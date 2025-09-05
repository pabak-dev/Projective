import { useEffect } from 'react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';
//import ApplicationLogo from '@/Components/ApplicationLogo';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Create Account" />

             <div className="flex flex-col items-center mb-8">
              
                <h1 className="text-xl font-semibold mt-4 text-gray-700">Projective</h1>
                <p className="text-sm text-gray-500">Team Task Management</p>
                <p className="mt-6 text-gray-600">Join your team and start collaborating</p>
            </div>

            <h2 className="text-2xl font-bold text-center text-gray-800">Create Account</h2>
            <p className="text-center text-gray-500 mt-1 mb-6">Start earning points and leveling up</p>


            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value="Full Name" />
                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        placeholder="Your full name"
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
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
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                        placeholder="Create a strong password"
                    />
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        required
                        placeholder="Confirm your password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2" />
                </div>

                <div className="mt-6">
                    {/* For the gradient button, you'll need to add custom styles to your CSS */}
                    <PrimaryButton className="w-full justify-center !py-3 bg-gradient-to-r from-purple-600 to-pink-500" disabled={processing}>
                        Join Your Team & Start Earning Points
                    </PrimaryButton>
                </div>
                 <p className="text-xs text-gray-500 text-center mt-4">
                    By registering, you agree to our Terms of Service and Privacy Policy
                </p>
            </form>
            
             <p className="text-center text-gray-500 mt-6">
                Already have an account?{' '}
                <Link href={route('login')} className="font-semibold text-blue-600 hover:text-blue-800">
                    Sign in here
                </Link>
            </p>
        </GuestLayout>
    );
}