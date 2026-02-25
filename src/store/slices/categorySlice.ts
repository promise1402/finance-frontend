import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/services/api';

export interface Category {
    _id: string;
    name: string;
    color: string;
    budget: number | null;
    user: string;
    createdAt: string;
    updatedAt: string;
}

export interface CategoryState {
    items: Category[];
    loading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk(
    'categories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get('/categories');
            return res.data.categories as Category[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? 'Failed to fetch categories.');
        }
    }
);

export const addCategory = createAsyncThunk(
    'categories/add',
    async (payload: { name: string; color: string; budget?: number }, { rejectWithValue }) => {
        try {
            const res = await api.post('/categories', payload);
            return res.data.category as Category;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? 'Failed to create category.');
        }
    }
);

export const editCategory = createAsyncThunk(
    'categories/edit',
    async (
        { id, ...body }: { id: string; name?: string; color?: string; budget?: number },
        { rejectWithValue }
    ) => {
        try {
            const res = await api.patch(`/categories/${id}`, body);
            return res.data.category as Category;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? 'Failed to update category.');
        }
    }
);

export const removeCategory = createAsyncThunk(
    'categories/remove',
    async (id: string, { rejectWithValue }) => {
        try {
            await api.delete(`/categories/${id}`);
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data?.message ?? 'Failed to delete category.');
        }
    }
);

// Slice
const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        clearCategoryError(state) {
            state.error = null;
        },
    },
    extraReducers: builder => {

        // fetchCategories
        builder
            .addCase(fetchCategories.pending, state => { state.loading = true; state.error = null; })
            .addCase(fetchCategories.fulfilled, (state, action: PayloadAction<Category[]>) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // addCategory
        builder
            .addCase(addCategory.pending, state => { state.loading = true; state.error = null; })
            .addCase(addCategory.fulfilled, (state, action: PayloadAction<Category>) => {
                state.loading = false;
                state.items.unshift(action.payload);
            })
            .addCase(addCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // editCategory
        builder
            .addCase(editCategory.pending, state => { state.loading = true; state.error = null; })
            .addCase(editCategory.fulfilled, (state, action: PayloadAction<Category>) => {
                state.loading = false;
                const idx = state.items.findIndex(c => c._id === action.payload._id);
                if (idx !== -1) state.items[idx] = action.payload;
            })
            .addCase(editCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // removeCategory
        builder
            .addCase(removeCategory.pending, state => { state.loading = true; state.error = null; })
            .addCase(removeCategory.fulfilled, (state, action: PayloadAction<string>) => {
                state.loading = false;
                state.items = state.items.filter(c => c._id !== action.payload);
            })
            .addCase(removeCategory.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCategoryError } = categorySlice.actions;

// Selectors
export const selectCategories = (state: { categories: CategoryState }) => state.categories.items;
export const selectCategoriesLoading = (state: { categories: CategoryState }) => state.categories.loading;
export const selectCategoriesError = (state: { categories: CategoryState }) => state.categories.error;

export default categorySlice.reducer;