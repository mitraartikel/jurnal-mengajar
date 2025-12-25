import { Outlet, NavLink } from 'react-router-dom';
import { Home, BookOpen, User } from 'lucide-react';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans text-slate-800">
      {/* Area Konten */}
      <div className="max-w-md mx-auto min-h-screen bg-white sm:shadow-xl sm:border-x sm:border-slate-100">
        <Outlet />
      </div>

      {/* Navigasi Bawah Mengambang (Glass Effect) */}
      <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md border-t border-slate-200/60 shadow-[0_-5px_20px_rgba(0,0,0,0.03)] w-full max-w-md pointer-events-auto pb-safe">
          <div className="flex justify-around items-center px-6 py-4">
            
            <NavLink to="/" className={({ isActive }) => 
                `flex flex-col items-center gap-1.5 transition-colors duration-300 ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-500'}`
            }>
              <Home strokeWidth={2.5} size={22} />
              {/* Titik indikator aktif */}
              <span className="text-[10px] font-semibold tracking-wide">Beranda</span>
            </NavLink>

            <NavLink to="/jurnal" className={({ isActive }) => 
                `flex flex-col items-center gap-1.5 transition-colors duration-300 ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-500'}`
            }>
              <BookOpen strokeWidth={2.5} size={22} />
              <span className="text-[10px] font-semibold tracking-wide">Jurnal</span>
            </NavLink>

            <NavLink to="/profil" className={({ isActive }) => 
                `flex flex-col items-center gap-1.5 transition-colors duration-300 ${isActive ? 'text-teal-600' : 'text-slate-400 hover:text-slate-500'}`
            }>
              <User strokeWidth={2.5} size={22} />
              <span className="text-[10px] font-semibold tracking-wide">Profil</span>
            </NavLink>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;