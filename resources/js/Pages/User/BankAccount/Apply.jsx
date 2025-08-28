import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import axios from 'axios';

export default function BankAccountApply() {
    const { auth, existingApplication, supportedAccountTypes, branches } = usePage().props;
    const user = auth.user;

    const [formData, setFormData] = useState({
        account_type: 'savings',
        branch_code: '001',
        account_number: '',
        account_holder_name: user.name,
        id_card_number: '',
        date_of_birth: '',
        address: '',
        phone_number: user.phone || '',
        mother_maiden_name: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.account_type) newErrors.account_type = 'Account type is required';
        if (!formData.branch_code) newErrors.branch_code = 'Branch is required';
        if (!formData.account_number) newErrors.account_number = 'Account number is required';
        if (formData.account_number.length < 6) newErrors.account_number = 'Account number too short';
        if (!formData.account_holder_name) newErrors.account_holder_name = 'Account holder name is required';
        if (!formData.id_card_number) newErrors.id_card_number = 'ID card number is required';
        if (formData.id_card_number.length !== 16) newErrors.id_card_number = 'ID card number must be 16 digits';
        if (!formData.date_of_birth) newErrors.date_of_birth = 'Date of birth is required';
        if (!formData.address) newErrors.address = 'Address is required';
        if (!formData.phone_number) newErrors.phone_number = 'Phone number is required';
        if (!formData.mother_maiden_name) newErrors.mother_maiden_name = 'Mother maiden name is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const response = await axios.post('/bank-account/apply', formData);
            
            if (response.data.success) {
                alert('SafePay account application submitted successfully! Please wait for review.');
                window.location.href = '/bank-account/status';
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Application failed';
            alert(message);
            
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (existingApplication) {
        return (
            <AuthenticatedLayout>
                <Head title="Bank Account Status" />
                
                <div className="min-h-screen bg-gray-50 py-6">
                    <div className="max-w-2xl mx-auto px-4">
                        <motion.div
                            className="bg-white rounded-2xl p-8 shadow-lg text-center"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${
                                existingApplication.status === 'approved' ? 'bg-green-100' :
                                existingApplication.status === 'rejected' ? 'bg-red-100' :
                                'bg-yellow-100'
                            }`}>
                                <Icon 
                                    icon={
                                        existingApplication.status === 'approved' ? 'mdi:check-circle' :
                                        existingApplication.status === 'rejected' ? 'mdi:close-circle' :
                                        'mdi:clock'
                                    } 
                                    className={`w-8 h-8 ${
                                        existingApplication.status === 'approved' ? 'text-green-600' :
                                        existingApplication.status === 'rejected' ? 'text-red-600' :
                                        'text-yellow-600'
                                    }`} 
                                />
                            </div>
                            
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                SafePay Account {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1)}
                            </h1>
                            
                            {existingApplication.status === 'pending' && (
                                <p className="text-gray-600 mb-6">
                                    Your application is under review. We'll notify you once it's processed.
                                </p>
                            )}
                            
                            {existingApplication.status === 'approved' && (
                                <p className="text-green-600 mb-6">
                                    Congratulations! Your SafePay account has been verified. You can now access all features.
                                </p>
                            )}
                            
                            {existingApplication.status === 'rejected' && (
                                <div className="text-left">
                                    <p className="text-red-600 mb-4">
                                        Your application was rejected for the following reason:
                                    </p>
                                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                                        <p className="text-red-800">{existingApplication.rejection_reason}</p>
                                    </div>
                                </div>
                            )}

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Account Type:</span>
                                        <p className="font-medium">{existingApplication.account_type_display || existingApplication.account_type}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Account Number:</span>
                                        <p className="font-medium font-mono">{existingApplication.full_account_number || existingApplication.account_number}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Account Holder:</span>
                                        <p className="font-medium">{existingApplication.account_holder_name}</p>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Applied:</span>
                                        <p className="font-medium">{new Date(existingApplication.created_at).toLocaleDateString('id-ID')}</p>
                                    </div>
                                </div>
                            </div>

                            <motion.a
                                href="/user/dashboard"
                                className="inline-block bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Back to Dashboard
                            </motion.a>
                        </motion.div>
                    </div>
                </div>
            </AuthenticatedLayout>
        );
    }

    return (
        <AuthenticatedLayout>
            <Head title="Apply SafePay Account" />

            <div className="min-h-screen bg-gray-50 py-6">
                <div className="max-w-2xl mx-auto px-4">
                    {/* Header */}
                    <motion.div
                        className="text-center mb-6"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Icon icon="mdi:bank" className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply for SafePay Account</h1>
                        <p className="text-gray-600">Complete your KYC verification to access all SafePay features</p>
                    </motion.div>

                    {/* Application Form */}
                    <motion.div
                        className="bg-white rounded-2xl p-6 shadow-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Account Type Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Type <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.account_type}
                                    onChange={(e) => handleChange('account_type', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.account_type ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                >
                                    {Object.entries(supportedAccountTypes).map(([code, name]) => (
                                        <option key={code} value={code}>{name}</option>
                                    ))}
                                </select>
                                {errors.account_type && <p className="text-red-500 text-xs mt-1">{errors.account_type}</p>}
                            </div>

                            {/* Branch Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SafePay Branch <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={formData.branch_code}
                                    onChange={(e) => handleChange('branch_code', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.branch_code ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                >
                                    {Object.entries(branches).map(([code, name]) => (
                                        <option key={code} value={code}>{name}</option>
                                    ))}
                                </select>
                                {errors.branch_code && <p className="text-red-500 text-xs mt-1">{errors.branch_code}</p>}
                            </div>

                            {/* Account Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Number <span className="text-red-500">*</span>
                                </label>
                                <div className="flex">
                                    <div className="bg-gray-100 px-4 py-3 rounded-l-xl border border-r-0 border-gray-300 text-gray-600 font-mono text-sm">
                                        SP{formData.branch_code}
                                    </div>
                                    <input
                                        type="text"
                                        value={formData.account_number}
                                        onChange={(e) => handleChange('account_number', e.target.value.replace(/\D/g, '').slice(0, 8))}
                                        className={`flex-1 px-4 py-3 border rounded-r-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                            errors.account_number ? 'border-red-300' : 'border-gray-300'
                                        }`}
                                        placeholder="12345678"
                                        maxLength="8"
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Your full account number will be: SP{formData.branch_code}{formData.account_number}</p>
                                {errors.account_number && <p className="text-red-500 text-xs mt-1">{errors.account_number}</p>}
                            </div>

                            {/* Account Holder Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account Holder Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.account_holder_name}
                                    onChange={(e) => handleChange('account_holder_name', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.account_holder_name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="John Doe"
                                />
                                {errors.account_holder_name && <p className="text-red-500 text-xs mt-1">{errors.account_holder_name}</p>}
                            </div>

                            {/* ID Card Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    ID Card Number (KTP) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.id_card_number}
                                    onChange={(e) => handleChange('id_card_number', e.target.value.replace(/\D/g, '').slice(0, 16))}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.id_card_number ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="1234567890123456"
                                    maxLength="16"
                                />
                                {errors.id_card_number && <p className="text-red-500 text-xs mt-1">{errors.id_card_number}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="date"
                                    value={formData.date_of_birth}
                                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.date_of_birth ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth}</p>}
                            </div>

                            {/* Phone Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.phone_number}
                                    onChange={(e) => handleChange('phone_number', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.phone_number ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="+62812345678"
                                />
                                {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number}</p>}
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleChange('address', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${
                                        errors.address ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    rows="3"
                                    placeholder="Jl. Sudirman No. 123, Jakarta Pusat, DKI Jakarta"
                                />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>

                            {/* Mother Maiden Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Mother's Maiden Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.mother_maiden_name}
                                    onChange={(e) => handleChange('mother_maiden_name', e.target.value)}
                                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                        errors.mother_maiden_name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                    placeholder="Mother's maiden name"
                                />
                                {errors.mother_maiden_name && <p className="text-red-500 text-xs mt-1">{errors.mother_maiden_name}</p>}
                            </div>

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold py-4 px-4 rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                        Submitting Application...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center">
                                        <Icon icon="mdi:send" className="w-5 h-5 mr-2" />
                                        Submit Application
                                    </div>
                                )}
                            </motion.button>
                        </form>
                    </motion.div>

                    {/* Information */}
                    <motion.div
                        className="mt-6 bg-blue-50 rounded-xl p-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="flex">
                            <Icon icon="mdi:information" className="w-5 h-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div className="text-sm text-blue-700">
                                <p className="font-medium mb-1">KYC Requirements:</p>
                                <ul className="space-y-1 text-blue-600">
                                    <li>• Valid Indonesian ID card (KTP)</li>
                                    <li>• Complete and accurate personal information</li>
                                    <li>• Unique account number (8 digits)</li>
                                    <li>• Review process takes 1-3 business days</li>
                                </ul>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
