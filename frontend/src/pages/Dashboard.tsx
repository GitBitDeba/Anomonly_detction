import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Define types
interface DataPoint {
  timestamp: string;
  value: number;
  normalRange: { min: number; max: number };
  isAnomaly: boolean;
}

interface Equipment {
  id: string;
  name: string;
  data: DataPoint[];
  currentValue: number;
  normalRange: { min: number; max: number };
  status: 'normal' | 'warning' | 'anomaly';
}

interface DatasetRunInfo {
  totalPoints: number;
  processedPoints: number;
  anomaliesFound: number;
  isComplete: boolean;
}

interface DashboardProps {
  isConnected: boolean;
  currentDataset: any;
}



const Dashboard = ({ isConnected, currentDataset }: DashboardProps) => {
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [runInfo, setRunInfo] = useState<DatasetRunInfo>({
    totalPoints: 0,
    processedPoints: 0,
    anomaliesFound: 0,
    isComplete: false,
  });
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

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

  // Generate sample equipment data
  useEffect(() => {
    // If we're connected to hardware or have a dataset, set up the sample data
    if (isConnected || currentDataset) {
      // For demo purposes, we'll generate sample data
      // In a real app, this would come from your hardware/dataset
      generateSampleData();
      
      if (currentDataset) {
        setRunInfo({
          totalPoints: 1000, // Sample value - would come from dataset
          processedPoints: 0,
          anomaliesFound: 0,
          isComplete: false
        });
      }
    }
  }, [isConnected, currentDataset]);

  // Simulate data playback for dataset
  useEffect(() => {
    let timer: number | null = null;
    
    if (currentDataset && isPlaying && !runInfo.isComplete) {
      timer = window.setInterval(() => {
        // Update processed points
        setRunInfo(prev => {
          const newProcessed = Math.min(prev.processedPoints + 5 * playbackSpeed, prev.totalPoints);
          const newAnomalies = Math.floor(Math.random() * 2) === 1 
            ? prev.anomaliesFound + 1 
            : prev.anomaliesFound;
          
          // Update equipment data with new values
          updateEquipmentData();
          
          return {
            ...prev,
            processedPoints: newProcessed,
            anomaliesFound: newAnomalies,
            isComplete: newProcessed >= prev.totalPoints
          };
        });
      }, 1000 / playbackSpeed);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentDataset, isPlaying, playbackSpeed, runInfo.isComplete]);

  // Helper functions
  const generateSampleData = () => {
    const equipmentTypes = [
      { name: 'Temperature Sensor', range: { min: 60, max: 85 } },
      { name: 'Pressure Valve', range: { min: 10, max: 50 } },
      { name: 'Flow Meter', range: { min: 100, max: 200 } },
      { name: 'Motor Speed', range: { min: 1000, max: 3000 } }
    ];
    
    const sampleEquipments = equipmentTypes.map((type, index) => {
  const currentValue = Math.random() * (type.range.max - type.range.min) + type.range.min;
  const isAnomaly = Math.random() > 0.8;
  const anomalyValue = isAnomaly 
    ? (Math.random() > 0.5 ? type.range.max * 1.2 : type.range.min * 0.8)
    : currentValue;
  
  // Generate historical data
  const data = Array.from({ length: 20 }, (_, i) => {
    const timestamp = new Date(Date.now() - (19 - i) * 60000).toLocaleTimeString();
    const value = i === 19 && isAnomaly 
      ? anomalyValue 
      : Math.random() * (type.range.max - type.range.min) + type.range.min;
    
    return {
      timestamp,
      value,
      normalRange: type.range,
      isAnomaly: value < type.range.min || value > type.range.max
    };
  });

  // Ensure status is strictly one of the allowed values
  const status: "anomaly" | "normal" | "warning" = isAnomaly ? "anomaly" : "normal";

  return {
    id: `equipment-${index}`,
    name: type.name,
    data,
    currentValue: data[data.length - 1].value,
    normalRange: type.range,
    status
  };
});

setEquipments(sampleEquipments)};


  const updateEquipmentData = () => {
    setEquipments(prev => prev.map(equipment => {
      // Generate a new data point
      const newTimestamp = new Date().toLocaleTimeString();
      const isAnomaly = Math.random() > 0.9;
      const newValue = isAnomaly
        ? (Math.random() > 0.5 
          ? equipment.normalRange.max * 1.2 
          : equipment.normalRange.min * 0.8)
        : Math.random() * (equipment.normalRange.max - equipment.normalRange.min) + equipment.normalRange.min;
      
      // Create new data point
      const newDataPoint = {
        timestamp: newTimestamp,
        value: newValue,
        normalRange: equipment.normalRange,
        isAnomaly
      };
      
      // Update data array (remove oldest, add newest)
      const newData = [...equipment.data.slice(1), newDataPoint];
      
      return {
        ...equipment,
        data: newData,
        currentValue: newValue,
        status: isAnomaly ? 'anomaly' : 'normal'
      };
    }));
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'anomaly':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'normal':
      default:
        return 'bg-green-500';
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  // Render different dashboard states
  const renderEmptyState = () => (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8"
    >
      <div className="mb-6 text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2 text-gray-700">No Data Available</h2>
      <p className="text-gray-500 max-w-lg">
        Connect your hardware or upload a dataset to start monitoring for anomalies in real-time.
      </p>
      <div className="mt-8 flex space-x-4">
        <button 
          onClick={() => window.location.href = '/upload'} 
          className="btn-primary"
        >
          Upload Dataset
        </button>
        <button 
          onClick={() => window.location.href = '/connect'} 
          className="btn-outline"
        >
          Connect Hardware
        </button>
      </div>
    </motion.div>
  );

  // Render data processing for dataset
  const renderDatasetProcessing = () => (
    <div className="mb-8 bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-wrap items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Dataset Processing</h3>
        <div className="flex items-center space-x-3">
          <button 
            onClick={togglePlayback} 
            className={`flex items-center justify-center h-8 w-8 rounded-full ${isPlaying ? 'bg-gray-200' : 'bg-primary-500 text-white'}`}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Speed:</span>
            <select 
              value={playbackSpeed} 
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="text-sm border rounded p-1"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="mb-2 flex justify-between text-sm text-gray-500">
        <span>Progress</span>
        <span>{Math.round((runInfo.processedPoints / runInfo.totalPoints) * 100)}%</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
        <div 
          className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${(runInfo.processedPoints / runInfo.totalPoints) * 100}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-value">{runInfo.processedPoints.toLocaleString()}</div>
          <div className="stat-label">Records Processed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{runInfo.anomaliesFound}</div>
          <div className="stat-label">Anomalies Detected</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {runInfo.isComplete ? "Complete" : "In Progress"}
          </div>
          <div className="stat-label">Status</div>
        </div>
      </div>
      
      {runInfo.isComplete && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Processing complete! Anomalies have been identified in your dataset.</span>
        </div>
      )}
    </div>
  );

  // Render the main dashboard with equipment data
  const renderDashboard = () => (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {equipments.map((equipment) => (
        <motion.div 
          key={equipment.id}
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{equipment.name}</h3>
              <div className={`h-3 w-3 rounded-full ${getStatusColorClass(equipment.status)}`}></div>
            </div>
            
            <div className="mb-6">
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={equipment.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(tick) => tick.split(':').slice(0, 2).join(':')}
                  />
                  <YAxis 
                    domain={[
                      Math.min(equipment.normalRange.min * 0.7, Math.min(...equipment.data.map(d => d.value))),
                      Math.max(equipment.normalRange.max * 1.3, Math.max(...equipment.data.map(d => d.value)))
                    ]}
                  />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5, stroke: '#3B82F6', strokeWidth: 2, fill: 'white' }}
                  />
                  
                  {/* Normal range reference area */}
                  <CartesianGrid 
                    y={equipment.normalRange.min} 
                    strokeDasharray="3 3" 
                    stroke="#22c55e" 
                    strokeWidth={1} 
                    horizontal={false}
                  />
                  <CartesianGrid 
                    y={equipment.normalRange.max} 
                    strokeDasharray="3 3" 
                    stroke="#22c55e" 
                    strokeWidth={1} 
                    horizontal={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="flex items-end">
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Current Value</div>
                <div className={`text-2xl font-bold ${equipment.status === 'anomaly' ? 'text-red-600' : 'text-gray-800'}`}>
                  {equipment.currentValue.toFixed(1)}
                </div>
              </div>
              
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Normal Range</div>
                <div className="text-sm text-gray-600">
                  {equipment.normalRange.min.toFixed(1)} - {equipment.normalRange.max.toFixed(1)}
                </div>
              </div>
              
              <div className="flex-1 text-right">
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  equipment.status === 'anomaly' 
                    ? 'bg-red-100 text-red-800' 
                    : equipment.status === 'warning'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                }`}>
                  {equipment.status === 'anomaly' ? 'Anomaly Detected' : equipment.status === 'warning' ? 'Warning' : 'Normal'}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
      
      {/* Summary Charts */}
      <motion.div 
        variants={itemVariants}
        className="bg-white rounded-xl shadow-md p-6 md:col-span-2"
      >
        <h3 className="text-lg font-semibold text-gray-800 mb-4">System Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Anomaly Distribution */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">Anomaly Distribution</h4>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Normal', value: equipments.filter(e => e.status === 'normal').length },
                    { name: 'Warning', value: equipments.filter(e => e.status === 'warning').length },
                    { name: 'Anomaly', value: equipments.filter(e => e.status === 'anomaly').length }
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#f59e0b" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Equipment Health */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">Equipment Health</h4>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={equipments.map(e => ({
                  name: e.name.split(' ')[0],
                  value: e.status === 'normal' 
                    ? 100 
                    : e.status === 'warning' 
                      ? 50 
                      : 20
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {equipments.map((e, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={
                        e.status === 'normal' 
                          ? '#22c55e' 
                          : e.status === 'warning' 
                            ? '#f59e0b' 
                            : '#ef4444'
                      } 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Recent Anomalies */}
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-3">Recent Anomalies</h4>
            {equipments.filter(e => e.status === 'anomaly').length > 0 ? (
              <div className="space-y-2">
                {equipments
                  .filter(e => e.status === 'anomaly')
                  .map(e => (
                    <div key={`anomaly-${e.id}`} className="flex items-center p-2 bg-red-50 rounded-lg">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-2"></div>
                      <div className="text-sm">
                        <span className="font-medium">{e.name}</span>
                        <span className="text-red-600 ml-2">{e.currentValue.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm">No anomalies detected</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-gray-900">Anomaly Detection Dashboard</h1>
          <p className="mt-2 text-gray-600">
            {isConnected 
              ? 'Real-time monitoring of connected equipment'
              : currentDataset 
                ? 'Analyzing uploaded dataset for anomalies'
                : 'Connect hardware or upload a dataset to get started'}
          </p>
        </div>
        
        {/* Show dataset processing UI for uploaded datasets */}
        {currentDataset && renderDatasetProcessing()}
        
        {/* Show main dashboard if we have data */}
        {equipments.length > 0 
          ? renderDashboard() 
          : renderEmptyState()}
      </div>
    </div>
  );
};

export default Dashboard;
