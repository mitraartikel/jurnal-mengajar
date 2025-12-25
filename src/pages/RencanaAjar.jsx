import { useState, useMemo } from 'react'; // Hapus useEffect yang tidak perlu
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ChevronLeft, Plus, Trash2, BookOpen, Filter, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const toRoman = (num) => {
  if (num === 7) return 'VII';
  if (num === 8) return 'VIII';
  if (num === 9) return 'IX';
  return num;
};

const RencanaAjar = () => {
  const navigate = useNavigate();
  
  const [selectedLevel, setSelectedLevel] = useState(7); 
  // Kita ganti nama state ini biar jelas. Ini hanya menyimpan apa yang KLIK user secara manual.
  const [manualSubject, setManualSubject] = useState(''); 
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ topic: '', meetingOrder: 1, objective: '' });

  // 1. AMBIL SETTING
  const settings = useLiveQuery(() => db.settings.toArray());

  // 2. DATA MAPEL DARI PROFIL (Stabil)
  const userSubjects = useMemo(() => {
    if (!settings) return ["Matematika"]; 
    const data = settings.find(s => s.key === 'mySubjects');
    return data?.value || ["Matematika"];
  }, [settings]); 

  // 3. LOGIKA PENENTUAN SUBJECT (SOLUSI "DERIVED STATE")
  // Di sini kuncinya. Kita tidak pakai useEffect.
  // Kita hitung langsung: Apa mapel yang harus aktif sekarang?
  const activeSubject = useMemo(() => {
    // A. Jika user pernah klik manual DAN mapel itu masih ada di daftar profil -> Pakai itu.
    if (manualSubject && userSubjects.includes(manualSubject)) {
      return manualSubject;
    }
    // B. Jika tidak, otomatis pakai mapel pertama di daftar.
    if (userSubjects.length > 0) {
      return userSubjects[0];
    }
    // C. Fallback darurat
    return "Matematika";
  }, [manualSubject, userSubjects]);

  // 4. AMBIL SYLLABUS (Gunakan activeSubject)
  const syllabus = useLiveQuery(async () => {
    if (!activeSubject) return [];
    return await db.syllabus
      .where('level').equals(parseInt(selectedLevel))
      .filter(item => item.subject === activeSubject) // Pakai activeSubject
      .sortBy('meetingOrder');
  }, [selectedLevel, activeSubject]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.topic) return;
    try {
      await db.syllabus.add({
        level: parseInt(selectedLevel),
        subject: activeSubject, // Pakai activeSubject
        topic: formData.topic,
        objective: formData.objective,
        meetingOrder: parseInt(formData.meetingOrder)
      });
      setFormData({ topic: '', objective: '', meetingOrder: parseInt(formData.meetingOrder) + 1 });
      alert(`Materi tersimpan ke mapel ${activeSubject}!`);
    } catch (error) {
      alert("Gagal: " + error);
    }
  };

  const handleDelete = async (id) => {
    if(confirm("Hapus materi ini?")) await db.syllabus.delete(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm text-slate-600"><ChevronLeft size={20} /></button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-800">Bank Materi</h1>
          <p className="text-slate-500 text-sm">Kelola kurikulum pembelajaran</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="relative">
          <div className="absolute left-3 top-3 text-slate-400"><Filter size={18} /></div>
          <select 
            value={activeSubject} 
            onChange={(e) => setManualSubject(e.target.value)} // Saat dipilih, baru simpan ke state manual
            className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 pl-10 pr-4 rounded-2xl appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
          >
            {userSubjects.map((mapel) => (
              <option key={mapel} value={mapel}>{mapel}</option>
            ))}
          </select>
          <div className="absolute right-4 top-4 pointer-events-none opacity-50">▼</div>
        </div>
        
        {userSubjects.length === 1 && userSubjects[0] === "Matematika" && settings?.length > 0 && !settings.find(s => s.key === 'mySubjects') && (
           <div className="flex items-center gap-2 p-3 bg-indigo-50 text-indigo-700 rounded-xl text-xs">
             <Settings size={14} />
             <span>Mapel belum pas? <Link to="/profil" className="underline font-bold">Atur di Profil</Link></span>
           </div>
        )}

        <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 flex">
          {[7, 8, 9].map((lvl) => (
            <button key={lvl} onClick={() => setSelectedLevel(lvl)} className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${selectedLevel === lvl ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'}`}>Kelas {toRoman(lvl)}</button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6 transition-all">
        <div onClick={() => setShowForm(!showForm)} className="p-4 flex justify-between items-center cursor-pointer bg-slate-50 hover:bg-slate-100">
          <span className="font-bold text-teal-700 flex items-center gap-2"><Plus size={18} /> Tambah Bab {activeSubject}</span>
          <span className="text-xs text-slate-400">{showForm ? 'Tutup' : 'Buka Form'}</span>
        </div>
        {showForm && (
          <form onSubmit={handleSave} className="p-4 space-y-4 border-t border-slate-100">
            <div className="flex gap-4">
              <div className="w-20">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Urutan</label>
                <input type="number" value={formData.meetingOrder} onChange={(e) => setFormData({...formData, meetingOrder: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-center border border-slate-200" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Topik / Judul Bab</label>
                <input type="text" autoFocus placeholder={`Cth: Bab 1 ${activeSubject}...`} value={formData.topic} onChange={(e) => setFormData({...formData, topic: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl font-bold border border-slate-200 focus:outline-teal-500" />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Tujuan Pembelajaran</label>
              <textarea rows="2" placeholder="Poin penting..." value={formData.objective} onChange={(e) => setFormData({...formData, objective: e.target.value})} className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-200 focus:outline-teal-500" />
            </div>
            <button type="submit" className="w-full py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700">Simpan ke Bank Materi</button>
          </form>
        )}
      </div>

      <div className="space-y-4">
        {syllabus?.map((item) => (
          <div key={item.id} className="flex gap-4 group">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">{item.meetingOrder}</div>
              <div className="w-0.5 h-full bg-slate-200 my-1 group-last:hidden"></div>
            </div>
            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-2 relative">
               <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800">{item.topic}</h3>
                    <p className="text-[10px] text-teal-600 font-bold uppercase mt-1">{item.subject}</p>
                    {item.objective && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.objective}</p>}
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="text-slate-300 hover:text-red-500 p-1"><Trash2 size={16} /></button>
               </div>
            </div>
          </div>
        ))}
        {syllabus?.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <BookOpen size={40} className="mx-auto mb-2 opacity-20" />
            <p className="text-sm">Belum ada materi <b>{activeSubject}</b> di Kelas {toRoman(selectedLevel)}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RencanaAjar;