import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export default function Activities() {
    const { activities = [] } = usePage().props;

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <AuthenticatedLayout>
            <Head title="All Activities - Manager" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">All Activities</h2>
                                    <p className="text-sm text-gray-600">System transaction activities</p>
                                </div>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                {activities.length > 0 ? (
                                    activities.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                        >
                                            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Icon 
                                                    icon={activity.type === 'qr_payment' ? 'mdi:qrcode' : 'mdi:send'} 
                                                    className="w-6 h-6 text-emerald-600" 
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-medium text-gray-900">
                                                        {activity.sender?.name} → {activity.receiver?.name}
                                                    </h4>
                                                    <span className="text-lg font-semibold text-gray-900">
                                                        {formatCurrency(activity.amount)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-sm text-gray-500">
                                                        {activity.description} • ID: {activity.transaction_id || activity.id}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(activity.created_at).toLocaleString('id-ID')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                activity.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                                activity.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {activity.status}
                                            </div>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-gray-500">
                                        <Icon icon="mdi:clock-outline" className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p>No activities found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
