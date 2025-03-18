import { createSlice } from "@reduxjs/toolkit";

// Try to load the user from localStorage for persistence
const userInfoRaw = localStorage.getItem("userInfo");
const userInfo =
  userInfoRaw && userInfoRaw !== "undefined" && userInfoRaw !== "null"
    ? JSON.parse(userInfoRaw)
    : null;

const initialState = {
  user: userInfo || null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set user on login
    setUser: (state, action) => {
      state.user = action.payload;
      console.log(action.payload);
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },
    // Remove user on logout
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem("userInfo");
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
