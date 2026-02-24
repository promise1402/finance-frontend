import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import categoryreducer from "./slices/categorySlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        categories: categoryreducer,
    },
});

// correct types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
