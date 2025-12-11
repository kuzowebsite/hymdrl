import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Image as ImageIcon, 
  Upload, Link as LinkIcon, Search, ExternalLink, Globe, Loader2 
} from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set, push, remove } from "firebase/database";

const PartnerStoresPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const [partners, setPartners] = useState([]);
  const [formData, setFormData] = useState({ name: '', link: '', logo: '' });

  // --- FETCH DATA ---
  useEffect(() => {
    const query = ref(db, "content/home/partners");
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPartners(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      } else {
        setPartners([]);
      }
      setLoading(false);
    });
  }, []);

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- HANDLERS ---
  const handleAddNew = () => {
    setEditingId(null);
    setFormData({ name: '', link: '', logo: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (partner) => {
    setEditingId(partner.id);
    setFormData(partner);
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Устгахдаа итгэлтэй байна уу?")) {
      remove(ref(db, `content/home/partners/${id}`));
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { alert("1MB limit"); return; }
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, logo: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingId) {
      set(ref(db, `content/home/partners/${editingId}`), formData);
    } else {
      const newRef = push(ref(db, "content/home/partners"));
      set(newRef, formData);
    }
    setIsModalOpen(false);
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Уншиж байна...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Хамтрагч дэлгүүрүүд</h1>
          <p className="text-slate-500 mt-1">Сайтын доод хэсэгт харагдах логонуудыг энд удирдана.</p>
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
                <th className="p-5 w-24 text-center">Лого</th>
                <th className="p-5">Дэлгүүрийн нэр</th>
                <th className="p-5">Сайт (Линк)</th>
                <th className="p-5 text-right">Үйлдэл</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPartners.map((partner) => (
                <tr key={partner.id} className="hover:bg-slate-50 transition">
                  <td className="p-5 text-center">
                    <div className="w-12 h-12 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-2 shadow-sm">
                      {partner.logo ? <img src={partner.logo} alt={partner.name} className="w-full h-full object-contain" /> : <span className="font-bold text-slate-400 text-xs">{partner.name.charAt(0)}</span>}
                    </div>
                  </td>
                  <td className="p-5 font-bold text-slate-900 text-base">{partner.name}</td>
                  <td className="p-5">
                     <a href={partner.link} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 font-medium bg-blue-50 px-3 py-1 rounded-lg w-fit">
                       <Globe size={14} /> {partner.link} <ExternalLink size={12} />
                     </a>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEdit(partner)} className="p-2 bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition"><Edit size={18}/></button>
                      <button onClick={() => handleDelete(partner.id)} className="p-2 bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition"><Trash2 size={18}/></button>
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
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Дэлгүүр засах' : 'Дэлгүүр нэмэх'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div className="flex justify-center">
                 <div className="relative group">
                    <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden">
                       {formData.logo ? <img src={formData.logo} alt="Preview" className="w-full h-full object-contain p-2" /> : <div className="text-center text-slate-400"><ImageIcon className="mx-auto" size={24} /><span className="text-[10px] mt-1 block">Лого</span></div>}
                    </div>
                    <label className="absolute bottom-0 right-0 p-2 bg-rose-600 rounded-full text-white cursor-pointer shadow-md hover:bg-rose-700 transition">
                       <Upload size={14} /><input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                 </div>
              </div>
              <div className="space-y-4">
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Дэлгүүрийн нэр</label><input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Сайт руу үсрэх линк</label>
                  <div className="relative"><LinkIcon size={16} className="absolute left-4 top-3.5 text-slate-400" /><input type="url" required className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none" value={formData.link} onChange={(e) => setFormData({...formData, link: e.target.value})} /></div>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition">Болих</button>
                <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition flex items-center gap-2"><Save size={18} /> Хадгалах</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnerStoresPage;