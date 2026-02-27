import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';

import { t } from '@/theme/theme';
import { expenseStrings as S } from '@/utils/appString';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Receipt } from 'lucide-react';

export interface Category {
    _id: string;
    label: string;
    budget?: number;
}

export interface ExpenseFormValues {
    amount: string;
    category: string;
    date: string;
    note: string;
}

interface AddExpenseModalProps {
    open: boolean;
    categories: Category[];
    onClose: () => void;
    onSubmit: (data: ExpenseFormValues) => Promise<void>;
    loading?: boolean;
    defaultValues?: Partial<ExpenseFormValues>;
}

const todayISO = () => new Date().toISOString().split('T')[0];
const EMPTY: ExpenseFormValues = { amount: '', category: '', date: todayISO(), note: '' };

export function AddExpenseModal({
    open,
    categories,
    onClose,
    onSubmit,
    loading = false,
    defaultValues,
}: AddExpenseModalProps) {
    const isEdit = !!defaultValues;

    const { register, handleSubmit, control, reset, formState: { errors } } =
        useForm<ExpenseFormValues>({ mode: 'onChange', defaultValues: EMPTY });

    useEffect(() => {
        if (!open) return;
        reset(
            isEdit
                ? {
                    amount: defaultValues?.amount ?? '',
                    category: defaultValues?.category ?? '',
                    date: defaultValues?.date ?? todayISO(),
                    note: defaultValues?.note ?? '',
                }
                : { ...EMPTY, date: todayISO() }
        );
    }, [open]);

    const handleClose = () => { onClose(); reset(EMPTY); };
    const errCls = (has: boolean) => has ? 'border-red-400 ring-2 ring-red-100' : '';

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={`w-[calc(100vw-2rem)] max-w-sm max-h-[85vh] overflow-y-auto ${t.popoverBg}`}>
                <DialogHeader>
                    <DialogTitle className={`flex items-center gap-2 text-sm font-semibold ${t.textPrimary}`}>
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${t.logoIconBg}`}>
                            <Receipt className={`w-3.5 h-3.5 ${t.logoIconText}`} />
                        </div>
                        {isEdit ? S.editTitle : S.createTitle}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-1">

                    {/* Amount */}
                    <div className="space-y-1.5">
                        <Label htmlFor="exp-amount" className={`text-xs font-medium ${t.textPrimary}`}>
                            {S.amountField} <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                            <span className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm select-none ${t.textMuted}`}>₹</span>
                            <Input
                                id="exp-amount"
                                placeholder="0.00"
                                inputMode="decimal"
                                className={`h-9 text-sm pl-7 ${t.inputBg} ${t.inputBorder} ${t.inputText} ${t.inputPlaceholder} ${t.inputFocus} ${errCls(!!errors.amount)}`}
                                {...register('amount', {
                                    required: S.amountRequired,
                                    validate: val => (!isNaN(Number(val)) && Number(val) > 0) ? true : S.amountInvalid,
                                })}
                            />
                        </div>
                        {errors.amount && <p className="text-xs text-red-500 leading-tight">{errors.amount.message}</p>}
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                        <Label htmlFor="exp-category" className={`text-xs font-medium ${t.textPrimary}`}>
                            {S.categoryField} <span className="text-red-500">*</span>
                        </Label>
                        <Controller
                            name="category"
                            control={control}
                            rules={{ required: S.categoryRequired }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger
                                        id="exp-category"
                                        className={`h-9 text-sm ${t.inputBg} ${t.inputBorder} ${t.inputText} ${t.inputFocus} ${errCls(!!errors.category)}`}
                                    >
                                        <SelectValue placeholder={S.categoryPlaceholder} />
                                    </SelectTrigger>
                                    <SelectContent className={t.popoverBg}>
                                        {categories.map(cat => (
                                            <SelectItem key={cat._id} value={cat._id} className={`text-sm ${t.menubarItem}`}>
                                                <span>{cat.label}</span>
                                                {cat.budget && (
                                                    <span className={`ml-2 text-xs ${t.textMuted}`}>
                                                        (₹{cat.budget.toLocaleString()})
                                                    </span>
                                                )}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.category && <p className="text-xs text-red-500 leading-tight">{errors.category.message}</p>}
                    </div>

                    {/* Date */}
                    <div className="space-y-1.5">
                        <Label htmlFor="exp-date" className={`text-xs font-medium ${t.textPrimary}`}>
                            {S.dateField} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="exp-date"
                            type="date"
                            className={`h-9 text-sm ${t.inputBg} ${t.inputBorder} ${t.inputText} ${t.inputFocus} ${errCls(!!errors.date)}`}
                            {...register('date', { required: S.dateRequired })}
                        />
                        {errors.date && <p className="text-xs text-red-500 leading-tight">{errors.date.message}</p>}
                    </div>

                    {/* Note */}
                    <div className="space-y-1.5">
                        <Label htmlFor="exp-note" className={`text-xs font-medium ${t.textPrimary}`}>
                            {S.noteField} <span className="text-red-500">*</span>
                        </Label>
                        <Textarea
                            id="exp-note"
                            placeholder={S.notePlaceholder}
                            rows={2}
                            className={`text-sm resize-none ${t.inputBg} ${t.inputBorder} ${t.inputText} ${t.inputPlaceholder} ${t.inputFocus} ${errCls(!!errors.note)}`}
                            {...register('note', { required: S.noteRequired })}
                        />
                        {errors.note && <p className="text-xs text-red-500 leading-tight">{errors.note.message}</p>}
                    </div>

                    <DialogFooter className="flex flex-row justify-end gap-2 pt-1">
                        <Button type="button" variant="ghost" size="sm" onClick={handleClose}
                            disabled={loading} className={`text-xs ${t.btnGhost}`}>
                            {S.cancelBtn}
                        </Button>
                        <Button type="submit" size="sm" disabled={loading} className={`text-xs ${t.btnPrimary}`}>
                            {loading ? S.savingBtn : isEdit ? S.saveBtn : S.createBtn}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}