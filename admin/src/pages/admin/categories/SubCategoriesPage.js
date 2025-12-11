import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, Filter, Search, Loader2, Layers } from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set, push, remove } from "firebase/database";

const SubCategoriesPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const [subCategories, setSubCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [formData, setFormData] = useState({ name: '', parentId: '', status: 'Active' });

  useEffect(() => {
    onValue(ref(db, "content/categories/sub"), (snapshot) => {
      const data = snapshot.val();
      setSubCategories(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
      setLoading(false);
    });
    onValue(ref(db, "content/categories/main"), (snapshot) => {
      const data = snapshot.val();
      setParentCategories(data ? Object.keys(data).map(key => ({ id: key, ...data[key] })) : []);
    });
  }, []);

  const getParentName = (id) => parentCategories.find(p => p.id === id)?.name || id;

  const filteredList = subCategories.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterCategory === 'All' || item.parentId === filterCategory;
    return matchesSearch && matchesFilter;
  });

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', parentId: parentCategories[0]?.id || '', status: 'Active' });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) set(ref(db, `content/categories/sub/${editingId}`), formData);
    else push(ref(db, "content/categories/sub"), formData);
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if(window.confirm("Устгах уу?")) remove(ref(db, `content/categories/sub/${id}`));
  }

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/></div>;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-slate-900">Барааны Ангилал</h1>
        <div className="flex gap-3">
            <select className="border rounded-xl px-3 text-sm outline-none" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="All">Бүгд</option>
                {parentCategories.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={handleAddNew} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition">
            <Plus size={20} /> Шинэ дэд ангилал
            </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-5">Нэр</th>
                <th className="p-5">Харьяа</th>
                <th className="p-5">Төлөв</th>
                <th className="p-5 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-5 font-bold text-slate-900">{item.name}</td>
                  <td className="p-5"><span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">{getParentName(item.parentId)}</span></td>
                  <td className="p-5"><span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>{item.status}</span></td>
                  <td className="p-5 text-right">
                    <button onClick={() => { setEditingId(item.id); setFormData(item); setIsModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg mr-2"><Edit size={18}/></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={18}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 space-y-6">
            <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Засах' : 'Нэмэх'}</h3>
            <form onSubmit={handleSave} className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Үндсэн Ангилал</label>
                    <select required className="w-full border p-2.5 rounded-xl" value={formData.parentId} onChange={(e) => setFormData({...formData, parentId: e.target.value})}>
                        {parentCategories.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Нэр</label>
                    <input type="text" required className="w-full border p-2.5 rounded-xl" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Утас"/>
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

export default SubCategoriesPage;