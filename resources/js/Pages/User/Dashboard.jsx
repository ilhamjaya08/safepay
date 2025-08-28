import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function UserDashboard() {
    const { auth, wallet, transactions, bank_account } = usePage().props;
    const user = auth.user;

    const quickSendContacts = [
        { id: 1, name: "Miranda", avatar: "M", color: "bg-blue-500" },
        { id: 2, name: "Alex", avatar: "A", color: "bg-purple-500" },
        { id: 3, name: "Dibala", avatar: "D", color: "bg-orange-500" },
        { id: 4, name: "Rosalia", avatar: "R", color: "bg-pink-500" },
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getTransactionIcon = (transaction) => {
        if (transaction.type === 'transfer') {
            return transaction.sender_id === user.id ? 'mdi:send' : 'mdi:account-arrow-down';
        } else if (transaction.type === 'qr_payment') {
            return 'mdi:qrcode';
        } else if (transaction.type === 'card_payment') {
            return 'mdi:credit-card';
        }
        return 'mdi:bank-transfer';
    };

    return (
        <AuthenticatedLayout>
            <Head title="User Dashboard" />

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
                                <p className="text-xs text-emerald-600 font-medium">Wallet: {wallet?.wallet_number}</p>
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
                    
                    {/* Bank Account Status Alert */}
                    {(!bank_account || bank_account.status !== 'approved') && (
                        <motion.div
                            className={`rounded-xl p-4 border ${
                                !bank_account ? 'bg-yellow-50 border-yellow-200' :
                                bank_account.status === 'pending' ? 'bg-blue-50 border-blue-200' :
                                'bg-red-50 border-red-200'
                            }`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-start space-x-3">
                                <Icon 
                                    icon={
                                        !bank_account ? 'mdi:alert-circle' :
                                        bank_account.status === 'pending' ? 'mdi:clock' :
                                        'mdi:close-circle'
                                    } 
                                    className={`w-6 h-6 mt-0.5 ${
                                        !bank_account ? 'text-yellow-600' :
                                        bank_account.status === 'pending' ? 'text-blue-600' :
                                        'text-red-600'
                                    }`} 
                                />
                                <div className="flex-1">
                                    <h3 className={`font-medium ${
                                        !bank_account ? 'text-yellow-800' :
                                        bank_account.status === 'pending' ? 'text-blue-800' :
                                        'text-red-800'
                                    }`}>
                                        {!bank_account ? 'SafePay Account Required' :
                                         bank_account.status === 'pending' ? 'KYC Under Review' :
                                         'KYC Application Rejected'}
                                    </h3>
                                    <p className={`text-sm mt-1 ${
                                        !bank_account ? 'text-yellow-700' :
                                        bank_account.status === 'pending' ? 'text-blue-700' :
                                        'text-red-700'
                                    }`}>
                                        {!bank_account ? 'Please complete your KYC verification to access all SafePay features' :
                                         bank_account.status === 'pending' ? 'Your KYC application is being reviewed by our team' :
                                         `KYC rejected: ${bank_account.rejection_reason}`}
                                    </p>
                                    <motion.a
                                        href={!bank_account ? route('user.bank.apply') : route('user.bank.status')}
                                        className={`inline-flex items-center mt-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            !bank_account ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                                            bank_account.status === 'pending' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                            'bg-red-600 hover:bg-red-700 text-white'
                                        }`}
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon icon={!bank_account ? 'mdi:plus' : 'mdi:eye'} className="w-4 h-4 mr-2" />
                                        {!bank_account ? 'Apply Now' : 'View Status'}
                                    </motion.a>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    
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
                                </div>
                            </div>

                            {/* Balance */}
                            <div className="mb-6">
                                <div className="flex items-center space-x-2 mb-2">
                                    <h2 className="text-3xl lg:text-4xl font-bold">
                                        {formatCurrency(wallet?.balance || 0)}
                                    </h2>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Icon icon="mdi:eye-outline" className="w-6 h-6 opacity-80" />
                                    </motion.button>
                                </div>
                                {wallet?.locked_balance > 0 && (
                                    <p className="text-sm opacity-80">
                                        Tersedia: {formatCurrency(wallet.balance - wallet.locked_balance)}
                                    </p>
                                )}
                            </div>

                            {/* Card Info */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm opacity-80 mb-1">SafePay ID</p>
                                    <p className="font-medium">{wallet?.wallet_number || 'No Wallet'}</p>
                                </div>
                                <div>
                                    <p className="text-sm opacity-80 mb-1">Status</p>
                                    <p className="font-medium">{wallet?.is_active ? 'Active' : 'Inactive'}</p>
                                </div>
                                <div className="text-right">
                                    <Icon icon="simple-icons:safepay" className="w-12 h-8" />
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
                            { name: "Transfer", icon: "mdi:send", color: "text-blue-600", href: bank_account?.status === 'approved' ? route('user.transfer.index') : '#', disabled: bank_account?.status !== 'approved' },
                            { name: "Scan QR", icon: "mdi:qrcode-scan", color: "text-purple-600", href: bank_account?.status === 'approved' ? route('user.qr.send') : '#', disabled: bank_account?.status !== 'approved' },
                            { name: "Receive", icon: "mdi:qrcode", color: "text-green-600", href: route('user.qr.receive'), disabled: false },
                            { name: "History", icon: "mdi:history", color: "text-orange-600", href: "#", disabled: bank_account?.status !== 'approved' },
                        ].map((action, index) => (
                            <motion.div
                                key={action.name}
                                className={`flex flex-col items-center space-y-2 p-4 bg-white rounded-xl shadow-sm transition-shadow ${
                                    action.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md cursor-pointer'
                                }`}
                                whileHover={action.disabled ? {} : { scale: 1.05 }}
                                whileTap={action.disabled ? {} : { scale: 0.95 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                                onClick={() => {
                                    if (!action.disabled) {
                                        window.location.href = action.href;
                                    } else {
                                        alert('Please complete KYC verification first');
                                    }
                                }}
                            >
                                <div className={`p-3 rounded-full ${action.disabled ? 'bg-gray-100' : 'bg-gray-50'}`}>
                                    <Icon icon={action.icon} className={`w-6 h-6 ${action.disabled ? 'text-gray-400' : action.color}`} />
                                </div>
                                <span className={`text-xs font-medium ${action.disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                                    {action.name}
                                </span>
                                {action.disabled && (
                                    <Icon icon="mdi:lock" className="w-3 h-3 text-gray-400 absolute top-2 right-2" />
                                )}
                            </motion.div>
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
                            {transactions?.length > 0 ? (
                                transactions.map((transaction, index) => (
                                    <motion.div
                                        key={transaction.id}
                                        className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                                    >
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                            <Icon icon={getTransactionIcon(transaction)} className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">
                                                {transaction.type === 'transfer' 
                                                    ? (transaction.sender_id === user.id 
                                                        ? `Transfer ke ${transaction.receiver?.name}` 
                                                        : `Transfer dari ${transaction.sender?.name}`)
                                                    : transaction.description
                                                }
                                            </h4>
                                            <p className="text-sm text-gray-500">{new Date(transaction.created_at).toLocaleDateString('id-ID')}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`font-semibold ${
                                                transaction.sender_id === user.id ? 'text-gray-900' : 'text-green-600'
                                            }`}>
                                                {transaction.sender_id === user.id ? '-' : '+'}{formatCurrency(transaction.amount)}
                                            </p>
                                            <p className={`text-xs ${
                                                transaction.status === 'completed' ? 'text-emerald-600' : 
                                                transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                                            }`}>
                                                {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <Icon icon="mdi:receipt-text-outline" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                    <p>Belum ada transaksi</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
