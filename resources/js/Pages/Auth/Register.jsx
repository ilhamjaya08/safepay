import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register - Safepay" />
            
            <div className="min-h-screen bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-md w-full"
                >
                    {/* Logo */}
                    <motion.div 
                        className="text-center mb-8"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <Link href={route('welcome')}>
                            <motion.img 
                                src="/logo.png" 
                                alt="Safepay Logo" 
                                className="h-12 w-auto mx-auto mb-4"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            />
                        </Link>
                        <h2 className="text-3xl font-bold text-white">
                            Daftar ke Safepay
                        </h2>
                        <p className="mt-2 text-emerald-100">
                            Mulai kelola keuangan Anda dengan mudah
                        </p>
                    </motion.div>

                    {/* Form Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="bg-white rounded-xl shadow-xl p-8"
                    >
                        <form onSubmit={submit} className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                            >
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Lengkap
                                </label>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={data.name}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    autoComplete="name"
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                            >
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    autoComplete="username"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.5 }}
                            >
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={data.password}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                            >
                                <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                    Konfirmasi Password
                                </label>
                                <input
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                                    autoComplete="new-password"
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                />
                                {errors.password_confirmation && (
                                    <p className="mt-2 text-sm text-red-600">{errors.password_confirmation}</p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                                className="pt-4"
                            >
                                <motion.button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-emerald-500 text-white py-3 px-4 rounded-lg font-semibold text-lg hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    whileHover={{ scale: processing ? 1 : 1.02 }}
                                    whileTap={{ scale: processing ? 1 : 0.98 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    {processing ? 'Mendaftar...' : 'Daftar'}
                                </motion.button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.8 }}
                                className="text-center pt-4 border-t border-gray-200"
                            >
                                <p className="text-gray-600">
                                    Sudah punya akun?{' '}
                                    <motion.span
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="inline-block"
                                    >
                                        <Link
                                            href={route('login')}
                                            className="text-emerald-600 hover:text-emerald-700 font-semibold"
                                        >
                                            Masuk di sini
                                        </Link>
                                    </motion.span>
                                </p>
                            </motion.div>
                        </form>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
