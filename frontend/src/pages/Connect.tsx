import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface ConnectProps {
  setIsConnected: (isConnected: boolean) => void;
  isConnected: boolean;
}

interface Device {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'connected' | 'error';
}

const Connect = ({ setIsConnected, isConnected }: ConnectProps) => {
  const navigate = useNavigate();
  const [availableDevices, setAvailableDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  // Simulated device scanning
  const scanForDevices = () => {
    setIsScanning(true);
    setAvailableDevices([]);
    
    // Simulate device discovery over time
    const sampleDevices: Device[] = [
      { id: 'temp-sens-01', name: 'Temperature Sensor', type: 'sensor', status: 'available' },
      { id: 'press-valve-02', name: 'Pressure Valve', type: 'actuator', status: 'available' },
      { id: 'flow-meter-03', name: 'Flow Meter', type: 'sensor', status: 'available' },
      { id: 'motor-speed-04', name: 'Motor Speed Controller', type: 'controller', status: 'available' },
      { id: 'industrial-hub-05', name: 'Industrial IoT Hub', type: 'gateway', status: 'available' },
    ];
    
    // Simulate discovering devices one by one
    const intervals = [800, 1200, 1500, 2200, 2800];
    
    intervals.forEach((delay, index) => {
      setTimeout(() => {
        setAvailableDevices(prev => [...prev, sampleDevices[index]]);
        
        // Stop scanning after all devices are found
        if (index === intervals.length - 1) {
          setIsScanning(false);
        }
      }, delay);
    });
  };

  // Handle device selection
  const handleSelectDevice = (device: Device) => {
    setSelectedDevice(device);
  };

  // Simulate connecting to a device
  const connectToDevice = () => {
    if (!selectedDevice) return;
    
    setConnectionStatus('connecting');
    
    // Simulate connection process
    setTimeout(() => {
      // 90% chance of successful connection
      const isSuccessful = Math.random() < 0.9;
      
      if (isSuccessful) {
        setConnectionStatus('connected');
        setIsConnected(true);
        
        // Update device status in the list
        setAvailableDevices(prev => 
          prev.map(device => 
            device.id === selectedDevice.id 
              ? { ...device, status: 'connected' } 
              : device
          )
        );
        
        // Navigate to dashboard after a delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setConnectionStatus('failed');
      }
    }, 2000);
  };

  // Reset connection
  const handleDisconnect = () => {
    setIsConnected(false);
    setConnectionStatus('idle');
    setSelectedDevice(null);
    
    // Update device statuses
    setAvailableDevices(prev => 
      prev.map(device => ({ ...device, status: 'available' }))
    );
  };

  // Auto-scan for devices on first load
  useEffect(() => {
    if (!isConnected && availableDevices.length === 0 && !isScanning) {
      scanForDevices();
    }
  }, []);

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">Connect Hardware</h1>
          <p className="mt-2 text-gray-600">
            Connect your industrial equipment to monitor for anomalies in real-time.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Device Discovery Panel */}
          <div className="lg:col-span-2">
            <motion.div 
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <motion.h2 variants={itemVariants} className="text-xl font-semibold text-gray-800">
                  Available Devices
                </motion.h2>
                <motion.button 
                  variants={itemVariants}
                  onClick={scanForDevices}
                  disabled={isScanning}
                  className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 disabled:text-gray-400"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 mr-1 ${isScanning ? 'animate-spin' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {isScanning ? 'Scanning...' : 'Scan for Devices'}
                </motion.button>
              </div>
              <motion.ul variants={containerVariants} className="space-y-4">
                {availableDevices.length > 0 ? (
                  availableDevices.map((device) => (
                    <motion.li
                      key={device.id}
                      variants={itemVariants}
                      className={`p-4 border rounded-lg cursor-pointer ${selectedDevice?.id === device.id ? 'bg-blue-100' : 'bg-white'} hover:bg-blue-50 transition-all`}
                      onClick={() => handleSelectDevice(device)}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-800 font-medium">{device.name} ({device.type})</span>
                        <span className={`text-sm font-semibold ${device.status === 'available' ? 'text-green-600' : 'text-red-600'}`}>{device.status}</span>
                      </div>
                    </motion.li>
                  ))
                ) : (
                  <motion.li variants={itemVariants} className="text-gray-500 text-center">
                    {isScanning ? 'Scanning for devices...' : 'No devices found'}
                  </motion.li>
                )}
              </motion.ul>
            </motion.div>
          </div>

          {/* Connection Panel */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <motion.h2 variants={itemVariants} className="text-xl font-semibold text-gray-800 mb-4">
              Connection Status
            </motion.h2>
            <div className="mb-4">
              {selectedDevice ? (
                <p className="text-gray-700">Selected Device: <span className="font-medium text-gray-900">{selectedDevice.name}</span></p>
              ) : (
                <p className="text-gray-500">Select a device to connect</p>
              )}
            </div>
            <motion.button
              variants={itemVariants}
              onClick={selectedDevice && connectionStatus !== 'connected' ? connectToDevice : handleDisconnect}
              disabled={!selectedDevice}
              className={`w-full text-center py-2 px-4 rounded-lg font-medium transition-all ${connectionStatus === 'connected' ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-primary-600 text-white hover:bg-primary-700'} disabled:bg-gray-300 disabled:cursor-not-allowed`}
            >
              {connectionStatus === 'idle' && 'Connect'}
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'connected' && 'Disconnect'}
              {connectionStatus === 'failed' && 'Retry Connection'}
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Connect;
