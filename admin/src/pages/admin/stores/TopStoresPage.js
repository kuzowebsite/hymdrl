import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Image as ImageIcon, 
  Upload, Link as LinkIcon, Search, ExternalLink, Store, Loader2 
} from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set, push, remove } from "firebase/database";

const TopStoresPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    name: '', description: '', link: '', logo: '', coverImage: ''
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const query = ref(db, "content/stores/top");
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStores(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setStores([]);
      }
      setLoading(false);
    });
  }, []);

  const filteredStores = stores.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- HANDLERS ---
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', description: '', link: '', logo: '', coverImage: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (store) => {
    setEditingId(store.id);
    setFormData(store);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Устгахдаа итгэлтэй байна уу?")) {
      remove(ref(db, `content/stores/top/${id}`));
    }
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { alert("1MB limit"); return; }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, [field]: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      set(ref(db, `content/stores/top/${editingId}`), formData);
    } else {
      const newRef = push(ref(db, "content/stores/top"));
      set(newRef, formData);
    }
    setIsModalOpen(false);
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Уншиж байна...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Шилдэг Дэлгүүрүүд</h1>
          <p className="text-slate-500 mt-1">Хамгийн нэр хүндтэй, онцлох дэлгүүрүүдийг энд удирдана.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
             <input type="text" placeholder="Дэлгүүр хайх..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none shadow-sm"/>
          </div>
          <button onClick={handleAddNew} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition shadow-lg shadow-rose-200 whitespace-nowrap">
            <Plus size={20} /> <span className="hidden sm:inline">Дэлгүүр нэмэх</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-5">Дэлгүүр</th>
                <th className="p-5">Cover Зураг</th>
                <th className="p-5">Тайлбар</th>
                <th className="p-5">Линк</th>
                <th className="p-5 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStores.map((store) => (
                <tr key={store.id} className="hover:bg-slate-50 transition">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-2 shadow-sm flex-shrink-0">
                        {store.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-contain" /> : <Store size={20} className="text-slate-400"/>}
                      </div>
                      <span className="font-bold text-slate-900 text-base">{store.name}</span>
                    </div>
                  </td>
                  <td className="p-5">
                     <div className="w-24 h-14 bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                        {store.coverImage ? <img src={store.coverImage} alt="Cover" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={16}/></div>}
                     </div>
                  </td>
                  <td className="p-5 text-slate-600 max-w-xs truncate">{store.description}</td>
                  <td className="p-5">
                     <a href={store.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium">LINK <ExternalLink size={12} /></a>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(store)} className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(store.id)} className="p-2 bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Дэлгүүр засах' : 'Дэлгүүр нэмэх'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-8">
              <form id="store-form" onSubmit={handleSave} className="space-y-8">
                <div>
                   <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2"><ImageIcon size={20} className="text-rose-600"/> Зураг & Лого</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1 flex flex-col items-center">
                         <label className="block text-sm font-bold text-slate-700 mb-2">Лого</label>
                         <div className="relative group w-32 h-32">
                            <div className="w-full h-full rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                               {formData.logo ? <img src={formData.logo} alt="Preview" className="w-full h-full object-contain p-2" /> : <div className="text-center text-slate-400"><Store className="mx-auto" size={24} /><span className="text-[10px] mt-1 block">Лого</span></div>}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2 bg-rose-600 rounded-full text-white cursor-pointer shadow-md hover:bg-rose-700 transition">
                               <Upload size={16} /><input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="hidden" />
                            </label>
                         </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Cover Зураг (Дэвсгэр)</label>
                        <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden group hover:border-rose-400 transition-colors flex items-center justify-center">
                          {formData.coverImage ? <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><Upload className="mx-auto mb-1" size={20}/><span className="text-xs">Том зураг оруулах</span></div>}
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                   </div>
                </div>
                <div>
                   <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2"><Store size={20} className="text-blue-600"/> Мэдээлэл</h4>
                   <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Дэлгүүрийн нэр</label><input type="text" required className="w-full border p-2.5 rounded-xl text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Жишээ: Shoppy" /></div>
                        <div><label className="block text-sm font-bold text-slate-700 mb-1">Сайт руу үсрэх линк</label><div className="relative"><LinkIcon size={16} className="absolute left-3 top-2.5 text-slate-400" /><input type="url" required className="w-full border pl-9 p-2.5 rounded-xl text-sm" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} placeholder="https://..." /></div></div>
                      </div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Тайлбар</label><textarea className="w-full border p-3 rounded-xl text-sm h-20 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Дэлгүүрийн тухай товч мэдээлэл..." /></div>
                   </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">Болих</button>
              <button type="submit" form="store-form" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2"><Save size={18} /> Хадгалах</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopStoresPage;