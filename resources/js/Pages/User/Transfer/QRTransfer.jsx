import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function QRTransfer({ invoice = null }) {
    const { auth } = usePage().props;
    const user = auth.user;
    
    // States
    const [pin, setPin] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [transaction, setTransaction] = useState(null);
    const [showPinInput, setShowPinInput] = useState(false);
    const [showAmountInput, setShowAmountInput] = useState(true);

    // Get receiver data from QR scan or session
    const [receiver, setReceiver] = useState(() => {
        const qrReceiver = sessionStorage.getItem('qrReceiver');
        const transferData = sessionStorage.getItem('transferData');
        
        if (qrReceiver) {
            return JSON.parse(qrReceiver);
        } else if (transferData) {
            const data = JSON.parse(transferData);
            return data.receiver;
        }
        return null;
    });

    useEffect(() => {
        if (!receiver) {
            router.visit('/transfer');
        }
    }, [receiver]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleAmountSubmit = () => {
        if (!amount || parseInt(amount) < 1000) {
            alert('Minimum amount is Rp 1.000');
            return;
        }
        setShowAmountInput(false);
        setShowPinInput(true);
    };

    const processTransfer = async () => {
        if (pin.length < 4) {
            alert('Please enter your PIN');
            return;
        }

        setIsProcessing(true);
        try {
            const payload = {
                type: 'internal',
                receiver_identifier: receiver.wallet_number,
                amount: parseInt(amount),
                description: description || 'QR Transfer',
                pin: pin
            };

            const response = await axios.post('/transfer/process', payload);

            if (response.data.success) {
                setTransaction(response.data.transaction);
                setShowSuccess(true);
                // Clear session data
                sessionStorage.removeItem('qrReceiver');
                sessionStorage.removeItem('transferData');
            } else {
                alert(response.data.message || 'Transfer failed');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Transfer failed';
            alert(message);
        } finally {
            setIsProcessing(false);
        }
    };

    const MoneyAnimation = () => (
        <motion.div
            className="flex items-center justify-center space-x-2 mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Sender */}
            <motion.div
                className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center"
                initial={{ x: -50 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <span className="text-white font-semibold text-lg">
                    {user.name.charAt(0).toUpperCase()}
                </span>
            </motion.div>

            {/* Money Animation */}
            <div className="relative flex-1 mx-4">
                <div className="h-0.5 bg-gray-200 w-full"></div>
                <motion.div
                    className="absolute top-1/2 left-0 transform -translate-y-1/2"
                    initial={{ x: 0 }}
                    animate={{ x: "100%" }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "loop",
                        ease: "easeInOut"
                    }}
                >
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <Icon icon="mdi:currency-usd" className="w-4 h-4 text-white" />
                    </div>
                </motion.div>
            </div>

            {/* Receiver */}
            <motion.div
                className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center"
                initial={{ x: 50 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <span className="text-white font-semibold text-lg">
                    {transferData.receiver?.name?.charAt(0).toUpperCase()}
                </span>
            </motion.div>
        </motion.div>
    );

    const SuccessAnimation = () => (
        <motion.div
            className="text-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
        >
            {/* Success Icon with ripple effect */}
            <div className="relative mb-6">
                <motion.div
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Icon icon="mdi:check" className="w-10 h-10 text-white" />
                </motion.div>
                
                {/* Ripple effects */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute inset-0 w-20 h-20 border-2 border-green-300 rounded-full mx-auto"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 2 + i * 0.5, opacity: 0 }}
                        transition={{
                            duration: 2,
                            delay: i * 0.3,
                            repeat: Infinity,
                            ease: "easeOut"
                        }}
                    />
                ))}
            </div>

            {/* Success Message */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Transfer Successful!
                </h2>
                <p className="text-gray-600 mb-6">
                    Your money has been sent successfully
                </p>
            </motion.div>
        </motion.div>
    );

    if (!receiver) {
        return null; // Will redirect
    }

    return (
        <AuthenticatedLayout>
            <Head title="Complete Transfer" />

            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-md mx-auto px-4">
                    <AnimatePresence mode="wait">
                        {!showSuccess ? (
                            <motion.div
                                key="transfer-form"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <motion.div
                                        className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.5, type: "spring" }}
                                    >
                                        <Icon icon="mdi:send" className="w-8 h-8 text-white" />
                                    </motion.div>
                                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                        Send Money
                                    </h1>
                                    <p className="text-gray-600">Enter amount and send to {receiver?.name}</p>
                                </div>

                                {showAmountInput ? (
                                    /* Amount Input Form */
                                    <motion.div
                                        className="bg-white rounded-2xl p-6 shadow-lg mb-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                    >
                                        {/* Receiver Info */}
                                        <div className="text-center mb-6">
                                            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <span className="text-white font-bold text-lg">
                                                    {receiver?.name?.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">{receiver?.name}</h3>
                                            <p className="text-sm text-gray-500">{receiver?.wallet_number}</p>
                                        </div>

                                        {/* Amount Input */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Amount to Send
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 text-lg">Rp</span>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={amount}
                                                    onChange={(e) => setAmount(e.target.value)}
                                                    className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-lg font-semibold"
                                                    placeholder="0"
                                                    min="1000"
                                                    autoFocus
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">Minimum amount: Rp 1.000</p>
                                        </div>

                                        {/* Description Input */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description (Optional)
                                            </label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 resize-none"
                                                rows="3"
                                                placeholder="What is this transfer for?"
                                            />
                                        </div>

                                        {/* Continue Button */}
                                        <motion.button
                                            onClick={handleAmountSubmit}
                                            disabled={!amount || parseInt(amount) < 1000}
                                            className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Icon icon="mdi:arrow-right" className="w-5 h-5 mr-2 inline" />
                                            Continue
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    /* Transfer Confirmation */
                                    <motion.div
                                        className="bg-white rounded-2xl p-6 shadow-lg mb-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                    >
                                        {/* Amount */}
                                        <div className="text-center mb-6">
                                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                                {formatCurrency(parseInt(amount))}
                                            </h2>
                                            {description && (
                                                <p className="text-gray-600">{description}</p>
                                            )}
                                        </div>

                                        {/* Transfer Details */}
                                        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">From</span>
                                                <span className="font-medium text-gray-900">{user.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">To</span>
                                                <span className="font-medium text-gray-900">{receiver?.name}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Wallet ID</span>
                                                <span className="font-mono text-sm text-gray-900">{receiver?.wallet_number}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Type</span>
                                                <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
                                                    QR Transfer
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {!showPinInput && !showAmountInput ? (
                                    /* Confirm Button */
                                    <motion.button
                                        onClick={() => setShowPinInput(true)}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-4 px-4 rounded-xl shadow-lg"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                    >
                                        <Icon icon="mdi:lock" className="w-5 h-5 mr-2 inline" />
                                        Confirm Transfer
                                    </motion.button>
                                ) : null}

                                {showPinInput && (
                                    /* PIN Input */
                                    <motion.div
                                        className="bg-white rounded-2xl p-6 shadow-lg"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="text-center mb-6">
                                            <Icon icon="mdi:shield-key" className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                Enter Your PIN
                                            </h3>
                                            <p className="text-gray-600 text-sm">
                                                Please enter your 4-digit PIN to authorize this transfer
                                            </p>
                                        </div>

                                        <div className="mb-6">
                                            <input
                                                type="password"
                                                value={pin}
                                                onChange={(e) => setPin(e.target.value)}
                                                className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                                placeholder="• • • •"
                                                maxLength="6"
                                                autoFocus
                                            />
                                            <p className="text-xs text-gray-500 text-center mt-2">
                                                Your transaction PIN is different from your login password
                                            </p>
                                        </div>

                                        <div className="space-y-3">
                                            <motion.button
                                                onClick={processTransfer}
                                                disabled={isProcessing || pin.length < 4}
                                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {isProcessing ? (
                                                    <div className="flex items-center justify-center">
                                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                        Processing...
                                                    </div>
                                                ) : (
                                                    'Authorize Transfer'
                                                )}
                                            </motion.button>

                                            <motion.button
                                                onClick={() => {
                                                    setShowPinInput(false);
                                                    setShowAmountInput(true);
                                                }}
                                                className="w-full border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                Back to Amount
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            /* Success Page */
                            <motion.div
                                key="success"
                                className="bg-white rounded-2xl p-8 shadow-lg"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                <SuccessAnimation />
                                
                                {/* Transaction Details */}
                                {transaction && (
                                    <motion.div
                                        className="bg-gray-50 rounded-xl p-4 mb-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: 0.8 }}
                                    >
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Transaction ID</span>
                                                <span className="font-mono text-xs">{transaction.transaction_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Amount</span>
                                                <span className="font-semibold">{formatCurrency(transaction.amount)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">To</span>
                                                <span>{transaction.receiver.name}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Date</span>
                                                <span>{new Date(transaction.created_at).toLocaleString('id-ID')}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Actions */}
                                <motion.div
                                    className="space-y-3"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 1 }}
                                >
                                    <button
                                        onClick={() => router.visit('/user/dashboard')}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg"
                                    >
                                        Back to Dashboard
                                    </button>
                                    <button
                                        onClick={() => router.visit('/transfer')}
                                        className="w-full border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        Make Another Transfer
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Processing Animation Overlay */}
                    <AnimatePresence>
                        {isProcessing && (
                            <motion.div
                                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <motion.div
                                    className="bg-white rounded-2xl p-8 mx-4 max-w-sm w-full text-center"
                                    initial={{ scale: 0.9 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0.9 }}
                                >
                                    <MoneyAnimation />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Processing Transfer...
                                    </h3>
                                    <p className="text-gray-600 text-sm">
                                        Please wait while we process your transfer
                                    </p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
