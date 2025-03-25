import toast, { Toaster } from "react-hot-toast";

// Custom toast component
export const CustomToaster = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={true}
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        // Default options for all toasts
        duration: 4000,
        style: {
          background: "#333",
          color: "#fff",
          borderRadius: "8px",
          border: "1px solid #444",
          padding: "12px 16px",
          maxWidth: "350px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        },
        // Success toast specific styling
        success: {
          style: {
            background: "#222",
            color: "#4caf50",
            border: "1px solid #4caf50",
          },
          icon: "✅",
        },
        // Error toast specific styling
        error: {
          style: {
            background: "#222",
            color: "#f44336",
            border: "1px solid #f44336",
          },
          icon: "❌",
        },
        // Warning toast specific styling
        warning: {
          style: {
            background: "#222",
            color: "#ff9800",
            border: "1px solid #ff9800",
          },
          icon: "⚠️",
        },
      }}
    />
  );
};

// Helper functions for easy toast usage
export const successToast = (message) => {
  toast.success(message, {
    icon: "✅",
    style: {
      background: "#222",
      color: "#4caf50",
      border: "1px solid #4caf50",
    },
  });
};

export const errorToast = (message) => {
  toast.error(message, {
    icon: "❌",
    style: {
      background: "#222",
      color: "#f44336",
      border: "1px solid #f44336",
    },
  });
};

export const warningToast = (message) => {
  toast.custom((t) => (
    <div
      className={`${t.visible ? "animate-enter" : "animate-leave"} max-w-md w-full bg-gray-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}
    >
      <div className="flex-1 w-0 p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <span role="img" aria-label="warning">
              ⚠️
            </span>
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-yellow-500">{message}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-700">
        <button
          onClick={() => toast.dismiss(t.id)}
          className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700"
        >
          Close
        </button>
      </div>
    </div>
  ));
};

// Custom global styles for animations (optional, but recommended)
const toastStyles = `
  @keyframes enter {
    0% { transform: translateX(100%); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }
  @keyframes leave {
    0% { transform: translateX(0); opacity: 1; }
    100% { transform: translateX(100%); opacity: 0; }
  }
  .animate-enter {
    animation: enter 0.3s ease-out;
  }
  .animate-leave {
    animation: leave 0.3s ease-in;
  }
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = toastStyles;
document.head.appendChild(styleSheet);

// Export main toast for direct usage
export default toast;
