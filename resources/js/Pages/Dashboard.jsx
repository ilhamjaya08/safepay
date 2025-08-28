import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function Dashboard() {
    const { auth, wallet, transactions } = usePage().props;
    const user = auth.user;

    // Dummy data
    const balance = 4520750.50;
    const cardNumber = "**** 9877";
    const expiry = "05/25";

    const quickSendContacts = [
        { id: 1, name: "Miranda", avatar: "M", color: "bg-blue-500" },
        { id: 2, name: "Alex", avatar: "A", color: "bg-purple-500" },
        { id: 3, name: "Dibala", avatar: "D", color: "bg-orange-500" },
        { id: 4, name: "Rosalia", avatar: "R", color: "bg-pink-500" },
    ];

    const dummyTransactions = [
        { id: 1, name: "Netflix Premium", amount: -89000, date: "Dec 15, 2023", status: "Paid", icon: "logos:netflix-icon", color: "text-red-600" },
        { id: 2, name: "Spotify Premium", amount: -65000, date: "Dec 15, 2023", status: "Paid", icon: "logos:spotify-icon", color: "text-green-600" },
        { id: 3, name: "Transfer dari John", amount: 250000, date: "Dec 14, 2023", status: "Received", icon: "mdi:account-arrow-down", color: "text-blue-600" },
        { id: 4, name: "Shopee Purchase", amount: -125000, date: "Dec 14, 2023", status: "Paid", icon: "simple-icons:shopee", color: "text-orange-600" },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
                {/* Header */}
                <motion.div 
                    className="bg-white px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="max-w-7xl mx-auto flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Selamat pagi,</p>
                                <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                            </div>
                        </div>
                        <motion.button 
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Icon icon="mdi:bell-outline" className="w-6 h-6 text-gray-600" />
                        </motion.button>
                    </div>
                </motion.div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    
                    {/* Balance Card */}
                    <motion.div
                        className="relative"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                    >
                        <div className="bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-2xl p-6 text-white shadow-lg">
                            {/* Currency Selector */}
                            <div className="flex justify-between items-start mb-6">
                                <div></div>
                                <div className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-3 py-1">
                                    <Icon icon="emojione:flag-for-indonesia" className="w-4 h-4" />
                                    <span className="text-sm font-medium">IDR</span>
                                    <Icon icon="mdi:chevron-down" className="w-4 h-4" />
                                </div>
                            </div>

                            {/* Balance */}
                            <div className="mb-6">
                                <div className="flex items-center space-x-2 mb-2">
                                    <h2 className="text-3xl lg:text-4xl font-bold">
                                        {formatCurrency(balance)}
                                    </h2>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Icon icon="mdi:eye-outline" className="w-6 h-6 opacity-80" />
                                    </motion.button>
                                </div>
                            </div>

                            {/* Card Info */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm opacity-80 mb-1">Number</p>
                                    <p className="font-medium">{cardNumber}</p>
                                </div>
                                <div>
                                    <p className="text-sm opacity-80 mb-1">Exp.</p>
                                    <p className="font-medium">{expiry}</p>
                                </div>
                                <div className="text-right">
                                    <Icon icon="logos:visa" className="w-12 h-8" />
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Buttons */}
                    <motion.div
                        className="grid grid-cols-4 gap-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {[
                            { name: "Kirim", icon: "mdi:send", color: "text-blue-600" },
                            { name: "Split Bills", icon: "mdi:receipt", color: "text-purple-600" },
                            { name: "Pulsa & Data", icon: "mdi:cellphone", color: "text-green-600" },
                            { name: "Lainnya", icon: "mdi:apps", color: "text-gray-600" },
                        ].map((action, index) => (
                            <motion.button
                                key={action.name}
                                className="flex flex-col items-center space-y-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                            >
                                <div className="p-3 bg-gray-50 rounded-full">
                                    <Icon icon={action.icon} className={`w-6 h-6 ${action.color}`} />
                                </div>
                                <span className="text-xs font-medium text-gray-700">{action.name}</span>
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Quick Send */}
                    <motion.div
                        className="bg-white rounded-xl p-6 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Kirim Cepat</h3>
                        <div className="flex items-center space-x-4">
                            <motion.button
                                className="flex flex-col items-center space-y-2"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                                    <Icon icon="mdi:plus" className="w-6 h-6 text-gray-400" />
                                </div>
                                <span className="text-xs text-gray-500">Add</span>
                            </motion.button>
                            
                            {quickSendContacts.map((contact, index) => (
                                <motion.button
                                    key={contact.id}
                                    className="flex flex-col items-center space-y-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                                >
                                    <div className={`w-12 h-12 ${contact.color} rounded-full flex items-center justify-center text-white font-semibold`}>
                                        {contact.avatar}
                                    </div>
                                    <span className="text-xs text-gray-700">{contact.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Transaction History */}
                    <motion.div
                        className="bg-white rounded-xl p-6 shadow-sm"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.5 }}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Riwayat Transaksi</h3>
                            <motion.button 
                                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                                whileHover={{ scale: 1.05 }}
                            >
                                Lihat Semua
                            </motion.button>
                        </div>

                        <div className="space-y-4">
                            {(transactions || dummyTransactions).map((transaction, index) => (
                                <motion.div
                                    key={transaction.id}
                                    className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                                >
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                        <Icon icon={transaction.icon} className={`w-6 h-6 ${transaction.color}`} />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-900">{transaction.name}</h4>
                                        <p className="text-sm text-gray-500">{transaction.date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                                            {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                                        </p>
                                        <p className={`text-xs ${transaction.status === 'Paid' ? 'text-emerald-600' : 'text-blue-600'}`}>
                                            {transaction.status}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
