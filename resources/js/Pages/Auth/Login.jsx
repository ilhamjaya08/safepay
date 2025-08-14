import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <>
            <Head title="Login - Safepay" />
            
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
                            Masuk ke Safepay
                        </h2>
                        <p className="mt-2 text-emerald-100">
                            Selamat datang kembali! Kelola keuangan Anda
                        </p>
                    </motion.div>

                    {/* Status Message */}
                    {status && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg"
                        >
                            {status}
                        </motion.div>
                    )}

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
                                transition={{ duration: 0.5, delay: 0.4 }}
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
                                    autoComplete="current-password"
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
                                transition={{ duration: 0.5, delay: 0.5 }}
                                className="flex items-center justify-between"
                            >
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                                    />
                                    <span className="ml-2 text-sm text-gray-600">
                                        Ingat saya
                                    </span>
                                </label>

                                {canResetPassword && (
                                    <motion.span
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="inline-block"
                                    >
                                        <Link
                                            href={route('password.request')}
                                            className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
                                        >
                                            Lupa password?
                                        </Link>
                                    </motion.span>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
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
                                    {processing ? 'Masuk...' : 'Masuk'}
                                </motion.button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.7 }}
                                className="text-center pt-4 border-t border-gray-200"
                            >
                                <p className="text-gray-600">
                                    Belum punya akun?{' '}
                                    <motion.span
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                        className="inline-block"
                                    >
                                        <Link
                                            href={route('register')}
                                            className="text-emerald-600 hover:text-emerald-700 font-semibold"
                                        >
                                            Daftar sekarang
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
