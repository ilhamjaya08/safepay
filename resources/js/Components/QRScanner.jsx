import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

export default function QRScanner({ onScan, onError, onClose }) {
    const videoRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [scanning, setScanning] = useState(false);

    useEffect(() => {
        startCamera();
        return () => {
            stopCamera();
        };
    }, []);

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment' // Use back camera
                }
            });
            
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                setScanning(true);
            }
        } catch (error) {
            console.error('Camera access error:', error);
            if (onError) onError(error);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
        setScanning(false);
    };

    const captureFrame = () => {
        if (!videoRef.current || !scanning) return;

        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URL for manual processing
        const imageData = canvas.toDataURL('image/png');
        
        // For demo purposes, we'll simulate QR detection
        // In real implementation, you'd use a QR decode library here
        // But for now, let's make it work with manual input
        
        // This is a simplified approach - you could integrate with jsQR library
        // or use the device's built-in scanning capabilities
    };

    const [showManualInput, setShowManualInput] = useState(false);
    const [manualInput, setManualInput] = useState('');

    const handleManualSubmit = () => {
        if (manualInput.trim()) {
            // For wallet ID format (SP12345678), create QR data
            if (manualInput.startsWith('SP') && manualInput.length === 10) {
                const qrData = btoa(JSON.stringify({
                    type: 'wallet',
                    wallet_number: manualInput.trim(),
                    user_id: null, // Will be validated by backend
                    user_name: 'Unknown User'
                }));
                if (onScan) onScan(qrData);
            } else {
                // Assume it's already QR data
                if (onScan) onScan(manualInput.trim());
            }
        }
    };

    return (
        <div className="relative">
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-black">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-64 object-cover"
                />
                
                {/* Scanning overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="border-2 border-emerald-400 w-48 h-48 rounded-xl">
                        <div className="relative w-full h-full">
                            {/* Corner indicators */}
                            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-emerald-400"></div>
                            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-emerald-400"></div>
                            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-emerald-400"></div>
                            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-emerald-400"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Input Option */}
            {showManualInput ? (
                <motion.div
                    className="mt-4 bg-gray-50 rounded-xl p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h4 className="font-medium text-gray-900 mb-3">Enter Wallet ID</h4>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            value={manualInput}
                            onChange={(e) => setManualInput(e.target.value)}
                            placeholder="SP12345678"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            autoFocus
                        />
                        <motion.button
                            onClick={handleManualSubmit}
                            disabled={!manualInput.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Send
                        </motion.button>
                    </div>
                    <motion.button
                        onClick={() => setShowManualInput(false)}
                        className="w-full mt-3 text-gray-600 text-sm py-2"
                    >
                        Back to Camera
                    </motion.button>
                </motion.div>
            ) : (
                /* Controls */
                <div className="mt-4 flex space-x-3">
                    <motion.button
                        onClick={() => setShowManualInput(true)}
                        className="flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-xl"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Icon icon="mdi:keyboard" className="w-4 h-4 mr-2 inline" />
                        Enter Wallet ID
                    </motion.button>
                    
                    <motion.button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Cancel
                    </motion.button>
                </div>
            )}

            <div className="mt-3 text-center">
                <p className="text-sm text-gray-600">
                    {showManualInput 
                        ? 'Enter SafePay Wallet ID (e.g., SP12345678)'
                        : 'Position QR code within the frame or enter wallet ID manually'
                    }
                </p>
            </div>
        </div>
    );
}
