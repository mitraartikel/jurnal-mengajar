import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import * as XLSX from 'xlsx';
import { ChevronLeft, FileSpreadsheet, Trash2, User, Pencil, X, Save } from 'lucide-react'; // Tambah Icon Pencil, X, Save

const KelasDetail = () => {
  const { id } = useParams();
  const classId = parseInt(id);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [isImporting, setIsImporting] = useState(false);
  
  // STATE BARU: Untuk menyimpan data siswa yang sedang diedit
  const [editingStudent, setEditingStudent] = useState(null); 

  const kelas = useLiveQuery(() => db.classes.get(classId));
  const students = useLiveQuery(() => 
    db.students.where('classId').equals(classId).toArray()
  ) || [];

  // --- FUNGSI IMPORT (Tetap Sama) ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet);
        const formattedStudents = data.map(row => ({
          name: row['Nama'] || row['nama'] || row['Name'],
          nis: row['NIS'] || row['nis'] || '-',
          gender: row['L/P'] || row['Gender'] || 'L',
          classId: classId
        })).filter(s => s.name);
        await db.students.bulkAdd(formattedStudents);
        alert(`Berhasil mengimpor ${formattedStudents.length} siswa!`);
      } catch (error) {
        console.error(error);
        alert('Gagal membaca file Excel.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleDeleteStudent = async (studentId) => {
    if (confirm('Hapus siswa ini? Data nilai & absen akan hilang selamanya.')) {
      await db.students.delete(studentId);
    }
  };

  // --- FUNGSI UPDATE (BARU) ---
  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      // Perintah 'update' di Dexie hanya mengubah field yang diminta
      // ID tetap sama, jadi relasi data AMAN.
      await db.students.update(editingStudent.id, {
        name: editingStudent.name,
        nis: editingStudent.nis,
        gender: editingStudent.gender
      });
      setEditingStudent(null); // Tutup modal
    } catch (error) {
      alert("Gagal update: " + error);
    }
  };

  if (!kelas) return <div className="p-6">Memuat data kelas...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24 relative">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 bg-white rounded-full shadow-sm text-slate-600">
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{kelas.name}</h1>
          <p className="text-slate-500 text-sm">{students.length} Siswa Terdaftar</p>
        </div>
      </div>

      {/* Area Tombol Aksi */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex gap-2">
          <button 
            onClick={() => fileInputRef.current.click()}
            disabled={isImporting}
            className="flex-1 bg-green-50 text-green-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-green-100 hover:bg-green-100 transition-colors"
          >
            {isImporting ? 'Processing...' : <><FileSpreadsheet size={18} /> Import Excel</>}
          </button>
          <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />

          {/* Tombol Tambah Manual (Dummy func) */}
          <button 
             onClick={() => alert("Gunakan import excel dulu ya untuk data massal!")}
             className="flex-1 bg-slate-50 text-slate-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 border border-slate-200"
          >
            <User size={18} /> Manual
          </button>
        </div>
      </div>

      {/* Daftar Siswa */}
      <div className="space-y-3">
        {students.map((siswa, index) => (
          <div key={siswa.id} className="bg-white p-4 rounded-xl border border-slate-100 flex items-center justify-between group hover:border-teal-200 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-xs font-bold text-slate-500">
                {index + 1}
              </div>
              <div>
                <p className="font-bold text-slate-800">{siswa.name}</p>
                <p className="text-xs text-slate-400">NIS: {siswa.nis} • {siswa.gender}</p>
              </div>
            </div>
            
            {/* Tombol Aksi Item */}
            <div className="flex gap-1">
              {/* Tombol Edit */}
              <button 
                onClick={() => setEditingStudent(siswa)} 
                className="p-2 text-slate-300 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
              >
                <Pencil size={16} />
              </button>
              
              {/* Tombol Hapus */}
              <button 
                onClick={() => handleDeleteStudent(siswa.id)} 
                className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL EDIT SISWA (MUNCUL JIKA editingStudent != null) --- */}
      {editingStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">Edit Siswa</h3>
              <button onClick={() => setEditingStudent(null)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">NAMA LENGKAP</label>
                <input 
                  type="text" 
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({...editingStudent, name: e.target.value})}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 mb-1 block">NIS</label>
                  <input 
                    type="text" 
                    value={editingStudent.nis}
                    onChange={(e) => setEditingStudent({...editingStudent, nis: e.target.value})}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                   <label className="text-xs font-bold text-slate-500 mb-1 block">L/P</label>
                   <select 
                      value={editingStudent.gender}
                      onChange={(e) => setEditingStudent({...editingStudent, gender: e.target.value})}
                      className="w-full border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                   >
                     <option value="L">L</option>
                     <option value="P">P</option>
                   </select>
                </div>
              </div>

              <button type="submit" className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-teal-700">
                <Save size={18} /> Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default KelasDetail;