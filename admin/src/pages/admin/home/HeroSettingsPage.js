import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Image as ImageIcon, 
  Eye, EyeOff, Upload, RefreshCw, Loader2 
} from 'lucide-react';
import { db } from '../../../firebase'; // Firebase config
import { ref, onValue, set, remove, push } from "firebase/database"; // Realtime DB functions

const HeroSettingsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [loading, setLoading] = useState(true); // Loading state
  
  const [slides, setSlides] = useState([]); // Firebase-аас ирэх дата

  const [formData, setFormData] = useState({
    title: '', subtitle: '', image: '', buttonText: '', isActive: true
  });

  // --- 1. READ DATA FROM FIREBASE ---
  useEffect(() => {
    const query = ref(db, "content/home/hero");
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (snapshot.exists()) {
        // Object-ийг Array болгож хувиргах (Firebase ID-тай нь хамт)
        const formattedData = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setSlides(formattedData);
      } else {
        setSlides([]);
      }
      setLoading(false);
    });
  }, []);

  // --- HANDLERS ---

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ title: '', subtitle: '', image: '', buttonText: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (slide) => {
    setEditingId(slide.id);
    setFormData(slide);
    setIsModalOpen(true);
  };

  // --- 2. DELETE DATA ---
  const handleDelete = (id) => {
    if (window.confirm("Та энэ слайдыг устгахдаа итгэлтэй байна уу?")) {
      remove(ref(db, `content/home/hero/${id}`));
    }
  };

  // --- 3. UPDATE STATUS ---
  const toggleStatus = (id, currentStatus) => {
    set(ref(db, `content/home/hero/${id}/isActive`), !currentStatus);
  };

  // --- FILE TO BASE64 ---
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Limit file size (Realtime DB has limit)
      if (file.size > 1048576) { // 1MB limit example
         alert("Зургийн хэмжээ хэт том байна! 1MB-аас бага байх ёстой.");
         return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 4. SAVE (CREATE / UPDATE) ---
  const handleSave = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Update Existing
      set(ref(db, `content/home/hero/${editingId}`), formData);
    } else {
      // Create New (Push generates unique ID)
      const newRef = push(ref(db, "content/home/hero"));
      set(newRef, formData);
    }
    setIsModalOpen(false);
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Уншиж байна...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Hero Панел</h1>
          <p className="text-slate-500 mt-1">Нүүр хуудасны слайдерыг энд удирдана.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition shadow-lg shadow-rose-200"
        >
          <Plus size={20} /> Шинэ слайд
        </button>
      </div>

      {/* SLIDES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {slides.map((slide) => (
          <div key={slide.id} className={`group bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${slide.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div className="h-48 bg-slate-100 relative">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 right-3 flex gap-2">
                 <button 
                   onClick={() => toggleStatus(slide.id, slide.isActive)}
                   className={`p-2 rounded-full backdrop-blur-md transition ${slide.isActive ? 'bg-green-500/20 text-green-600 hover:bg-green-500 hover:text-white' : 'bg-gray-500/20 text-gray-600 hover:bg-gray-500 hover:text-white'}`}
                 >
                   {slide.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                 </button>
              </div>
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                 <h3 className="text-white font-bold text-lg leading-tight">{slide.title}</h3>
                 <p className="text-white/80 text-xs mt-1 truncate">{slide.subtitle}</p>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between bg-white">
               <div className="text-xs text-slate-400 font-medium">
                 Button: <span className="text-slate-700">{slide.buttonText}</span>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => handleEdit(slide)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18} /></button>
                 <button onClick={() => handleDelete(slide.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 size={18} /></button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {slides.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
           <ImageIcon className="mx-auto text-slate-300 mb-3" size={48} />
           <p className="text-slate-500">Одоогоор слайд байхгүй байна.</p>
        </div>
      )}

      {/* --- MODAL FORM (Яг өмнөхтэй ижил, зөвхөн onSubmit={handleSave} хэвээрээ) --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Слайд засах' : 'Шинэ слайд нэмэх'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Зураг оруулах</label>
                <div className="w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden group hover:border-rose-400 transition-colors">
                   {formData.image ? (
                     <>
                       <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity duration-300">
                          <RefreshCw className="text-white mb-2" size={24} />
                          <span className="text-white text-sm font-bold">Зураг солих</span>
                       </div>
                     </>
                   ) : (
                     <div className="flex flex-col items-center justify-center h-full text-slate-400">
                        <div className="p-4 bg-white rounded-full shadow-sm mb-2">
                           <Upload size={24} className="text-rose-500" />
                        </div>
                        <span className="text-sm font-medium">Энд дарж зураг сонгоно уу</span>
                        <span className="text-xs text-slate-400 mt-1">Max 1MB</span>
                     </div>
                   )}
                   <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Гарчиг (Title)</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Товч текст (Subtitle)</label>
                  <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})}/>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Товч (Button Text)</label>
                  <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:border-rose-500 outline-none" value={formData.buttonText} onChange={(e) => setFormData({...formData, buttonText: e.target.value})}/>
                </div>
                <div className="flex items-center pt-8">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${formData.isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                         <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Идэвхтэй харуулах</span>
                   </label>
                </div>
              </div>
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">Болих</button>
                <button type="submit" disabled={!formData.image} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50"><Save size={18} /> Хадгалах</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroSettingsPage;