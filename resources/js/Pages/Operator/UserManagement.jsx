import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage, Link, router } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import axios from 'axios';

export default function OperatorUserManagement() {
    const { users, filters } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [suspendData, setSuspendData] = useState({ reason: '', type: 'temporary', expires_at: '' });
    const [isLoading, setIsLoading] = useState(false);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        router.get('/operator/users', { search, status }, { preserveState: true });
    };

    const handleStatusFilter = (newStatus) => {
        setStatus(newStatus);
        router.get('/operator/users', { search, status: newStatus }, { preserveState: true });
    };

    const loadUserDetails = async (user) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`/operator/users/${user.id}/details`);
            setSelectedUser(response.data);
            setShowUserDetails(true);
        } catch (error) {
            alert('Failed to load user details');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSuspendUser = async (user) => {
        setSelectedUser(user);
        setShowSuspendModal(true);
    };

    const submitSuspension = async () => {
        setIsLoading(true);
        try {
            const response = await axios.post(`/operator/users/${selectedUser.id}/suspend`, suspendData);
            if (response.data.success) {
                alert('User suspended successfully');
                setShowSuspendModal(false);
                setSuspendData({ reason: '', type: 'temporary', expires_at: '' });
                window.location.reload();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to suspend user');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLiftSuspension = async (user) => {
        if (!confirm('Are you sure you want to lift this suspension?')) return;
        
        setIsLoading(true);
        try {
            const response = await axios.post(`/operator/users/${user.id}/lift-suspension`);
            if (response.data.success) {
                alert('Suspension lifted successfully');
                window.location.reload();
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to lift suspension');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (user) => {
        if (user.suspensions && user.suspensions.length > 0) {
            return 'bg-red-100 text-red-800';
        }
        return user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (user) => {
        if (user.suspensions && user.suspensions.length > 0) {
            return 'Suspended';
        }
        return user.is_active ? 'Active' : 'Inactive';
    };

    return (
        <AuthenticatedLayout>
            <Head title="User Management - Operator" />

            <div className="min-h-screen bg-gray-50">
                {/* Header */}
                <motion.div 
                    className="bg-white px-4 sm:px-6 lg:px-8 py-6 border-b border-gray-100"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                                <p className="text-sm text-gray-500">Monitor and manage SafePay users</p>
                            </div>
                            <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-800">
                                Operator Panel
                            </span>
                        </div>
                    </div>
                </motion.div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    {/* Filters */}
                    <motion.div
                        className="bg-white rounded-xl p-6 shadow-sm mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Search by name, email, or wallet number..."
                                />
                            </div>
                            <div className="flex gap-2">
                                <select
                                    value={status}
                                    onChange={(e) => handleStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    <Icon icon="mdi:magnify" className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    </motion.div>

                    {/* Users Table */}
                    <motion.div
                        className="bg-white rounded-xl shadow-sm overflow-hidden"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-sm text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.wallet?.wallet_number || 'No wallet'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                {user.wallet ? formatCurrency(user.wallet.balance) : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user)}`}>
                                                    {getStatusText(user)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(user.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => loadUserDetails(user)}
                                                        className="text-orange-600 hover:text-orange-900 p-1"
                                                        title="View Details"
                                                    >
                                                        <Icon icon="mdi:eye" className="w-4 h-4" />
                                                    </button>
                                                    {user.suspensions && user.suspensions.length > 0 ? (
                                                        <button
                                                            onClick={() => handleLiftSuspension(user)}
                                                            className="text-green-600 hover:text-green-900 p-1"
                                                            title="Lift Suspension"
                                                        >
                                                            <Icon icon="mdi:account-check" className="w-4 h-4" />
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleSuspendUser(user)}
                                                            className="text-red-600 hover:text-red-900 p-1"
                                                            title="Suspend User"
                                                        >
                                                            <Icon icon="mdi:account-off" className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {users.links && (
                            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                                <div className="flex-1 flex justify-between sm:hidden">
                                    {users.prev_page_url && (
                                        <Link href={users.prev_page_url} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                            Previous
                                        </Link>
                                    )}
                                    {users.next_page_url && (
                                        <Link href={users.next_page_url} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                            Next
                                        </Link>
                                    )}
                                </div>
                                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm text-gray-700">
                                            Showing <span className="font-medium">{users.from}</span> to <span className="font-medium">{users.to}</span> of{' '}
                                            <span className="font-medium">{users.total}</span> results
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Suspend Modal */}
                {showSuspendModal && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-md">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Suspend User</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Reason</label>
                                    <textarea
                                        value={suspendData.reason}
                                        onChange={(e) => setSuspendData({...suspendData, reason: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                                        rows="3"
                                        placeholder="Enter suspension reason..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Type</label>
                                    <select
                                        value={suspendData.type}
                                        onChange={(e) => setSuspendData({...suspendData, type: e.target.value})}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                                    >
                                        <option value="temporary">Temporary</option>
                                        <option value="permanent">Permanent</option>
                                    </select>
                                </div>
                                {suspendData.type === 'temporary' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Expires At</label>
                                        <input
                                            type="datetime-local"
                                            value={suspendData.expires_at}
                                            onChange={(e) => setSuspendData({...suspendData, expires_at: e.target.value})}
                                            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowSuspendModal(false)}
                                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitSuspension}
                                    disabled={isLoading || !suspendData.reason}
                                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {isLoading ? 'Suspending...' : 'Suspend User'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Details Modal */}
                {showUserDetails && selectedUser && (
                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-900">User Details</h3>
                                <button
                                    onClick={() => setShowUserDetails(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <Icon icon="mdi:close" className="w-6 h-6" />
                                </button>
                            </div>
                            
                            <div className="space-y-6">
                                {/* User Info */}
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">Basic Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <p><span className="font-medium">Name:</span> {selectedUser.user.name}</p>
                                        <p><span className="font-medium">Email:</span> {selectedUser.user.email}</p>
                                        <p><span className="font-medium">Phone:</span> {selectedUser.user.phone || 'Not provided'}</p>
                                        <p><span className="font-medium">Status:</span> 
                                            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedUser.user)}`}>
                                                {getStatusText(selectedUser.user)}
                                            </span>
                                        </p>
                                    </div>
                                </div>

                                {/* Wallet Info */}
                                {selectedUser.user.wallet && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Wallet Information</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                            <p><span className="font-medium">Wallet Number:</span> {selectedUser.user.wallet.wallet_number}</p>
                                            <p><span className="font-medium">Balance:</span> {formatCurrency(selectedUser.user.wallet.balance)}</p>
                                            <p><span className="font-medium">Locked Balance:</span> {formatCurrency(selectedUser.user.wallet.locked_balance)}</p>
                                        </div>
                                    </div>
                                )}

                                {/* Recent Transactions */}
                                {selectedUser.recent_transactions && selectedUser.recent_transactions.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Transactions</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="space-y-2">
                                                {selectedUser.recent_transactions.slice(0, 5).map((transaction) => (
                                                    <div key={transaction.id} className="flex justify-between items-center text-sm">
                                                        <span>{transaction.type} - {formatCurrency(transaction.amount)}</span>
                                                        <span className="text-gray-500">
                                                            {new Date(transaction.created_at).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
