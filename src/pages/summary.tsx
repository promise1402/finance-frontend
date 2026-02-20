import { t } from '@/theme/theme';
import { AppStrings } from '@/utils/appString';
import { QuickActionFAB } from '@/components/quickActionFab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const S = AppStrings.pages.summary;

export default function SummaryPage() {
    return (
        <div className="space-y-5">

            <p className={`text-sm ${t.textMuted}`}>{S.description}</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card className={`border ${t.cardChart}`}>
                    <CardHeader className="px-5 pt-5 pb-3">
                        <CardTitle className={`text-sm font-semibold ${t.textPrimary}`}>Monthly Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">

                        <div className={`h-52 rounded-xl border flex items-center justify-center ${t.cardInner}`}>
                            <p className={`text-xs ${t.cardInnerText}`}>{'<SummaryChart />'} goes here</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className={`border ${t.cardChart}`}>
                    <CardHeader className="px-5 pt-5 pb-3">
                        <CardTitle className={`text-sm font-semibold ${t.textPrimary}`}>Category Totals</CardTitle>
                    </CardHeader>
                    <CardContent className="px-5 pb-5">
                        {/* ↓ Drop your <CategoryTotals /> here */}
                        <div className={`h-52 rounded-xl border flex items-center justify-center ${t.cardInner}`}>
                            <p className={`text-xs ${t.cardInnerText}`}>{'<CategoryTotals />'} goes here</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <QuickActionFAB mode="menu" />
        </div>
    );
}