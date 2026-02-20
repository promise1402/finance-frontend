import { createSlice } from '@reduxjs/toolkit';

export interface AuthState {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
}

const persistedUser = localStorage.getItem('user');
const persistedToken = localStorage.getItem('token');

const initialState: AuthState = {
    user: persistedUser ? JSON.parse(persistedUser) : null,
    token: persistedToken,
    isAuthenticated: !!persistedToken,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, token } = action.payload;
            state.user = user;
            state.token = token;
            state.isAuthenticated = true;

            // Persist to localStorage
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;

            // Clear from localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
    },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;