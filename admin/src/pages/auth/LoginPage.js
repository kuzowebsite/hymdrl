import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, AlertCircle, Zap, Loader2 } from 'lucide-react';
import { auth } from '../../firebase';
import { signInWithEmailAndPassword } from "firebase/auth";

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;
      
      // Token хадгалах (Authentication Guard-д ашиглана)
      localStorage.setItem('adminToken', user.accessToken); 
      
      navigate('/admin');
    } catch (err) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Имэйл эсвэл нууц үг буруу байна.');
      } else {
        setError('Нэвтрэхэд алдаа гарлаа: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-600 text-white mb-4">
            <Zap size={24} fill="currentColor"/>
          </div>
          <h2 className="text-2xl font-black text-white">Админ Нэвтрэх</h2>
          <p className="text-slate-400 text-sm mt-2">Hyamdral.mn удирдлагын хэсэг</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Имэйл</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                <input 
                  type="email" required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-rose-500 outline-none transition"
                  placeholder="admin@hyamdral.mn"
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm focus:border-rose-500 outline-none transition"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input type="checkbox" className="accent-rose-600 w-4 h-4 rounded" />
                Намайг сана
              </label>
              <a href="#" className="text-rose-600 font-bold hover:underline">Нууц үг мартсан?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={20}/> : <>Нэвтрэх <LogIn size={20}/></>}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-500">
            Админ эрх байхгүй юу? <Link to="/register" className="text-rose-600 font-bold hover:underline">Бүртгүүлэх</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;