import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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

const Homepage = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  

  return (
    <div>
      {/* Hero Section */}
<section className="relative overflow-hidden bg-gradient-to-b from-primary-900 to-primary-800 text-white">
  {/* Background pattern - enhanced to cover the whole section with movement */}
  <div className="absolute inset-0 opacity-10">
    <motion.div
      animate={{ x: [0, -20] }}
      transition={{ repeat: Infinity, duration: 60, ease: "linear" }}
      className="w-full h-full"
    >
      <svg className="w-[200%] h-full" width="200%" height="100%" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="200%" height="100%" fill="url(#grid)" />
      </svg>
    </motion.div>
  </div>
  
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 
          variants={itemVariants}
          className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight"
        >
          Advanced Anomaly Detection for Industrial Systems
        </motion.h1>
        <motion.p 
          variants={itemVariants}
          className="mt-6 text-lg md:text-xl text-blue-100 max-w-xl"
        >
          Detect equipment failures before they happen with our cutting-edge machine learning algorithms. Monitor in real-time or analyze historical data.
        </motion.p>
        <motion.div 
          variants={itemVariants}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/upload')}
            className="btn-secondary bg-white text-black hover:bg-white/800"
          >
            Upload Dataset
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/connect')}
            className="btn-outline border-white text-black hover:bg-white/10"
          >
            Connect Hardware
          </motion.button>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="relative hidden lg:block"
      >
        <div className="w-full h-80 relative">
          {/* Original moving square */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary-400 to-secondary-600 rounded-2xl shadow-xl"
          >
            <svg className="absolute inset-0 w-full h-full text-white opacity-20" viewBox="0 0 100 100">
              <path d="M0,50 C0,22.3857625 22.3857625,0 50,0 C77.6142375,0 100,22.3857625 100,50 C100,77.6142375 77.6142375,100 50,100 C22.3857625,100 0,77.6142375 0,50 Z" fill="none" stroke="currentColor" strokeWidth="2"></path>
              <path d="M0,50 C0,77.6142375 22.3857625,100 50,100 C77.6142375,100 100,77.6142375 100,50 C100,22.3857625 77.6142375,0 50,0 C22.3857625,0 0,22.3857625 0,50 Z" fill="none" stroke="currentColor" strokeWidth="2"></path>
              <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="2"></circle>
            </svg>
          </motion.div>
          
          {/* Original moving rectangle */}
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="absolute bottom-0 left-0 w-56 h-56 bg-gradient-to-tr from-accent-500 to-accent-400 rounded-2xl shadow-xl"
          >
            <svg className="absolute inset-0 w-full h-full text-white opacity-20" viewBox="0 0 100 100">
              <rect x="10" y="10" width="80" height="80" fill="none" stroke="currentColor" strokeWidth="2"></rect>
              <rect x="25" y="25" width="50" height="50" fill="none" stroke="currentColor" strokeWidth="2"></rect>
              <rect x="40" y="40" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"></rect>
            </svg>
          </motion.div>
          
          {/* Original moving circle */}
          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute top-10 left-20 w-48 h-48 bg-gradient-to-bl from-primary-400 to-primary-600 rounded-2xl shadow-xl"
          >
            <svg className="absolute inset-0 w-full h-full text-white opacity-20" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2"></circle>
              <path d="M50,5 L50,95" stroke="currentColor" strokeWidth="2"></path>
              <path d="M5,50 L95,50" stroke="currentColor" strokeWidth="2"></path>
            </svg>
          </motion.div>
          
          {/* New animated triangle */}
          <motion.div 
            animate={{ 
              y: [0, 15, 0],
              rotate: [0, 10, 0]
            }} 
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-tl from-blue-400 to-indigo-600 rounded-2xl shadow-xl"
          >
            <svg className="absolute inset-0 w-full h-full text-white opacity-20" viewBox="0 0 100 100">
              <polygon points="50,10 90,90 10,90" fill="none" stroke="currentColor" strokeWidth="2" />
              <polygon points="50,30 70,70 30,70" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </motion.div>
          
          {/* New animated hexagon */}
          <motion.div 
            animate={{ 
              x: [0, -10, 0],
              rotate: [0, -5, 0]
            }} 
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute top-5 left-5 w-36 h-36 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl"
          >
            <svg className="absolute inset-0 w-full h-full text-white opacity-20" viewBox="0 0 100 100">
              <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" fill="none" stroke="currentColor" strokeWidth="2" />
              <polygon points="50,30 70,40 70,60 50,70 30,60 30,40" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </motion.div>
          
          {/* Dashboard preview floating above the shapes */}
          <motion.div 
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <div className="bg-gray-800 rounded-xl shadow-2xl overflow-hidden w-full max-w-md">
              <div className="p-4 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs font-medium text-gray-400">Dashboard Preview</div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-700 p-2 rounded-lg">
                    <div className="h-16 bg-gradient-to-r from-blue-400 to-blue-500 rounded-md"></div>
                    <div className="mt-2 h-2 bg-gray-600 rounded-full w-3/4"></div>
                  </div>
                  <div className="bg-gray-700 p-2 rounded-lg">
                    <div className="h-16 bg-gradient-to-r from-green-400 to-green-500 rounded-md"></div>
                    <div className="mt-2 h-2 bg-gray-600 rounded-full w-1/2"></div>
                  </div>
                  <div className="bg-gray-700 p-2 rounded-lg">
                    <div className="h-16 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-md"></div>
                    <div className="mt-2 h-2 bg-gray-600 rounded-full w-2/3"></div>
                  </div>
                  <div className="bg-gray-700 p-2 rounded-lg">
                    <div className="h-16 bg-gradient-to-r from-red-400 to-red-500 rounded-md"></div>
                    <div className="mt-2 h-2 bg-gray-600 rounded-full w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </div>
  
  {/* Wave divider */}
  <div className="absolute bottom-0 left-0 right-0">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full h-auto">
      <path fill="#1f2937" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
    </svg>
  </div>
</section>

{/* 
  TODO Point 2: Convert the whole website to dark theme

  TODO Point 3: Improve button styling to be more visible and match the theme

  TODO Point 4: Add hover effects to "How it works" section and improve the circle styling
*/}
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">Powerful Anomaly Detection</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Our cutting-edge machine learning models identify anomalies with unparalleled accuracy
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Advanced Pattern Recognition"
              description="Our algorithms identify subtle patterns that traditional monitoring systems miss, allowing for early detection of anomalies."
            />
            
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Real-time Monitoring"
              description="Connect your hardware for instant analysis and alerts, with millisecond-level latency for critical systems."
            />
            
            <FeatureCard 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
              title="Comprehensive Analytics"
              description="Upload historical datasets to gain deep insights into performance patterns and identify optimization opportunities."
            />
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Simple integration with powerful results
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <motion.ol 
                initial="hidden"
                whileInView="visible"
                variants={containerVariants}
                viewport={{ once: true, margin: "-100px" }}
                className="relative border-l border-gray-300 ml-3"
              >
                <WorkflowStep 
                  number="1"
                  title="Connect or Upload"
                  description="Connect your hardware directly or upload your historical dataset for analysis."
                />
                
                <WorkflowStep 
                  number="2"
                  title="Auto-Detection"
                  description="Our model automatically identifies anomalies and their potential causes."
                />
                
                <WorkflowStep 
                  number="3"
                  title="Visual Dashboard"
                  description="See real-time results in our intuitive, interactive dashboard."
                />
                
                <WorkflowStep 
                  number="4"
                  title="Take Action"
                  description="Receive actionable insights and recommendations to prevent equipment failures."
                />
              </motion.ol>
            </div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-white rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-1 bg-gradient-to-r from-primary-500 to-secondary-500">
                <div className="p-4 bg-white rounded-lg">
                  <div className="p-2 bg-gray-50 rounded-lg flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400">anomalydetect.dashboard</div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="w-5/6 h-20 bg-gradient-to-r from-blue-100 to-blue-50 rounded-md flex items-end p-2">
                        <div className="w-1/12 h-4 bg-blue-400 rounded-sm"></div>
                        <div className="w-1/12 h-8 bg-blue-400 rounded-sm mx-1"></div>
                        <div className="w-1/12 h-6 bg-blue-400 rounded-sm"></div>
                        <div className="w-1/12 h-10 bg-blue-400 rounded-sm mx-1"></div>
                        <div className="w-1/12 h-5 bg-blue-400 rounded-sm"></div>
                        <div className="w-1/12 h-7 bg-blue-400 rounded-sm mx-1"></div>
                        <div className="w-1/12 h-12 bg-red-500 rounded-sm"></div>
                        <div className="w-1/12 h-4 bg-blue-400 rounded-sm mx-1"></div>
                        <div className="w-1/12 h-6 bg-blue-400 rounded-sm"></div>
                        <div className="w-1/12 h-9 bg-blue-400 rounded-sm mx-1"></div>
                        <div className="w-1/12 h-5 bg-blue-400 rounded-sm"></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="h-24 bg-gray-100 rounded-lg p-3">
                        <div className="h-4 w-2/3 bg-gray-300 rounded-full mb-2"></div>
                        <div className="flex items-center justify-between">
                          <div className="text-4xl font-bold text-primary-600">97%</div>
                          <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center text-green-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="h-24 bg-gray-100 rounded-lg p-3">
                        <div className="h-4 w-2/3 bg-gray-300 rounded-full mb-2"></div>
                        <div className="flex items-center justify-between">
                          <div className="text-4xl font-bold text-danger">3</div>
                          <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold">Ready to detect anomalies in your system?</h2>
            <p className="mt-4 text-xl text-blue-100 max-w-3xl mx-auto">
              Start monitoring your equipment in minutes and prevent costly failures.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/upload')}
                className="btn-secondary bg-blue text-primary-700 hover:bg-blue-50"
              >
                Upload Dataset
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/connect')}
                className="btn-outline border-white text-white hover:bg-white/10"
              >
                Connect Hardware
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true, margin: "-100px" }}
      className="card hover:shadow-xl transition-all duration-300"
    >
      <div className="text-primary-600 mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </motion.div>
  );
};

// Workflow Step Component
const WorkflowStep = ({ number, title, description }: { number: string; title: string; description: string }) => {
  return (
    <motion.li 
    variants={itemVariants}
      className="mb-10 ml-6"
    >
      <div className="absolute -left-4 mt-1.5 flex items-center justify-center w-7 h-7 bg-primary-600 rounded-full ring-6 ring-black">
        <span className="text-xs font-medium text-white">{number}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-base text-gray-600">{description}</p>
    </motion.li>
  );
};

export default Homepage;