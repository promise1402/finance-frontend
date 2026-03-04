import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { AppDispatch, RootState } from '@/store';

import {
    fetchSummary,
    selectSummaryData,
    selectSummaryLoading,
} from '@/store/slices/summarySlice';
import {
    fetchExpenses,
    selectExpenses,
    getCategoryId,
    getCategoryName,
} from '@/store/slices/expenseSlice';
import { fetchCategories, selectCategories } from '@/store/slices/categorySlice';

import { t } from '@/theme/theme';
import { dashboardStrings as S } from '@/utils/appString';
import { QuickActionFAB } from '@/components/quickActionFab';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { PieChart, Pie, Cell, Sector } from 'recharts';
import { Loader2, Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight } from 'lucide-react';

const fmt = (n: number) => `₹${n.toLocaleString()}`;

type BarRange = 1 | 3 | 6;
type PieRange = 1 | 3 | 6;

const BAR_RANGES: { label: string; value: BarRange }[] = [
    { label: S.range1M, value: 1 },
    { label: S.range3M, value: 3 },
    { label: S.range6M, value: 6 },
];
const PIE_RANGES: { label: string; value: PieRange }[] = [
    { label: S.range1M, value: 1 },
    { label: S.range3M, value: 3 },
    { label: S.range6M, value: 6 },
];

// Active pie shape
const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    return (
        <g>
            <text x={cx} y={cy - 8} textAnchor="middle" fill={fill} fontSize={12} fontWeight={600}>{payload.name}</text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill={fill} fontSize={12}>{fmt(value)}</text>
            <text x={cx} y={cy + 26} textAnchor="middle" fill="#94a3b8" fontSize={10}>{(percent * 100).toFixed(1)}%</text>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 6}
                startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} innerRadius={outerRadius + 9} outerRadius={outerRadius + 12}
                startAngle={startAngle} endAngle={endAngle} fill={fill} />
        </g>
    );
};

// Stat cards with per-card accent
interface StatCardProps {
    label: string;
    value: string;
    sub?: string;
    icon: React.ElementType;
    iconBg: string;   // e.g. 'bg-blue-100'
    iconColor: string;   // e.g. 'text-blue-600'
    valueColor?: string; // override value colour if needed
}
function StatCard({ label, value, sub, icon: Icon, iconBg, iconColor, valueColor }: StatCardProps) {
    return (
        <div className={`rounded-xl border p-4 flex items-start gap-3 ${t.cardChart}`}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon className={`w-4 h-4 ${iconColor}`} />
            </div>
            <div className="min-w-0">
                <p className={`text-xs ${t.textMuted}`}>{label}</p>
                <p className={`text-base font-bold mt-0.5 truncate ${valueColor ?? t.textPrimary}`}>{value}</p>
                {sub && <p className={`text-xs mt-0.5 ${t.textMuted}`}>{sub}</p>}
            </div>
        </div>
    );
}

