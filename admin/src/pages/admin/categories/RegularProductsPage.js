import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Image as ImageIcon, Upload, Search, Loader2, Store, Percent, Layers, Tag } from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set, push, remove } from "firebase/database";

const RegularProductsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '', store: '', category: '', subCategory: '', 
    originalPrice: '', price: '', discount: '', 
    mainImage: '', description: ''
  });

  useEffect(() => {
    onValue(ref(db, "content/categories/products"), (s) => setProducts(s.val() ? Object.keys(s.val()).map(k => ({ id: k, ...s.val()[k] })) : []));
    onValue(ref(db, "content/categories/main"), (s) => setMainCategories(s.val() ? Object.keys(s.val()).map(k => ({ id: k, ...s.val()[k] })) : []));
    onValue(ref(db, "content/categories/sub"), (s) => {
        setSubCategories(s.val() ? Object.keys(s.val()).map(k => ({ id: k, ...s.val()[k] })) : []);
        setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const availableSubCats = subCategories.filter(sub => sub.parentId === formData.category);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if(file) {
        if(file.size > 1048576) { alert("1MB limit"); return; }
        const reader = new FileReader();
        reader.onloadend = () => setFormData(prev => ({ ...prev, mainImage: reader.result }));
        reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) set(ref(db, `content/categories/products/${editingId}`), formData);
    else push(ref(db, "content/categories/products"), formData);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
      if(window.confirm("Устгах уу?")) remove(ref(db, `content/categories/products/${id}`));
  };

  const calculatePercent = (p, op) => {
      const price = parseFloat(p.replace(/,/g, ''));
      const old = parseFloat(op.replace(/,/g, ''));
      if(old > 0) setFormData(prev => ({ ...prev, discount: Math.round(((old - price) / old) * 100) }));
  }

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-900">Энгийн Бараа</h1>
        <div className="flex gap-3">
            <input type="text" placeholder="Хайх..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border rounded-xl px-3 py-2 text-sm outline-none"/>
            <button onClick={() => { setEditingId(null); setFormData({name: '', store: '', category: mainCategories[0]?.id || '', subCategory: '', originalPrice: '', price: '', discount: '', mainImage: '', description: ''}); setIsModalOpen(true); }} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition">
            <Plus size={20} /> Бараа нэмэх
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-5">Зураг</th>
                <th className="p-5">Нэр & Дэлгүүр</th>
                <th className="p-5">Ангилал</th>
                <th className="p-5">Үнэ</th>
                <th className="p-5 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-5">
                    <div className="w-14 h-14 rounded-lg bg-slate-100 border overflow-hidden">
                      {item.mainImage ? <img src={item.mainImage} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={20}/></div>}
                    </div>
                  </td>
                  <td className="p-5">
                     <p className="font-bold text-slate-900">{item.name}</p>
                     <p className="text-xs text-slate-500 mt-1">{item.store}</p>
                  </td>
                  <td className="p-5"><span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold">{item.category} / {subCategories.find(s=>s.id===item.subCategory)?.name}</span></td>
                  <td className="p-5"><div className="font-bold text-slate-800">{item.price}₮</div><span className="text-xs text-green-600 font-bold">-{item.discount}%</span></td>
                  <td className="p-5 text-right">
                    <button onClick={() => { setEditingId(item.id); setFormData(item); setIsModalOpen(true); }} className="p-2 text-blue-600 bg-blue-50 rounded-lg mr-2"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-600 bg-rose-50 rounded-lg"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl p-6 space-y-6 overflow-y-auto max-h-[90vh]">
            <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Бараа засах' : 'Бараа нэмэх'}</h3>
            <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                   <div className="md:col-span-1">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Зураг</label>
                     <div className="w-full aspect-square border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative flex items-center justify-center overflow-hidden">
                       {formData.mainImage ? <img src={formData.mainImage} className="w-full h-full object-cover" /> : <Upload className="text-slate-400"/>}
                       <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                     </div>
                   </div>
                   <div className="md:col-span-3 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Үндсэн Ангилал</label>
                                <select required className="w-full border p-2.5 rounded-xl" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value, subCategory: ''})}>
                                    <option value="">Сонгох...</option>
                                    {mainCategories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Дэд Ангилал</label>
                                <select className="w-full border p-2.5 rounded-xl" value={formData.subCategory} onChange={(e) => setFormData({...formData, subCategory: e.target.value})} disabled={!formData.category}>
                                    <option value="">Сонгох...</option>
                                    {availableSubCats.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input type="text" required className="w-full border p-2.5 rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Барааны нэр" />
                            <input type="text" required className="w-full border p-2.5 rounded-xl" value={formData.store} onChange={(e) => setFormData({...formData, store: e.target.value})} placeholder="Дэлгүүр" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <input type="text" required className="w-full border p-2.5 rounded-xl" value={formData.originalPrice} onChange={(e) => { setFormData({...formData, originalPrice: e.target.value}); calculatePercent(formData.price, e.target.value); }} placeholder="Үндсэн үнэ" />
                            <input type="text" required className="w-full border p-2.5 rounded-xl text-rose-600 font-bold" value={formData.price} onChange={(e) => { setFormData({...formData, price: e.target.value}); calculatePercent(e.target.value, formData.originalPrice); }} placeholder="Хямдарсан үнэ" />
                            <input type="number" className="w-full border p-2.5 rounded-xl bg-slate-50" value={formData.discount} readOnly placeholder="%" />
                        </div>
                   </div>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Тайлбар</label>
                    <textarea className="w-full border p-2.5 rounded-xl h-20" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
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

export default RegularProductsPage;