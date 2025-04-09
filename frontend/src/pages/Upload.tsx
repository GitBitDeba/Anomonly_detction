import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Mock data for demonstration
const sampleDatasets = [
  { id: 1, name: 'Industrial Pump Dataset', size: '2.4 MB', records: 5842, description: 'Historical data from industrial pumps with known anomalies' },
  { id: 2, name: 'HVAC System', size: '3.7 MB', records: 8920, description: 'Temperature and pressure readings from commercial HVAC systems' },
  { id: 3, name: 'Power Generator', size: '1.9 MB', records: 4210, description: 'Voltage and current data from power generators with anomaly markers' }
];

// API URL configuration - make sure to update this for production
const API_URL: string = import.meta.env.VITE_API_URL || "http://localhost:8000";// or "https://your-fastapi-backend-url.com"

const Upload = ({ setCurrentDataset }: { setCurrentDataset: (data: any) => void }) => {
  const navigate = useNavigate();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [selectedSample, setSelectedSample] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setUploadedFile(file);
    setSelectedSample(null);
    setUploadError(null);
  };

  const handleSampleSelect = (id: number) => {
    setSelectedSample(id);
    setUploadedFile(null);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!uploadedFile && !selectedSample) return;
  
    setIsUploading(true);
    setUploadProgress(0);
    setUploadComplete(false);
    setUploadError(null);
  
    try {
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 200);
      
      let predictionData;
      
      if (uploadedFile) {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', uploadedFile);
      
        // Send the file to the backend API
        const response = await fetch(`${API_URL}/predict`, {
          method: 'POST',
          body: formData
        });
      
        if (!response.ok) {
          throw new Error(`Server responded with ${response.status}: ${await response.text()}`);
        }
      
        predictionData = await response.json();
      } else if (selectedSample) {
        // Handle sample dataset selection
        // In a real app, you might fetch this from your backend
        // Here we'll simulate with mock data
        predictionData = await simulateSampleDataPrediction(selectedSample);
      }
  
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadComplete(true);
  
      // Organize the data for the dashboard
      const dataset = {
        id: uploadedFile ? 'custom-' + Date.now() : `sample-${selectedSample}`,
        name: uploadedFile ? uploadedFile.name : sampleDatasets.find(d => d.id === selectedSample)?.name,
        size: uploadedFile ? (uploadedFile.size / (1024 * 1024)).toFixed(1) + ' MB' : 
              sampleDatasets.find(d => d.id === selectedSample)?.size,
        records: predictionData.length,
        data: predictionData,
        isCustom: !!uploadedFile,
        anomaliesCount: predictionData.filter((item: any) => item.Prediction === "Failure").length
      };
  
      // Set the current dataset to be used in the Dashboard
      setCurrentDataset(dataset);
  
      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(error instanceof Error ? error.message : 'An unknown error occurred');
      setIsUploading(false);
    }
  };

  // Function to simulate predictions for sample datasets
  const simulateSampleDataPrediction = async (sampleId: number) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate mock prediction data based on sample ID
    const recordCount = sampleDatasets.find(d => d.id === sampleId)?.records || 1000;
    const sampleSize = Math.min(recordCount, 100); // Limit to 100 records for performance
    
    return Array.from({ length: sampleSize }, (_, i) => {
      const isAnomaly = Math.random() > 0.85; // 15% chance of anomaly
      return {
        id: i,
        timestamp: new Date(Date.now() - (sampleSize - i) * 3600000).toISOString(),
        "Type": ["L", "M", "H"][Math.floor(Math.random() * 3)],
        "Air temperature [K]": 290 + Math.random() * 20,
        "Process temperature [K]": 305 + Math.random() * 15,
        "Rotational speed [rpm]": 1000 + Math.random() * 2000,
        "Torque [Nm]": 20 + Math.random() * 60,
        "Tool wear [min]": Math.floor(Math.random() * 200),
        "Prediction": isAnomaly ? "Failure" : "No Failure"
      };
    });
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="text-center mb-16"
      >
        <motion.h1 
          variants={itemVariants} 
          className="text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white"
        >
          Upload Your Dataset
        </motion.h1>
        <motion.p 
          variants={itemVariants}
          className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
        >
          Upload your own data or choose from our sample datasets to start detecting anomalies
        </motion.p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Upload Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Upload Your Own Dataset</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              Supported formats: CSV, JSON, Excel (.xlsx, .xls)
            </p>
          </div>
          
          <div className="p-6">
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-gray-600'
              } ${uploadedFile ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".csv, .json, .xlsx, .xls"
              />
              
              {!uploadedFile ? (
                <>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                    />
                  </svg>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    Drag and drop your file here, or{' '}
                    <button 
                      type="button" 
                      className="text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-medium focus:outline-none"
                      onClick={openFileSelector}
                    >
                      browse
                    </button>
                  </p>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                    Files up to 50MB
                  </p>
                </>
              ) : (
                <div className="text-left">
                  <div className="flex items-center">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-8 w-8 text-green-500 dark:text-green-400" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadedFile(null)}
                    className="mt-4 text-xs text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300 font-medium"
                  >
                    Remove file
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Sample Datasets Section */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sample Datasets</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
              Try our curated datasets with known anomalies
            </p>
          </div>
          
          <div className="p-6">
            <ul className="space-y-4">
              {sampleDatasets.map((dataset) => (
                <li key={dataset.id}>
                  <div 
                    className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      selectedSample === dataset.id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700'
                    }`}
                    onClick={() => handleSampleSelect(dataset.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`w-4 h-4 rounded-full mr-3 ${
                          selectedSample === dataset.id ? 'bg-primary-500' : 'border border-gray-300 dark:border-gray-600'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{dataset.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {dataset.size} • {dataset.records.toLocaleString()} records
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 pl-7">
                      {dataset.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
      
      {/* Analysis Options and Upload Button */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-12"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Analysis Options</h2>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Detection Sensitivity</h3>
              <select 
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm"
                defaultValue="medium"
              >
                <option value="low">Low (fewer alerts)</option>
                <option value="medium">Medium (balanced)</option>
                <option value="high">High (more alerts)</option>
                <option value="custom">Custom threshold</option>
              </select>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Analysis Type</h3>
              <select 
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm"
                defaultValue="all"
              >
                <option value="all">Full Spectrum Analysis</option>
                <option value="univariate">Univariate Analysis</option>
                <option value="multivariate">Multivariate Analysis</option>
                <option value="correlation">Correlation Analysis</option>
              </select>
            </div>
            
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Report Detail Level</h3>
              <select 
                className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md py-2 px-3 text-sm"
                defaultValue="standard"
              >
                <option value="basic">Basic (overview only)</option>
                <option value="standard">Standard (with explanations)</option>
                <option value="detailed">Detailed (technical)</option>
                <option value="comprehensive">Comprehensive (all details)</option>
              </select>
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Upload Button and Progress */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center"
      >
        {isUploading ? (
          <div className="max-w-md mx-auto">
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {uploadComplete ? 'Upload complete' : 'Uploading dataset...'}
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {uploadProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            {uploadComplete && (
              <p className="mt-4 text-green-600 dark:text-green-400">
                Analysis started. Redirecting to dashboard...
              </p>
            )}
          </div>
        ) : (
          <>
            {uploadError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg max-w-md mx-auto">
                <p className="text-sm font-medium">Error: {uploadError}</p>
              </div>
            )}
            
            <button 
              onClick={handleUpload}
              disabled={!uploadedFile && selectedSample === null}
              className={`px-8 py-3 rounded-lg font-medium text-white ${
                !uploadedFile && selectedSample === null
                  ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                  : 'bg-primary-600 hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600'
              } transition-colors duration-200 shadow-lg hover:shadow-xl`}
            >
              Start Analysis
            </button>
          </>
        )}
        
        {(!uploadedFile && selectedSample === null) && (
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            Please upload a dataset or select a sample to continue
          </p>
        )}
      </motion.div>
    </div>
  );
};

export default Upload;