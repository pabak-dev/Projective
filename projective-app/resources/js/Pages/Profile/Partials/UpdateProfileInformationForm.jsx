import { Link, useForm, usePage } from '@inertiajs/react';
import { Transition } from '@headlessui/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

export default function UpdateProfileInformation({ mustVerifyEmail, status, className = '' }) {
    const user = usePage().props.auth.user;

    // Form for text inputs (name, email)
    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
    });

    // Separate form for the avatar file
    const { data: avatarData, setData: setAvatarData, post: postAvatar, processing: avatarProcessing, errors: avatarErrors } = useForm({
        avatar: null,
    });

    const submit = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const submitAvatar = (e) => {
        e.preventDefault();
        postAvatar(route('profile.avatar.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                <p className="mt-1 text-sm text-gray-600">Update your account's profile information and email address.</p>
            </header>

            {/* --- Avatar Upload Form --- */}
            <form onSubmit={submitAvatar} className="mt-6 space-y-6">
                <div className="flex items-center space-x-6">
                    <div className="shrink-0">
                        <img className="h-20 w-20 rounded-full object-cover" src={user.avatar ? `/storage/${user.avatar}` : `https://ui-avatars.com/api/?name=${user.name}&color=7F9CF5&background=EBF4FF`} alt={user.name} />
                    </div>
                    <label className="block">
                        <span className="sr-only">Choose profile photo</span>
                        <input type="file" onChange={(e) => setAvatarData('avatar', e.target.files[0])} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
                    </label>
                    <PrimaryButton disabled={avatarProcessing}>Upload</PrimaryButton>
                </div>
                <InputError className="mt-2" message={avatarErrors.avatar} />
            </form>
            
            <hr className="my-6" />

            {/* --- User Details Form --- */}
            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput id="name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required isFocused autoComplete="name"/>
                    <InputError className="mt-2" message={errors.name} />
                </div>
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput id="email" type="email" className="mt-1 block w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} required autoComplete="username"/>
                    <InputError className="mt-2" message={errors.email} />
                </div>
                {/* ... (rest of the form remains the same) ... */}
                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>
                    <Transition show={recentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}