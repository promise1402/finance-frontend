import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryreducer from "./slices/categorySlice";
import expenseReducer from "./slices/expenseSlice";
import summaryReducer from "./slices/summarySlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        categories: categoryreducer,
        expenses: expenseReducer,
        summary: summaryReducer,
    },
});

// correct types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
