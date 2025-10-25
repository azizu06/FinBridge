import { useTranslation } from 'react-i18next';
import Header from './Header';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './Dashboard.jsx';
import Home from './Home.jsx';
import About from './About.jsx';

function App() {

  const {t} = useTranslation();

  return (
    <>
      <div className="App bg-gray-100 min-h-screen">
        <Router>
          <Header />
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </Router>
      </div>
    </>
  )
}

export default App
