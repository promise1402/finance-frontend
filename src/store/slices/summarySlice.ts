import api from '@/services/api';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type RangeType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface SummaryExpense {
    id: string;
    amount: number;
    note?: string;
    date: string;
    category: any;
}

export interface CategorySummaryEntry {
    budget: number;
    spend: number;
    expenses: { id: string; amount: number; date: string; note?: string }[];
}

export interface SummaryData {
    range: RangeType;
    anchor: string;
    totalBudget: number;
    totalExpenses: number;
    remainingBudget: number;
    periodTotal: number;
    expenseByCategory: Record<string, CategorySummaryEntry>;
    expenses: SummaryExpense[];
}

export interface SummaryState {
    data: SummaryData | null;
    range: RangeType;
    anchor: string;
    loading: boolean;
    error: string | null;
}

const initialState: SummaryState = {
    data: null,
    range: 'monthly',
    anchor: new Date().toISOString(),
    loading: false,
    error: null,
};

export const fetchSummary = createAsyncThunk(
    'summary/fetch',
    async ({ range, anchor }: { range: RangeType; anchor: string }, { rejectWithValue }) => {
        try {
            const res = await api.get('/summary', { params: { range, date: anchor } });
            return res.data as SummaryData;
        } catch (err: any) {
            return rejectWithValue(err?.response?.data?.message ?? 'Failed to load summary.');
        }
    }
);

const summarySlice = createSlice({
    name: 'summary',
    initialState,
    reducers: {
        setRangeAndAnchor(state, action: PayloadAction<{ range: RangeType; anchor: string }>) {
            state.range = action.payload.range;
            state.anchor = action.payload.anchor;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchSummary.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchSummary.fulfilled, (state, action) => { state.loading = false; state.data = action.payload; })
            .addCase(fetchSummary.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export const { setRangeAndAnchor } = summarySlice.actions;

export const selectSummaryData = (s: { summary: SummaryState }) => s.summary.data;
export const selectSummaryRange = (s: { summary: SummaryState }) => s.summary.range;
export const selectSummaryAnchor = (s: { summary: SummaryState }) => s.summary.anchor;
export const selectSummaryLoading = (s: { summary: SummaryState }) => s.summary.loading;

export default summarySlice.reducer;