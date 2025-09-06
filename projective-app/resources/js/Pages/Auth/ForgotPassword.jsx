import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Forgot Password" />

            <div className="max-w-md mx-auto mt-10 bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 text-center mb-3">
                    Forgot Password?
                </h1>
                <p className="text-sm text-gray-600 text-center mb-6">
                    No worries! Enter your email and we’ll send you a reset link.
                </p>

                {status && (
                    <div className="mb-4 text-sm font-medium text-green-600 bg-green-100 border border-green-200 rounded-lg p-3 text-center">
                        {status}
                    </div>
                )}

                <form onSubmit={submit} className="space-y-5">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email Address
                        </label>
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full rounded-lg border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />
                        <InputError message={errors.email} className="mt-2 text-red-500" />
                    </div>

                    <div className="flex items-center justify-end">
                        <PrimaryButton
                            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
                            disabled={processing}
                        >
                            Send Reset Link
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
