import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Search, 
  Zap, Shirt, Home, Smile, Dumbbell, Baby, 
  Car, Book, Coffee, Monitor, Smartphone, Watch, Loader2, Layers 
} from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set, remove } from "firebase/database";

const MainCategoriesPage = () => {
  const AVAILABLE_ICONS = [
    { id: 'Zap', icon: Zap }, { id: 'Shirt', icon: Shirt }, { id: 'Home', icon: Home },
    { id: 'Smile', icon: Smile }, { id: 'Dumbbell', icon: Dumbbell }, { id: 'Baby', icon: Baby },
    { id: 'Car', icon: Car }, { id: 'Book', icon: Book }, { id: 'Coffee', icon: Coffee },
    { id: 'Monitor', icon: Monitor }, { id: 'Smartphone', icon: Smartphone }, { id: 'Watch', icon: Watch },
    { id: 'Layers', icon: Layers }
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  const [formData, setFormData] = useState({ id: '', name: '', icon: 'Zap', status: 'Active' });

  useEffect(() => {
    const query = ref(db, "content/categories/main");
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (data) setCategories(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      else setCategories([]);
      setLoading(false);
    });
  }, []);

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderIcon = (iconName) => {
    const IconComp = AVAILABLE_ICONS.find(i => i.id === iconName)?.icon || Zap;
    return <IconComp size={20} />;
  };

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ id: '', name: '', icon: 'Zap', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setFormData(cat);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Устгахдаа итгэлтэй байна уу?")) {
      remove(ref(db, `content/categories/main/${id}`));
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.id.trim()) return alert("ID оруулна уу");
    const categoryRef = ref(db, `content/categories/main/${formData.id}`);
    set(categoryRef, {
      name: formData.name,
      icon: formData.icon,
      status: formData.status
    });
    setIsModalOpen(false);
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Үндсэн Ангилал</h1>
          <p className="text-slate-500">Системийн үндсэн цэснүүд.</p>
        </div>
        <button onClick={handleAddNew} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition">
          <Plus size={20} /> Шинэ ангилал
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-5 text-center">Icon</th>
                <th className="p-5">ID</th>
                <th className="p-5">Нэр</th>
                <th className="p-5">Төлөв</th>
                <th className="p-5 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50">
                  <td className="p-5 text-center"><div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-600">{renderIcon(cat.icon)}</div></td>
                  <td className="p-5 font-mono text-slate-500 font-bold">{cat.id}</td>
                  <td className="p-5 font-bold text-slate-900">{cat.name}</td>
                  <td className="p-5"><span className={`px-3 py-1 rounded-full text-xs font-bold ${cat.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{cat.status}</span></td>
                  <td className="p-5 text-right">
                    <button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6">
            <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Ангилал засах' : 'Шинэ ангилал'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">ID (Code)</label>
                  <input type="text" required className="w-full border p-2.5 rounded-xl uppercase" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value.toUpperCase()})} readOnly={!!editingId} placeholder="TECH"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Нэр</label>
                  <input type="text" required className="w-full border p-2.5 rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Технологи"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Icon</label>
                  <div className="grid grid-cols-7 gap-2">
                    {AVAILABLE_ICONS.map((item) => (
                      <div key={item.id} onClick={() => setFormData({...formData, icon: item.id})} className={`aspect-square rounded-lg flex items-center justify-center cursor-pointer border ${formData.icon === item.id ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-slate-200'}`}>
                        <item.icon size={20} />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2"><input type="radio" name="status" value="Active" checked={formData.status === 'Active'} onChange={(e) => setFormData({...formData, status: e.target.value})}/> Идэвхтэй</label>
                    <label className="flex items-center gap-2"><input type="radio" name="status" value="Inactive" checked={formData.status === 'Inactive'} onChange={(e) => setFormData({...formData, status: e.target.value})}/> Идэвхгүй</label>
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

export default MainCategoriesPage;