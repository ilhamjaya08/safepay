import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useRef, useEffect } from 'react';
import QRCode from 'qrcode';

export default function QRReceive() {
    const { auth, wallet, qr_data } = usePage().props;
    const user = auth.user;
    const canvasRef = useRef(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    useEffect(() => {
        if (qr_data && canvasRef.current) {
            // Generate QR code with wallet data
            QRCode.toCanvas(canvasRef.current, qr_data, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#064e3b',
                    light: '#ffffff'
                }
            }).catch(err => {
                console.error('Failed to generate QR code:', err);
            });
        }
    }, [qr_data]);

    const shareQR = () => {
        if (navigator.share) {
            navigator.share({
                title: 'SafePay - Send Money to Me',
                text: `Send money to ${user.name} using SafePay. Wallet ID: ${wallet.wallet_number}`,
            });
        } else {
            // Fallback: copy wallet number to clipboard
            navigator.clipboard.writeText(wallet.wallet_number).then(() => {
                alert('Wallet ID copied to clipboard!');
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Receive Money" />

            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-md mx-auto px-4">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:qrcode" className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Receive Money</h1>
                        <p className="text-gray-600">Share your QR code to receive money</p>
                    </motion.div>

                    {/* QR Code Display */}
                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg text-center"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Your Wallet QR Code
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                Others can scan this code to send you money
                            </p>
                            <p className="text-2xl font-bold text-emerald-600">
                                {formatCurrency(wallet?.balance || 0)}
                            </p>
                            <p className="text-sm text-gray-500">Current Balance</p>
                        </div>

                        {/* QR Code */}
                        <motion.div
                            className="bg-white p-6 rounded-2xl border-2 border-gray-100 mb-6 inline-block"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <canvas ref={canvasRef} className="mx-auto" />
                        </motion.div>

                        {/* Wallet Info */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-600">Name</span>
                                <span className="font-medium text-gray-900">{user.name}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm mb-2">
                                <span className="text-gray-600">Wallet ID</span>
                                <span className="font-mono text-gray-900">{wallet.wallet_number}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-600">Status</span>
                                <span className={`text-xs px-2 py-1 rounded-full ${wallet.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {wallet.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <motion.button
                                onClick={shareQR}
                                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon icon="mdi:share-variant" className="w-5 h-5 mr-2 inline" />
                                Share QR Code
                            </motion.button>
                            
                            <motion.button
                                onClick={() => {
                                    navigator.clipboard.writeText(wallet.wallet_number).then(() => {
                                        alert('Wallet ID copied to clipboard!');
                                    });
                                }}
                                className="w-full border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon icon="mdi:content-copy" className="w-5 h-5 mr-2 inline" />
                                Copy Wallet ID
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Instructions */}
                    <motion.div
                        className="mt-6 bg-blue-50 rounded-xl p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="flex">
                            <Icon icon="mdi:information" className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-1">How to receive money:</p>
                                <ul className="space-y-1 text-blue-600">
                                    <li>• Share your QR code with the sender</li>
                                    <li>• They scan it and enter the amount</li>
                                    <li>• Money will be transferred instantly</li>
                                    <li>• You'll see the balance update in real-time</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
