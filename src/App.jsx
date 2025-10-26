import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Header from './Header.jsx';
import Home from './Home.jsx';
import Dashboard from './Dashboard.jsx';
import About from './About.jsx';

function App() {
  return (
    <div className="App bg-gray-100 min-h-screen">
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
