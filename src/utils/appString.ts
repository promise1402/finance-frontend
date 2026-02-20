export const loginStrings = {
    title: "Sign in to your account",
    emailLabel: "Email address",
    emailPlaceholder: "you@example.com",
    passwordLabel: "Password",
    passwordPlaceholder: "••••••••",
    buttonText: "Sign in",
    footerText: "New to Finance Manager?",
    linkText: "Create an account",
    apiFallbackError: "Login failed. Please check your credentials.",
};

export const registerStrings = {
    title: "Create a new account",
    emailLabel: "Email address",
    usernameLabel: "Username",
    passwordLabel: "Password",
    confirmPasswordLabel: "Confirm Password",
    buttonText: "Register",
    footerText: "Already have an account?",
    linkText: "Sign in",
    apiFallbackError: "Something went wrong. Please try again.",
};

export const validationStrings = {
    emailRequired: "Email is required",
    emailInvalid: "Please enter a valid email",
    usernameRequired: "Username is required",
    passwordRequired: "Password is required",
    passwordMin: "Min 6 characters",
    confirmPasswordRequired: "Please confirm your password",
    passwordsDoNotMatch: "Passwords do not match",
};

export const AppStrings = {
    category: {
        modalTitle: 'New Category',
        labelField: 'Category Name',
        labelPlaceholder: 'e.g. Groceries, Rent, Transport',
        labelRequired: 'Category name is required.',
        labelMinLength: 'At least 2 characters.',
        budgetField: 'Budget',
        budgetHint: 'optional · can be set later',
        budgetInvalid: 'Must be a valid positive number.',
        submitBtn: 'Create Category',
        submittingBtn: 'Creating…',
        cancelBtn: 'Cancel',
    },

    expense: {
        modalTitle: 'New Expense',
        amountField: 'Amount',
        amountRequired: 'Amount is required.',
        amountInvalid: 'Enter a valid positive amount.',
        categoryField: 'Category',
        categoryPlaceholder: 'Select a category',
        categoryRequired: 'Please select a category.',
        dateField: 'Date',
        dateRequired: 'Date is required.',
        noteField: 'Note',
        noteRequired: 'Note is required.',
        notePlaceholder: 'What was this expense for?',
        submitBtn: 'Add Expense',
        submittingBtn: 'Saving…',
        cancelBtn: 'Cancel',
    },

    fab: {
        addExpense: 'Add Expense',
        addCategory: 'Add Category',
    },

    pages: {
        dashboard: { description: "Here's what's happening with your money." },
        categories: { description: 'Manage your expense categories.' },
        expenses: { description: 'Track and manage all your expenses.' },
        summary: { description: 'A full overview of your financial activity.' },
    },
} as const;