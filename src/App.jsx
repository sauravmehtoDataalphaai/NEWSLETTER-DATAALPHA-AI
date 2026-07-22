import { BrowserRouter, Navigate, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import './App.css';

/**
 * Routes:
 *  /       → Public subscription form
 *  /admin  → Admin login + subscriber data
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
        {/* Old routes redirect to the new structure */}
        <Route path="/subscribe" element={<Navigate to="/" replace />} />
        <Route path="/dashboard" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
