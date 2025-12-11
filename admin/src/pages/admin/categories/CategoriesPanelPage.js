import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Upload, Loader2, Layers } from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set, push, remove } from "firebase/database";

const CategoriesPanelPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [panels, setPanels] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', categoryId: '', description: '', coverImage: '' });

  useEffect(() => {
    onValue(ref(db, "content/categories/panel"), (s) => {
      setPanels(s.val() ? Object.keys(s.val()).map(k => ({ id: k, ...s.val()[k] })) : []);
      setLoading(false);
    });
    onValue(ref(db, "content/categories/main"), (s) => {
      setMainCategories(s.val() ? Object.keys(s.val()).map(k => ({ id: k, ...s.val()[k] })) : []);
    });
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
        if(file.size > 1048576) { alert("1MB limit"); return; }
        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, coverImage: reader.result }));
        reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) set(ref(db, `content/categories/panel/${editingId}`), formData);
    else push(ref(db, "content/categories/panel"), formData);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
      if(window.confirm("Устгах уу?")) remove(ref(db, `content/categories/panel/${id}`));
  }

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-900">Ангилал Панел</h1>
        <button onClick={() => { setEditingId(null); setFormData({name: '', categoryId: '', description: '', coverImage: ''}); setIsModalOpen(true); }} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition">
          <Plus size={20} /> Шинэ панел
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {panels.map((panel) => (
          <div key={panel.id} className="group bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-xl transition-all">
            <div className="h-48 bg-slate-900 relative overflow-hidden">
               {panel.coverImage ? <img src={panel.coverImage} alt={panel.name} className="w-full h-full object-cover opacity-80" /> : <div className="w-full h-full flex items-center justify-center text-slate-500"><ImageIcon size={40}/></div>}
               <div className="absolute inset-0 flex flex-col justify-center px-8 bg-black/40">
                  <span className="text-xs font-bold text-yellow-400 uppercase tracking-wider mb-2 bg-black/20 w-fit px-2 py-1 rounded">{panel.categoryId}</span>
                  <h3 className="text-3xl font-black text-white">{panel.name}</h3>
               </div>
            </div>
            <div className="p-6 flex flex-col flex-1">
               <p className="text-slate-600 text-sm mb-4 line-clamp-2">{panel.description}</p>
               <div className="mt-auto flex justify-end gap-2 pt-4 border-t border-slate-100">
                 <button onClick={() => { setEditingId(panel.id); setFormData(panel); setIsModalOpen(true); }} className="px-4 py-2 bg-slate-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition flex items-center gap-2"><Edit size={16}/> Засах</button>
                 <button onClick={() => handleDelete(panel.id)} className="px-4 py-2 bg-slate-50 text-rose-600 font-bold rounded-lg hover:bg-rose-100 transition flex items-center gap-2"><Trash2 size={16}/> Устгах</button>
               </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-6 space-y-6">
            <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Панел засах' : 'Панел нэмэх'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Cover Зураг</label>
                  <div className="w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative flex items-center justify-center overflow-hidden">
                     {formData.coverImage ? <img src={formData.coverImage} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><Upload className="mx-auto mb-1"/><span className="text-xs">Зураг сонгох</span></div>}
                     <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Ангилал (ID)</label>
                        <select required className="w-full border p-2.5 rounded-xl" value={formData.categoryId} onChange={(e) => {
                            const cat = mainCategories.find(c => c.id === e.target.value);
                            setFormData({...formData, categoryId: e.target.value, name: cat ? cat.name : ''});
                        }}>
                            <option value="">Сонгох...</option>
                            {mainCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Гарчиг</label>
                        <input type="text" required className="w-full border p-2.5 rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Тайлбар</label>
                    <textarea required className="w-full border p-2.5 rounded-xl h-24" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100">Болих</button>
                    <button type="submit" className="bg-rose-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-700">Хадгалах</button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPanelPage;