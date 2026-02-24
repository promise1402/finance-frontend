import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { t } from '@/theme/theme';
import { AddExpenseModal, ExpenseFormValues, Category } from '@/modals/addExpense';
import { AddCategoryModal, CategoryFormValues } from '@/modals/addCategory';

import Sidebar, { navItems } from '@/pages/sidebar';
import { QuickActionFAB } from '@/components/quickActionFab';

import {
    Menubar, MenubarContent, MenubarItem,
    MenubarMenu, MenubarTrigger,
} from '@/components/ui/menubar';
import { Tag, Receipt, Wallet, Plus } from 'lucide-react';
import { Toaster } from './ui/sonner';

const MOCK_CATEGORIES: Category[] = [
    { _id: '1', label: 'Groceries', budget: 500 },
    { _id: '2', label: 'Transport', budget: 200 },
    { _id: '3', label: 'Rent', budget: 1500 },
    { _id: '4', label: 'Utilities' },
];

export default function Layout() {
    const location = useLocation();

    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [expenseOpen, setExpenseOpen] = useState(false);
    const [categoryOpen, setCategoryOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const activeLabel = navItems.find(n => n.path === location.pathname)?.label ?? 'Dashboard';

    const isExpenses = location.pathname === '/expenses';
    const isCategories = location.pathname === '/categories';
    const showExpense = !isCategories;
    const showCategory = !isExpenses;

    const triggerLabel =
        isExpenses ? 'Add Expense' :
            isCategories ? 'Add Category' :
                'Quick Actions';

    const TriggerIcon =
        isExpenses ? Receipt :
            isCategories ? Tag :
                Plus;

    const handleExpenseSubmit = async (data: ExpenseFormValues) => {
        setLoading(true);
        try {
            // TODO: dispatch(createExpense({ ...data, amount: Number(data.amount), date: new Date(data.date) }))
            console.log('Create expense:', data);
            setExpenseOpen(false);
        } finally { setLoading(false); }
    };

    const handleCategorySubmit = async (data: CategoryFormValues) => {
        setLoading(true);
        try {
            // TODO: dispatch(createCategory({ label: data.label, budget: data.budget ? Number(data.budget) : undefined }))
            console.log('Create category:', data);
            setCategoryOpen(false);
        } finally { setLoading(false); }
    };

    return (
        <div className={`flex flex-col h-screen ${t.pageBg} overflow-hidden`}>

            {/* ══ ROW 1 — TOPBAR (h-[61px], perfectly aligned with sidebar logo strip) */}
            <div className="hidden md:flex w-full h-15.25 shrink-0">

                {/* Desktop logo strip — same width as sidebar */}
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

                {/* Desktop header — page title + context-aware Quick Actions */}
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

                    {/* Context-aware Quick Actions */}
                    <div className="flex items-center gap-2 ml-auto">
                        <Menubar className={`bg-transparent border ${t.menubarBorder} h-8`}>
                            <MenubarMenu>
                                {(isExpenses || isCategories) ? (
                                    // Single action — no dropdown, direct modal open
                                    <MenubarTrigger
                                        className={`flex items-center gap-1.5 text-xs px-3 h-7 ${t.menubarTrigger}`}
                                        onClick={() => isExpenses ? setExpenseOpen(true) : setCategoryOpen(true)}
                                    >
                                        <TriggerIcon className="w-3.5 h-3.5" />
                                        {triggerLabel}
                                    </MenubarTrigger>
                                ) : (
                                    // Multi-action dropdown
                                    <>
                                        <MenubarTrigger className={`flex items-center gap-1.5 text-xs px-3 h-7 ${t.menubarTrigger}`}>
                                            <TriggerIcon className="w-3.5 h-3.5" />
                                            {triggerLabel}
                                        </MenubarTrigger>
                                        <MenubarContent className={t.menubarContent}>
                                            {showExpense && (
                                                <MenubarItem className={`text-xs ${t.menubarItem}`} onClick={() => setExpenseOpen(true)}>
                                                    <Receipt className="w-3.5 h-3.5 mr-2" /> Add Expense
                                                </MenubarItem>
                                            )}
                                            {showCategory && (
                                                <MenubarItem className={`text-xs ${t.menubarItem}`} onClick={() => setCategoryOpen(true)}>
                                                    <Tag className="w-3.5 h-3.5 mr-2" /> Add Category
                                                </MenubarItem>
                                            )}
                                        </MenubarContent>
                                    </>
                                )}
                            </MenubarMenu>
                        </Menubar>
                    </div>
                </header>

                {/* Mobile topbar is rendered inside Sidebar */}
            </div>

            <div className="flex flex-1 min-h-0">

                {/* Sidebar — handles mobile overlay + drawer internally */}
                <Sidebar
                    isOpen={isSidebarOpen}
                    onOpen={() => setSidebarOpen(true)}
                    onClose={() => setSidebarOpen(false)}
                />

                <main className={` flex-1 overflow-y-auto p-5 pt-20.25 md:pt-5 pb-24 md:pb-5
          ${t.pageBg}
        `}>
                    <Outlet />
                </main>
            </div>

            <AddExpenseModal
                open={expenseOpen}
                categories={MOCK_CATEGORIES}
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
                    isExpenses ? 'expense' :
                        isCategories ? 'category' :
                            'menu'
                }
            />
            <Toaster position="top-right" richColors closeButton />
        </div>
    );
}