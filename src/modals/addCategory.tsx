import { useForm } from 'react-hook-form';

import { t } from '@/theme/theme';
import { AppStrings } from '@/utils/appString';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Tag } from 'lucide-react';

const S = AppStrings.category;

export interface CategoryFormValues {
    label: string;   // required
    budget: string;   // optional — parsed to Number on submit
}

interface AddCategoryModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormValues) => Promise<void>;
    loading?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
export function AddCategoryModal({
    open,
    onClose,
    onSubmit,
    loading = false,
}: AddCategoryModalProps) {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CategoryFormValues>({
        mode: 'onChange',
        defaultValues: { label: '', budget: '' },
    });

    const handleClose = () => { onClose(); reset(); };

    // Field error ring helper
    const errCls = (has: boolean) =>
        has ? 'border-red-400 ring-2 ring-red-100' : '';

    return (
        <Dialog open={open} onOpenChange={handleClose}>

            <DialogContent className={`
        w-[calc(100vw-2rem)] max-w-sm max-h-[85vh] overflow-y-auto
        ${t.popoverBg}
      `}>
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 text-sm font-semibold ${t.textPrimary}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${t.logoIconBg}`}>
                            <Tag className={`w-3.5 h-3.5 ${t.logoIconText}`} />
                        </div>
                        {S.modalTitle}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">

                    {/* Category Name — required */}
                    <div className="space-y-1.5">
                        <Label htmlFor="cat-label" className={`text-xs font-medium ${t.textPrimary}`}>
                            {S.labelField} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="cat-label"
                            placeholder={S.labelPlaceholder}
                            autoComplete="off"
                            className={`h-9 text-sm
                ${t.inputBg} ${t.inputBorder} ${t.inputText}
                ${t.inputPlaceholder} ${t.inputFocus}
                ${errCls(!!errors.label)}
              `}
                            {...register('label', {
                                required: S.labelRequired,
                                minLength: { value: 2, message: S.labelMinLength },
                            })}
                        />
                        {errors.label && (
                            <p className="text-xs text-red-500 leading-tight">{errors.label.message}</p>
                        )}
                    </div>

                    {/* Budget — optional */}
                    <div className="space-y-1.5">
                        <Label htmlFor="cat-budget" className={`text-xs font-medium ${t.textPrimary}`}>
                            {S.budgetField}{' '}
                            <span className={`font-normal ${t.textMuted}`}>({S.budgetHint})</span>
                        </Label>
                        <div className="relative">
                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none ${t.textMuted}`}>
                                $
                            </span>
                            <Input
                                id="cat-budget"
                                placeholder="0.00"
                                inputMode="decimal"
                                className={`h-9 text-sm pl-7
                  ${t.inputBg} ${t.inputBorder} ${t.inputText}
                  ${t.inputPlaceholder} ${t.inputFocus}
                  ${errCls(!!errors.budget)}
                `}
                                {...register('budget', {
                                    validate: val =>
                                        !val || (!isNaN(Number(val)) && Number(val) >= 0)
                                            ? true
                                            : S.budgetInvalid,
                                })}
                            />
                        </div>
                        {errors.budget && (
                            <p className="text-xs text-red-500 leading-tight">{errors.budget.message}</p>
                        )}
                    </div>

                    <DialogFooter className="flex flex-row justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleClose}
                            disabled={loading}
                            className={`text-xs ${t.btnGhost}`}
                        >
                            {S.cancelBtn}
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading}
                            className={`text-xs ${t.btnPrimary}`}
                        >
                            {loading ? S.submittingBtn : S.submitBtn}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}