import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Homepage from './pages/Homepage';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Connect from './pages/Connect';
import './index.css';

function App() {
  // Global state could be managed with context or a state management library
  const [isConnected, setIsConnected] = useState(false);
  const [currentDataset, setCurrentDataset] = useState(null);

  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Homepage />} />
            <Route 
              path="/dashboard" 
              element={
                <Dashboard 
                  isConnected={isConnected} 
                  currentDataset={currentDataset} 
                />
              } 
            />
            <Route 
              path="/upload" 
              element={
                <Upload setCurrentDataset={setCurrentDataset} />
              } 
            />
            <Route 
              path="/connect" 
              element={
                <Connect 
                  setIsConnected={setIsConnected} 
                  isConnected={isConnected}
                />
              } 
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;