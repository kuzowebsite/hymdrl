import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Image as ImageIcon, 
  Upload, Link as LinkIcon, Zap, Clock, Calendar, Percent, Loader2 
} from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set, push, remove } from "firebase/database";

const FlashSalePage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [sales, setSales] = useState([]);
  const [formData, setFormData] = useState({
    title: '', description: '', bgImage: '', endDate: '',
    productName: '', productImage: '', oldPrice: '', price: '', 
    discountPercent: '', stock: '', link: ''
  });

  // --- FETCH DATA ---
  useEffect(() => {
    const query = ref(db, "content/home/flashSales");
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSales(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setSales([]);
      }
      setLoading(false);
    });
  }, []);

  // --- HANDLERS ---
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      title: '', description: '', bgImage: '', endDate: '',
      productName: '', productImage: '', oldPrice: '', price: '', 
      discountPercent: '', stock: '', link: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Устгахдаа итгэлтэй байна уу?")) {
      remove(ref(db, `content/home/flashSales/${id}`));
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

  const calculatePercent = (price, oldPrice) => {
    const p = parseFloat(price.replace(/,/g, ''));
    const op = parseFloat(oldPrice.replace(/,/g, ''));
    if (!isNaN(p) && !isNaN(op) && op > 0) {
      const percent = Math.round(((op - p) / op) * 100);
      setFormData(prev => ({ ...prev, discountPercent: percent }));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      set(ref(db, `content/home/flashSales/${editingId}`), formData);
    } else {
      const newRef = push(ref(db, "content/home/flashSales"));
      set(newRef, formData);
    }
    setIsModalOpen(false);
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Уншиж байна...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Хямдралын зар (Flash Sale)</h1>
          <p className="text-slate-500 mt-1">Нүүр хуудсан дээрх цагтай урамшууллын хэсэг.</p>
        </div>
        <button onClick={handleAddNew} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition shadow-lg shadow-rose-200"><Plus size={20} /> Шинэ зар нэмэх</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {sales.map((sale) => (
          <div key={sale.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group">
            <div className="h-64 relative bg-slate-900">
               {sale.bgImage && <img src={sale.bgImage} alt="BG" className="w-full h-full object-cover opacity-60" />}
               <div className="absolute inset-0 p-6 flex justify-between items-center text-white">
                  <div className="flex-1 pr-4">
                     <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur px-2 py-1 rounded text-xs font-bold mb-2"><Zap size={12} fill="currentColor"/> FLASH SALE</div>
                     <h3 className="text-2xl font-black leading-tight whitespace-pre-line mb-2">{sale.title}</h3>
                     <p className="text-white/80 text-xs line-clamp-2">{sale.description}</p>
                     <div className="mt-4 flex items-center gap-2 text-sm font-bold bg-black/40 w-fit px-3 py-1.5 rounded-lg"><Clock size={16} className="text-yellow-400" /><span>Дуусах: {new Date(sale.endDate).toLocaleDateString()}</span></div>
                  </div>
                  <div className="w-32 bg-white text-slate-900 rounded-xl p-2 shadow-lg rotate-3 group-hover:rotate-0 transition duration-300 flex-shrink-0">
                     <div className="h-24 bg-gray-100 rounded-lg mb-2 overflow-hidden">{sale.productImage && <img src={sale.productImage} alt="Product" className="w-full h-full object-cover" />}</div>
                     <div className="text-center"><p className="text-[10px] font-bold text-rose-600">-{sale.discountPercent}%</p><p className="font-bold text-xs truncate">{sale.productName}</p><p className="text-xs font-black">{sale.price}₮</p></div>
                  </div>
               </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
               <div className="flex items-center gap-4 text-xs text-slate-500 font-medium"><span className="flex items-center gap-1"><LinkIcon size={14}/> {sale.link}</span><span className="flex items-center gap-1"><Zap size={14}/> {sale.stock} ш үлдсэн</span></div>
               <div className="flex gap-2"><button onClick={() => handleEdit(sale)} className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 rounded-lg transition"><Edit size={18}/></button><button onClick={() => handleDelete(sale.id)} className="p-2 bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 rounded-lg transition"><Trash2 size={18}/></button></div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Зар засах' : 'Зар нэмэх'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            <div className="overflow-y-auto p-8">
              <form id="flash-sale-form" onSubmit={handleSave} className="space-y-8">
                <div>
                   <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2"><ImageIcon size={20} className="text-rose-600"/> Панел / Баннер</h4>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Дэвсгэр зураг</label>
                        <div className="w-full h-40 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden group hover:border-rose-400 transition-colors flex items-center justify-center">
                          {formData.bgImage ? <img src={formData.bgImage} alt="BG Preview" className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><Upload className="mx-auto mb-1" size={20}/><span className="text-xs">Арын зураг оруулах</span></div>}
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'bgImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                      <div className="space-y-4">
                         <div><label className="block text-sm font-bold text-slate-700 mb-1">Гарчиг</label><input type="text" required className="w-full border p-2.5 rounded-xl text-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></div>
                         <div><label className="block text-sm font-bold text-slate-700 mb-1">Тайлбар</label><textarea className="w-full border p-2.5 rounded-xl text-sm h-20 resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></div>
                      </div>
                   </div>
                   <div className="mt-4"><label className="block text-sm font-bold text-slate-700 mb-1">Дуусах хугацаа</label><div className="relative"><Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} /><input type="datetime-local" required className="w-full md:w-1/2 border pl-10 p-2.5 rounded-xl text-sm" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})}/></div></div>
                </div>
                <div>
                   <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2"><Zap size={20} className="text-yellow-500"/> Бүтээгдэхүүний мэдээлэл</h4>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-1">
                        <label className="block text-sm font-bold text-slate-700 mb-2">Барааны зураг</label>
                        <div className="w-full h-48 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 relative overflow-hidden group hover:border-rose-400 transition-colors flex items-center justify-center">
                          {formData.productImage ? <img src={formData.productImage} alt="Preview" className="w-full h-full object-cover" /> : <div className="text-center text-slate-400"><Upload className="mx-auto mb-1" size={20}/><span className="text-xs">Барааны зураг</span></div>}
                          <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'productImage')} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                      </div>
                      <div className="md:col-span-2 grid grid-cols-2 gap-4">
                         <div className="col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">Барааны нэр</label><input type="text" required className="w-full border p-2.5 rounded-xl text-sm" value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} /></div>
                         <div><label className="block text-sm font-bold text-slate-700 mb-1">Үндсэн үнэ</label><input type="text" required className="w-full border p-2.5 rounded-xl text-sm" value={formData.oldPrice} onChange={(e) => { setFormData({...formData, oldPrice: e.target.value}); calculatePercent(formData.price, e.target.value); }} /></div>
                         <div><label className="block text-sm font-bold text-slate-700 mb-1">Хямдарсан үнэ</label><input type="text" required className="w-full border p-2.5 rounded-xl text-sm font-bold text-rose-600" value={formData.price} onChange={(e) => { setFormData({...formData, price: e.target.value}); calculatePercent(e.target.value, formData.oldPrice); }} /></div>
                         <div><label className="block text-sm font-bold text-slate-700 mb-1">Хямдрал %</label><div className="relative"><Percent className="absolute left-3 top-2.5 text-slate-400" size={16} /><input type="number" className="w-full border pl-9 p-2.5 rounded-xl text-sm" value={formData.discountPercent} onChange={(e) => setFormData({...formData, discountPercent: e.target.value})} placeholder="Auto calc" /></div></div>
                         <div><label className="block text-sm font-bold text-slate-700 mb-1">Тоо ширхэг</label><input type="number" required className="w-full border p-2.5 rounded-xl text-sm" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} /></div>
                         <div className="col-span-2"><label className="block text-sm font-bold text-slate-700 mb-1">Сайт руу үсрэх линк</label><div className="relative"><LinkIcon className="absolute left-3 top-2.5 text-slate-400" size={16} /><input type="url" required className="w-full border pl-9 p-2.5 rounded-xl text-sm" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} /></div></div>
                      </div>
                   </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">Болих</button>
              <button type="submit" form="flash-sale-form" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2"><Save size={18} /> Хадгалах</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashSalePage;