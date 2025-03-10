import { createSlice } from '@reduxjs/toolkit';

// Try to load the user from localStorage for persistence
const userInfo = JSON.parse(localStorage.getItem('userInfo'));

const initialState = {
  user: userInfo || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set user on login
    setUser: (state, action) => {
      state.user = action.payload;
      console.log(action.payload);
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    // Remove user on logout
    logout: (state) => {
      state.user = null;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
