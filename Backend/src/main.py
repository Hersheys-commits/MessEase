import os
from typing import Annotated, TypedDict
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, SystemMessage
from langchain_core.tools import tool
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.mongodb import MongoDBSaver 
from langgraph.prebuilt import ToolNode
from pymongo import MongoClient

load_dotenv()

# --- STATE DEFINITION ---
class State(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

# --- TOOLS ---
@tool
def submit_complaint(category: str, description: str):
    """
    Submits a finalized complaint to the Warden. 
    Categories: 'Food Quality', 'Service', 'Menu Concerns', or 'Hostel'.
    'description' MUST be a professional, formal email including:
    - A clear Subject Line
    - Formal Salutation (e.g., Dear Warden,)
    - Detailed, polite body paragraphs describing the issue
    - Professional closing (e.g., Sincerely, [Student Name])
    """
    return f"SUCCESS: Your formal {category} complaint has been officially logged and sent to the Warden."

tools = [submit_complaint]
# Using 8b model to avoid RateLimitErrors (Error 429)
model = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"), 
    model="llama-3.1-8b-instant" 
).bind_tools(tools)

# --- NODE LOGIC ---
def agent_node(state: State):
    # Only send the last few messages to save tokens and stay within rate limits
    
    system_prompt = SystemMessage(content=(
        "You are the MessEase Assistant. Your primary job is to help students "
        "draft professional, formal complaints to the hostel Warden. "
        "When a student mentions an issue, use the 'submit_complaint' tool. "
        "The 'description' field MUST be a complete, detailed formal email. "
        "Do not just summarize; write the full email body so the student can review it."
    ))
    messages = [system_prompt] + state["messages"]
    return {"messages": [model.invoke(messages)]}

# --- GRAPH CONSTRUCTION ---
workflow = StateGraph(State)
workflow.add_node("agent", agent_node)
workflow.add_node("tools", ToolNode(tools))

workflow.set_entry_point("agent")

def should_continue(state: State):
    last_message = state["messages"][-1]
    
    # FIX: Check if AIMessage to avoid AttributeError when HumanMessage is injected
    if isinstance(last_message, AIMessage) and last_message.tool_calls:
        return "tools"
    
    return END

workflow.add_conditional_edges("agent", should_continue)
workflow.add_edge("tools", "agent")

# --- PERSISTENCE ---
client = MongoClient(os.getenv("MONGODB_URI"))
checkpointer = MongoDBSaver(client, db_name="MessEase")
app_graph = workflow.compile(
    checkpointer=checkpointer,
    interrupt_before=["tools"] 
)

# --- FASTAPI ---
app = FastAPI()
app.add_middleware(
    CORSMiddleware, 
    allow_origins=["http://localhost:5173"],
    allow_credentials=True, 
    allow_methods=["*"], 
    allow_headers=["*"]
)

class ChatRequest(BaseModel):
    message: str
    user_id: str

@app.post("/chat")
async def chat(request: ChatRequest):
    config = {"configurable": {"thread_id": request.user_id}}
    input_message = HumanMessage(content=request.message)
    
    final_state = None
    for event in app_graph.stream({"messages": [input_message]}, config, stream_mode="values"):
        final_state = event

    snapshot = app_graph.get_state(config)
    if snapshot.next:
        last_msg = snapshot.values["messages"][-1]
        draft = last_msg.tool_calls[0]["args"]
        return {
            "reply": "I have drafted a formal complaint for your review. Please check the details below.",
            "is_draft": True,
            "draft_data": draft
        }

    return {"reply": final_state["messages"][-1].content, "is_draft": False}

@app.post("/chat/confirm")
async def confirm_chat(request: ChatRequest):
    config = {"configurable": {"thread_id": request.user_id}}
    # Resume the graph past the interrupt
    app_graph.update_state(config, None, as_node="agent")
    
    final_state = None
    for event in app_graph.stream(None, config, stream_mode="values"):
        final_state = event
        
    return {"reply": final_state["messages"][-1].content, "is_draft": False}

@app.post("/chat/discard")
async def discard_complaint(request: ChatRequest):
    config = {"configurable": {"thread_id": request.user_id}}
    # Move the graph state forward without calling the tool
    app_graph.update_state(
        config, 
        {"messages": [AIMessage(content="I've discarded that draft. How else can I help you?")]}, 
        as_node="agent"
    )
    return {"reply": "Draft discarded successfully.", "is_draft": False}