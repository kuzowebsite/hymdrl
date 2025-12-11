import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Image as ImageIcon, 
  Upload, Link as LinkIcon, Search, ExternalLink, MapPin, ShoppingBag, Loader2 
} from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set, push, remove } from "firebase/database";

const OtherStoresPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [tempBranch, setTempBranch] = useState({ name: '', link: '' });
  const [stores, setStores] = useState([]);
  const [formData, setFormData] = useState({
    name: '', logo: '', description: '', siteLink: '',
    dealsCount: '', 
    bestSellerImage: '', bestSellerLink: '',
    branches: [] 
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const query = ref(db, "content/stores/others");
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStores(Object.keys(data).map(key => ({ 
            id: key, 
            ...data[key],
            branches: data[key].branches || [] // Ensure branches is array
        })));
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
    setFormData({
      name: '', logo: '', description: '', siteLink: '',
      dealsCount: '', bestSellerImage: '', bestSellerLink: '',
      branches: []
    });
    setTempBranch({ name: '', link: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (store) => {
    setEditingId(store.id);
    setFormData({ ...store, branches: store.branches || [] });
    setTempBranch({ name: '', link: '' });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Устгахдаа итгэлтэй байна уу?")) {
      remove(ref(db, `content/stores/others/${id}`));
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

  // BRANCH HANDLERS
  const addBranch = () => {
    if (!tempBranch.name) return alert("Салбарын нэрийг оруулна уу");
    setFormData(prev => ({
      ...prev,
      branches: [...(prev.branches || []), tempBranch]
    }));
    setTempBranch({ name: '', link: '' });
  };

  const removeBranch = (index) => {
    const newBranches = formData.branches.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, branches: newBranches }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      set(ref(db, `content/stores/others/${editingId}`), formData);
    } else {
      const newRef = push(ref(db, "content/stores/others"));
      set(newRef, formData);
    }
    setIsModalOpen(false);
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Уншиж байна...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Бусад Дэлгүүрүүд</h1>
          <p className="text-slate-500 mt-1">Жагсаалтанд харагдах энгийн дэлгүүрүүдийг энд удирдана.</p>
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
                <th className="p-5">Тайлбар & Линк</th>
                <th className="p-5">Бестселлер</th>
                <th className="p-5">Салбарууд</th>
                <th className="p-5 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStores.map((store) => (
                <tr key={store.id} className="hover:bg-slate-50 transition">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-2 shadow-sm flex-shrink-0">
                        {store.logo ? <img src={store.logo} alt={store.name} className="w-full h-full object-contain" /> : <div className="text-slate-300 font-bold text-xs">IMG</div>}
                      </div>
                      <div>
                         <span className="font-bold text-slate-900 block">{store.name}</span>
                         <span className="text-rose-600 text-xs font-bold">{store.dealsCount} хямдрал</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                     <p className="text-slate-600 text-xs line-clamp-1 mb-1 max-w-[200px]">{store.description}</p>
                     <a href={store.siteLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-xs"><ExternalLink size={12} /> {store.siteLink}</a>
                  </td>
                  <td className="p-5">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                           {store.bestSellerImage && <img src={store.bestSellerImage} alt="Best" className="w-full h-full object-cover" />}
                        </div>
                     </div>
                  </td>
                  <td className="p-5">
                     <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold text-slate-700">{store.branches ? store.branches.length : 0} салбар</span>
                     </div>
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
              <form id="other-store-form" onSubmit={handleSave} className="space-y-8">
                <div>
                   <h4 className="font-black text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2"><ShoppingBag size={20} className="text-blue-600" /> Үндсэн мэдээлэл</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1 flex flex-col items-center">
                         <label className="block text-sm font-bold text-slate-700 mb-2">Лого</label>
                         <div className="relative group w-32 h-32">
                            <div className="w-full h-full rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                               {formData.logo ? <img src={formData.logo} alt="Preview" className="w-full h-full object-contain p-4" /> : <div className="text-center text-slate-400"><ImageIcon className="mx-auto" size={24} /><span className="text-[10px] block mt-1">Оруулах</span></div>}
                            </div>
                            <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                         </div>
                      </div>
                      <div className="md:col-span-2 space-y-4">
                         <div><label className="block text-sm font-bold text-slate-700 mb-1">Дэлгүүрийн нэр</label><input type="text" required className="w-full border p-2.5 rounded-xl text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                         <div><label className="block text-sm font-bold text-slate-700 mb-1">Тайлбар</label><textarea className="w-full border p-2.5 rounded-xl text-sm h-16 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
                         <div className="flex gap-4">
                            <div className="flex-1"><label className="block text-sm font-bold text-slate-700 mb-1">Сайт линк</label><input type="url" className="w-full border p-2.5 rounded-xl text-sm" value={formData.siteLink} onChange={(e) => setFormData({...formData, siteLink: e.target.value})} placeholder="https://..." /></div>
                            <div className="w-32"><label className="block text-sm font-bold text-slate-700 mb-1">Хямдрал тоо</label><input type="number" className="w-full border p-2.5 rounded-xl text-sm" value={formData.dealsCount} onChange={(e) => setFormData({...formData, dealsCount: e.target.value})} placeholder="0" /></div>
                         </div>
                      </div>
                   </div>
                </div>
                <div>
                   <h4 className="font-black text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2"><ExternalLink size={20} className="text-rose-600" /> Бестселлер бараа</h4>
                   <div className="flex gap-6 items-start">
                      <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-center relative overflow-hidden group flex-shrink-0">
                         {formData.bestSellerImage ? <img src={formData.bestSellerImage} alt="Best Seller" className="w-full h-full object-cover" /> : <Upload size={20} className="text-slate-400" />}
                         <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bestSellerImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                      <div className="flex-1">
                         <label className="block text-sm font-bold text-slate-700 mb-1">Бараа руу үсрэх линк</label>
                         <input type="url" className="w-full border p-2.5 rounded-xl text-sm" value={formData.bestSellerLink} onChange={(e) => setFormData({...formData, bestSellerLink: e.target.value})} placeholder="https://store.mn/product/123" />
                         <p className="text-xs text-slate-400 mt-2">Тухайн дэлгүүрийн хамгийн их эрэлттэй барааны зураг болон линкийг оруулна.</p>
                      </div>
                   </div>
                </div>
                <div>
                   <h4 className="font-black text-slate-900 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2"><MapPin size={20} className="text-green-600" /> Салбарын байршил</h4>
                   <div className="space-y-3 mb-4">
                      {formData.branches && formData.branches.map((branch, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                           <div className="flex items-center gap-3">
                              <div className="p-2 bg-white rounded-full text-rose-500 border border-slate-100"><MapPin size={16}/></div>
                              <div><p className="text-sm font-bold text-slate-800">{branch.name}</p><a href={branch.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">{branch.link || "Линкгүй"}</a></div>
                           </div>
                           <button type="button" onClick={() => removeBranch(index)} className="p-2 text-slate-400 hover:text-red-500 transition"><Trash2 size={16}/></button>
                        </div>
                      ))}
                   </div>
                   <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-500 uppercase mb-3">Шинэ салбар нэмэх</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                         <input type="text" className="border p-2 rounded-lg text-sm w-full" placeholder="Салбарын нэр" value={tempBranch.name} onChange={(e) => setTempBranch({...tempBranch, name: e.target.value})} />
                         <input type="url" className="border p-2 rounded-lg text-sm w-full" placeholder="Google Maps Link" value={tempBranch.link} onChange={(e) => setTempBranch({...tempBranch, link: e.target.value})} />
                      </div>
                      <button type="button" onClick={addBranch} className="w-full py-2 bg-slate-800 text-white rounded-lg text-sm font-bold hover:bg-slate-900 transition flex items-center justify-center gap-2"><Plus size={16}/> Салбар нэмэх</button>
                   </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">Болих</button>
              <button type="submit" form="other-store-form" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2"><Save size={18} /> Хадгалах</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OtherStoresPage;