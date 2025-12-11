import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Image as ImageIcon, 
  Upload, Link as LinkIcon, ShoppingBag, ExternalLink, Store, Search, Loader2 
} from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set, push, remove } from "firebase/database";

const BestSellersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    name: '', price: '', soldCount: '', link: '', image: '', storeLogo: ''
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const query = ref(db, "content/home/bestSellers");
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedData = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setItems(formattedData);
      } else {
        setItems([]);
      }
      setLoading(false);
    });
  }, []);

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- HANDLERS ---
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', price: '', soldCount: '', link: '', image: '', storeLogo: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Та энэ барааг устгахдаа итгэлтэй байна уу?")) {
      remove(ref(db, `content/home/bestSellers/${id}`));
    }
  };

  const handleImageUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { alert("1MB-аас бага байх ёстой"); return; }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [fieldName]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      set(ref(db, `content/home/bestSellers/${editingId}`), formData);
    } else {
      const newRef = push(ref(db, "content/home/bestSellers"));
      set(newRef, formData);
    }
    setIsModalOpen(false);
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Уншиж байна...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Их зарагдсан</h1>
          <p className="text-slate-500 mt-1">Хамгийн их борлуулалттай барааг энд удирдана.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
             <input type="text" placeholder="Бараа хайх..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-rose-500 outline-none shadow-sm"/>
          </div>
          <button onClick={handleAddNew} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition shadow-lg shadow-rose-200 whitespace-nowrap">
            <Plus size={20} /> <span className="hidden sm:inline">Бараа нэмэх</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-5 whitespace-nowrap">Бараа</th>
                <th className="p-5 whitespace-nowrap">Дэлгүүр</th>
                <th className="p-5 whitespace-nowrap">Зарагдсан</th>
                <th className="p-5 whitespace-nowrap">Үнэ</th>
                <th className="p-5 text-right whitespace-nowrap">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20}/></div>}
                      </div>
                      <span className="font-bold text-slate-900 line-clamp-2 max-w-[200px]">{item.name}</span>
                    </div>
                  </td>
                  <td className="p-5">
                     <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-1">
                        {item.storeLogo ? <img src={item.storeLogo} alt="Logo" className="w-full h-full object-contain" /> : <Store size={16} />}
                     </div>
                  </td>
                  <td className="p-5 font-bold text-slate-700">{item.soldCount} ш</td>
                  <td className="p-5 text-rose-600 font-bold whitespace-nowrap">{item.price}</td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(item)} className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredItems.length === 0 && <div className="text-center py-20 text-slate-400">Бараа олдсонгүй.</div>}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Бараа засах' : 'Бараа нэмэх'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
              <form id="best-seller-form" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Барааны зураг</label>
                      <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden group hover:border-rose-400 transition-colors flex items-center justify-center">
                        {formData.image ? <img src={formData.image} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><Upload className="mx-auto mb-1" size={20}/><span className="text-xs">Зураг оруулах</span></div>}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'image')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Дэлгүүрийн лого</label>
                      <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden group hover:border-rose-400 transition-colors flex items-center justify-center">
                        {formData.storeLogo ? <img src={formData.storeLogo} alt="Logo Preview" className="w-full h-full object-contain p-4" /> : <div className="text-center text-slate-400"><ShoppingBag className="mx-auto mb-1" size={20}/><span className="text-xs">Лого оруулах</span></div>}
                        <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'storeLogo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                      </div>
                   </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Барааны нэр</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Үнэ</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Зарагдсан ширхэг</label><input type="number" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" value={formData.soldCount} onChange={(e) => setFormData({...formData, soldCount: e.target.value})} /></div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Сайт руу үсрэх линк</label>
                    <div className="relative"><LinkIcon size={16} className="absolute left-4 top-3.5 text-slate-400" /><input type="url" required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} /></div>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">Болих</button>
              <button type="submit" form="best-seller-form" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2"><Save size={18} /> Хадгалах</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BestSellersPage;