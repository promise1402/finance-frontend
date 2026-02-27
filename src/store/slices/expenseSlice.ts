import api from "@/services/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PopulatedCategory {
    _id:  string;
    name: string;
}

export interface Expense {
    _id:      string;
    amount:   number;
    note:     string;
    date:     string;
    category: string | PopulatedCategory;
    user:     string;
    createdAt: string;
    updatedAt: string;
}

// Always get category as a plain string ID
export function getCategoryId(category: string | PopulatedCategory): string {
    return typeof category === 'string' ? category : category._id;
}

// Get category name if already populated by backend
export function getCategoryName(category: string | PopulatedCategory): string | undefined {
    return typeof category === 'object' ? category.name : undefined;
}

export interface ExpenseState {
    items:   Expense[];
    loading: boolean;
    error:   string | null;
}

const initialState: ExpenseState = {
    items:   [],
    loading: false,
    error:   null,
};

// Thunks

export const fetchExpenses = createAsyncThunk(
    'expenses/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/expenses');
            return res.data.expenses as Expense[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message ?? 'Failed to fetch expenses.');
        }
    }
);

export const addExpense = createAsyncThunk(
    'expenses/add',
    async (payload: { amount: number; note: string; date: string; category: string }, { rejectWithValue }) => {
        try {
            const res = await api.post('/expenses', payload);
            return res.data.expense as Expense;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message ?? 'Failed to add expense.');
        }
    }
);

// After patching, re-fetch the updated expense so category is populated
export const editExpense = createAsyncThunk(
    'expenses/edit',
    async (
        { id, ...body }: { id: string; amount?: number; note?: string; date?: string; category?: string },
        { rejectWithValue }
    ) => {
        try {
            await api.patch(`/expenses/${id}`, body);
            const res = await api.get('/expenses');
            return res.data.expenses as Expense[];
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message ?? 'Failed to update expense.');
        }
    }
);

// Delete
export const removeExpense = createAsyncThunk(
    'expenses/remove',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/expenses/${id}`);
            return id; // return the id we passed in, not from response
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.message ?? 'Failed to remove expense.');
        }
    }
);

// Slice

const expenseSlice = createSlice({
    name: 'expenses',
    initialState,
    reducers: {
        clearExpenseError(state) { state.error = null; },
    },
    extraReducers: (builder) => {

        // Fetch
        builder
            .addCase(fetchExpenses.pending,   (state) => { state.loading = true; state.error = null; })
            .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchExpenses.rejected,  (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Add
        builder
            .addCase(addExpense.pending,   (state) => { state.loading = true; state.error = null; })
            .addCase(addExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
                state.loading = false;
                state.items.unshift(action.payload);
            })
            .addCase(addExpense.rejected,  (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Edit
        builder
            .addCase(editExpense.pending,   (state) => { state.loading = true; state.error = null; })
            .addCase(editExpense.fulfilled, (state, action: PayloadAction<Expense[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(editExpense.rejected,  (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Remove
        builder
            .addCase(removeExpense.pending,   (state) => { state.loading = true; state.error = null; })
            .addCase(removeExpense.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.items = state.items.filter(e => e._id !== action.payload);
            })
            .addCase(removeExpense.rejected,  (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearExpenseError } = expenseSlice.actions;

export const selectExpenses        = (state: { expenses: ExpenseState }) => state.expenses.items;
export const selectExpensesLoading = (state: { expenses: ExpenseState }) => state.expenses.loading;
export const selectExpensesError   = (state: { expenses: ExpenseState }) => state.expenses.error;

export default expenseSlice.reducer;