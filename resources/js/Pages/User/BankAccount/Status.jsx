import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function BankAccountStatus() {
    const { auth, application } = usePage().props;
    const user = auth.user;

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return {
                    bg: 'bg-green-100',
                    text: 'text-green-800',
                    icon: 'text-green-600',
                    iconName: 'mdi:check-circle'
                };
            case 'rejected':
                return {
                    bg: 'bg-red-100',
                    text: 'text-red-800',
                    icon: 'text-red-600',
                    iconName: 'mdi:close-circle'
                };
            case 'pending':
            default:
                return {
                    bg: 'bg-yellow-100',
                    text: 'text-yellow-800',
                    icon: 'text-yellow-600',
                    iconName: 'mdi:clock'
                };
        }
    };

    const statusColors = getStatusColor(application?.status);

    return (
        <AuthenticatedLayout>
            <Head title="SafePay Account Status" />
            
            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-2xl mx-auto px-4">
                    {application ? (
                        <motion.div
                            className="bg-white rounded-2xl p-8 shadow-lg"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            {/* Status Icon and Title */}
                            <div className="text-center mb-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${statusColors.bg}`}>
                                    <Icon 
                                        icon={statusColors.iconName} 
                                        className={`w-8 h-8 ${statusColors.icon}`} 
                                    />
                                </div>
                                
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    SafePay Account {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </h1>
                                
                                {application.status === 'pending' && (
                                    <p className="text-gray-600 mb-6">
                                        Your KYC application is under review. We'll notify you once it's processed.
                                    </p>
                                )}
                                
                                {application.status === 'approved' && (
                                    <p className="text-green-600 mb-6">
                                        Congratulations! Your SafePay account has been verified. You can now access all features.
                                    </p>
                                )}
                                
                                {application.status === 'rejected' && (
                                    <div className="text-left">
                                        <p className="text-red-600 mb-4">
                                            Your application was rejected for the following reason:
                                        </p>
                                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                            <p className="text-red-800">{application.rejection_reason}</p>
                                        </div>
                                        <p className="text-gray-600 mb-6 text-center">
                                            You can submit a new application with the correct information.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Application Details */}
                            <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Details</h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Account Type:</span>
                                        <p className="font-medium">{application.account_type_display || application.account_type}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Branch:</span>
                                        <p className="font-medium">{application.branch_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Account Number:</span>
                                        <p className="font-medium font-mono">{application.full_account_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Account Holder:</span>
                                        <p className="font-medium">{application.account_holder_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">ID Card Number:</span>
                                        <p className="font-mono text-xs">{application.id_card_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Phone Number:</span>
                                        <p className="font-medium">{application.phone_number}</p>
                                    </div>
                                    <div className="md:col-span-2">
                                        <span className="text-gray-600">Address:</span>
                                        <p className="font-medium">{application.address}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Applied on:</span>
                                        <p className="font-medium">{new Date(application.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}</p>
                                    </div>
                                    {application.reviewed_at && (
                                        <div>
                                            <span className="text-gray-600">Reviewed on:</span>
                                            <p className="font-medium">{new Date(application.reviewed_at).toLocaleDateString('id-ID', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="text-center mb-6">
                                <span className={`inline-flex items-center px-6 py-2 rounded-full text-sm font-medium ${statusColors.bg} ${statusColors.text}`}>
                                    <Icon icon={statusColors.iconName} className="w-4 h-4 mr-2" />
                                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                                </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <motion.a
                                    href="/user/dashboard"
                                    className="flex-1 text-center bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Icon icon="mdi:dashboard" className="w-5 h-5 mr-2 inline" />
                                    Back to Dashboard
                                </motion.a>
                                
                                {application.status === 'rejected' && (
                                    <motion.a
                                        href="/bank-account/apply"
                                        className="flex-1 text-center bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                    >
                                        <Icon icon="mdi:plus" className="w-5 h-5 mr-2 inline" />
                                        Apply Again
                                    </motion.a>
                                )}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="bg-white rounded-2xl p-8 shadow-lg text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Icon icon="mdi:bank-off" className="w-8 h-8 text-gray-400" />
                            </div>
                            
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                No Application Found
                            </h1>
                            
                            <p className="text-gray-600 mb-6">
                                You haven't submitted a SafePay account application yet.
                            </p>

                            <motion.a
                                href="/bank-account/apply"
                                className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl shadow-lg"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Icon icon="mdi:plus" className="w-5 h-5 mr-2 inline" />
                                Apply Now
                            </motion.a>
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
