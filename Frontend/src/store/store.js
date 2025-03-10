// store.js
import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
    reducer: {
        auth: authReducer,
        chat: chatReducer,
        socket: socketReducer,
        friend: friendReducer,
    },
});

export default store;
