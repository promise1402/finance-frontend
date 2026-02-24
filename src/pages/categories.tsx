import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch } from '@/store';

import {
    fetchCategories,
    addCategory,
    editCategory,
    removeCategory,
    selectCategories,
    selectCategoriesLoading,
    clearCategoryError,
    type Category,
} from '@/store/slices/categorySlice';

import { categoryStrings as S } from '@/utils/appString';
import { t } from '@/theme/theme';

import { AddCategoryModal, type CategoryFormValues } from '@/modals/addCategory';
import { QuickActionFAB } from '@/components/quickActionFab';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription,
    AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Pencil, Trash2, Tag, Loader2 } from 'lucide-react';

// Empty state
function EmptyState({ onAdd }: { onAdd: () => void }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${t.logoIconBg}`}>
                <Tag className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
                <p className={`text-sm font-medium ${t.textPrimary}`}>{S.emptyTitle}</p>
                <p className={`text-xs mt-1 ${t.textMuted}`}>{S.emptyDesc}</p>
            </div>
            <Button size="sm" onClick={onAdd} className={`text-xs ${t.btnPrimary}`}>
                {S.addBtn}
            </Button>
        </div>
    );
}

// Mobile
function CategoryCard({
    category, onEdit, onDelete,
}: {
    category: Category;
    onEdit: (c: Category) => void;
    onDelete: (c: Category) => void;
}) {
    return (
        <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 first:border-t-0">
            <div className="flex items-center gap-3 min-w-0">
                <span
                    className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: category.color }}
                />
                <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${t.textPrimary}`}>{category.name}</p>
                    <p className={`text-xs mt-0.5 ${t.textMuted}`}>
                        {category.budget != null
                            ? `Budget: ₹${category.budget.toLocaleString()}`
                            : 'No budget set'}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-3">
                <Button variant="ghost" size="icon" onClick={() => onEdit(category)}
                    className={`h-8 w-8 ${t.btnGhost}`} aria-label="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(category)}
                    className={`h-8 w-8 ${t.btnDanger}`} aria-label="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    );
}

// Desktop
function CategoryRow({
    category, onEdit, onDelete,
}: {
    category: Category;
    onEdit: (c: Category) => void;
    onDelete: (c: Category) => void;
}) {
    return (
        <tr className={`border-t ${t.tableRow} ${t.tableRowHover} transition-colors`}>
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <span
                        className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                        style={{ backgroundColor: category.color }}
                    />
                    <span className={`text-sm font-medium ${t.textPrimary}`}>{category.name}</span>
                </div>
            </td>
            <td className="px-4 py-3">
                {category.budget != null ? (
                    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${t.badgeSuccess}`}>
                        ₹{category.budget.toLocaleString()}
                    </span>
                ) : (
                    <span className={`text-xs ${t.textMuted}`}>—</span>
                )}
            </td>
            <td className={`px-4 py-3 text-xs ${t.textMuted}`}>
                {new Date(category.createdAt).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                })}
            </td>
            <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(category)}
                        className={`h-7 w-7 ${t.btnGhost}`} aria-label="Edit">
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(category)}
                        className={`h-7 w-7 ${t.btnDanger}`} aria-label="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            </td>
        </tr>
    );
}

// Page component
export default function CategoriesPage() {
    const dispatch = useDispatch<AppDispatch>();
    const categories = useSelector(selectCategories);
    const loading = useSelector(selectCategoriesLoading);

    const [modalOpen, setModalOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // Fetch on mount
    useEffect(() => {
        dispatch(fetchCategories())
            .unwrap()
            .catch(() => {
                toast.error(S.fetchError, { description: 'Check your connection and refresh.' });
            });
    }, [dispatch]);

    const openCreate = () => { setEditTarget(null); setModalOpen(true); };
    const openEdit = (c: Category) => { setEditTarget(c); setModalOpen(true); };
    const closeModal = () => { setModalOpen(false); setEditTarget(null); };

    // Create or Update
    const handleSubmit = async (data: CategoryFormValues) => {
        setSubmitting(true);
        const name = data.name.trim();
        try {
            if (editTarget) {
                await dispatch(editCategory({
                    id: editTarget._id,
                    name,
                    color: data.color,
                    ...(data.budget ? { budget: Number(data.budget) } : {}),
                })).unwrap();
                // ✅ Update — blue info tone
                toast.success(`"${name}" updated successfully.`, {
                    description: 'Your changes have been saved.',
                });
            } else {
                await dispatch(addCategory({
                    name,
                    color: data.color,
                    ...(data.budget ? { budget: Number(data.budget) } : {}),
                })).unwrap();

                toast.success(`"${name}" category created.`, {
                    description: 'You can now assign it to expenses.',
                });
            }
            closeModal();
        } catch (err: any) {
            // err.message comes from rejectWithValue in the slice
            const errStr = (err?.payload ?? err?.message ?? String(err ?? '')).toLowerCase();
            const isDuplicate = errStr.includes('exists') || errStr.includes('duplicate');
            //  Error — red, never show raw API text
            toast.error(isDuplicate
                ? `"${name}" already exists.`
                : S.saveError,
                { description: isDuplicate ? 'Try a different name.' : 'Please try again.' }
            );
            dispatch(clearCategoryError());
        } finally {
            setSubmitting(false);
        }
    };

    // Delete
    const handleDelete = async () => {
        if (!deleteTarget) return;
        const name = deleteTarget.name;
        setDeleteTarget(null);   // close dialog immediately
        try {
            await dispatch(removeCategory(deleteTarget._id)).unwrap();
            // Delete
            toast.success(`"${name}" deleted.`, {
                description: 'The category has been permanently removed.',
            });
        } catch {
            toast.error(S.deleteError, { description: 'Please try again.' });
            dispatch(clearCategoryError());
        }
    };

    return (
        <div className="space-y-5">

            <p className={`text-sm ${t.textMuted}`}>{S.pageDesc}</p>

            <Card className={`border ${t.cardChart}`}>
                <CardHeader className="px-5 pt-5 pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className={`text-sm font-semibold ${t.textPrimary}`}>
                            All Categories
                            {categories.length > 0 && (
                                <span className={`ml-2 text-xs font-normal ${t.textMuted}`}>
                                    ({categories.length})
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
                    {loading && categories.length === 0 ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className={`w-6 h-6 animate-spin ${t.textMuted}`} />
                        </div>
                    ) : categories.length === 0 ? (
                        <EmptyState onAdd={openCreate} />
                    ) : (
                        <>
                            {/* Mobile — card list */}
                            <div className="md:hidden">
                                {categories.map(cat => (
                                    <CategoryCard key={cat._id} category={cat}
                                        onEdit={openEdit} onDelete={setDeleteTarget} />
                                ))}
                            </div>

                            {/* Desktop — table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className={`text-xs uppercase tracking-wide ${t.tableHeader}`}>
                                            <th className="px-4 py-2.5 text-left font-medium">{S.tableNameCol}</th>
                                            <th className="px-4 py-2.5 text-left font-medium">{S.tableBudgetCol}</th>
                                            <th className="px-4 py-2.5 text-left font-medium">{S.tableCreatedCol}</th>
                                            <th className="px-4 py-2.5 text-right font-medium">{S.tableActionsCol}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {categories.map(cat => (
                                            <CategoryRow key={cat._id} category={cat}
                                                onEdit={openEdit} onDelete={setDeleteTarget} />
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <QuickActionFAB mode="category" />

            {/* Add / Edit modal */}
            <AddCategoryModal
                open={modalOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                loading={submitting}
                defaultValues={editTarget ? {
                    name: editTarget.name,
                    color: editTarget.color,
                    budget: editTarget.budget != null ? String(editTarget.budget) : '',
                } : undefined}
            />

            {/* Delete confirmation */}
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
                                    <span className="font-semibold" style={{ color: deleteTarget.color }}>
                                        {deleteTarget.name}
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