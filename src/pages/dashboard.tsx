import { useSelector } from 'react-redux';
import type { RootState } from '@/store';

import { t } from '@/theme/theme';
import { AppStrings } from '@/utils/appString';
import { QuickActionFAB } from '@/components/quickActionFab';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const S = AppStrings.pages.dashboard;

// ─── Dummy data — swap with real Redux/API values ─────────────────────────────
const MONTHLY_BUDGET = 4000;
const TOTAL_EXPENSES = 3180;
const TOTAL_INCOME = 5230;
const TOTAL_BALANCE = 12450;
const remaining = MONTHLY_BUDGET - TOTAL_EXPENSES;
const spentPercent = Math.min((TOTAL_EXPENSES / MONTHLY_BUDGET) * 100, 100);
const isOverBudget = remaining < 0;

export default function DashboardPage() {
    const user = useSelector((state: RootState) => state.auth.user);
    const username = user?.username || 'User';

    return (
        <div className="space-y-6">

            {/* Welcome */}
            <div>
                <h2 className={`text-xl font-semibold ${t.textPrimary}`}>
                    Welcome, <span className="text-blue-600">{username}!</span>
                </h2>
                <p className={`text-sm mt-1 ${t.textMuted}`}>{S.description}</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                <Card className={`${t.cardBalance} border-0`}>
                    <CardHeader className="pb-1 pt-4 px-4">
                        <CardTitle className={`text-xs font-medium uppercase tracking-wider ${t.cardBalanceLabel}`}>
                            Total Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <p className="text-2xl font-bold">${TOTAL_BALANCE.toLocaleString()}.00</p>
                        <div className="flex items-center gap-1 mt-1.5">
                            <TrendingUp className={`w-3 h-3 ${t.cardBalanceTrend}`} />
                            <span className={`text-xs font-medium ${t.cardBalanceTrend}`}>+8.2% this month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border ${t.cardIncome}`}>
                    <CardHeader className="pb-1 pt-4 px-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className={`text-xs font-medium uppercase tracking-wider ${t.cardIncomeLabel}`}>
                                Total Income
                            </CardTitle>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${t.cardIncomeBadge}`}>
                                +12.5%
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <p className={`text-2xl font-bold ${t.cardIncomeValue}`}>${TOTAL_INCOME.toLocaleString()}.00</p>
                        <div className="flex items-center gap-1 mt-1.5">
                            <ArrowUpRight className={`w-3.5 h-3.5 ${t.cardIncomeTrend}`} />
                            <span className={`text-xs font-medium ${t.cardIncomeTrend}`}>vs last month</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border ${t.cardExpense}`}>
                    <CardHeader className="pb-1 pt-4 px-4">
                        <div className="flex items-center justify-between">
                            <CardTitle className={`text-xs font-medium uppercase tracking-wider ${t.cardExpenseLabel}`}>
                                Total Expenses
                            </CardTitle>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${t.cardExpenseBadge}`}>
                                +3.1%
                            </span>
                        </div>
                    </CardHeader>
                    <CardContent className="px-4 pb-4">
                        <p className={`text-2xl font-bold ${t.cardExpenseValue}`}>${TOTAL_EXPENSES.toLocaleString()}.00</p>
                        <div className="flex items-center gap-1 mt-1.5">
                            <ArrowDownRight className={`w-3.5 h-3.5 ${t.cardExpenseTrend}`} />
                            <span className={`text-xs font-medium ${t.cardExpenseTrend}`}>vs last month</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Budget bar */}
            <Card className={`border ${t.cardChart}`}>
                <CardContent className="px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <span className={`text-sm font-semibold ${t.textPrimary}`}>Monthly Budget</span>
                        <span className={`text-xs font-semibold ${isOverBudget ? t.budgetOver : t.budgetUnder}`}>
                            {isOverBudget
                                ? `✗ Over budget by $${Math.abs(remaining).toLocaleString()}`
                                : `✓ Under budget by $${remaining.toLocaleString()}`}
                        </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-slate-100">
                        <div
                            className={`h-2.5 rounded-full bg-linear-to-r transition-all duration-500
                ${isOverBudget ? t.budgetBarOver : t.budgetBarOk}`}
                            style={{ width: `${spentPercent}%` }}
                        />
                    </div>
                    <div className="flex justify-between mt-2 text-xs">
                        <span className={t.textMuted}>${TOTAL_EXPENSES.toLocaleString()} spent</span>
                        <span className={t.textMuted}>${MONTHLY_BUDGET.toLocaleString()} budget</span>
                    </div>
                </CardContent>
            </Card>

            <Separator className={t.sep} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className={`lg:col-span-2 border ${t.cardChart}`}>
                    <CardHeader className="px-5 pt-5 pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className={`text-sm font-semibold ${t.textPrimary}`}>Spending Overview</CardTitle>
                            <span className={`text-xs ${t.textMuted}`}>Last 6 months</span>
                        </div>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className={`h-52 rounded-xl border flex items-center justify-center ${t.cardInner}`}>
                            <p className={`text-xs ${t.cardInnerText}`}>{'<BarChart />'} goes here</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border ${t.cardChart}`}>
                    <CardHeader className="px-5 pt-5 pb-3">
                        <CardTitle className={`text-sm font-semibold ${t.textPrimary}`}>By Category</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        <div className={`h-52 rounded-xl border flex items-center justify-center ${t.cardInner}`}>
                            <p className={`text-xs ${t.cardInnerText}`}>{'<PieChart />'} goes here</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Transactions */}
            <Card className={`border ${t.cardChart}`}>
                <CardHeader className="px-5 pt-5 pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className={`text-sm font-semibold ${t.textPrimary}`}>Recent Transactions</CardTitle>
                        <Button variant="ghost" size="sm" className={`h-7 text-xs ${t.btnViewAll}`}>
                            View all
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                    <div className={`h-40 rounded-xl border flex items-center justify-center ${t.cardInner}`}>
                        <p className={`text-xs ${t.cardInnerText}`}>{'<RecentTransactions />'} goes here</p>
                    </div>
                </CardContent>
            </Card>

            {/* Mobile FAB — menu mode: choose Add Expense or Add Category */}
            <QuickActionFAB mode="menu" />
        </div>
    );
}