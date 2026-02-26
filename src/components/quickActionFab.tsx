import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch } from '@/store';

import { addCategory, selectCategories } from '@/store/slices/categorySlice';
import { addExpense, fetchExpenses } from '@/store/slices/expenseSlice';
import { t } from '@/theme/theme';
import { AppStrings, categoryStrings as CS, expenseStrings as ES } from '@/utils/appString';
import { AddCategoryModal, type CategoryFormValues } from '@/modals/addCategory';
import { AddExpenseModal, type ExpenseFormValues } from '@/modals/addExpense';
import { Plus, Receipt, Tag } from 'lucide-react';

const S = AppStrings.fab;

type FABMode = 'menu' | 'expense' | 'category';

interface QuickActionFABProps {
    mode: FABMode;
}

export function QuickActionFAB({ mode }: QuickActionFABProps) {
    const dispatch = useDispatch<AppDispatch>();

    const categoriesFromStore = useSelector(selectCategories);
    const categoriesForExpense = categoriesFromStore.map(c => ({
        _id: c._id,
        label: c.name,
        budget: c.budget ?? undefined,
    }));

    const [menuOpen, setMenuOpen] = useState(false);
    const [expenseOpen, setExpenseOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleFabClick = () => {
        if (mode === 'menu') setMenuOpen(o => !o);
        if (mode === 'expense') setExpenseOpen(true);
        if (mode === 'category') setCategoryOpen(true);
    };

    // Expense
    const handleExpenseSubmit = async (data: ExpenseFormValues) => {
        setLoading(true);
        const note = data.note.trim();
        try {
            await dispatch(addExpense({
                amount: Number(data.amount),
                note,
                date: data.date,
                category: data.category,
            })).unwrap();
            dispatch(fetchExpenses()); // sync list in case ExpensesPage is mounted
            toast.success(`"${note}" expense added.`, {
                description: 'You can now view it in your expenses.',
            });
            setExpenseOpen(false);
            setMenuOpen(false);
        } catch (err: any) {
            toast.error(ES.saveError, {
                id: 'expense-save-error',
                description: 'Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Category
    const handleCategorySubmit = async (data: CategoryFormValues) => {
        setLoading(true);
        const name = data.name.trim();
        try {
            await dispatch(addCategory({
                name,
                color: data.color,
                ...(data.budget ? { budget: Number(data.budget) } : {}),
            })).unwrap();

            toast.success(`"${name}" category created.`, {
                description: 'You can now assign it to expenses.',
            });
            setCategoryOpen(false);
            setMenuOpen(false);
        } catch (err: any) {
            const errStr = (err?.payload ?? err?.message ?? String(err ?? '')).toLowerCase();
            const isDuplicate = errStr.includes('exists') || errStr.includes('already') || errStr.includes('duplicate');
            toast.error(
                isDuplicate ? `"${name}" already exists.` : CS.saveError,
                {
                    id: 'category-save-error',
                    description: isDuplicate ? 'Try a different name.' : 'Please try again.',
                }
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Mobile FAB (hidden on md+) */}
            <div className="fixed bottom-5 right-5 z-40 md:hidden flex flex-col items-end gap-2">

                {mode === 'menu' && menuOpen && (
                    <div className={`
                        flex flex-col rounded-xl overflow-hidden shadow-lg mb-1
                        animate-in slide-in-from-bottom-3 duration-150
                        ${t.fabMenuBg}
                    `}>
                        {/* Category first */}
                        <button
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${t.fabMenuItem}`}
                            onClick={() => { setMenuOpen(false); setCategoryOpen(true); }}
                        >
                            <Tag className="w-3.5 h-3.5" />
                            {S.addCategory}
                        </button>
                        <div className={`h-px mx-3 ${t.fabMenuSep}`} />
                        {/* Expense second */}
                        <button
                            className={`flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium transition-colors ${t.fabMenuItem}`}
                            onClick={() => { setMenuOpen(false); setExpenseOpen(true); }}
                        >
                            <Receipt className="w-3.5 h-3.5" />
                            {S.addExpense}
                        </button>
                    </div>
                )}

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

            {/* Modals */}
            <AddExpenseModal
                open={expenseOpen}
                categories={categoriesForExpense}
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