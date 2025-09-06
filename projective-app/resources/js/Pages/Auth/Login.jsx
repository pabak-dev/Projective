import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <GuestLayout>
            <Head title="Sign In" />

            <div className="flex flex-col items-center mb-8">

                <h1 className="text-xl font-semibold mt-4 text-gray-700">Projective</h1>
                <p className="text-sm text-gray-500">Team Task Management</p>
                <p className="mt-6 text-gray-600">Welcome back to your team</p>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800">Sign In</h2>
            <p className="text-center text-gray-500 mt-1 mb-6">Continue your productivity journey</p>

            {status && <div className="mb-4 font-medium text-sm text-green-600">{status}</div>}

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                        placeholder="your@email.com"
                    />
                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value="Password" />
                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                        placeholder="Enter your password"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-6">
                    
                    <PrimaryButton className="w-full justify-center !py-3 bg-gradient-to-r from-blue-500 to-purple-600" disabled={processing}>
                        Sign In & Start Collaborating
                    </PrimaryButton>
                </div>

                <div className="text-center mt-4">
                    <Link
                        href={route('password.request')}
                        className="underline text-sm text-gray-600 hover:text-gray-900"
                    >
                        Forgot your password?
                    </Link>
                </div>
            </form>
           <p className="text-center text-gray-500 mt-10">
                Don't have an account?{' '}
                <Link href={route('register')} className="font-semibold text-blue-600 hover:text-blue-800">
                    Create one here
                </Link>
            </p>
        </GuestLayout>
    );
}