// Range pill
function RangePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <button onClick={onClick}
            className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${active ? t.btnPrimary : `${t.btnGhost} border ${t.border}`
                }`}>
            {label}
        </button>
    );
}

// Page
export default function DashboardPage() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();
    const user = useSelector((s: RootState) => s.auth.user);
    const summary = useSelector(selectSummaryData);
    const loading = useSelector(selectSummaryLoading);
    const expenses = useSelector(selectExpenses);
    const categories = useSelector(selectCategories);

    const [barRange, setBarRange] = useState<BarRange>(6);
    const [pieRange, setPieRange] = useState<PieRange>(1);
    const [activePieIdx, setActivePieIdx] = useState(0);

    const username = user?.username ?? 'User';

    const colorByName = useMemo(
        () => Object.fromEntries(categories.map(c => [c.name, c.color])),
        [categories]
    );
    const colorById = useMemo(
        () => Object.fromEntries(categories.map(c => [c._id, c.color])),
        [categories]
    );

    useEffect(() => {
        dispatch(fetchCategories()).unwrap().catch(() => { });
        dispatch(fetchExpenses()).unwrap().catch(() => { });
        dispatch(fetchSummary({ range: 'monthly', anchor: new Date().toISOString() }))
            .unwrap()
            .catch(() => toast.error(S.fetchError, { description: S.fetchErrorDesc }));
    }, [dispatch]);

    // Derived values
    const totalBudget = summary?.totalBudget ?? 0;
    const totalExpenses = summary?.totalExpenses ?? 0;
    const remainingBudget = summary?.remainingBudget ?? 0;
    const periodTotal = summary?.periodTotal ?? 0;
    const isOverBudget = remainingBudget < 0;
    const usedPct = totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(0) : '0';

    // Bar data
    const barData = useMemo(() => {
        const now = new Date();
        const months: Record<string, { month: string; amount: number }> = {};
        for (let i = barRange - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            months[key] = { month: key, amount: 0 };
        }
        expenses.forEach(exp => {
            const d = new Date(exp.date);
            const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
            if (months[key]) months[key].amount += exp.amount;
        });
        return Object.values(months);
    }, [expenses, barRange]);

    const barConfig = { amount: { label: 'Spent', color: '#3b82f6' } };

    // Pie data
    const pieData = useMemo(() => {
        const now = new Date();
        const cutoff = new Date(now.getFullYear(), now.getMonth() - (pieRange - 1), 1);
        const totals: Record<string, number> = {};
        expenses.forEach(exp => {
            if (new Date(exp.date) < cutoff) return;
            const id = getCategoryId(exp.category);
            const name = getCategoryName(exp.category) ?? categories.find(c => c._id === id)?.name ?? 'Uncategorised';
            totals[name] = (totals[name] ?? 0) + exp.amount;
        });
        return Object.entries(totals)
            .map(([name, value]) => ({ name, value }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [expenses, pieRange, categories]);

    const pieTotal = pieData.reduce((s, d) => s + d.value, 0);

    // Recent
    const recent = useMemo(
        () => [...expenses]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5),
        [expenses]
    );

    return (
        <div className="space-y-5">

            <div>
                <h2 className={`text-lg font-semibold ${t.textPrimary}`}>
                    {S.welcome} <span className="text-blue-500">{username}!</span>
                </h2>
                <p className={`text-sm mt-0.5 ${t.textMuted}`}>Here's what's happening with your money.</p>
            </div>

            {loading && !summary ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className={`w-6 h-6 animate-spin ${t.textMuted}`} />
                </div>
            ) : (
                <>
                    {/* Stat cards — each with its own accent */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                        {/* Total Budget — blue */}
                        <StatCard
                            label={S.statBudget}
                            value={fmt(totalBudget)}
                            icon={Wallet}
                            iconBg="bg-blue-100"
                            iconColor="text-blue-600"
                            valueColor="text-blue-700"
                        />

                        {/* This Month — violet */}
                        <StatCard
                            label={S.statThisMonth}
                            value={fmt(periodTotal)}
                            icon={TrendingUp}
                            iconBg="bg-violet-100"
                            iconColor="text-violet-600"
                            valueColor="text-violet-700"
                        />

                        {/* All-time Spent — amber */}
                        <StatCard
                            label={S.statAllTime}
                            value={fmt(totalExpenses)}
                            icon={TrendingDown}
                            iconBg="bg-amber-100"
                            iconColor="text-amber-600"
                            valueColor="text-amber-700"
                        />

                        {/* Remaining — emerald or red */}
                        <StatCard
                            label={S.statRemaining}
                            value={fmt(remainingBudget)}
                            icon={PiggyBank}
                            iconBg={isOverBudget ? 'bg-red-100' : 'bg-emerald-100'}
                            iconColor={isOverBudget ? 'text-red-500' : 'text-emerald-600'}
                            valueColor={isOverBudget ? 'text-red-500' : 'text-emerald-700'}
                            sub={isOverBudget ? S.statOverBudget : `${usedPct}${S.statUsed}`}
                        />
                    </div>

                    <Separator className={t.sep} />

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                        {/* Bar chart */}
                        <Card className={`lg:col-span-2 border ${t.cardChart}`}>
                            <CardHeader className="px-5 pt-5 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className={`text-sm font-semibold ${t.textPrimary}`}>{S.spendingOverview}</CardTitle>
                                    <div className="flex gap-1.5">
                                        {BAR_RANGES.map(r => (
                                            <RangePill key={r.value} label={r.label} active={barRange === r.value} onClick={() => setBarRange(r.value)} />
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-5 pb-5">
                                {barData.every(d => d.amount === 0) ? (
                                    <div className={`h-52 rounded-xl border flex items-center justify-center ${t.cardInner}`}>
                                        <p className={`text-xs ${t.textMuted}`}>{S.noBarData}</p>
                                    </div>
                                ) : (
                                    <ChartContainer config={barConfig} className="h-52 w-full">
                                        <BarChart data={barData} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
                                            <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
                                            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }}
                                                tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                                            <ChartTooltip content={<ChartTooltipContent formatter={(v: any) => fmt(Number(v))} />} />
                                            <ChartLegend content={<ChartLegendContent />} />
                                            <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} maxBarSize={48} />
                                        </BarChart>
                                    </ChartContainer>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pie chart */}
                        <Card className={`border ${t.cardChart}`}>
                            <CardHeader className="px-5 pt-5 pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className={`text-sm font-semibold ${t.textPrimary}`}>{S.byCategory}</CardTitle>
                                    <div className="flex gap-1">
                                        {PIE_RANGES.map(r => (
                                            <RangePill key={r.value} label={r.label} active={pieRange === r.value}
                                                onClick={() => { setPieRange(r.value); setActivePieIdx(0); }} />
                                        ))}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="px-3 pb-4">
                                {pieData.length === 0 ? (
                                    <div className={`h-52 rounded-xl border flex items-center justify-center ${t.cardInner}`}>
                                        <p className={`text-xs ${t.textMuted}`}>{S.noCategoryData}</p>
                                    </div>
                                ) : (
                                    <>
                                        <ChartContainer
                                            config={Object.fromEntries(pieData.map((d, i) => [
                                                d.name,
                                                { label: d.name, color: colorByName[d.name] ?? `hsl(${(i * 67) % 360},65%,55%)` },
                                            ]))}
                                            className="h-44 w-full"
                                        >
                                            <PieChart>
                                                <ChartTooltip content={<ChartTooltipContent formatter={(v: any) => fmt(Number(v))} hideLabel />} />
                                                <Pie
                                                    activeIndex={activePieIdx}
                                                    activeShape={renderActiveShape}
                                                    data={pieData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={50} outerRadius={68}
                                                    dataKey="value"
                                                    onMouseEnter={(_, i) => setActivePieIdx(i)}
                                                >
                                                    {pieData.map((entry, i) => (
                                                        <Cell key={i}
                                                            fill={colorByName[entry.name] ?? `hsl(${(i * 67) % 360},65%,55%)`} />
                                                    ))}
                                                </Pie>
                                            </PieChart>
                                        </ChartContainer>

                                        {/* Category legend */}
                                        <div className="mt-2 space-y-1.5 px-1">
                                            {pieData.slice(0, 5).map((d, i) => {
                                                const color = colorByName[d.name] ?? `hsl(${(i * 67) % 360},65%,55%)`;
                                                const isAct = activePieIdx === i;
                                                return (
                                                    <div key={d.name}
                                                        className="flex items-center justify-between cursor-pointer"
                                                        onMouseEnter={() => setActivePieIdx(i)}>
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="w-2 h-2 rounded-full shrink-0"
                                                                style={{ backgroundColor: color }} />
                                                            <span className={`text-xs truncate ${isAct ? `font-semibold ${t.textPrimary}` : t.textMuted}`}>
                                                                {d.name}
                                                            </span>
                                                        </div>
                                                        <span className={`text-xs font-medium shrink-0 ml-2 ${isAct ? t.textPrimary : t.textMuted}`}>
                                                            {((d.value / pieTotal) * 100).toFixed(0)}%
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent transactions */}
                    <Card className={`border ${t.cardChart}`}>
                        <CardHeader className="px-5 pt-5 pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className={`text-sm font-semibold ${t.textPrimary}`}>{S.recentTransactions}</CardTitle>
                                <Button variant="ghost" size="sm"
                                    onClick={() => navigate('/expenses')}
                                    className={`h-7 text-xs gap-1 ${t.btnGhost}`}>
                                    {S.viewAll} <ArrowUpRight className="w-3 h-3" />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="px-0 pb-2">
                            {recent.length === 0 ? (
                                <div className={`mx-5 h-20 rounded-xl border flex items-center justify-center ${t.cardInner}`}>
                                    <p className={`text-xs ${t.textMuted}`}>{S.noTransactions}</p>
                                </div>
                            ) : (
                                recent.map(exp => {
                                    const id = getCategoryId(exp.category);
                                    const name = getCategoryName(exp.category) ?? categories.find(c => c._id === id)?.name ?? 'Uncategorised';
                                    const color = colorById[id] ?? '#94a3b8';
                                    return (
                                        <div key={exp._id}
                                            className={`flex items-center justify-between px-5 py-3 border-t ${t.tableRow} ${t.tableRowHover} transition-colors`}>
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/10"
                                                    style={{ backgroundColor: color }} />
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-medium truncate ${t.textPrimary}`}>{exp.note}</p>
                                                    <p className={`text-xs mt-0.5 ${t.textMuted}`}>
                                                        {name} · {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold shrink-0 ml-4 ${t.textPrimary}`}>{fmt(exp.amount)}</span>
                                        </div>
                                    );
                                })
                            )}
                        </CardContent>
                    </Card>
                </>
            )}

            <QuickActionFAB mode="menu" />
        </div>
    );
}