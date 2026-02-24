import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { t } from '@/theme/theme';
import { categoryStrings as S } from '@/utils/appString';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Tag } from 'lucide-react';

// ─── Preset swatches ──────────────────────────────────────────────────────────
export const CATEGORY_COLORS = [
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#14b8a6', // teal
    '#3b82f6', // blue
    '#64748b', // slate
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CategoryFormValues {
    name: string;
    color: string;
    budget: string;
}

interface AddCategoryModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: CategoryFormValues) => Promise<void>;
    loading?: boolean;
    defaultValues?: Partial<CategoryFormValues>;  // present = edit mode
}

export function AddCategoryModal({
    open,
    onClose,
    onSubmit,
    loading = false,
    defaultValues,
}: AddCategoryModalProps) {
    const isEdit = !!defaultValues;

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CategoryFormValues>({
        mode: 'onChange',
        defaultValues: {
            name: defaultValues?.name ?? '',
            color: defaultValues?.color ?? CATEGORY_COLORS[0],
            budget: defaultValues?.budget ?? '',
        },
    });

    // Re-sync when modal opens for a different category
    useEffect(() => {
        if (open) {
            reset({
                name: defaultValues?.name ?? '',
                color: defaultValues?.color ?? CATEGORY_COLORS[0],
                budget: defaultValues?.budget ?? '',
            });
        }
    }, [open, defaultValues, reset]);

    const selectedColor = watch('color');

    const handleClose = () => { onClose(); reset(); };

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
                        {/* Icon adopts selected colour live */}
                        <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150"
                            style={{ backgroundColor: selectedColor }}
                        >
                            <Tag className="w-3.5 h-3.5 text-white" />
                        </div>
                        {isEdit ? S.editTitle : S.createTitle}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">

                    {/* Name */}
                    <div className="space-y-1.5">
                        <Label htmlFor="cat-name" className={`text-xs font-medium ${t.textPrimary}`}>
                            {S.nameField} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="cat-name"
                            placeholder={S.namePlaceholder}
                            autoComplete="off"
                            className={`h-9 text-sm
                                ${t.inputBg} ${t.inputBorder} ${t.inputText}
                                ${t.inputPlaceholder} ${t.inputFocus}
                                ${errCls(!!errors.name)}
                            `}
                            {...register('name', {
                                required: S.nameRequired,
                                minLength: { value: 2, message: S.nameMinLength },
                            })}
                        />
                        {errors.name && (
                            <p className="text-xs text-red-500 leading-tight">{errors.name.message}</p>
                        )}
                    </div>

                    {/* Colour swatches */}
                    <div className="space-y-2">
                        <Label className={`text-xs font-medium ${t.textPrimary}`}>{S.colorField}</Label>
                        <div className="flex flex-wrap gap-2 mt-px">
                            {CATEGORY_COLORS.map(color => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setValue('color', color, { shouldValidate: true })}
                                    className={`
                                        w-6 h-6 rounded-full transition-all duration-150 shrink-0
                                        ${selectedColor === color
                                            ? 'ring-2 ring-offset-1 ring-slate-400 scale-110'
                                            : 'opacity-75 hover:opacity-100 hover:scale-105'}
                                    `}
                                    style={{ backgroundColor: color }}
                                    aria-label={color}
                                />
                            ))}
                        </div>
                        {/* Hidden field so color is included in form data */}
                        <input type="hidden" {...register('color', { required: true })} />
                    </div>

                    {/* Budget — optional */}
                    <div className="space-y-1.5">
                        <Label htmlFor="cat-budget" className={`text-xs font-medium ${t.textPrimary}`}>
                            {S.budgetField}{' :'}
                            <span className={`font-normal ${t.textMuted}`}>
                                {/* ({S.budgetHint}) */}
                            </span>
                        </Label>
                        <div className="relative">
                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none ${t.textMuted}`}>
                                ₹
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
                        {/* Submit button adopts the selected colour */}
                        <Button
                            type="submit"
                            size="sm"
                            disabled={loading}
                            className="text-xs text-white border-0"
                            style={{ backgroundColor: selectedColor }}
                        >
                            {loading ? S.savingBtn : isEdit ? S.saveBtn : S.createBtn}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}