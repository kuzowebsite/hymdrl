import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- FIREBASE IMPORT ---
// App.js нь src/ хавтас дотор байдаг тул ./ гэж дуудна
import { db } from './firebase'; 
import { ref, onValue } from "firebase/database";

// --- PAGES IMPORTS ---
// Pages хавтас руу ./pages/ гэж хандана
import HomePage from './pages/HomePage';
import FeaturedPage from './pages/FeaturedPage';
import StoresPage from './pages/StoresPage';
import CategoriesPage from './pages/CategoriesPage';
import ProductDetailPage from './pages/ProductDetailPage';

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // SITE SETTINGS STATE (Firebase-аас ирэх өгөгдөл)
  const [siteSettings, setSiteSettings] = useState({
    siteName: 'Hyamdral.mn',
    footerText: '© 2024 Hyamdral.mn',
    logo: null
  });

  // --- 1. FETCH GENERAL SETTINGS FROM FIREBASE ---
  useEffect(() => {
    const query = ref(db, "content/general");
    const unsubscribe = onValue(query, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSiteSettings({
          siteName: data.siteName || 'Hyamdral.mn',
          footerText: data.footerText || '© 2024 Hyamdral.mn',
          logo: data.logo || null
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // --- SCROLL EFFECT ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { name: 'Нүүр', path: '/' },
    { name: 'Онцлох', path: '/featured' },
    { name: 'Дэлгүүрүүд', path: '/stores' },
    { name: 'Ангилал', path: '/categories' },
  ];

  const NavLink = ({ item, isMobile = false }) => {
    const location = useLocation();
    const isActive = location.pathname === item.path;
    
    return (
      <Link 
        to={item.path} 
        onClick={() => isMobile && setMobileMenuOpen(false)}
        className={`
          relative transition-colors font-medium
          ${isMobile ? 'text-lg block py-2' : 'text-sm'}
          ${isActive ? 'text-rose-600 font-bold' : 'text-slate-600 hover:text-rose-600'}
        `}
      >
        {item.name}
        {!isMobile && isActive && (
          <motion.span layoutId="underline" className="absolute -bottom-1 left-0 w-full h-0.5 bg-rose-600" />
        )}
      </Link>
    );
  };

  return (
    <Router>
      <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-800 flex flex-col">
        
        {/* HEADER */}
        <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
          <div className="container mx-auto px-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              {/* Лого байвал зургийг харуулна, байхгүй бол Icon харуулна */}
              {siteSettings.logo ? (
                <img src={siteSettings.logo} alt="Logo" className="h-8 object-contain" />
              ) : (
                <div className="bg-rose-600 p-1.5 rounded-lg text-white"><Zap size={20} fill="white"/></div>
              )}
              <span className="text-xl font-black text-slate-900">{siteSettings.siteName}</span>
            </Link>

            <nav className="hidden md:flex gap-8">
              {menuItems.map((item) => <NavLink key={item.name} item={item} />)}
            </nav>

            <div className="flex items-center gap-4">
              <Search className="w-5 h-5 text-slate-500 cursor-pointer hover:text-rose-600" />
              <button className="md:hidden" onClick={() => setMobileMenuOpen(true)}><Menu /></button>
            </div>
          </div>
        </header>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "tween" }}
              className="fixed inset-0 z-[60] bg-white p-6 md:hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold">Цэс</span>
                <button onClick={() => setMobileMenuOpen(false)}><X /></button>
              </div>
              <nav className="space-y-4">
                {menuItems.map((item) => <NavLink key={item.name} item={item} isMobile={true} />)}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- PAGE CONTENT (ROUTES) --- */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/featured" element={<FeaturedPage />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
        </Routes>

        {/* FOOTER */}
        <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
          <div className="container mx-auto px-4 text-center">
            <p className="text-slate-400 text-sm">{siteSettings.footerText}</p>
          </div>
        </footer>

      </div>
    </Router>
  );
}