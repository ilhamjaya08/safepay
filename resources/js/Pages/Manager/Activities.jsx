import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';

export default function Activities() {
    const {
        transactions,
        filters,
        availableTypes = [],
        availableStatuses = [],
    } = usePage().props;

    const data = transactions?.data ?? [];
    const meta = transactions?.meta ?? {};
    const links = transactions?.links ?? [];

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [type, setType] = useState(filters.type || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    const [showExportModal, setShowExportModal] = useState(false);
    const [exportFormat, setExportFormat] = useState('xlsx');
    const [exportScope, setExportScope] = useState('all');
    const [exportDays, setExportDays] = useState('7');
    const [exportLastCount, setExportLastCount] = useState('100');
    const [exportStartDate, setExportStartDate] = useState('');
    const [exportEndDate, setExportEndDate] = useState('');

    useEffect(() => {
        setSearch(filters.search || '');
    }, [filters.search]);

    useEffect(() => {
        setStatus(filters.status || '');
    }, [filters.status]);

    useEffect(() => {
        setType(filters.type || '');
    }, [filters.type]);

    useEffect(() => {
        setDateFrom(filters.date_from || '');
    }, [filters.date_from]);

    useEffect(() => {
        setDateTo(filters.date_to || '');
    }, [filters.date_to]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount ?? 0);
    };

    const statusStyles = useMemo(() => ({
        completed: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        failed: 'bg-red-100 text-red-800',
        processing: 'bg-blue-100 text-blue-800',
        cancelled: 'bg-gray-100 text-gray-600',
    }), []);

    const getTypeIcon = (transactionType) => {
        switch (transactionType) {
            case 'payment_qr':
                return 'mdi:qrcode';
            case 'topup':
                return 'mdi:wallet-plus';
            case 'withdrawal':
                return 'mdi:cash-minus';
            case 'transfer_external':
                return 'mdi:bank-transfer';
            case 'transfer_internal':
                return 'mdi:swap-horizontal-bold';
            case 'refund':
                return 'mdi:cash-refund';
            default:
                return 'mdi:receipt';
        }
    };

    const handleFilterSubmit = (event) => {
        event.preventDefault();

        router.get(route('manager.activities'), {
            search,
            status,
            type,
            date_from: dateFrom,
            date_to: dateTo,
        }, {
            preserveState: true,
            replace: true,
            preserveScroll: true,
        });
    };

    const handleResetFilters = () => {
        setSearch('');
        setStatus('');
        setType('');
        setDateFrom('');
        setDateTo('');

        router.get(route('manager.activities'), {}, {
            preserveState: false,
            replace: true,
        });
    };

    const handleExportSubmit = (event) => {
        event.preventDefault();

        if (exportScope === 'last_days') {
            const days = Number(exportDays);
            if (!days || days < 1) {
                alert('Masukkan jumlah hari yang valid (minimal 1).');
                return;
            }
        }

        if (exportScope === 'date_range' && (!exportStartDate || !exportEndDate)) {
            alert('Lengkapi tanggal mulai dan akhir untuk ekspor.');
            return;
        }

        if (exportScope === 'last_transactions') {
            const count = Number(exportLastCount);
            if (!count || count < 1) {
                alert('Masukkan jumlah transaksi terakhir yang valid (minimal 1).');
                return;
            }
        }

        const params = {
            format: exportFormat,
            scope: exportScope,
            search: filters.search || '',
            status: filters.status || '',
            type: filters.type || '',
            date_from: filters.date_from || '',
            date_to: filters.date_to || '',
        };

        if (exportScope === 'last_days') {
            params.days = Number(exportDays);
        } else if (exportScope === 'date_range') {
            params.start_date = exportStartDate;
            params.end_date = exportEndDate;
        } else if (exportScope === 'last_transactions') {
            params.last_count = Number(exportLastCount);
        }

        setShowExportModal(false);
        const url = route('manager.activities.export', params);
        window.location.href = url;
    };

    return (
        <AuthenticatedLayout>
            <Head title="All Activities - Manager" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <motion.div
                        className="bg-white overflow-hidden shadow-sm sm:rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="p-6 border-b border-gray-100">
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Semua Transaksi</h2>
                                    <p className="text-sm text-gray-500">Pantau dan analisa aktivitas keuangan sistem Safepay.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowExportModal(true)}
                                        className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                                    >
                                        <Icon icon="mdi:download" className="h-4 w-4" />
                                        Unduh Data
                                    </button>
                                </div>
                            </div>

                            <form onSubmit={handleFilterSubmit} className="mt-6 rounded-xl border border-gray-100 bg-gray-50/70 p-4">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
                                    <div className="lg:col-span-2">
                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Pencarian</label>
                                        <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-red-400">
                                            <Icon icon="mdi:magnify" className="h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="Cari ID transaksi, nama pengirim/penerima..."
                                                className="ml-2 w-full border-0 p-0 text-sm text-gray-700 focus:ring-0"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Status</label>
                                        <select
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-red-400 focus:ring-2 focus:ring-red-200"
                                        >
                                            <option value="">Semua status</option>
                                            {availableStatuses.map((item) => (
                                                <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Jenis Transaksi</label>
                                        <select
                                            value={type}
                                            onChange={(e) => setType(e.target.value)}
                                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-red-400 focus:ring-2 focus:ring-red-200"
                                        >
                                            <option value="">Semua jenis</option>
                                            {availableTypes.map((item) => (
                                                <option key={item} value={item}>{item.replace(/_/g, ' ')}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="md:col-span-2 lg:col-span-2">
                                        <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Rentang Tanggal</label>
                                        <div className="flex flex-col gap-2 sm:flex-row">
                                            <input
                                                type="date"
                                                value={dateFrom}
                                                onChange={(e) => setDateFrom(e.target.value)}
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-red-400 focus:ring-2 focus:ring-red-200"
                                            />
                                            <input
                                                type="date"
                                                value={dateTo}
                                                onChange={(e) => setDateTo(e.target.value)}
                                                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-red-400 focus:ring-2 focus:ring-red-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-end gap-2 lg:justify-end">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
                                        >
                                            <Icon icon="mdi:filter-variant" className="h-4 w-4" />
                                            Terapkan
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleResetFilters}
                                            className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                        >
                                            Reset
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6">
                            {data.length > 0 ? (
                                <div className="space-y-4">
                                    {data.map((activity, index) => (
                                        <motion.div
                                            key={activity.id}
                                            className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:flex-row sm:items-center"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3, delay: index * 0.04 }}
                                        >
                                            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-emerald-50">
                                                <Icon icon={getTypeIcon(activity.type)} className="h-6 w-6 text-emerald-600" />
                                            </div>

                                            <div className="flex-1">
                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div>
                                                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                                                            <span>{activity.sender?.name || 'Tidak diketahui'}</span>
                                                            <Icon icon="mdi:arrow-right" className="h-4 w-4 text-gray-400" />
                                                            <span>{activity.receiver?.name || 'Tidak diketahui'}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500">
                                                            ID: <span className="font-medium text-gray-700">{activity.transaction_id}</span> • {activity.type_label}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-base font-semibold text-gray-900">{formatCurrency(activity.amount)}</p>
                                                        <p className="text-xs text-gray-500">Total: {formatCurrency(activity.total_amount)}</p>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                                    <div className="text-sm text-gray-600">{activity.description}</div>
                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                                        <span>{activity.sender?.email || '-'}</span>
                                                        <Icon icon="mdi:dot" className="h-5 w-5 text-gray-300" />
                                                        <span>{activity.receiver?.email || '-'}</span>
                                                        <Icon icon="mdi:dot" className="h-5 w-5 text-gray-300" />
                                                        <span>{activity.created_at ? new Date(activity.created_at).toLocaleString('id-ID') : '-'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className={`self-start rounded-full px-3 py-1 text-xs font-medium ${statusStyles[activity.status] || 'bg-gray-100 text-gray-600'}`}>
                                                {(activity.status || '').replace(/_/g, ' ')}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                                    <Icon icon="mdi:clock-outline" className="mb-4 h-16 w-16 opacity-40" />
                                    <p className="font-medium">Belum ada transaksi yang sesuai filter.</p>
                                    <p className="text-sm">Coba ubah kata kunci atau rentang tanggal untuk melihat data lainnya.</p>
                                </div>
                            )}

                            {links.length > 1 && (
                                <div className="mt-6 flex flex-col gap-4 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                                    <p className="text-sm text-gray-500">
                                        Menampilkan {meta.from ?? 0}-{meta.to ?? 0} dari {meta.total ?? 0} transaksi
                                    </p>
                                    <div className="flex flex-wrap items-center gap-2">
                                        {links.map((link, index) => (
                                            link.url ? (
                                                <Link
                                                    // eslint-disable-next-line react/no-danger
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    key={`${link.label}-${index}`}
                                                    href={link.url}
                                                    className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                                                        link.active
                                                            ? 'bg-red-500 text-white shadow-sm'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                    }`}
                                                    preserveState
                                                    preserveScroll
                                                />
                                            ) : (
                                                <span
                                                    // eslint-disable-next-line react/no-danger
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                    key={`${link.label}-${index}`}
                                                    className="rounded-lg px-3 py-1.5 text-sm text-gray-400"
                                                />
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {showExportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4">
                    <motion.div
                        className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Ekspor Data Transaksi</h3>
                                <p className="text-sm text-gray-500">Pilih format dan cakupan data sebelum mengunduh.</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowExportModal(false)}
                                className="text-gray-400 transition-colors hover:text-gray-600"
                            >
                                <Icon icon="mdi:close" className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleExportSubmit} className="mt-6 space-y-5">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Format file</p>
                                <div className="mt-2 flex items-center gap-3">
                                    <label className={`w-full cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${exportFormat === 'xlsx' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-200'}`}>
                                        <input
                                            type="radio"
                                            name="exportFormat"
                                            value="xlsx"
                                            checked={exportFormat === 'xlsx'}
                                            onChange={() => setExportFormat('xlsx')}
                                            className="sr-only"
                                        />
                                        XLSX
                                    </label>
                                    <label className={`w-full cursor-pointer rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${exportFormat === 'csv' ? 'border-red-500 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-200'}`}>
                                        <input
                                            type="radio"
                                            name="exportFormat"
                                            value="csv"
                                            checked={exportFormat === 'csv'}
                                            onChange={() => setExportFormat('csv')}
                                            className="sr-only"
                                        />
                                        CSV
                                    </label>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Data yang ingin diunduh</p>
                                <div className="mt-3 space-y-3">
                                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${exportScope === 'all' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-200'}`}>
                                        <input
                                            type="radio"
                                            name="exportScope"
                                            value="all"
                                            checked={exportScope === 'all'}
                                            onChange={() => setExportScope('all')}
                                        />
                                        <span>Semua data (mengikuti filter yang sedang aktif)</span>
                                    </label>

                                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${exportScope === 'last_days' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="exportScope"
                                                value="last_days"
                                                checked={exportScope === 'last_days'}
                                                onChange={() => setExportScope('last_days')}
                                            />
                                            <span>Beberapa hari terakhir</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            className="ml-auto w-24 rounded-md border border-gray-200 px-3 py-1 text-sm"
                                            value={exportDays}
                                            onChange={(e) => setExportDays(e.target.value)}
                                            disabled={exportScope !== 'last_days'}
                                        />
                                    </label>

                                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${exportScope === 'last_month' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-200'}`}>
                                        <input
                                            type="radio"
                                            name="exportScope"
                                            value="last_month"
                                            checked={exportScope === 'last_month'}
                                            onChange={() => setExportScope('last_month')}
                                        />
                                        <span>Satu bulan terakhir</span>
                                    </label>

                                    <div className={`rounded-lg border px-4 py-3 text-sm transition-colors ${exportScope === 'date_range' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-200'}`}>
                                        <label className="flex cursor-pointer items-center gap-3">
                                            <input
                                                type="radio"
                                                name="exportScope"
                                                value="date_range"
                                                checked={exportScope === 'date_range'}
                                                onChange={() => setExportScope('date_range')}
                                            />
                                            <span>Rentang tanggal tertentu</span>
                                        </label>
                                        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                                            <input
                                                type="date"
                                                value={exportStartDate}
                                                onChange={(e) => setExportStartDate(e.target.value)}
                                                disabled={exportScope !== 'date_range'}
                                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                                            />
                                            <input
                                                type="date"
                                                value={exportEndDate}
                                                onChange={(e) => setExportEndDate(e.target.value)}
                                                disabled={exportScope !== 'date_range'}
                                                className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-red-400 focus:ring-2 focus:ring-red-200"
                                            />
                                        </div>
                                    </div>

                                    <label className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${exportScope === 'last_transactions' ? 'border-red-400 bg-red-50 text-red-600' : 'border-gray-200 text-gray-600 hover:border-red-200'}`}>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                name="exportScope"
                                                value="last_transactions"
                                                checked={exportScope === 'last_transactions'}
                                                onChange={() => setExportScope('last_transactions')}
                                            />
                                            <span>Jumlah transaksi terakhir</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="1"
                                            className="ml-auto w-24 rounded-md border border-gray-200 px-3 py-1 text-sm"
                                            value={exportLastCount}
                                            onChange={(e) => setExportLastCount(e.target.value)}
                                            disabled={exportScope !== 'last_transactions'}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowExportModal(false)}
                                    className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-600"
                                >
                                    <Icon icon="mdi:download" className="h-4 w-4" />
                                    Mulai Unduh
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
