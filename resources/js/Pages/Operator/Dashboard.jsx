import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function OperatorDashboard() {
    const { auth, stats, recent_users, recent_transactions } = usePage().props;
    const user = auth.user;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    const statCards = [
        { title: 'Total Users', value: formatNumber(stats.total_users), icon: 'mdi:account-group', color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Active Users', value: formatNumber(stats.active_users), icon: 'mdi:account-check', color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Pending Applications', value: formatNumber(stats.pending_bank_applications), icon: 'mdi:bank-clock', color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: "Today's Transactions", value: formatNumber(stats.daily_transactions), icon: 'mdi:swap-horizontal', color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Operator Dashboard" />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <motion.div 
                    className="bg-white px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Operator Panel</p>
                                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                                Operator
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    
                    {/* Stats Cards */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        {statCards.map((stat, index) => (
                            <motion.div
                                key={stat.title}
                                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                    <div className={`p-3 rounded-full ${stat.bg}`}>
                                        <Icon icon={stat.icon} className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Daily Volume Card */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Today's Volume</h3>
                                <Icon icon="mdi:trending-up" className="w-6 h-6 text-emerald-600" />
                            </div>
                            <p className="text-3xl font-bold text-emerald-600">
                                {formatCurrency(stats.total_volume || 0)}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">Total transaction volume today</p>
                        </motion.div>

                        {/* Pending Bank Applications */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.35 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Bank Applications</h3>
                                <Icon icon="mdi:bank-clock" className="w-6 h-6 text-orange-600" />
                            </div>
                            <p className="text-3xl font-bold text-orange-600">
                                {formatNumber(stats.pending_bank_applications || 0)}
                            </p>
                            <div className="flex items-center justify-between mt-3">
                                <p className="text-sm text-gray-500">Pending review</p>
                                <motion.a
                                    href="/operator/bank-applications"
                                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    Review →
                                </motion.a>
                            </div>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Recent Users */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                                <motion.button 
                                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    View All Users
                                </motion.button>
                            </div>

                            <div className="space-y-4">
                                {recent_users?.length > 0 ? (
                                    recent_users.map((recentUser, index) => (
                                        <motion.div
                                            key={recentUser.id}
                                            className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                                        >
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                {recentUser.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">{recentUser.name}</h4>
                                                <p className="text-sm text-gray-500">{recentUser.email}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {formatCurrency(recentUser.wallet?.balance || 0)}
                                                </p>
                                                <p className={`text-xs ${recentUser.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                                    {recentUser.is_active ? 'Active' : 'Inactive'}
                                                </p>
                                            </div>
                                            <motion.button
                                                className="p-2 text-gray-400 hover:text-gray-600"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                            >
                                                <Icon icon="mdi:chevron-right" className="w-5 h-5" />
                                            </motion.button>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Icon icon="mdi:account-outline" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No users found</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Recent Transactions */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
                                <motion.button 
                                    className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    View All
                                </motion.button>
                            </div>

                            <div className="space-y-4">
                                {recent_transactions?.length > 0 ? (
                                    recent_transactions.map((transaction, index) => (
                                        <motion.div
                                            key={transaction.id}
                                            className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                                        >
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Icon 
                                                    icon={transaction.type === 'qr_payment' ? 'mdi:qrcode' : 'mdi:send'} 
                                                    className="w-6 h-6 text-emerald-600" 
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900">
                                                    {transaction.sender?.name} → {transaction.receiver?.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {transaction.type === 'qr_payment' ? 'QR Payment' : 'Transfer'} • 
                                                    {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    {formatCurrency(transaction.amount)}
                                                </p>
                                                <p className={`text-xs ${
                                                    transaction.status === 'completed' ? 'text-green-600' : 
                                                    transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                    {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                                </p>
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Icon icon="mdi:swap-horizontal" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No transactions found</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
