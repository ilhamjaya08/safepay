import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function ManagerDashboard() {
    const { auth, stats, system_metrics, recent_activities } = usePage().props;
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

    const overviewCards = [
        { title: 'Total Users', value: formatNumber(stats.total_users), icon: 'mdi:account-group', color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Total Operators', value: formatNumber(stats.total_operators), icon: 'mdi:account-tie', color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: 'Total Volume', value: formatCurrency(stats.total_volume), icon: 'mdi:currency-usd', color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Monthly Transactions', value: formatNumber(stats.monthly_transactions), icon: 'mdi:chart-line', color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    const systemCards = [
        { title: 'Pending Applications', value: formatNumber(system_metrics.pending_bank_applications), icon: 'mdi:bank-clock', color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: 'Approved Accounts', value: formatNumber(system_metrics.approved_bank_applications), icon: 'mdi:bank-check', color: 'text-green-600', bg: 'bg-green-50' },
        { title: 'Failed Today', value: formatNumber(system_metrics.failed_transactions), icon: 'mdi:alert-circle', color: 'text-red-600', bg: 'bg-red-50' },
    ];

    const managerActions = [
        { title: 'User Management', description: 'Manage users, top up balances', icon: 'mdi:account-cog', color: 'text-blue-600', href: '/manager/users' },
        { title: 'Transactions History', description: 'Analyze all transactions', icon: 'mdi:chart-box', color: 'text-purple-600', href: '/manager/activities' },
        { title: 'New Bank Account Applications', description: 'Verify new users account status', icon: 'tdesign:verify', color: 'text-yellow-600', href: '/manager/bank-applications' },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Manager Dashboard" />

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
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Manager Panel</p>
                                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                Manager
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    
                    {/* Overview Stats */}
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        {overviewCards.map((stat, index) => (
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

                    {/* Monthly Volume Highlight */}
                    <motion.div
                        className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium mb-2">Monthly Transaction Volume</h3>
                                <p className="text-3xl font-bold">{formatCurrency(stats.monthly_volume || 0)}</p>
                                <p className="text-sm opacity-80 mt-1">{formatNumber(stats.monthly_transactions)} transactions this month</p>
                            </div>
                            <div className="text-right">
                                <Icon icon="mdi:chart-areaspline" className="w-16 h-16 opacity-80" />
                            </div>
                        </div>
                    </motion.div>

                    {/* System Health */}
                    <motion.div
                        className="bg-white rounded-xl p-6 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">System Health</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {systemCards.map((metric, index) => (
                                <motion.div
                                    key={metric.title}
                                    className="text-center"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                                >
                                    <div className={`w-16 h-16 ${metric.bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                                        <Icon icon={metric.icon} className={`w-8 h-8 ${metric.color}`} />
                                    </div>
                                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                                    <p className="text-sm text-gray-500">{metric.title}</p>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Manager Actions */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.5 }}
                        >
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Manager Actions</h3>
                            <div className="space-y-3">
                                {managerActions.map((action, index) => (
                                    <motion.a
                                        key={action.title}
                                        href={action.href}
                                        className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors text-left w-full block"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                                    >
                                        <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                                            <Icon icon={action.icon} className={`w-5 h-5 ${action.color}`} />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                                            <p className="text-xs text-gray-500">{action.description}</p>
                                        </div>
                                        <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-400" />
                                    </motion.a>
                                ))}
                            </div>
                        </motion.div>

                        {/* Recent Activities */}
                        <motion.div
                            className="bg-white rounded-xl p-6 shadow-sm"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
                                <motion.a 
                                    href={route('manager.activities')}
                                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                                    whileHover={{ scale: 1.05 }}
                                >
                                    View All
                                </motion.a>
                            </div>

                            <div className="space-y-4">
                                {recent_activities?.length > 0 ? (
                                    recent_activities.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                                        >
                                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Icon 
                                                    icon={activity.type === 'qr_payment' ? 'mdi:qrcode' : 'mdi:send'} 
                                                    className="w-5 h-5 text-emerald-600" 
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 text-sm truncate">
                                                    {activity.sender?.name} → {activity.receiver?.name}
                                                </h4>
                                                <p className="text-xs text-gray-500">
                                                    {formatCurrency(activity.amount)} • 
                                                    {new Date(activity.created_at).toLocaleString('id-ID', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                activity.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {activity.status}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Icon icon="mdi:clock-outline" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm">No recent activities</p>
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
