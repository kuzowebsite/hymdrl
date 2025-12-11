import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Image as ImageIcon, 
  Upload, Link as LinkIcon, Monitor, Eye, EyeOff, Loader2 
} from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set, push, remove } from "firebase/database";

const FeaturedPanelPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [banners, setBanners] = useState([]);
  const [formData, setFormData] = useState({
    title: '', subtitle: '', link: '', buttonText: '', bgImage: '', isActive: true
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const query = ref(db, "content/featured/panel");
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setBanners(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setBanners([]);
      }
      setLoading(false);
    });
  }, []);

  // --- HANDLERS ---
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ title: '', subtitle: '', link: '', buttonText: '', bgImage: '', isActive: true });
    setIsModalOpen(true);
  };

  const handleEdit = (banner) => {
    setEditingId(banner.id);
    setFormData(banner);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Устгахдаа итгэлтэй байна уу?")) {
      remove(ref(db, `content/featured/panel/${id}`));
    }
  };

  const toggleStatus = (id, currentStatus) => {
    set(ref(db, `content/featured/panel/${id}/isActive`), !currentStatus);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { alert("1MB limit"); return; }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, bgImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      set(ref(db, `content/featured/panel/${editingId}`), formData);
    } else {
      const newRef = push(ref(db, "content/featured/panel"));
      set(newRef, formData);
    }
    setIsModalOpen(false);
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Уншиж байна...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Онцлох Панел</h1>
          <p className="text-slate-500 mt-1">"Өдрийн онцлох" хэсгийн баннеруудыг энд удирдана.</p>
        </div>
        <button onClick={handleAddNew} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition shadow-lg shadow-rose-200">
          <Plus size={20} /> Шинэ баннер
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <div key={banner.id} className={`group bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${banner.isActive ? 'border-slate-200' : 'border-slate-100 opacity-60'}`}>
            <div className="h-48 bg-slate-900 relative overflow-hidden">
               {banner.bgImage && <img src={banner.bgImage} alt={banner.title} className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition duration-500" />}
               <div className="absolute top-3 right-3">
                 <button onClick={() => toggleStatus(banner.id, banner.isActive)} className={`p-2 rounded-full backdrop-blur-md transition ${banner.isActive ? 'bg-green-500/20 text-green-400 hover:bg-green-500 hover:text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                   {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                 </button>
               </div>
               <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                  <h3 className="text-white font-bold text-lg leading-tight line-clamp-1">{banner.title}</h3>
                  <p className="text-white/70 text-xs mt-1 line-clamp-1">{banner.subtitle}</p>
               </div>
            </div>
            <div className="p-4 bg-white flex items-center justify-between">
               <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                  <LinkIcon size={14} /> <span className="truncate max-w-[100px]">{banner.link}</span>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => handleEdit(banner)} className="p-2 bg-slate-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"><Edit size={18}/></button>
                 <button onClick={() => handleDelete(banner.id)} className="p-2 bg-slate-50 text-rose-600 hover:bg-rose-100 rounded-lg transition"><Trash2 size={18}/></button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Баннер засах' : 'Шинэ баннер нэмэх'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
              <form id="featured-panel-form" onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Дэвсгэр зураг</label>
                  <div className="w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden group hover:border-rose-400 transition-colors flex items-center justify-center">
                     {formData.bgImage ? <img src={formData.bgImage} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><Upload className="mx-auto mb-1" size={24}/><span className="text-xs">Зураг оруулах</span></div>}
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Гарчиг</label>
                    <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Тайлбар текст</label>
                    <textarea required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none h-20 resize-none" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Линк (URL)</label>
                    <div className="relative"><LinkIcon className="absolute left-3 top-3 text-slate-400" size={16}/><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} /></div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Товч (Button Text)</label>
                    <div className="relative"><Monitor className="absolute left-3 top-3 text-slate-400" size={16}/><input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-3 text-sm outline-none" value={formData.buttonText} onChange={(e) => setFormData({...formData, buttonText: e.target.value})} /></div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-2 border-t border-slate-50 mt-4">
                   <label className="flex items-center gap-3 cursor-pointer group select-none">
                      <div className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${formData.isActive ? 'bg-green-500' : 'bg-slate-300'}`}>
                         <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-all duration-300 ${formData.isActive ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                      <input type="checkbox" className="hidden" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} />
                      <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">Сайтад харуулах</span>
                   </label>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">Болих</button>
              <button type="submit" form="featured-panel-form" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2"><Save size={18} /> Хадгалах</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedPanelPage;