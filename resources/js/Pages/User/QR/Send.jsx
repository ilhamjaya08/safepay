import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import QRScanner from '@/Components/QRScanner';
import axios from 'axios';

export default function QRSend() {
    const { auth } = usePage().props;
    const [isScanning, setIsScanning] = useState(false);
    const [scanResult, setScanResult] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const startScanning = () => {
        setIsScanning(true);
        setScanResult(null);
    };

    const stopScanning = () => {
        setIsScanning(false);
    };

    const handleScan = async (result) => {
        if (result) {
            setIsProcessing(true);
            try {
                const response = await axios.post('/qr/scan', {
                    qr_data: result
                });

                if (response.data.success) {
                    setScanResult(response.data);
                    setIsScanning(false);
                } else {
                    alert(response.data.message || 'Invalid QR Code');
                }
            } catch (error) {
                alert('Failed to process QR code');
                console.error(error);
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleError = (error) => {
        console.log('QR Scanner error:', error);
    };

    const proceedToPayment = () => {
        if (scanResult && scanResult.receiver) {
            // Store receiver data for transfer page
            sessionStorage.setItem('qrReceiver', JSON.stringify(scanResult.receiver));
            router.visit('/transfer/qr');
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

    const resetScanner = () => {
        setScanResult(null);
        setIsScanning(false);
    };

    return (
        <AuthenticatedLayout>
            <Head title="Scan & Pay" />

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
                            <Icon icon="mdi:qrcode-scan" className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Scan & Pay</h1>
                        <p className="text-gray-600">Scan QR code to make instant payments</p>
                    </motion.div>

                    {!scanResult ? (
                        <motion.div
                            className="bg-white rounded-2xl shadow-lg overflow-hidden"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            {!isScanning ? (
                                /* Start Scanning */
                                <div className="p-6 text-center">
                                    <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                        <Icon icon="mdi:qrcode-scan" className="w-16 h-16 text-gray-400" />
                                    </div>
                                    
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        Ready to Scan
                                    </h3>
                                    <p className="text-gray-600 mb-6">
                                        Position the QR code within the frame to scan
                                    </p>

                                    <motion.button
                                        onClick={startScanning}
                                        className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon icon="mdi:camera" className="w-5 h-5 mr-2 inline" />
                                        Start Scanning
                                    </motion.button>
                                </div>
                            ) : (
                                /* Scanner Active */
                                <div className="p-4">
                                    <div className="text-center mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                            Scan QR Code
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Point your camera at the QR code or enter manually
                                        </p>
                                    </div>
                                    
                                    {isProcessing && (
                                        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-3"></div>
                                            <span className="text-blue-700 text-sm">Processing QR Code...</span>
                                        </div>
                                    )}
                                    
                                    <QRScanner
                                        onScan={handleScan}
                                        onError={handleError}
                                        onClose={stopScanning}
                                    />
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        /* Scan Result */
                        <motion.div
                            className="bg-white rounded-2xl p-6 shadow-lg"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Icon icon="mdi:check" className="w-6 h-6 text-green-600" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Receiver Found
                                </h3>
                            </div>

                            {/* Receiver Details */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="text-center mb-4">
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-white font-bold text-lg">
                                            {scanResult.receiver.name.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <h4 className="text-lg font-bold text-gray-900">
                                        {scanResult.receiver.name}
                                    </h4>
                                    <p className="text-gray-600 text-sm">Ready to receive money</p>
                                </div>

                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="text-gray-600">Name:</span>
                                        <span className="font-medium text-gray-900">{scanResult.receiver.name}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Wallet ID:</span>
                                        <span className="font-mono text-xs text-gray-900">{scanResult.receiver.wallet_number}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <motion.button
                                    onClick={proceedToPayment}
                                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Icon icon="mdi:send" className="w-5 h-5 mr-2 inline" />
                                    Send Money
                                </motion.button>
                                
                                <motion.button
                                    onClick={resetScanner}
                                    className="w-full border border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Scan Another Code
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

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
                                <p className="font-medium mb-1">Tips for scanning:</p>
                                <ul className="space-y-1 text-blue-600">
                                    <li>• Hold your device steady</li>
                                    <li>• Ensure good lighting</li>
                                    <li>• Keep QR code within the frame</li>
                                    <li>• Make sure QR code is not damaged</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
