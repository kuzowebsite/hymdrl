import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, Loader2 } from 'lucide-react';
import { auth, db } from '../../firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { ref, set } from "firebase/database";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Нууц үг таарахгүй байна.');
      return;
    }

    setLoading(true);
    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Save additional info (Name, Role) to Realtime Database
      await set(ref(db, 'users/' + user.uid), {
        name: formData.name,
        email: formData.email,
        role: 'admin', // Default role
        createdAt: new Date().toISOString()
      });

      alert("Амжилттай бүртгэгдлээ! Одоо нэвтэрнэ үү.");
      navigate('/login');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Энэ имэйл хаяг бүртгэлтэй байна.');
      } else if (err.code === 'auth/weak-password') {
        setError('Нууц үг хэтэрхий сул байна (хамгийн багадаа 6 тэмдэгт).');
      } else {
        setError('Бүртгүүлэхэд алдаа гарлаа: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-500 text-white mb-4">
            <UserPlus size={24} />
          </div>
          <h2 className="text-2xl font-black text-white">Админ Бүртгэл</h2>
          <p className="text-slate-400 text-sm mt-2">Шинэ админ эрх үүсгэх</p>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Нэр</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="text" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-rose-500 outline-none"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Имэйл</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="email" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-rose-500 outline-none"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Нууц үг</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="password" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-rose-500 outline-none"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Нууц үг давтах</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="password" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-rose-500 outline-none"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20}/> : 'Бүртгүүлэх'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Бүртгэлтэй юу? <Link to="/login" className="text-slate-900 font-bold hover:underline">Нэвтрэх</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;