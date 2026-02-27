import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'sonner';

import { registerUser, selectAuthLoading } from '../store/slices/authSlice';
import { registerStrings, validationStrings } from '../utils/appString';
import type { AppDispatch } from '../store';
import { Toaster } from '@/components/ui/sonner';

export default function Register() {
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();
    const loading = useSelector(selectAuthLoading);

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { register, handleSubmit, watch, formState: { errors } } = useForm({ mode: 'onChange' });

    const password = watch('password');

    const onSubmit = async (data: any) => {
        const { confirmPassword, ...payload } = data;
        try {
            await dispatch(registerUser(payload)).unwrap();
            toast.success(registerStrings.successTitle, { description: registerStrings.successDesc });
            navigate('/login');
        } catch (err: any) {
            // RTK unwrap throws the rejectWithValue payload directly
            const msg = typeof err === 'string'
                ? err
                : err?.payload ?? err?.message ?? registerStrings.apiFallbackError;
            toast.error(msg);
        }
    };

    const EyeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    );

    const EyeSlashIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    {registerStrings.title}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-7" onSubmit={handleSubmit(onSubmit)}>
                        {/* EMAIL FIELD */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">
                                {registerStrings.emailLabel}
                            </label>
                            <input
                                type="email"
                                {...register("email", {
                                    required: validationStrings.emailRequired,
                                    pattern: { value: /\S+@\S+\.\S+/, message: validationStrings.emailInvalid },
                                })}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            />
                            <p className="absolute text-[10px] text-red-600 mt-0.5 left-1 uppercase font-bold tracking-wider">
                                {errors.email?.message as string}
                            </p>
                        </div>

                        {/* USERNAME FIELD */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">
                                {registerStrings.usernameLabel}
                            </label>
                            <input
                                type="text"
                                {...register("username", { required: validationStrings.usernameRequired })}
                                className={`mt-1 block w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                            />
                            <p className="absolute text-[10px] text-red-600 mt-0.5 left-1 uppercase font-bold tracking-wider">
                                {errors.username?.message as string}
                            </p>
                        </div>

                        {/* PASSWORD FIELD */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">
                                {registerStrings.passwordLabel}
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    {...register("password", {
                                        required: validationStrings.passwordRequired,
                                        minLength: { value: 6, message: validationStrings.passwordMin },
                                    })}
                                    className={`block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                                >
                                    {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            <p className="absolute text-[10px] text-red-600 mt-0.5 left-1 uppercase font-bold tracking-wider">
                                {errors.password?.message as string}
                            </p>
                        </div>

                        {/* CONFIRM PASSWORD FIELD */}
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700">
                                {registerStrings.confirmPasswordLabel}
                            </label>
                            <div className="relative mt-1">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    {...register("confirmPassword", {
                                        required: validationStrings.confirmPasswordRequired,
                                        validate: v => v === password || validationStrings.passwordsDoNotMatch,
                                    })}
                                    className={`block w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm pr-10`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(p => !p)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400"
                                >
                                    {showConfirmPassword ? <EyeSlashIcon /> : <EyeIcon />}
                                </button>
                            </div>
                            <p className="absolute text-[10px] text-red-600 mt-0.5 left-1 uppercase font-bold tracking-wider">
                                {errors.confirmPassword?.message as string}
                            </p>
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 transition-all">
                                {loading ? registerStrings.loadingText : registerStrings.buttonText}
                            </button>
                            <p className="mt-4 text-center text-sm text-gray-600">
                                {registerStrings.footerText}{' '}
                                <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 underline">
                                    {registerStrings.linkText}
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
            <Toaster position="top-right" richColors closeButton />
        </div>
    );
}