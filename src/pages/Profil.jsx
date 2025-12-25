import { useState, useEffect } from 'react';
import { db } from '../db'; 
import { Save, User, School, BookOpen, CheckSquare, Square } from 'lucide-react';

const MASTER_SUBJECTS = [
  "Al Qur'an Hadis", "Akidah Akhlak", "Fikih", "Sejarah Kebudayaan Islam",
  "Bahasa Arab", "Pendidikan Pancasila", "Bahasa Indonesia", "Matematika",
  "Ilmu Pengetahuan Alam", "Ilmu Pengetahuan Sosial", "Bahasa Inggris",
  "Pendidikan Jasmani, Olahraga dan Kesehatan", "Informatika",
  "Muatan Lokal", "Seni dan Prakarya"
];

const Profil = () => {
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [mySubjects, setMySubjects] = useState([]);

  // PERBAIKAN DI SINI:
  // Jangan pakai useLiveQuery untuk Form. Pakai useEffect biasa (Run Once).
  useEffect(() => {
    const loadData = async () => {
      try {
        const settings = await db.settings.toArray();
        const nameData = settings.find(s => s.key === 'teacherName');
        const schoolData = settings.find(s => s.key === 'schoolName');
        const subjectData = settings.find(s => s.key === 'mySubjects');

        if (nameData) setName(nameData.value);
        if (schoolData) setSchool(schoolData.value);
        if (subjectData) setMySubjects(subjectData.value);
      } catch (error) {
        console.error("Gagal memuat profil:", error);
      }
    };
    
    loadData();
  }, []); // <--- Array kosong artinya: "Jalankan cuma sekali pas halaman dibuka"

  const toggleSubject = (subject) => {
    if (mySubjects.includes(subject)) {
      setMySubjects(mySubjects.filter(s => s !== subject));
    } else {
      setMySubjects([...mySubjects, subject]);
    }
  };

  const handleSave = async () => {
    try {
      await db.settings.bulkPut([
        { key: 'teacherName', value: name },
        { key: 'schoolName', value: school },
        { key: 'mySubjects', value: mySubjects }
      ]);
      alert("Profil berhasil disimpan!");
    } catch (error) {
      alert("Gagal menyimpan: " + error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Profil Guru</h1>
      <div className="space-y-6">
        {/* IDENTITAS */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h2 className="font-bold text-slate-700 flex items-center gap-2"><User size={18} /> Identitas</h2>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Lengkap</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800" placeholder="Nama Anda" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase">Nama Sekolah</label>
            <div className="relative">
              <School className="absolute left-3 top-3 text-slate-400" size={18} />
              <input type="text" value={school} onChange={(e) => setSchool(e.target.value)} className="w-full p-3 pl-10 bg-slate-50 rounded-xl border border-slate-200 font-bold text-slate-800" placeholder="Sekolah Tempat Mengajar" />
            </div>
          </div>
        </section>

        {/* PILIH MAPEL */}
        <section className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-700 flex items-center gap-2 mb-4"><BookOpen size={18} /> Mapel yang Diampu</h2>
          <div className="grid grid-cols-1 gap-2">
            {MASTER_SUBJECTS.map((sub) => {
              const isActive = mySubjects.includes(sub);
              return (
                <div key={sub} onClick={() => toggleSubject(sub)} className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-all border ${isActive ? 'bg-teal-50 border-teal-200 text-teal-800' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                  {isActive ? <CheckSquare size={20} className="text-teal-600" /> : <Square size={20} className="text-slate-300" />}
                  <span className="text-sm font-medium">{sub}</span>
                </div>
              );
            })}
          </div>
        </section>

        <button onClick={handleSave} className="w-full bg-slate-800 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-900 shadow-lg shadow-slate-200"><Save size={20} /> Simpan Profil</button>
      </div>
    </div>
  );
};

export default Profil;