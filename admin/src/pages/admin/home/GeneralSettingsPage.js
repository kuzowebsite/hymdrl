import React, { useState, useEffect } from 'react';
import { 
  Save, Upload, Globe, Mail, Phone, MapPin, 
  Facebook, Instagram, Image as ImageIcon, CheckCircle, Loader2 
} from 'lucide-react';
import { db } from '../../../firebase';
import { ref, onValue, set } from "firebase/database";

const GeneralSettingsPage = () => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    siteName: '', siteDescription: '', footerText: '',
    email: '', phone: '', address: '',
    facebook: '', instagram: '',
    logo: '', favicon: ''
  });

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const query = ref(db, "content/general");
    return onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setFormData(data);
      }
      setDataLoading(false);
    });
  }, []);

  // --- HANDLERS ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) { 
         alert("Зургийн хэмжээ 1MB-аас бага байх ёстой."); return; 
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setLoading(true);
    // Save directly to 'content/general'
    set(ref(db, "content/general"), formData)
      .then(() => {
        setLoading(false);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      })
      .catch((err) => {
        alert("Алдаа гарлаа: " + err.message);
        setLoading(false);
      });
  };

  if (dataLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Уншиж байна...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-20 relative">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900">Үндсэн тохиргоо</h1>
          <p className="text-slate-500 mt-1">Сайтын ерөнхий мэдээлэл болон логог энд удирдана.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-rose-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-rose-700 transition shadow-lg shadow-rose-200 disabled:opacity-70"
        >
          {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20} />}
          <span>{loading ? 'Хадгалж байна...' : 'Хадгалах'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          {/* SITE IDENTITY */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <Globe className="text-rose-500" size={20} /> Сайтын мэдээлэл
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Сайтын нэр</label>
                <input type="text" name="siteName" value={formData.siteName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-rose-500 focus:bg-white outline-none transition" placeholder="Hyamdral.mn"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Тайлбар</label>
                <textarea name="siteDescription" value={formData.siteDescription} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-rose-500 focus:bg-white outline-none transition h-24 resize-none" placeholder="Сайтын тухай..."/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Footer Текст</label>
                <input type="text" name="footerText" value={formData.footerText} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-rose-500 focus:bg-white outline-none transition"/>
              </div>
            </div>
          </div>

          {/* CONTACT INFO */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <Phone className="text-blue-500" size={20} /> Холбоо барих
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Mail size={14} /> Имэйл</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-rose-500 outline-none transition"/>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><Phone size={14} /> Утас</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-rose-500 outline-none transition"/>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2"><MapPin size={14} /> Хаяг</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:border-rose-500 outline-none transition"/>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          {/* LOGO UPLOAD */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-6 flex items-center gap-2">
              <ImageIcon className="text-purple-500" size={20} /> Брэнд / Лого
            </h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Үндсэн Лого</label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition relative">
                  {formData.logo ? (
                    <img src={formData.logo} alt="Logo" className="h-20 object-contain" />
                  ) : (
                    <div className="text-center py-4 text-slate-400"><Upload className="mx-auto mb-2" /><span className="text-xs">Зураг оруулах</span></div>
                  )}
                  <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'logo')} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Favicon</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center bg-slate-50 relative overflow-hidden">
                    {formData.favicon ? <img src={formData.favicon} alt="Favicon" className="w-8 h-8 object-contain" /> : <Globe className="text-slate-300" />}
                    <input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'favicon')} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL MEDIA */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-6">Сошиал суваг</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><Facebook size={18} /></div>
                <input type="text" name="facebook" value={formData.facebook} onChange={handleChange} placeholder="Facebook URL" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"/>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-pink-100 p-2 rounded-lg text-pink-600"><Instagram size={18} /></div>
                <input type="text" name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Instagram URL" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none"/>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TOAST */}
      <div className={`fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 transform ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <CheckCircle className="text-green-400" size={24} />
        <div>
          <h4 className="font-bold">Амжилттай хадгалагдлаа!</h4>
          <p className="text-xs text-slate-400">Сайтын тохиргоо шинэчлэгдлээ.</p>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;