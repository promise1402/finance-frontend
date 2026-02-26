import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch } from '@/store';

import {
    fetchExpenses, addExpense, editExpense, removeExpense,
    selectExpenses, selectExpensesLoading, clearExpenseError,
    getCategoryId, getCategoryName,
    type Expense,
} from '@/store/slices/expenseSlice';

import {
    fetchCategories,
    selectCategories,
    selectCategoriesLoading,
} from '@/store/slices/categorySlice';

import { t } from '@/theme/theme';
import { expenseStrings as S } from '@/utils/appString';

import { AddExpenseModal, type ExpenseFormValues } from '@/modals/addExpense';
import { QuickActionFAB } from '@/components/quickActionFab';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, Receipt, Loader2 } from 'lucide-react';

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function resolveCategoryInfo(
    expense: Expense,
    categoryMap: Record<string, { name: string; color: string }>
): { name: string; color: string } {
    const id = getCategoryId(expense.category);
    const name = getCategoryName(expense.category) ?? categoryMap[id]?.name ?? S.emptyTitle;
    const color = categoryMap[id]?.color ?? '#94a3b8';
    return { name, color };
}

// Empty State

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${t.logoIconBg}`}>
                <Receipt className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
                <p className={`text-sm font-medium ${t.textPrimary}`}>{S.emptyTitle}</p>
                <p className={`text-xs mt-1 ${t.textMuted}`}>{S.emptyDesc}</p>
            </div>
        </div>
    );
}

// Mobile Card

function ExpenseCard({ expense, categoryName, categoryColor, onEdit, onDelete }: {
    expense: Expense; categoryName: string; categoryColor: string;
    onEdit: (e: Expense) => void; onDelete: (e: Expense) => void;
}) {
    return (
        <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 first:border-t-0">
            <div className="flex items-center gap-3 min-w-0">
                <span className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: categoryColor }} />
                <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${t.textPrimary}`}>{expense.note}</p>
                    <p className={`text-xs mt-0.5 ${t.textMuted}`}>{categoryName} · {formatDate(expense.date)}</p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className={`text-sm font-semibold ${t.textPrimary}`}>₹{expense.amount.toLocaleString()}</span>
                <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}
                    className={`h-8 w-8 ${t.btnGhost}`} aria-label="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(expense)}
                    className={`h-8 w-8 ${t.btnDanger}`} aria-label="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
}

// Desktop Row

