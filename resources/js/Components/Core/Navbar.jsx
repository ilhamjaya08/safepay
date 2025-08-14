import { Link } from "@inertiajs/react";
import { motion } from "framer-motion";

export default function Navbar({ auth }) {
    return (
        <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <motion.div 
                        className="flex items-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <img 
                            src="/logo.png" 
                            alt="Safepay Logo" 
                            className="h-8 w-auto"
                        />
                    </motion.div>
                    
                    {/* Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <motion.a 
                            href="#" 
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            whileHover={{ scale: 1.05, color: "#059669" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Fitur
                        </motion.a>
                        <motion.a 
                            href="#" 
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            whileHover={{ scale: 1.05, color: "#059669" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Tentang
                        </motion.a>
                        <motion.a 
                            href="#" 
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            whileHover={{ scale: 1.05, color: "#059669" }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            Hubungi Kami
                        </motion.a>
                    </div>
                    
                    {/* Auth Buttons */}
                    <div className="flex items-center space-x-4">
                        {auth.user ? (
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <Link
                                    href={route('dashboard')}
                                    className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                >
                                    Dashboard
                                </Link>
                            </motion.div>
                        ) : (
                            <>
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Link
                                        href={route('login')}
                                        className="text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        Log in
                                    </Link>
                                </motion.div>
                                <motion.div
                                    whileHover={{ 
                                        scale: 1.05,
                                        boxShadow: "0 4px 15px rgba(16, 185, 129, 0.3)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 300 }}
                                >
                                    <Link
                                        href={route('register')}
                                        className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
                                    >
                                        Daftar
                                    </Link>
                                </motion.div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}