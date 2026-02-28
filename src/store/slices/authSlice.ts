import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface AuthState {
    user: any | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

// Cookie is handled by browser automatically — only persist the user object
const persistedUser = localStorage.getItem('user');

const initialState: AuthState = {
    user: persistedUser ? JSON.parse(persistedUser) : null,
    isAuthenticated: !!persistedUser,   // cookie is still valid if user is persisted
    loading: false,
    error: null,
};

// Thunks

export const loginUser = createAsyncThunk(
    'auth/login',
    async (payload: { email: string; password: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/login', payload);
            return res.data.user;
        } catch (err: any) {
            return rejectWithValue(
                err?.response?.data?.message ??
                err?.message ??
                'Login failed. Please check your credentials.'
            );
        }
    }
);

export const registerUser = createAsyncThunk(
    'auth/register',
    async (payload: { email: string; username: string; password: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/auth/register', payload);
            return res.data;
        } catch (err: any) {
            return rejectWithValue(
                err?.response?.data?.message ??
                err?.response?.data?.errors?.[0]?.msg ??
                err?.message ??
                'Something went wrong. Please try again.'
            );
        }
    }
);

// Slice

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('user');
        },
        clearAuthError: (state) => { state.error = null; },
    },
    extraReducers: (builder) => {

        // Login
        builder
            .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload;
                state.isAuthenticated = true;
                localStorage.setItem('user', JSON.stringify(action.payload));
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Register — no auth state change, user must log in after registering
        builder
            .addCase(registerUser.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(registerUser.fulfilled, (state) => { state.loading = false; })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { logout, clearAuthError } = authSlice.actions;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;

export default authSlice.reducer;