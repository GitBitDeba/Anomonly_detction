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

interface PredictionRecord {
  Type: string;
  "Air temperature [K]": number;
  "Process temperature [K]": number;
  "Rotational speed [rpm]": number;
  "Torque [Nm]": number;
  "Tool wear [min]": number;
  Prediction: string;
  [key: string]: any; // Allow for any additional fields
}

interface Dataset {
  id: string;
  name: string;
  size: string;
  records: number;
  data: PredictionRecord[];
  isCustom: boolean;
  anomaliesCount?: number;
}

interface DashboardProps {
  isConnected: boolean;
  currentDataset: Dataset | null;
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
  const [anomalyDistribution, setAnomalyDistribution] = useState({
    normal: 0,
    warning: 0,
    anomaly: 0
  });
  const [featureImportance, setFeatureImportance] = useState<{ name: string, value: number }[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>('1d'); // '1h', '1d', '1w', '1m'

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

  // Initialize dashboard with dataset or connected hardware data
  useEffect(() => {
    if (isConnected) {
      // Generate sample data for hardware connection
      generateSampleHardwareData();
    } else if (currentDataset) {
      // Process the uploaded dataset 
      processDatasetForDashboard(currentDataset);
    }
  }, [isConnected, currentDataset]);

  // Simulate data playback for dataset visualization
  useEffect(() => {
    let timer: number | null = null;
    
    if (currentDataset && isPlaying && !runInfo.isComplete) {
      timer = window.setInterval(() => {
        // Update processed points
        setRunInfo(prev => {
          const newProcessed = Math.min(prev.processedPoints + 5 * playbackSpeed, prev.totalPoints);
          
          // Update equipment visualization (for animation purposes)
          updateEquipmentVisualization(newProcessed / prev.totalPoints);
          
          return {
            ...prev,
            processedPoints: newProcessed,
            isComplete: newProcessed >= prev.totalPoints
          };
        });
      }, 1000 / playbackSpeed);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [currentDataset, isPlaying, playbackSpeed, runInfo.isComplete]);

  // Process the dataset for dashboard visualization
  const processDatasetForDashboard = (dataset: Dataset) => {
    if (!dataset || !dataset.data || dataset.data.length === 0) return;
    
    // Count anomalies in the prediction data
    const anomalyCount = dataset.data.filter(item => item.Prediction === "Failure").length;
    
    // Set up run info
    setRunInfo({
      totalPoints: dataset.records,
      processedPoints: dataset.records, // Already processed since we have the results
      anomaliesFound: anomalyCount,
      isComplete: true
    });
    
    // Set anomaly distribution
    setAnomalyDistribution({
      normal: dataset.data.filter(item => item.Prediction === "No Failure").length,
      warning: 0, // We don't have warning state in our prediction model (just Failure/No Failure)
      anomaly: anomalyCount
    });
    
    // Create equipment visualizations from the dataset
    createEquipmentVisualizations(dataset);
    
    // Calculate feature importance (simulated)
    calculateFeatureImportance(dataset);
  };
  
  // Create equipment visualizations based on the dataset features
  const createEquipmentVisualizations = (dataset: Dataset) => {
    if (!dataset.data || dataset.data.length === 0) return;
    
    // Get numeric feature columns (exclude Prediction and Type which are categorical)
    const numericFeatures = Object.keys(dataset.data[0]).filter(key => 
      key !== "Prediction" && 
      key !== "Type" && 
      typeof dataset.data[0][key] === "number"
    );
    
    // Create an equipment visualization for each numeric feature
    const generatedEquipments = numericFeatures.map((feature, index) => {
      // Calculate min and max for the feature to establish normal range
      const values = dataset.data.map(item => item[feature] as number);
      const min = Math.min(...values);
      const max = Math.max(...values);
      const normalMin = min + (max - min) * 0.1; // 10% buffer from min
      const normalMax = max - (max - min) * 0.1; // 10% buffer from max
      
      // Create data points for visualization
      const dataPoints: DataPoint[] = dataset.data.slice(0, 20).map((item, i) => {
        const value = item[feature] as number;
        const isAnomaly = item.Prediction === "Failure";
        
        return {
          timestamp: item.timestamp || `Point ${i+1}`,
          value,
          normalRange: { min: normalMin, max: normalMax },
          isAnomaly
        };
      });
      
      // Get the latest value
      const latestValue = dataPoints[dataPoints.length - 1]?.value || 0;
      const isLatestAnomaly = dataPoints[dataPoints.length - 1]?.isAnomaly || false;
      
      return {
        id: `feature-${index}`,
        name: feature, // Use the feature name
        data: dataPoints,
        currentValue: latestValue,
        normalRange: { min: normalMin, max: normalMax },
        status: isLatestAnomaly ? 'anomaly' as 'anomaly' : 'normal' as 'normal'
      };
    });
    
    setEquipments(generatedEquipments);
    
    // Set the first equipment as selected by default
    if (generatedEquipments.length > 0 && !selectedEquipment) {
      setSelectedEquipment(generatedEquipments[0].id);
    }
  };
  
  // Calculate feature importance (simulated since we don't have the actual model)
  const calculateFeatureImportance = (dataset: Dataset) => {
    if (!dataset.data || dataset.data.length === 0) return;
    
    // Get numeric feature columns
    const numericFeatures = Object.keys(dataset.data[0]).filter(key => 
      key !== "Prediction" && 
      key !== "Type" && 
      typeof dataset.data[0][key] === "number"
    );
    
    // Simulate feature importance (in a real app, this would come from your model)
    const importances = numericFeatures.map(feature => {
      // Simulate a correlation coefficient between the feature and the prediction
      const normalValues = dataset.data
        .filter(item => item.Prediction === "No Failure")
        .map(item => item[feature] as number);
      
      const anomalyValues = dataset.data
        .filter(item => item.Prediction === "Failure")
        .map(item => item[feature] as number);
      
      // Calculate mean for both groups
      const normalMean = normalValues.reduce((sum, val) => sum + val, 0) / Math.max(normalValues.length, 1);
      const anomalyMean = anomalyValues.reduce((sum, val) => sum + val, 0) / Math.max(anomalyValues.length, 1);
      
      // Calculate variance for both groups
      const normalVariance = normalValues.reduce((sum, val) => sum + Math.pow(val - normalMean, 2), 0) / Math.max(normalValues.length, 1);
      const anomalyVariance = anomalyValues.reduce((sum, val) => sum + Math.pow(val - anomalyMean, 2), 0) / Math.max(anomalyValues.length, 1);
      
      // Calculate a score that simulates feature importance
      // Higher difference in means and lower variances would indicate a more important feature
      const meanDifference = Math.abs(normalMean - anomalyMean);
      const varianceSum = normalVariance + anomalyVariance;
      
      // Avoid division by zero
      const score = varianceSum === 0 ? meanDifference : meanDifference / Math.sqrt(varianceSum);
      
      return {
        name: feature,
        value: score
      };
    });
    
    // Normalize scores to sum to 1
    const totalScore = importances.reduce((sum, item) => sum + item.value, 0);
    const normalizedImportances = importances.map(item => ({
      name: item.name,
      value: totalScore === 0 ? 0 : (item.value / totalScore)
    }));
    
    // Sort by importance (descending)
    normalizedImportances.sort((a, b) => b.value - a.value);
    
    setFeatureImportance(normalizedImportances);
  };

  // Generate sample data for hardware connection simulation
  const generateSampleHardwareData = () => {
    // Create sample equipment data
    const hardwareEquipments: Equipment[] = [
      {
        id: 'pump-1',
        name: 'Pump Pressure',
        data: Array.from({ length: 20 }, (_, i) => {
          const value = 50 + Math.random() * 20;
          const isAnomaly = i === 17; // Anomaly at point 17
          return {
            timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
            value,
            normalRange: { min: 55, max: 65 },
            isAnomaly
          };
        }),
        currentValue: 67,
        normalRange: { min: 55, max: 65 },
        status: 'warning'
      },
      {
        id: 'motor-1',
        name: 'Motor Temperature',
        data: Array.from({ length: 20 }, (_, i) => {
          const value = 85 + Math.random() * 10;
          const isAnomaly = i >= 18; // Anomaly at last 2 points
          return {
            timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
            value,
            normalRange: { min: 80, max: 90 },
            isAnomaly
          };
        }),
        currentValue: 95,
        normalRange: { min: 80, max: 90 },
        status: 'anomaly'
      },
      {
        id: 'flow-1',
        name: 'Flow Rate',
        data: Array.from({ length: 20 }, (_, i) => {
          const value = 120 + Math.random() * 20;
          const isAnomaly = false; // No anomalies
          return {
            timestamp: new Date(Date.now() - (20 - i) * 60000).toISOString(),
            value,
            normalRange: { min: 110, max: 140 },
            isAnomaly
          };
        }),
        currentValue: 128,
        normalRange: { min: 110, max: 140 },
        status: 'normal'
      }
    ];
    
    setEquipments(hardwareEquipments);
    setSelectedEquipment(hardwareEquipments[0].id);
    
    // Set sample run info
    setRunInfo({
      totalPoints: 100,
      processedPoints: 100,
      anomaliesFound: 3,
      isComplete: true
    });
    
    // Set sample anomaly distribution
    setAnomalyDistribution({
      normal: 90,
      warning: 7,
      anomaly: 3
    });
    
    // Set sample feature importance
    setFeatureImportance([
      { name: 'Motor Temperature', value: 0.45 },
      { name: 'Pump Pressure', value: 0.35 },
      { name: 'Flow Rate', value: 0.20 }
    ]);
  };
  
  // Update equipment visualization based on playback progress
  const updateEquipmentVisualization = (progress: number) => {
    if (equipments.length === 0) return;
    
    // Update each equipment's data to simulate real-time visualization
    const updatedEquipments = equipments.map(equipment => {
      // Get the number of points to show based on progress
      const pointsToShow = Math.max(1, Math.floor(equipment.data.length * progress));
      
      // Get the latest visible data point
      const latestDataPoint = equipment.data[pointsToShow - 1];
      
      return {
        ...equipment,
        currentValue: latestDataPoint.value,
        status: latestDataPoint.isAnomaly ? 'anomaly' as 'anomaly' : 
                latestDataPoint.value > equipment.normalRange.max || 
                latestDataPoint.value < equipment.normalRange.min ? 'warning' as 'warning' : 'normal' as 'normal'
      };
    });
    
    setEquipments(updatedEquipments);
  };
  
  // Control playback
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
  };
  
  const restartPlayback = () => {
    setRunInfo(prev => ({
      ...prev,
      processedPoints: 0,
      isComplete: false
    }));
    setIsPlaying(true);
  };
  
  // Get color based on status
  const getStatusColor = (status: 'normal' | 'warning' | 'anomaly') => {
    switch (status) {
      case 'normal':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'anomaly':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  const getStatusTextColor = (status: 'normal' | 'warning' | 'anomaly') => {
    switch (status) {
      case 'normal':
        return 'text-green-500';
      case 'warning':
        return 'text-yellow-500';
      case 'anomaly':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  // Get selected equipment data
  const selectedEquipmentData = selectedEquipment 
    ? equipments.find(eq => eq.id === selectedEquipment) 
    : null;
  
  // Format chart data for line chart
  const getLineChartData = () => {
    if (!selectedEquipmentData) return [];
    
    return selectedEquipmentData.data.map((point, index) => ({
      name: index + 1,
      value: point.value,
      min: point.normalRange.min,
      max: point.normalRange.max,
      anomaly: point.isAnomaly ? point.value : null // Show only anomaly points
    }));
  };
  
  // Removed unused COLORS constant
  
  // PIE CHART DATA
  const pieChartData = [
    { name: 'Normal', value: anomalyDistribution.normal },
    { name: 'Warning', value: anomalyDistribution.warning },
    { name: 'Anomaly', value: anomalyDistribution.anomaly }
  ];
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Dashboard Header */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="mb-8"
      >
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {currentDataset ? currentDataset.name : 'Hardware Monitoring'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {currentDataset 
                ? `${currentDataset.records.toLocaleString()} records · ${currentDataset.size}`
                : 'Real-time hardware monitoring system'}
            </p>
          </div>
          
          {!runInfo.isComplete && (
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <button 
                onClick={togglePlayback}
                className="flex items-center px-3 py-1.5 rounded-md bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 hover:bg-primary-200 dark:hover:bg-primary-800"
              >
                {isPlaying ? (
                  <>
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Play
                  </>
                )}
              </button>
              
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => changePlaybackSpeed(0.5)}
                  className={`px-2 py-1 rounded ${playbackSpeed === 0.5 ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  0.5x
                </button>
                <button 
                  onClick={() => changePlaybackSpeed(1)}
                  className={`px-2 py-1 rounded ${playbackSpeed === 1 ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  1x
                </button>
                <button 
                  onClick={() => changePlaybackSpeed(2)}
                  className={`px-2 py-1 rounded ${playbackSpeed === 2 ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  2x
                </button>
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Progress Bar */}
        {!runInfo.isComplete && (
          <motion.div variants={itemVariants} className="bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${(runInfo.processedPoints / runInfo.totalPoints) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-primary-600 dark:bg-primary-500"
            ></motion.div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Stats Cards */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 mr-4">
              <svg className="w-6 h-6 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{runInfo.totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 mr-4">
              <svg className="w-6 h-6 text-purple-500 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Processed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{runInfo.processedPoints.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900 mr-4">
              <svg className="w-6 h-6 text-red-500 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Anomalies Found</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{runInfo.anomaliesFound.toLocaleString()}</p>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 mr-4">
              <svg className="w-6 h-6 text-green-500 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Anomaly Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {runInfo.processedPoints > 0 
                  ? ((runInfo.anomaliesFound / runInfo.processedPoints) * 100).toFixed(1) + '%'
                  : '0%'
                }
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
      
      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Equipment Panels */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monitored Parameters</h2>
            </div>
            <div className="p-2">
              {equipments.map((equipment) => (
                <div 
                  key={equipment.id}
                  onClick={() => setSelectedEquipment(equipment.id)}
                  className={`p-4 transition-colors duration-150 cursor-pointer
                    ${selectedEquipment === equipment.id 
                      ? 'bg-gray-100 dark:bg-gray-700' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                    }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full mr-3 ${getStatusColor(equipment.status)}`}></div>
                      <span className="font-medium text-gray-900 dark:text-white">{equipment.name}</span>
                    </div>
                    <span className={`text-lg font-semibold ${getStatusTextColor(equipment.status)}`}>
                      {equipment.currentValue.toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Normal range: {equipment.normalRange.min.toFixed(1)} - {equipment.normalRange.max.toFixed(1)}
                  </div>
                  
                  {/* Mini Sparkline */}
                  <div className="h-8 mt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={equipment.data.map((d, i) => ({ x: i, y: d.value }))}>
                        <Line 
                          type="monotone" 
                          dataKey="y" 
                          stroke={
                            equipment.status === 'normal' ? '#10B981' : 
                            equipment.status === 'warning' ? '#F59E0B' : '#EF4444'
                          } 
                          strokeWidth={1.5} 
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Feature Importance */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Feature Importance</h2>
            </div>
            <div className="p-4">
              {/* Feature Importance Bar Chart */}
              <ResponsiveContainer width="100%" height={featureImportance.length * 40 + 40} className="mt-2">
                <BarChart
                  layout="vertical"
                  data={featureImportance}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <YAxis dataKey="name" type="category" width={120} />
                  <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                  <Bar dataKey="value" fill="#6366F1" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                Features ranked by their impact on anomaly detection model
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Chart Section */}
        <div className="lg:col-span-2">
          {/* Selected Parameter Detail Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedEquipmentData ? selectedEquipmentData.name : 'Parameter Details'}
              </h2>
              
              {/* Time Range Selector */}
              <div className="flex items-center space-x-1 text-sm">
                <button 
                  onClick={() => setTimeRange('1h')}
                  className={`px-2 py-1 rounded-md ${timeRange === '1h' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  1h
                </button>
                <button 
                  onClick={() => setTimeRange('1d')}
                  className={`px-2 py-1 rounded-md ${timeRange === '1d' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  1d
                </button>
                <button 
                  onClick={() => setTimeRange('1w')}
                  className={`px-2 py-1 rounded-md ${timeRange === '1w' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  1w
                </button>
                <button 
                  onClick={() => setTimeRange('1m')}
                  className={`px-2 py-1 rounded-md ${timeRange === '1m' 
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  1m
                </button>
              </div>
            </div>
            <div className="p-4">
              {selectedEquipmentData ? (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Current Value</div>
                      <div className={`text-2xl font-bold ${getStatusTextColor(selectedEquipmentData.status)}`}>
                        {selectedEquipmentData.currentValue.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Status</div>
                      <div className="flex items-center">
                        <div className={`h-3 w-3 rounded-full mr-2 ${getStatusColor(selectedEquipmentData.status)}`}></div>
                        <span className="font-medium capitalize">
                          {selectedEquipmentData.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Normal Range</div>
                      <div className="font-medium">
                        {selectedEquipmentData.normalRange.min.toFixed(1)} - {selectedEquipmentData.normalRange.max.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={getLineChartData()}
                        margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="min" 
                          stroke="#9CA3AF" 
                          strokeDasharray="3 3" 
                          dot={false}
                          name="Min Normal"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="max" 
                          stroke="#9CA3AF" 
                          strokeDasharray="3 3" 
                          dot={false}
                          name="Max Normal"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#6366F1" 
                          strokeWidth={2} 
                          name="Actual Value"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="anomaly" 
                          stroke="#EF4444" 
                          strokeWidth={2} 
                          dot={{ r: 6 }}
                          activeDot={{ r: 8 }}
                          name="Anomaly"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Recommendations or insights */}
                  {selectedEquipmentData.status !== 'normal' && (
                    <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md text-sm">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-500 dark:text-yellow-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="font-medium text-yellow-800 dark:text-yellow-300">Potential Issue Detected</p>
                          <p className="mt-1 text-yellow-700 dark:text-yellow-400">
                            {selectedEquipmentData.name} is {selectedEquipmentData.status === 'warning' ? 'approaching' : 'exceeding'} normal operating limits. Consider {selectedEquipmentData.status === 'warning' ? 'monitoring closely' : 'immediate inspection'}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-500 dark:text-gray-400 py-16">
                  Select a parameter to view detailed information
                </div>
              )}
            </div>
          </div>
          
          {/* Distribution and Anomaly Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Anomaly Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Anomaly Distribution</h2>
              </div>
              <div className="p-4">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      >
                       {pieChartData.map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={
                                    index === 0
                                      ? '#10B981'
                                      : index === 1
                                      ? '#F59E0B'
                                      : '#EF4444'
                                  }
                                />
                              ))}

                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString()} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-sm">
                  <div>
                    <div className="font-medium text-green-600 dark:text-green-400">
                      {anomalyDistribution.normal.toLocaleString()}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Normal</div>
                  </div>
                  <div>
                    <div className="font-medium text-yellow-500 dark:text-yellow-400">
                      {anomalyDistribution.warning.toLocaleString()}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Warning</div>
                  </div>
                  <div>
                    <div className="font-medium text-red-600 dark:text-red-400">
                      {anomalyDistribution.anomaly.toLocaleString()}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400">Anomaly</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Anomalies */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Anomalies</h2>
              </div>
              <div className="p-4">
                {(() => {
                  // Find all anomalies across equipment
                  const anomalies = equipments
                    .flatMap(eq => eq.data
                      .filter(point => point.isAnomaly)
                      .map(point => ({
                        equipmentId: eq.id,
                        equipmentName: eq.name,
                        timestamp: point.timestamp,
                        value: point.value,
                        normalRange: point.normalRange
                      }))
                    )
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .slice(0, 5);
                  
                  if (anomalies.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        No anomalies detected yet
                      </div>
                    );
                  }
                  
                  return (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                      {anomalies.map((anomaly, index) => (
                        <li key={index} className="py-3">
                          <div className="flex justify-between">
                            <div className="font-medium">{anomaly.equipmentName}</div>
                            <div className="text-red-600 dark:text-red-400 font-medium">
                              {anomaly.value.toFixed(2)}
                            </div>
                          </div>
                          <div className="flex justify-between text-sm">
                            <div className="text-gray-500 dark:text-gray-400">
                              Normal: {anomaly.normalRange.min.toFixed(1)} - {anomaly.normalRange.max.toFixed(1)}
                            </div>
                            <div className="text-gray-500 dark:text-gray-400">
                              {new Date(anomaly.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      {runInfo.isComplete && (
        <div className="mt-8 flex justify-center space-x-4">
          <button 
            onClick={restartPlayback}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
          >
            Replay Analysis
          </button>
          
          <button 
            className="px-4 py-2 bg-white text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-primary-400 dark:border-primary-500 dark:hover:bg-gray-750 dark:focus:ring-offset-gray-900"
          >
            Download Report
          </button>
          
          {currentDataset && (
            <button 
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-750 dark:focus:ring-offset-gray-900"
            >
              Upload New Dataset
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;