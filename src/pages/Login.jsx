import { ArrowRight } from 'lucide-react';

const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50 p-6">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white w-full max-w-sm">
        
        {/* Header Sederhana */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-teal-600">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Jurnal Guru</h1>
          <p className="text-slate-500 text-sm mt-1">Asisten Administrasi Digital Anda</p>
        </div>

        {/* Tombol Modern */}
        <button className="group w-full bg-slate-900 text-white py-4 rounded-2xl font-medium hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2">
          <span>Masuk Sekarang</span>
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </button>
        
        <p className="mt-6 text-center text-xs text-slate-400">
          Versi Offline v1.0 • Aman & Privat
        </p>
      </div>
    </div>
  );
};

export default Login;