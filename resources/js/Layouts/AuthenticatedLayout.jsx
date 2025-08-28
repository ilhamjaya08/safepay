import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useState } from 'react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation */}
            <motion.nav 
                className="bg-white shadow-sm border-b border-gray-200"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between items-center">
                        {/* Logo & Navigation Links */}
                        <div className="flex items-center">
                            {/* Logo */}
                            <motion.div 
                                className="flex shrink-0 items-center"
                                whileHover={{ scale: 1.05 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Link href={route('dashboard')}>
                                    <img 
                                        src="/logo.png" 
                                        alt="Safepay Logo" 
                                        className="h-8 w-auto"
                                    />
                                </Link>
                            </motion.div>

                            {/* Desktop Navigation */}
                            <div className="hidden space-x-1 sm:ml-10 sm:flex">
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <NavLink
                                        href={route('dashboard')}
                                        active={route().current('dashboard') || route().current('user.dashboard') || route().current('operator.dashboard') || route().current('manager.dashboard')}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            route().current('dashboard') || route().current('user.dashboard') || route().current('operator.dashboard') || route().current('manager.dashboard')
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                                        }`}
                                    >
                                        Dashboard
                                    </NavLink>
                                </motion.div>
                                
                                {/* Role-specific navigation */}
                                {user.role === 'user' && (
                                    <>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <a 
                                                href={route('user.transfer.index')}
                                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                            >
                                                Transfer
                                            </a>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <a 
                                                href={route('user.qr.receive')}
                                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                            >
                                                QR Code
                                            </a>
                                        </motion.div>
                                    </>
                                )}
                                
                                {(user.role === 'operator' || user.role === 'manager') && (
                                    <>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <a 
                                                href={user.role === 'operator' ? '/operator/bank-applications' : '/manager/bank-applications'} 
                                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                            >
                                                Bank Apps
                                            </a>
                                        </motion.div>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <a 
                                                href="#" 
                                                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                            >
                                                Reports
                                            </a>
                                        </motion.div>
                                    </>
                                )}
                                
                                {user.role === 'manager' && (
                                    <motion.div
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <a 
                                            href="#" 
                                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                        >
                                            System
                                        </a>
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* User Menu */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-4">
                            {/* Notification Bell (optional) */}
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5V9.586l-1.414-1.414A1 1 0 0012 7.707V6a3 3 0 10-6 0v1.707a1 1 0 00-.586.475L4 9.586V12l-5 5h5m0 0v1a3 3 0 006 0v-1m-6 0h6" />
                                </svg>
                            </motion.button>

                            {/* User Dropdown */}
                            <div className="relative">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <motion.div
                                            whileHover={{ scale: 1.05 }}
                                            transition={{ type: "spring", stiffness: 300 }}
                                        >
                                            <button className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-sm font-semibold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span>{user.name}</span>
                                                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </motion.div>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <div className="px-4 py-2 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                            <span className={`inline-flex mt-1 items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                                user.role === 'manager' ? 'bg-red-100 text-red-800' :
                                                user.role === 'operator' ? 'bg-orange-100 text-orange-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                            </span>
                                        </div>
                                        <Dropdown.Link href={route('profile.edit')}>
                                            Profil
                                        </Dropdown.Link>
                                        <Dropdown.Link href="#" className="text-gray-600">
                                            Pengaturan
                                        </Dropdown.Link>
                                        <div className="border-t border-gray-100">
                                            <Dropdown.Link
                                                href={route('logout')}
                                                method="post"
                                                as="button"
                                                className="text-red-600"
                                            >
                                                Keluar
                                            </Dropdown.Link>
                                        </div>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        {/* Mobile menu button */}
                        <div className="flex items-center sm:hidden">
                            <motion.button
                                onClick={() => setShowingNavigationDropdown(!showingNavigationDropdown)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none transition-colors"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                    <path
                                        className={!showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={showingNavigationDropdown ? 'inline-flex' : 'hidden'}
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <motion.div
                    className={`sm:hidden ${showingNavigationDropdown ? 'block' : 'hidden'}`}
                    initial={false}
                    animate={showingNavigationDropdown ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    <div className="px-4 pt-2 pb-3 space-y-1 bg-gray-50">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                            className={`block px-3 py-2 rounded-md text-base font-medium ${
                                route().current('dashboard')
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                            Transaksi
                        </a>
                        <a href="#" className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                            Laporan
                        </a>
                    </div>

                    <div className="pt-4 pb-1 border-t border-gray-200 bg-white">
                        <div className="px-4 flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-base font-medium text-gray-800">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1 px-4">
                            <ResponsiveNavLink 
                                href={route('profile.edit')}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                            >
                                Profil
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                            >
                                Keluar
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </motion.div>
            </motion.nav>

            {/* Header */}
            {header && (
                <motion.header 
                    className="bg-white shadow-sm"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </motion.header>
            )}

            {/* Main Content */}
            <motion.main 
                className="flex-1"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                {children}
            </motion.main>

            {/* Bottom Navigation - Mobile Only */}
            <motion.nav 
                className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
            >
                <div className="flex justify-around items-center">
                    {[
                        { 
                            name: "Home", 
                            icon: "mdi:home", 
                            activeIcon: "mdi:home",
                            href: route('dashboard'),
                            active: route().current('dashboard')
                        },
                        { 
                            name: "Card", 
                            icon: "mdi:credit-card-outline", 
                            activeIcon: "mdi:credit-card",
                            href: "#",
                            active: false
                        },
                        { 
                            name: "QR", 
                            icon: "mdi:qrcode-scan", 
                            activeIcon: "mdi:qrcode-scan",
                            href: "#",
                            active: false,
                            special: true
                        },
                        { 
                            name: "Report", 
                            icon: "mdi:chart-line", 
                            activeIcon: "mdi:chart-line",
                            href: "#",
                            active: false
                        },
                        { 
                            name: "Settings", 
                            icon: "mdi:cog-outline", 
                            activeIcon: "mdi:cog",
                            href: "#",
                            active: false
                        },
                    ].map((item) => (
                        <motion.div
                            key={item.name}
                            className="flex flex-col items-center justify-center py-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {item.special ? (
                                <motion.button
                                    className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-1"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Icon 
                                        icon={item.icon} 
                                        className="w-7 h-7 text-white" 
                                    />
                                </motion.button>
                            ) : (
                                <Link href={item.href} className="flex flex-col items-center">
                                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl transition-colors ${
                                        item.active 
                                            ? 'bg-emerald-50' 
                                            : 'hover:bg-gray-50'
                                    }`}>
                                        <Icon 
                                            icon={item.active ? item.activeIcon : item.icon} 
                                            className={`w-6 h-6 ${
                                                item.active 
                                                    ? 'text-emerald-600' 
                                                    : 'text-gray-500'
                                            }`} 
                                        />
                                    </div>
                                    <span className={`text-xs mt-1 font-medium ${
                                        item.active 
                                            ? 'text-emerald-600' 
                                            : 'text-gray-500'
                                    }`}>
                                        {item.name}
                                    </span>
                                </Link>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.nav>
        </div>
    );
}
