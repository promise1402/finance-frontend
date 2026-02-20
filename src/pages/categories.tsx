import { t } from '@/theme/theme';
import { AppStrings } from '@/utils/appString';
import { QuickActionFAB } from '@/components/quickActionFab';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const S = AppStrings.pages.categories;

export default function CategoriesPage() {
    return (
        <div className="space-y-5">

            <p className={`text-sm ${t.textMuted}`}>{S.description}</p>

            <Card className={`border ${t.cardChart}`}>
                <CardHeader className="px-5 pt-5 pb-3">
                    <CardTitle className={`text-sm font-semibold ${t.textPrimary}`}>All Categories</CardTitle>
                </CardHeader>
                <CardContent className="px-5 pb-5">

                    <div className={`h-64 rounded-xl border flex items-center justify-center ${t.cardInner}`}>
                        <p className={`text-xs ${t.cardInnerText}`}>{'<CategoriesList />'} goes here</p>
                    </div>
                </CardContent>
            </Card>

            <QuickActionFAB mode="category" />
        </div>
    );
}