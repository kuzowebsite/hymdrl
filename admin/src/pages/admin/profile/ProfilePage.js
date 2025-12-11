import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Camera, Save, Key, Shield, CheckCircle, Loader2 
} from 'lucide-react';
import { auth, db } from '../../../firebase';
import { updatePassword, updateProfile, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { ref, onValue, update } from "firebase/database";

const ProfilePage = () => {
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // User Info State
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    role: 'Admin',
    avatar: ''
  });

  // Password State
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const currentUser = auth.currentUser;

  // --- 1. FETCH USER DATA ---
  useEffect(() => {
    if (currentUser) {
      const userRef = ref(db, `users/${currentUser.uid}`);
      onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setUserInfo({
            name: data.name || currentUser.displayName || '',
            email: currentUser.email || '',
            role: data.role || 'Admin',
            avatar: data.avatar || currentUser.photoURL || ''
          });
        }
        setDataLoading(false);
      });
    } else {
        setDataLoading(false);
    }
  }, [currentUser]);

  // --- HANDLERS ---

  // 1. Image Upload (Base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 1048576) { // 1MB limit
          alert("Зургийн хэмжээ 1MB-аас бага байх ёстой.");
          return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result;
        setUserInfo(prev => ({ ...prev, avatar: base64 }));
        
        // Update immediately in DB
        if (currentUser) {
            await update(ref(db, `users/${currentUser.uid}`), { avatar: base64 });
            // Optional: Update Auth Profile
            await updateProfile(currentUser, { photoURL: base64 });
            showSuccess('Профайл зураг шинэчлэгдлээ!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Info Update (Name only, Email update is complex in Firebase)
  const handleInfoUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        if (currentUser) {
            // Update in DB
            await update(ref(db, `users/${currentUser.uid}`), { 
                name: userInfo.name 
            });
            // Update Auth Profile
            await updateProfile(currentUser, { displayName: userInfo.name });
            
            showSuccess('Мэдээлэл амжилттай хадгалагдлаа.');
        }
    } catch (error) {
        alert("Алдаа: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  // 3. Password Update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("Шинэ нууц үг таарахгүй байна!");
      return;
    }
    if (!passwords.current) {
        alert("Одоогийн нууц үгээ оруулна уу.");
        return;
    }

    setLoading(true);
    try {
      if (currentUser && currentUser.email) {
          // 1. Re-authenticate user (Required for sensitive actions)
          const credential = EmailAuthProvider.credential(currentUser.email, passwords.current);
          await reauthenticateWithCredential(currentUser, credential);

          // 2. Update Password
          await updatePassword(currentUser, passwords.new);
          
          setPasswords({ current: '', new: '', confirm: '' });
          showSuccess('Нууц үг амжилттай солигдлоо.');
      }
    } catch (error) {
        if(error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
            alert("Одоогийн нууц үг буруу байна.");
        } else {
            alert("Алдаа: " + error.message);
        }
    } finally {
        setLoading(false);
    }
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  if (dataLoading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto"/> Уншиж байна...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-20">
      
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900">Профайл тохиргоо</h1>
        <p className="text-slate-500 mt-1">Хувийн мэдээлэл болон нууц үгээ энд удирдана.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: PROFILE CARD */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col items-center text-center">
            
            <div className="relative group cursor-pointer mb-4">
              <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                {userInfo.avatar ? (
                  <img src={userInfo.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={48} className="text-slate-300" />
                )}
              </div>
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white" size={24} />
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
            </div>

            <h2 className="text-xl font-bold text-slate-900">{userInfo.name || "Нэргүй"}</h2>
            <p className="text-slate-500 text-sm mb-4">{userInfo.email}</p>
            
            <div className="bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-xs font-bold inline-flex items-center gap-1">
              <Shield size={12} /> {userInfo.role}
            </div>
          </div>
        </div>

        {/* RIGHT: FORMS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. EDIT INFO FORM */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
              <User className="text-blue-500" size={20} /> Хувийн мэдээлэл
            </h3>
            <form onSubmit={handleInfoUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Нэр</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="text" 
                    value={userInfo.name}
                    onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-rose-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Нэвтрэх нэр (Email)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    value={userInfo.email}
                    readOnly
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-500 cursor-not-allowed outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-1">Имэйл хаягийг өөрчлөх боломжгүй.</p>
              </div>
              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={loading} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition flex items-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={16}/> : <Save size={16} />} Хадгалах
                </button>
              </div>
            </form>
          </div>

          {/* 2. CHANGE PASSWORD FORM */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-lg text-slate-900 mb-6 flex items-center gap-2">
              <Key className="text-rose-500" size={20} /> Нууц үг солих
            </h3>
            <form onSubmit={handlePasswordUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Одоогийн нууц үг</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input 
                    type="password" required
                    value={passwords.current}
                    onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-rose-500 outline-none"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Шинэ нууц үг</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="password" required
                      value={passwords.new}
                      onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-rose-500 outline-none"
                      placeholder="Шинэ нууц үг"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Баталгаажуулах</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                    <input 
                      type="password" required
                      value={passwords.confirm}
                      onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-rose-500 outline-none"
                      placeholder="Дахин бичнэ үү"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button type="submit" disabled={loading} className="bg-rose-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-700 transition flex items-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={16}/> : <Key size={16} />} Шинэчлэх
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      <div className={`fixed bottom-6 right-6 bg-slate-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 transition-all duration-500 transform ${successMsg ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`}>
        <CheckCircle className="text-green-400" size={24} />
        <div>
          <h4 className="font-bold">Амжилттай!</h4>
          <p className="text-xs text-slate-400">{successMsg}</p>
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;