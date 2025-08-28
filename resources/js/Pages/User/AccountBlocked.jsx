import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function AccountBlocked({ status, message, reason, suspension, contact_support }) {
    const formatDate = (dateString) => {
        if (!dateString) return null;
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusConfig = () => {
        switch (status) {
            case 'suspended':
                return {
                    icon: 'mdi:account-cancel',
                    color: 'text-red-600',
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-200',
                    title: 'Account Suspended'
                };
            case 'inactive':
                return {
                    icon: 'mdi:account-off',
                    color: 'text-gray-600',
                    bgColor: 'bg-gray-50',
                    borderColor: 'border-gray-200',
                    title: 'Account Deactivated'
                };
            default:
                return {
                    icon: 'mdi:account-alert',
                    color: 'text-yellow-600',
                    bgColor: 'bg-yellow-50',
                    borderColor: 'border-yellow-200',
                    title: 'Account Restricted'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <>
            <Head title={config.title} />
            
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <motion.div
                    className="max-w-md w-full"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:wallet" className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">SafePay</h1>
                    </div>

                    {/* Main Card */}
                    <motion.div
                        className={`bg-white rounded-2xl p-8 shadow-xl border ${config.borderColor}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        {/* Status Icon */}
                        <div className={`w-20 h-20 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
                            <Icon icon={config.icon} className={`w-10 h-10 ${config.color}`} />
                        </div>

                        {/* Message */}
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-2">{config.title}</h2>
                            <p className="text-gray-600 mb-4">{message}</p>
                            {reason && (
                                <div className={`${config.bgColor} ${config.borderColor} border rounded-lg p-4 text-left`}>
                                    <p className="text-sm font-medium text-gray-900 mb-1">Reason:</p>
                                    <p className="text-sm text-gray-700">{reason}</p>
                                </div>
                            )}
                        </div>

                        {/* Suspension Details */}
                        {status === 'suspended' && suspension && (
                            <motion.div
                                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.3 }}
                            >
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="font-medium text-red-900">Type:</span>
                                        <span className="text-red-700 capitalize">{suspension.type}</span>
                                    </div>
                                    {suspension.expires_at && (
                                        <div className="flex justify-between">
                                            <span className="font-medium text-red-900">Expires:</span>
                                            <span className="text-red-700">{formatDate(suspension.expires_at)}</span>
                                        </div>
                                    )}
                                    {suspension.remaining_time && (
                                        <div className="flex justify-between">
                                            <span className="font-medium text-red-900">Remaining:</span>
                                            <span className="text-red-700">{suspension.remaining_time}</span>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* Actions */}
                        <div className="space-y-3">
                            {contact_support && (
                                <motion.a
                                    href="mailto:support@safepay.com"
                                    className="w-full bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors flex items-center justify-center"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Icon icon="mdi:email" className="w-5 h-5 mr-2" />
                                    Contact Support
                                </motion.a>
                            )}
                            
                            <motion.a
                                href="/logout"
                                method="post"
                                className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon icon="mdi:logout" className="w-5 h-5 mr-2" />
                                Logout
                            </motion.a>
                        </div>

                        {/* Help Text */}
                        <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500">
                                If you believe this is an error, please contact our support team.
                            </p>
                        </div>
                    </motion.div>

                    {/* Additional Info */}
                    <motion.div
                        className="mt-6 text-center text-xs text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                    >
                        <p>SafePay Digital Wallet • Customer Protection</p>
                    </motion.div>
                </motion.div>
            </div>
        </>
    );
}
