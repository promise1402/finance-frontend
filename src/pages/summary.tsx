import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch } from '@/store';

import {
    fetchSummary, setRangeAndAnchor,
    selectSummaryData, selectSummaryRange, selectSummaryAnchor, selectSummaryLoading,
    type RangeType,
} from '@/store/slices/summarySlice';

import { selectCategories, fetchCategories } from '@/store/slices/categorySlice';
import { summaryStrings as S } from '@/utils/appString';

import { t } from '@/theme/theme';
import { QuickActionFAB } from '@/components/quickActionFab';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronDown, Loader2, Receipt } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const RANGES: RangeType[] = ['daily', 'weekly', 'monthly', 'yearly'];
const fmt = (n: number) => `₹${n.toLocaleString()}`;

// Date Helpers

function getWeekStart(d: Date): Date {
    const day = new Date(d);
    day.setDate(day.getDate() - day.getDay());
    day.setHours(0, 0, 0, 0);
    return day;
}

function getLabel(range: RangeType, anchor: Date): string {
    if (range === 'daily')
        return anchor.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    if (range === 'weekly') {
        const s = getWeekStart(anchor);
        const e = new Date(s); e.setDate(e.getDate() + 6);
        return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (range === 'monthly')
        return anchor.toLocaleString('en-US', { month: 'long', year: 'numeric' });
    return `${anchor.getFullYear()}`;
}

function buildOptions(range: RangeType): { label: string; iso: string }[] {
    const now = new Date();
    if (range === 'yearly') {
        return Array.from({ length: 10 }, (_, i) => {
            const d = new Date(now.getFullYear() - i, 0, 1);
            return { label: `${d.getFullYear()}`, iso: d.toISOString() };
        });
    }
    if (range === 'monthly') {
        return Array.from({ length: 24 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            return { label: d.toLocaleString('en-US', { month: 'long', year: 'numeric' }), iso: d.toISOString() };
        });
    }
    if (range === 'weekly') {
        return Array.from({ length: 12 }, (_, i) => {
            const ws = getWeekStart(now);
            const d = new Date(ws); d.setDate(d.getDate() - i * 7);
            const e = new Date(d); e.setDate(e.getDate() + 6);
            return {
                label: `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
                iso: d.toISOString(),
            };
        });
    }
    return Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now); d.setDate(d.getDate() - i); d.setHours(12, 0, 0, 0);
        return {
            label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
            iso: d.toISOString(),
        };
    });
}

// Jump Dropdown

function JumpDropdown({ range, anchor, onSelect }: {
    range: RangeType;
    anchor: string;
    onSelect: (iso: string) => void;
}) {
    const options = useMemo(() => buildOptions(range), [range]);
    const currentLabel = getLabel(range, new Date(anchor));

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={`
                    flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                    text-xs font-semibold transition-colors whitespace-nowrap shrink-0
                    ${t.btnGhost} border ${t.border}
                `}>
                    <span className="max-w-32.5 sm:max-w-none truncate">{currentLabel}</span>
                    <ChevronDown className="w-3 h-3 shrink-0" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={6}
                className={`max-h-60 overflow-y-auto min-w-44 ${t.popoverBg}`}
            >
                {options.map((opt, i) => (
                    <DropdownMenuItem
                        key={i}
                        onClick={() => onSelect(opt.iso)}
                        className={`text-xs cursor-pointer ${opt.label === currentLabel
                            ? `font-semibold ${t.textPrimary}`
                            : t.textMuted
                            }`}
                    >
                        {opt.label}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}


export default function SummaryPage() {
    const dispatch = useDispatch<AppDispatch>();
    const summaryData = useSelector(selectSummaryData);
    const range = useSelector(selectSummaryRange);
    const anchor = useSelector(selectSummaryAnchor);
    const loading = useSelector(selectSummaryLoading);
    const categories = useSelector(selectCategories);

    const colorMap = useMemo(
        () => Object.fromEntries(categories.map(c => [c._id, c.color])),
        [categories]
    );

    const load = (r: RangeType, a: string) => {
        dispatch(setRangeAndAnchor({ range: r, anchor: a }));
        dispatch(fetchSummary({ range: r, anchor: a }))
            .unwrap()
            .catch(() => toast.error(S.fetchError, { description: S.fetchErrorDesc }));
    };

    useEffect(() => {
        dispatch(fetchCategories()).unwrap().catch(() => { });
        load(range, anchor);
    }, []);

    const handleRangeChange = (r: RangeType) => load(r, new Date().toISOString());
    const handleAnchorChange = (iso: string) => load(range, iso);

    const expenses = summaryData?.expenses ?? [];
    const anchorDate = new Date(anchor);

    return (
        <div className="space-y-5">
            <p className={`text-sm ${t.textMuted}`}>{S.pageDesc}</p>

            <Card className={`border ${t.cardChart}`}>
                <CardHeader className="px-5 pt-5 pb-0">

                    {/* Row 1: all 4 pills equal width */}
                    <div className="flex gap-1.5 mb-3">
                        {RANGES.map(r => (
                            <button
                                key={r}
                                onClick={() => handleRangeChange(r)}
                                className={`flex-1 py-1 rounded-full text-xs font-medium capitalize transition-colors ${range === r ? t.btnPrimary : `${t.btnGhost} border ${t.border}`
                                    }`}
                            >
                                {r}
                            </button>
                        ))}
                    </div>

                    {/* Row 2: dropdown right-aligned */}
                    <div className="flex justify-end mb-4">
                        <JumpDropdown range={range} anchor={anchor} onSelect={handleAnchorChange} />
                    </div>

                    {/* Period summary bar */}
                    <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl mb-3 ${t.cardInner}`}>
                        <span className={`text-xs ${t.textMuted}`}>
                            {expenses.length} {expenses.length === 1 ? S.expense : S.expenses}
                        </span>
                        <span className={`text-sm font-bold ${t.textPrimary}`}>
                            {fmt(summaryData?.periodTotal ?? 0)}
                        </span>
                    </div>
                </CardHeader>

                <CardContent className="px-0 pb-2">
                    {loading ? (
                        <div className="flex items-center justify-center py-14">
                            <Loader2 className={`w-5 h-5 animate-spin ${t.textMuted}`} />
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 gap-3">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.logoIconBg}`}>
                                <Receipt className="w-5 h-5 text-white" />
                            </div>
                            <div className="text-center">
                                <p className={`text-sm font-medium ${t.textPrimary}`}>{S.noExpenses}</p>
                                <p className={`text-xs mt-0.5 ${t.textMuted}`}>{S.noExpensesDesc} {getLabel(range, anchorDate)}.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mobile */}
                            <div className="md:hidden">
                                {expenses.map(exp => {
                                    const catId = typeof exp.category === 'object' ? exp.category?._id : exp.category;
                                    const name = typeof exp.category === 'object' ? exp.category?.name : 'Uncategorised';
                                    const color = colorMap[catId] ?? '#94a3b8';
                                    return (
                                        <div key={exp.id} className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 first:border-t-0">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="w-3 h-3 rounded-full shrink-0 ring-1 ring-black/10"
                                                    style={{ backgroundColor: color }} />
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-medium truncate ${t.textPrimary}`}>{exp.note ?? '-'}</p>
                                                    <p className={`text-xs mt-0.5 ${t.textMuted}`}>
                                                        {name} · {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-sm font-semibold shrink-0 ml-3 ${t.textPrimary}`}>{fmt(exp.amount)}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Desktop */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className={`text-xs uppercase tracking-wide ${t.tableHeader}`}>
                                            <th className="px-4 py-2.5 text-left font-medium">{S.tableNoteCol}</th>
                                            <th className="px-4 py-2.5 text-left font-medium">{S.tableCategoryCol}</th>
                                            <th className="px-4 py-2.5 text-left font-medium">{S.tableDateCol}</th>
                                            <th className="px-4 py-2.5 text-right font-medium">{S.tableAmountCol}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {expenses.map(exp => {
                                            const catId = typeof exp.category === 'object' ? exp.category?._id : exp.category;
                                            const name = typeof exp.category === 'object' ? exp.category?.name : 'Uncategorised';
                                            const color = colorMap[catId] ?? '#94a3b8';
                                            return (
                                                <tr key={exp.id} className={`border-t ${t.tableRow} ${t.tableRowHover} transition-colors`}>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-sm font-medium ${t.textPrimary}`}>{exp.note ?? '-'}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-black/10"
                                                                style={{ backgroundColor: color }} />
                                                            <span className={`text-xs ${t.textMuted}`}>{name}</span>
                                                        </div>
                                                    </td>
                                                    <td className={`px-4 py-3 text-xs ${t.textMuted}`}>
                                                        {new Date(exp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className={`px-4 py-3 text-right text-sm font-semibold ${t.textPrimary}`}>
                                                        {fmt(exp.amount)}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            <QuickActionFAB mode="menu" />
        </div>
    );
}