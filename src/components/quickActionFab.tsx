import { useState } from 'react';

import { t } from '@/theme/theme';
import { AppStrings } from '@/utils/appString';
import { AddCategoryModal, CategoryFormValues } from '@/modals/addCategory';
import { AddExpenseModal, ExpenseFormValues, Category } from '@/modals/addExpense';
import { Plus, Receipt, Tag } from 'lucide-react';

const S = AppStrings.fab;

const MOCK_CATEGORIES: Category[] = [
    { _id: '1', label: 'Groceries', budget: 500 },
    { _id: '2', label: 'Transport', budget: 200 },
    { _id: '3', label: 'Rent', budget: 1500 },
    { _id: '4', label: 'Utilities' },
];

type FABMode = 'menu' | 'expense' | 'category';

interface QuickActionFABProps {
    mode: FABMode;
}

export function QuickActionFAB({ mode }: QuickActionFABProps) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [expenseOpen, setExpenseOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // In real app: const categories = useSelector(selectCategories);
    const categories = MOCK_CATEGORIES;

    // ── Handlers ────────────────────────────────────────────────────────────────
    const handleFabClick = () => {
        if (mode === 'menu') setMenuOpen(o => !o);
        if (mode === 'expense') setExpenseOpen(true);
        if (mode === 'category') setCategoryOpen(true);
    };

    const handleExpenseSubmit = async (data: ExpenseFormValues) => {
        setLoading(true);
        try {
            const payload = {
                amount: Number(data.amount),
                category: data.categoryId,
                date: new Date(data.date),
                note: data.note.trim(),
            };
            // TODO: dispatch(createExpense(payload))
            console.log('Create expense:', payload);
            setExpenseOpen(false);
            setMenuOpen(false);
        } finally {
            setLoading(false);
        }
    };

    const handleCategorySubmit = async (data: CategoryFormValues) => {
        setLoading(true);
        try {
            const payload = {
                label: data.label.trim(),
                budget: data.budget ? Number(data.budget) : undefined,
            };
            // TODO: dispatch(createCategory(payload))
            console.log('Create category:', payload);
            setCategoryOpen(false);
            setMenuOpen(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed bottom-5 right-5 z-40 md:hidden flex flex-col items-end gap-2">

                {mode === 'menu' && menuOpen && (
                    <div className={`
            flex flex-col rounded-xl overflow-hidden shadow-lg mb-1
            animate-in slide-in-from-bottom-3 duration-150
            ${t.fabMenuBg}
          `}>
                        <button
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${t.fabMenuItem}`}
                            onClick={() => { setMenuOpen(false); setExpenseOpen(true); }}
                        >
                            <Receipt className="w-3.5 h-3.5" />
                            {S.addExpense}
                        </button>
                        <div className={`h-px mx-3 ${t.fabMenuSep}`} />
                        <button
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${t.fabMenuItem}`}
                            onClick={() => { setMenuOpen(false); setCategoryOpen(true); }}
                        >
                            <Tag className="w-3.5 h-3.5" />
                            {S.addCategory}
                        </button>
                    </div>
                )}

                {/* FAB button */}
                <button
                    onClick={handleFabClick}
                    className={`
            w-11 h-11 rounded-full flex items-center justify-center
            transition-all duration-200 active:scale-95 shadow-md
            ${t.fabBg}
          `}
                    aria-label="Quick actions"
                >
                    <Plus className={`
            w-4 h-4 transition-transform duration-200
            ${mode === 'menu' && menuOpen ? 'rotate-45' : 'rotate-0'}
          `} />
                </button>
            </div>

            <AddExpenseModal
                open={expenseOpen}
                categories={categories}
                onClose={() => setExpenseOpen(false)}
                onSubmit={handleExpenseSubmit}
                loading={loading}
            />

            <AddCategoryModal
                open={categoryOpen}
                onClose={() => setCategoryOpen(false)}
                onSubmit={handleCategorySubmit}
                loading={loading}
            />
        </>
    );
}