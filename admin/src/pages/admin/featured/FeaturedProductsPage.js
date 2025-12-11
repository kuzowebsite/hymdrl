import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Image as ImageIcon, 
  Upload, Search, Store, Percent, ShieldCheck, Truck, Loader2 
} from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set, push, remove } from "firebase/database";

const FeaturedProductsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    name: '', store: '', originalPrice: '', price: '', discount: '', 
    mainImage: '', gallery: [], description: '', warranty: '', delivery: ''
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const query = ref(db, "content/featured/products");
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map(key => ({ 
            id: key, 
            ...data[key],
            gallery: data[key].gallery || [] // Ensure gallery is array
        }));
        setProducts(list);
      } else {
        setProducts([]);
      }
      setLoading(false);
    });
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculatePercent = (price, originalPrice) => {
    const p = parseFloat(price.replace(/,/g, ''));
    const op = parseFloat(originalPrice.replace(/,/g, ''));
    if (!isNaN(p) && !isNaN(op) && op > 0) {
      const percent = Math.round(((op - p) / op) * 100);
      setFormData(prev => ({ ...prev, discount: percent }));
    }
  };

  // --- HANDLERS ---
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      name: '', store: '', originalPrice: '', price: '', discount: '', 
      mainImage: '', gallery: [], description: '', warranty: '', delivery: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({ ...product, gallery: product.gallery || [] });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Устгахдаа итгэлтэй байна уу?")) {
      remove(ref(db, `content/featured/products/${id}`));
    }
  };

  const handleMainImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { alert("1MB limit"); return; }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, mainImage: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleGalleryUpload = (e) => {
    const file = e.target.files[0];
    if (file && formData.gallery.length < 6) {
      if (file.size > 1048576) { alert("1MB limit"); return; }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, gallery: [...prev.gallery, reader.result] }));
      reader.readAsDataURL(file);
    } else if (formData.gallery.length >= 6) {
      alert("Дээд тал нь 6 зураг оруулах боломжтой.");
    }
  };

  const removeGalleryImage = (index) => {
    const newGallery = formData.gallery.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, gallery: newGallery }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      set(ref(db, `content/featured/products/${editingId}`), formData);
    } else {
      const newRef = push(ref(db, "content/featured/products"));
      set(newRef, formData);
    }
    setIsModalOpen(false);
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Уншиж байна...</div>;

  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Онцлох Бараа</h1>
          <p className="text-slate-500 mt-1">Онцлох хэсэгт харагдах бүтээгдэхүүнүүдийг энд удирдана.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
             <Search className="absolute left-3 top-2.5 text-slate-400 w-5 h-5" />
             <input type="text" placeholder="Бараа хайх..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none shadow-sm"/>
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
                <th className="p-5">Зураг</th>
                <th className="p-5">Барааны нэр</th>
                <th className="p-5">Дэлгүүр</th>
                <th className="p-5">Үнэ / Хямдрал</th>
                <th className="p-5">Цомог</th>
                <th className="p-5 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition">
                  <td className="p-5">
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                      {item.mainImage ? <img src={item.mainImage} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon size={20}/></div>}
                    </div>
                  </td>
                  <td className="p-5 font-bold text-slate-900 max-w-[200px] truncate">{item.name}</td>
                  <td className="p-5 text-slate-600">{item.store}</td>
                  <td className="p-5">
                     <div className="font-bold text-rose-600">{item.price}₮</div>
                     <div className="text-xs text-slate-400 line-through">{item.originalPrice}₮</div>
                     <div className="text-xs font-bold text-green-600 mt-1">{item.discount}% Off</div>
                  </td>
                  <td className="p-5"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">{item.gallery ? item.gallery.length : 0} / 6</span></td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(item)} className="p-2 bg-slate-100 text-blue-600 hover:bg-blue-100 rounded-lg transition"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(item.id)} className="p-2 bg-slate-100 text-rose-600 hover:bg-rose-50 rounded-lg transition"><Trash2 size={18}/></button>
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
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[95vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Бараа засах' : 'Бараа нэмэх'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-8">
              <form id="product-form" onSubmit={handleSave} className="space-y-8">
                <div>
                   <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2"><ImageIcon size={20} className="text-rose-600"/> Зургийн цомог</h4>
                   <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="md:col-span-1">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Үндсэн зураг</label>
                        <div className="w-full aspect-square border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden group hover:border-rose-400 transition-colors flex items-center justify-center">
                          {formData.mainImage ? <img src={formData.mainImage} alt="Main" className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><Upload className="mx-auto mb-1" size={20}/><span className="text-xs">Сонгох</span></div>}
                          <input type="file" accept="image/*" onChange={handleMainImageUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                      <div className="md:col-span-3">
                         <div className="flex justify-between items-center mb-2"><label className="block text-xs font-bold text-slate-500 uppercase">Нэмэлт зураг ({formData.gallery.length}/6)</label></div>
                         <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                            {formData.gallery.map((img, idx) => (
                              <div key={idx} className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden group">
                                 <img src={img} alt="" className="w-full h-full object-cover" />
                                 <button type="button" onClick={() => removeGalleryImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"><X size={12}/></button>
                              </div>
                            ))}
                            {formData.gallery.length < 6 && (
                              <div className="aspect-square border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex items-center justify-center relative hover:border-rose-400 transition-colors cursor-pointer text-slate-400 hover:text-rose-500">
                                 <Plus size={24} /> <input type="file" accept="image/*" onChange={handleGalleryUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                              </div>
                            )}
                         </div>
                      </div>
                   </div>
                </div>
                <div>
                   <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2"><Store size={20} className="text-blue-600"/> Үндсэн мэдээлэл</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Барааны нэр</label><input type="text" required className="w-full border p-2.5 rounded-xl text-sm" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Дэлгүүрийн нэр</label><input type="text" required className="w-full border p-2.5 rounded-xl text-sm" value={formData.store} onChange={(e) => setFormData({...formData, store: e.target.value})} /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1">Үндсэн үнэ</label><input type="text" required className="w-full border p-2.5 rounded-xl text-sm" value={formData.originalPrice} onChange={(e) => { setFormData({...formData, originalPrice: e.target.value}); calculatePercent(formData.price, e.target.value); }} /></div>
                      <div className="flex gap-4">
                         <div className="flex-1"><label className="block text-sm font-bold text-slate-700 mb-1">Хямдарсан үнэ</label><input type="text" required className="w-full border p-2.5 rounded-xl text-sm font-bold text-rose-600" value={formData.price} onChange={(e) => { setFormData({...formData, price: e.target.value}); calculatePercent(e.target.value, formData.originalPrice); }} /></div>
                         <div className="w-24"><label className="block text-sm font-bold text-slate-700 mb-1">%</label><div className="relative"><Percent className="absolute left-2 top-2.5 text-slate-400" size={14} /><input type="number" className="w-full border pl-7 p-2.5 rounded-xl text-sm bg-slate-50" value={formData.discount} readOnly /></div></div>
                      </div>
                   </div>
                </div>
                <div>
                   <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2"><ShieldCheck size={20} className="text-green-600"/> Дэлгэрэнгүй мэдээлэл</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-4">
                      <div><label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><ShieldCheck size={14}/> Баталгаа</label><input type="text" className="w-full border p-2.5 rounded-xl text-sm" value={formData.warranty} onChange={(e) => setFormData({...formData, warranty: e.target.value})} /></div>
                      <div><label className="block text-sm font-bold text-slate-700 mb-1 flex items-center gap-1"><Truck size={14}/> Хүргэлт</label><input type="text" className="w-full border p-2.5 rounded-xl text-sm" value={formData.delivery} onChange={(e) => setFormData({...formData, delivery: e.target.value})} /></div>
                   </div>
                   <div><label className="block text-sm font-bold text-slate-700 mb-1">Дэлгэрэнгүй тайлбар</label><textarea className="w-full border p-3 rounded-xl text-sm h-24 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">Болих</button>
              <button type="submit" form="product-form" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2"><Save size={18} /> Хадгалах</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedProductsPage;