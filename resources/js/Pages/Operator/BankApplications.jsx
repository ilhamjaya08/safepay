import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function BankApplications() {
    const { auth } = usePage().props;
    const user = auth.user;
    const [applications, setApplications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    useEffect(() => {
        loadApplications();
    }, []);

    const loadApplications = async () => {
        try {
            // Dynamic endpoint based on user role
            const rolePrefix = user.role === 'manager' ? 'manager' : 'operator';
            const apiEndpoint = `/${rolePrefix}/bank-applications/pending`;
            console.log('Loading applications from:', apiEndpoint, 'for role:', user.role);
            
            const response = await axios.get(apiEndpoint);
            console.log('Applications loaded:', response.data);
            setApplications(response.data);
        } catch (error) {
            console.error('Failed to load applications:', error);
            console.error('Error details:', error.response);
        } finally {
            setIsLoading(false);
        }
    };

    const handleReview = async (applicationId, action) => {
        if (action === 'reject' && !rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        setIsProcessing(true);
        try {
            const payload = {
                action: action,
                ...(action === 'reject' && { rejection_reason: rejectionReason })
            };

            const rolePrefix = user.role === 'manager' ? 'manager' : 'operator';
            const response = await axios.post(`/${rolePrefix}/bank-applications/${applicationId}/review`, payload);
            
            if (response.data.success) {
                alert(response.data.message);
                setSelectedApp(null);
                setRejectionReason('');
                loadApplications(); // Reload list
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Review failed';
            alert(message);
        } finally {
            setIsProcessing(false);
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

    return (
        <AuthenticatedLayout>
            <Head title="SafePay Account Applications" />

            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <motion.div
                        className="mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                                <Icon icon="mdi:bank-check" className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">SafePay Account Applications</h1>
                                <p className="text-gray-600">Review and approve KYC applications for SafePay accounts</p>
                            </div>
                        </div>
                    </motion.div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                            <span className="ml-3 text-gray-600">Loading applications...</span>
                        </div>
                    ) : applications.length === 0 ? (
                        <motion.div
                            className="bg-white rounded-2xl p-8 shadow-lg text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Icon icon="mdi:bank-off" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Applications</h3>
                            <p className="text-gray-600">All SafePay account applications have been reviewed</p>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {applications.map((app, index) => (
                                <motion.div
                                    key={app.id}
                                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: index * 0.1 }}
                                    onClick={() => setSelectedApp(app)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {/* User Info */}
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                            <span className="text-white font-bold">
                                                {app.user.name.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{app.user.name}</h3>
                                            <p className="text-sm text-gray-600">{app.user.email}</p>
                                        </div>
                                    </div>

                                    {/* Account Info */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Account Type:</span>
                                            <span className="font-medium">{app.account_type_display || app.account_type}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Branch:</span>
                                            <span className="font-medium text-xs">{app.branch_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Account:</span>
                                            <span className="font-mono text-xs">{app.full_account_number}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Holder:</span>
                                            <span className="font-medium">{app.account_holder_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Applied:</span>
                                            <span>{new Date(app.created_at).toLocaleDateString('id-ID')}</span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            <Icon icon="mdi:clock" className="w-3 h-3 mr-1" />
                                            Pending Review
                                        </span>
                                        <Icon icon="mdi:chevron-right" className="w-4 h-4 text-gray-400" />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    {/* Review Modal */}
                    {selectedApp && (
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <motion.div
                                className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Review Application</h2>
                                    <motion.button
                                        onClick={() => setSelectedApp(null)}
                                        className="p-2 hover:bg-gray-100 rounded-full"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        <Icon icon="mdi:close" className="w-5 h-5 text-gray-500" />
                                    </motion.button>
                                </div>

                                {/* Application Details */}
                                <div className="space-y-6">
                                    {/* User Info */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">User Information</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Name:</span>
                                                <p className="font-medium">{selectedApp.user.name}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Email:</span>
                                                <p className="font-medium">{selectedApp.user.email}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Phone:</span>
                                                <p className="font-medium">{selectedApp.phone_number}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">ID Card:</span>
                                                <p className="font-mono text-xs">{selectedApp.id_card_number}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Account Info */}
                                    <div className="bg-blue-50 rounded-xl p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">SafePay Account Information</h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-600">Account Type:</span>
                                                <p className="font-medium">{selectedApp.account_type_display || selectedApp.account_type}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Branch:</span>
                                                <p className="font-medium">{selectedApp.branch_name}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Account Number:</span>
                                                <p className="font-mono">{selectedApp.full_account_number}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Account Holder:</span>
                                                <p className="font-medium">{selectedApp.account_holder_name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Personal Details */}
                                    <div className="bg-green-50 rounded-xl p-4">
                                        <h3 className="font-semibold text-gray-900 mb-3">Personal Details</h3>
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <span className="text-gray-600">Date of Birth:</span>
                                                <p className="font-medium">{new Date(selectedApp.date_of_birth).toLocaleDateString('id-ID')}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Address:</span>
                                                <p className="font-medium">{selectedApp.address}</p>
                                            </div>
                                            <div>
                                                <span className="text-gray-600">Mother's Maiden Name:</span>
                                                <p className="font-medium">{selectedApp.mother_maiden_name}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rejection Reason Input (if rejecting) */}
                                    <div className="bg-red-50 rounded-xl p-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Rejection Reason (if rejecting)
                                        </label>
                                        <textarea
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                                            rows="3"
                                            placeholder="Provide reason for rejection..."
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex space-x-4">
                                        <motion.button
                                            onClick={() => handleReview(selectedApp.id, 'approve')}
                                            disabled={isProcessing}
                                            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {isProcessing ? (
                                                <div className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                    Processing...
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center">
                                                    <Icon icon="mdi:check" className="w-5 h-5 mr-2" />
                                                    Approve
                                                </div>
                                            )}
                                        </motion.button>

                                        <motion.button
                                            onClick={() => handleReview(selectedApp.id, 'reject')}
                                            disabled={isProcessing}
                                            className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 px-4 rounded-xl disabled:opacity-50"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            <div className="flex items-center justify-center">
                                                <Icon icon="mdi:close" className="w-5 h-5 mr-2" />
                                                Reject
                                            </div>
                                        </motion.button>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
