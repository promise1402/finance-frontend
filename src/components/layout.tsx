import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { t } from '@/theme/theme';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';

import { addCategory, selectCategories } from '@/store/slices/categorySlice';
import { addExpense, fetchExpenses } from '@/store/slices/expenseSlice';
import { categoryStrings as CS, expenseStrings as ES } from '@/utils/appString';
import { AddExpenseModal, type ExpenseFormValues } from '@/modals/addExpense';
import { AddCategoryModal, type CategoryFormValues } from '@/modals/addCategory';

import Sidebar, { navItems } from '@/pages/sidebar';
import { QuickActionFAB } from '@/components/quickActionFab';

import {
    Menubar, MenubarContent, MenubarItem,
    MenubarMenu, MenubarTrigger,
} from '@/components/ui/menubar';
import { Tag, Receipt, Wallet, Plus } from 'lucide-react';
import { Toaster } from './ui/sonner';

export default function Layout() {
    const location = useLocation();
    const dispatch = useDispatch<AppDispatch>();

    const categoriesFromStore = useSelector(selectCategories);
    const categoriesForExpense = categoriesFromStore.map(c => ({
        _id: c._id,
        label: c.name,
        budget: c.budget ?? undefined,
    }));

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [expenseOpen, setExpenseOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const activeLabel = navItems.find(n => n.path === location.pathname)?.label ?? 'Dashboard';

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
        <div className={`flex flex-col h-screen ${t.pageBg} overflow-hidden`}>

            {/* ══ ROW 1 — TOPBAR */}
            <div className="hidden md:flex w-full h-15.25 shrink-0">

                {/* Desktop logo strip */}
                <div className={`
                    hidden md:flex items-center gap-2.5
                    w-64 shrink-0 px-5
                    ${t.sidebarBg} border-r border-b ${t.border}
                `}>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${t.logoIconBg}`}>
                        <Wallet className={`w-4 h-4 ${t.logoIconText}`} />
                    </div>
                    <span className={`font-semibold text-sm tracking-tight ${t.textPrimary}`}>
                        Finance Manager
                    </span>
                </div>

                {/* Desktop header */}
                <header className={`
                    flex-1 hidden md:flex items-center justify-between px-5
                    ${t.headerBg} border-b ${t.border}
                `}>
                    <div>
                        <h1 className={`text-sm font-semibold ${t.textPrimary}`}>{activeLabel}</h1>
                        <p className={`text-xs mt-0.5 ${t.textSubtle}`}>
                            {new Date().toLocaleDateString('en-US', {
                                weekday: 'long', month: 'long', day: 'numeric',
                            })}
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                        <Menubar className={`bg-transparent border ${t.menubarBorder} h-8`}>
                            <MenubarMenu>
                                <MenubarTrigger className={`flex items-center gap-1.5 text-xs px-3 h-7 ${t.menubarTrigger}`}>
                                    <Plus className="w-3.5 h-3.5" />
                                    Quick Actions
                                </MenubarTrigger>
                                <MenubarContent className={t.menubarContent}>
                                    <MenubarItem
                                        className={`text-xs ${t.menubarItem}`}
                                        onClick={() => setCategoryOpen(true)}
                                    >
                                        <Tag className="w-3.5 h-3.5 mr-2" /> Add Category
                                    </MenubarItem>
                                    <MenubarItem
                                        className={`text-xs ${t.menubarItem}`}
                                        onClick={() => setExpenseOpen(true)}
                                    >
                                        <Receipt className="w-3.5 h-3.5 mr-2" /> Add Expense
                                    </MenubarItem>
                                </MenubarContent>
                            </MenubarMenu>
                        </Menubar>
                    </div>
                </header>
            </div>

            <div className="flex flex-1 min-h-0">
                <Sidebar
                    isOpen={isSidebarOpen}
                    onOpen={() => setSidebarOpen(true)}
                    onClose={() => setSidebarOpen(false)}
                />

                <main className={`flex-1 overflow-y-auto p-5 pt-20.25 md:pt-5 pb-24 md:pb-5 ${t.pageBg}`}>
                    <Outlet />
                </main>
            </div>

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

            <QuickActionFAB
                mode={
                    location.pathname === '/expenses' ? 'expense' :
                        location.pathname === '/categories' ? 'category' :
                            'menu'
                }
            />
            <Toaster position="top-right" richColors closeButton />
        </div>
    );
}