function ExpenseRow({ expense, categoryName, categoryColor, onEdit, onDelete }: {
    expense: Expense; categoryName: string; categoryColor: string;
    onEdit: (e: Expense) => void; onDelete: (e: Expense) => void;
}) {
    return (
        <tr className={`border-t ${t.tableRow} ${t.tableRowHover} transition-colors`}>
            <td className="px-4 py-3">
                <span className={`text-sm font-medium ${t.textPrimary}`}>{expense.note}</span>
            </td>
            <td className="px-4 py-3">
                <span className={`text-sm font-semibold ${t.textPrimary}`}>₹{expense.amount.toLocaleString()}</span>
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/10"
                        style={{ backgroundColor: categoryColor }} />
                    <span className={`text-xs ${t.textMuted}`}>{categoryName}</span>
                </div>
            </td>
            <td className={`px-4 py-3 text-xs ${t.textMuted}`}>{formatDate(expense.date)}</td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}
                        className={`h-7 w-7 ${t.btnGhost}`} aria-label="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(expense)}
                        className={`h-7 w-7 ${t.btnDanger}`} aria-label="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

// Page

export default function ExpensesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const expenses = useSelector(selectExpenses);
    const expensesLoading = useSelector(selectExpensesLoading);
    const categories = useSelector(selectCategories);
    const categoriesLoading = useSelector(selectCategoriesLoading);

    const categoryMap = Object.fromEntries(categories.map(c => [c._id, { name: c.name, color: c.color }]));
    const categoriesForModal = categories.map(c => ({ _id: c._id, label: c.name, budget: c.budget ?? undefined }));

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Expense | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        dispatch(fetchCategories()).unwrap().catch(() => { });
        dispatch(fetchExpenses()).unwrap().catch(() => {
            toast.error(S.fetchError, { description: 'Check your connection and refresh.' });
        });
    }, [dispatch]);

    const initialLoading = (expensesLoading || categoriesLoading) &&
        expenses.length === 0 && categories.length === 0;

    const openCreate = () => { setEditTarget(null); setModalOpen(true); };
    const openEdit = (e: Expense) => { setEditTarget(e); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditTarget(null); };

    // Create/Update
    const handleSubmit = async (data: ExpenseFormValues) => {
        setSubmitting(true);
        const note = data.note.trim();
        try {
            if (editTarget) {
                await dispatch(editExpense({
                    id: editTarget._id,
                    amount: Number(data.amount),
                    note,
                    date: data.date,
                    category: data.category,
                })).unwrap();
                toast.success(`"${note}" updated successfully.`, {
                    description: 'Your changes have been saved.',
                });
            } else {
                await dispatch(addExpense({
                    amount: Number(data.amount),
                    note,
                    date: data.date,
                    category: data.category,
                })).unwrap();
                toast.success(`"${note}" expense added.`, {
                    description: 'You can now view it in your expenses.',
                });
            }
            closeModal();
        } catch (err: any) {
            const msg = err?.payload ?? '';
            const isForbidden = typeof msg === 'string' && msg.toLowerCase().includes('forbidden');
            toast.error(
                isForbidden ? 'Permission denied.' : S.saveError,
                {
                    id: 'expense-save-error',
                    description: isForbidden ? 'You can only edit your own expenses.' : 'Please try again.',
                }
            );
            dispatch(clearExpenseError());
        } finally {
            setSubmitting(false);
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!deleteTarget) return;
        const note = deleteTarget.note;
        setDeleteTarget(null);
        try {
            await dispatch(removeExpense(deleteTarget._id)).unwrap();
            toast.success(`"${note}" deleted.`, {
                description: 'The expense has been permanently removed.',
            });
        } catch (err: any) {
            const msg = err?.payload ?? '';
            const isForbidden = typeof msg === 'string' && msg.toLowerCase().includes('forbidden');
            toast.error(
                isForbidden ? 'Permission denied.' : S.deleteError,
                { description: isForbidden ? 'You can only delete your own expenses.' : 'Please try again.' }
            );
            dispatch(clearExpenseError());
        }
    };

    return (
        <div className="space-y-5">
            <p className={`text-sm ${t.textMuted}`}>{S.pageDesc}</p>

            <Card className={`border ${t.cardChart}`}>
                <CardHeader className="px-5 pt-5 pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className={`text-sm font-semibold ${t.textPrimary}`}>
                            All Expenses
                            {expenses.length > 0 && (
                                <span className={`ml-2 text-xs font-normal ${t.textMuted}`}>
                                    ({expenses.length})
                                </span>
                            )}
                        </CardTitle>
                        <Button size="sm" onClick={openCreate}
                            className={`hidden md:flex text-xs ${t.btnPrimary}`}>
                            {S.addBtn}
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="px-0 pb-2">
                    {initialLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className={`w-6 h-6 animate-spin ${t.textMuted}`} />
                        </div>
                    ) : expenses.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            {/* Mobile */}
                            <div className="md:hidden">
                                {expenses.map(exp => {
                                    const { name, color } = resolveCategoryInfo(exp, categoryMap);
                                    return (
                                        <ExpenseCard key={exp._id} expense={exp}
                                            categoryName={name} categoryColor={color}
                                            onEdit={openEdit} onDelete={setDeleteTarget} />
                                    );
                                })}
                            </div>

                            {/* Desktop */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className={`text-xs uppercase tracking-wide ${t.tableHeader}`}>
                                            <th className="px-4 py-2.5 text-left font-medium">{S.tableNoteCol}</th>
                                            <th className="px-4 py-2.5 text-left font-medium">{S.tableAmountCol}</th>
                                            <th className="px-4 py-2.5 text-left font-medium">{S.tableCategoryCol}</th>
                                            <th className="px-4 py-2.5 text-left font-medium">{S.tableDateCol}</th>
                                            <th className="px-4 py-2.5 text-right font-medium">{S.tableActionsCol}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.map(exp => {
                                            const { name, color } = resolveCategoryInfo(exp, categoryMap);
                                            return (
                                                <ExpenseRow key={exp._id} expense={exp}
                                                    categoryName={name} categoryColor={color}
                                                    onEdit={openEdit} onDelete={setDeleteTarget} />
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <QuickActionFAB mode="expense" />

            <AddExpenseModal
                open={modalOpen}
                categories={categoriesForModal}
                onClose={closeModal}
                onSubmit={handleSubmit}
                loading={submitting}
                defaultValues={editTarget ? {
                    note: editTarget.note,
                    amount: String(editTarget.amount),
                    date: editTarget.date.split('T')[0],
                    category: getCategoryId(editTarget.category),
                } : undefined}
            />

            <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
                <AlertDialogContent className={`w-[calc(100vw-2rem)] max-w-sm ${t.popoverBg}`}>
                    <AlertDialogHeader>
                        <AlertDialogTitle className={`flex items-center gap-2 text-sm font-semibold ${t.textPrimary}`}>
                            <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                                <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </div>
                            {S.deleteTitle}
                        </AlertDialogTitle>
                        <AlertDialogDescription className={`text-xs leading-relaxed ${t.textMuted}`}>
                            {deleteTarget && (
                                <>
                                    You are about to delete{' '}
                                    <span className={`font-semibold ${t.textPrimary}`}>
                                        {deleteTarget.note}
                                    </span>
                                    . {S.deleteDesc}
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex flex-row justify-end gap-2 pt-1">
                        <AlertDialogCancel onClick={() => setDeleteTarget(null)}
                            className={`text-xs h-8 ${t.btnGhost}`}>
                            {S.deleteCancel}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}
                            className="text-xs h-8 bg-red-500 hover:bg-red-600 text-white border-0">
                            {S.deleteConfirm}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}