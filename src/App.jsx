// src/App.jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MainLayout from './layouts/MainLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Login (Berdiri Sendiri) */}
        <Route path="/login" element={<Login />} />

        {/* Halaman Dalam (Pakai Menu Bawah) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jurnal" element={<div className="p-6">Halaman Jurnal (Segera)</div>} />
          <Route path="/profil" element={<div className="p-6">Halaman Profil (Segera)</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;