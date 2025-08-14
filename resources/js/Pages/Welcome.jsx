import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import Navbar from '@/Components/Core/Navbar';

export default function Welcome({ auth, laravelVersion, phpVersion }) {
    return (
        <>
            <Head title="Welcome" />
            <div className="min-h-screen bg-white">
                <Navbar auth={auth} />
                
                {/* Hero Section */}
                <motion.div 
                    className="bg-gradient-to-br from-emerald-400 to-emerald-500 min-h-screen flex items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left side - Illustration */}
                            <motion.div 
                                className="ml-20 flex justify-center lg:justify-start"
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                            >
                                <motion.div
                                    animate={{ y: [0, -10, 0] }}
                                    transition={{
                                        duration: 3,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="flex justify-center items-center"
                                >
                                    <img 
                                        src="/savings.svg" 
                                        alt="Savings Illustration" 
                                        className="w-80 h-80 object-contain"
                                    />
                                </motion.div>
                            </motion.div>
                            
                            {/* Right side - Content */}
                            <motion.div 
                                className="text-center lg:text-left"
                                initial={{ x: 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                            >
                                <motion.h1 
                                    className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-8"
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.6 }}
                                >
                                    Kendalikan
                                    <br />
                                    Keuanganmu,
                                    <br />
                                    Dimanapun Kamu
                                    <br />
                                    Berada
                                </motion.h1>
                                
                                <motion.div 
                                    className="flex justify-center lg:justify-start"
                                    initial={{ y: 30, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.6, delay: 0.8 }}
                                >
                                    <motion.button 
                                        className="bg-white text-emerald-500 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors shadow-lg"
                                        whileHover={{ 
                                            scale: 1.05,
                                            boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        Coba Sekarang
                                    </motion.button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
