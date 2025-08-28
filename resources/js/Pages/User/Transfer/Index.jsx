import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import axios from 'axios';

export default function TransferIndex() {
    const { auth } = usePage().props;
    const [receiverInput, setReceiverInput] = useState('');
    const [receiver, setReceiver] = useState(null);
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [showTransferForm, setShowTransferForm] = useState(false);

    const validateReceiver = async () => {
        if (!receiverInput.trim()) return;

        setIsValidating(true);
        try {
            const response = await axios.post('/transfer/validate-receiver', {
                identifier: receiverInput.trim()
            });

            if (response.data.success) {
                setReceiver(response.data.receiver);
                setShowTransferForm(true);
            } else {
                alert(response.data.message || 'Receiver not found');
                setReceiver(null);
                setShowTransferForm(false);
            }
        } catch (error) {
            alert('Failed to validate receiver');
            setReceiver(null);
            setShowTransferForm(false);
        } finally {
            setIsValidating(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const resetForm = () => {
        setReceiverInput('');
        setReceiver(null);
        setAmount('');
        setDescription('');
        setShowTransferForm(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Transfer Money" />

            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-md mx-auto px-4">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:send" className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Transfer Money</h1>
                        <p className="text-gray-600">Send money to SafePay users instantly</p>
                    </motion.div>

                    {/* Quick Actions */}
                    <motion.div
                        className="grid grid-cols-2 gap-4 mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <Link href={route('user.qr.send')}>
                            <motion.div
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Icon icon="mdi:qrcode-scan" className="w-6 h-6 text-purple-600" />
                                </div>
                                <h3 className="font-medium text-gray-900 text-sm">Scan QR</h3>
                                <p className="text-xs text-gray-500">Pay via QR Code</p>
                            </motion.div>
                        </Link>

                        <Link href={route('user.qr.receive')}>
                            <motion.div
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <Icon icon="mdi:qrcode" className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="font-medium text-gray-900 text-sm">Receive</h3>
                                <p className="text-xs text-gray-500">Generate QR Code</p>
                            </motion.div>
                        </Link>
                    </motion.div>

                    {/* Transfer Form */}
                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">
                            Send to SafePay User
                        </h2>

                        <div className="space-y-4">
                            {/* Receiver Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Recipient
                                </label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={receiverInput}
                                        onChange={(e) => setReceiverInput(e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Email or Wallet ID (SP12345678)"
                                        disabled={showTransferForm}
                                    />
                                    {!showTransferForm && (
                                        <motion.button
                                            onClick={validateReceiver}
                                            disabled={isValidating || !receiverInput.trim()}
                                            className="px-4 py-3 bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {isValidating ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            ) : (
                                                <Icon icon="mdi:magnify" className="w-5 h-5" />
                                            )}
                                        </motion.button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter email address or SafePay wallet ID
                                </p>
                            </div>

                            {/* Receiver Found */}
                            {receiver && (
                                <motion.div
                                    className="bg-green-50 border border-green-200 rounded-xl p-4"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                <span className="text-green-600 font-semibold text-sm">
                                                    {receiver.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-green-900">{receiver.name}</p>
                                                <p className="text-xs text-green-700">{receiver.wallet_number}</p>
                                            </div>
                                        </div>
                                        <motion.button
                                            onClick={resetForm}
                                            className="text-green-600 hover:text-green-700"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                        >
                                            <Icon icon="mdi:pencil" className="w-4 h-4" />
                                        </motion.button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Transfer Form */}
                            {showTransferForm && (
                                <motion.div
                                    className="space-y-4 pt-4 border-t border-gray-200"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Amount Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Amount
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 text-lg">Rp</span>
                                            </div>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                                                placeholder="0"
                                                min="1000"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Minimum amount: Rp 1.000</p>
                                    </div>

                                    {/* Description Input */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description (Optional)
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="block w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                            rows="3"
                                            placeholder="What is this transfer for?"
                                        />
                                    </div>

                                    {/* Continue Button */}
                                    <Link
                                        href="/transfer/qr"
                                        data={{
                                            type: 'internal',
                                            receiver: receiver,
                                            amount: amount,
                                            description: description
                                        }}
                                        className="block"
                                    >
                                        <motion.button
                                            disabled={!amount || parseInt(amount) < 1000}
                                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <Icon icon="mdi:arrow-right" className="w-5 h-5 mr-2 inline" />
                                            Continue Transfer
                                        </motion.button>
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>

                    {/* Recent Transfers */}
                    <motion.div
                        className="mt-6 bg-white rounded-2xl p-6 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Send</h3>
                        <div className="space-y-3">
                            {/* Placeholder for recent contacts */}
                            <div className="text-center py-8 text-gray-500">
                                <Icon icon="mdi:account-group-outline" className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">Recent transfers will appear here</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Info */}
                    <motion.div
                        className="mt-6 bg-blue-50 rounded-xl p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="flex">
                            <Icon icon="mdi:information" className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-1">Transfer Information:</p>
                                <ul className="space-y-1 text-blue-600">
                                    <li>• Transfers are instant and free</li>
                                    <li>• Available 24/7</li>
                                    <li>• Minimum transfer: Rp 1.000</li>
                                    <li>• Maximum transfer: Rp 10.000.000</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
