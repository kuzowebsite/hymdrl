import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, ChevronDown, ChevronRight, ShoppingBag, 
  Store, Tag, Image, Menu, X, LogOut, ChevronLeft, Settings, User // <--- Settings, User нэмэгдсэн
} from 'lucide-react';

// PAGES
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import DashboardPage from './pages/admin/DashboardPage';
import ProfilePage from './pages/admin/profile/ProfilePage'; // <--- IMPORT

import GeneralSettingsPage from './pages/admin/home/GeneralSettingsPage';
import HeroSettingsPage from './pages/admin/home/HeroSettingsPage';
import BestSellersPage from './pages/admin/home/BestSellersPage';
import PartnerStoresPage from './pages/admin/home/PartnerStoresPage';
import FlashSalePage from './pages/admin/home/FlashSalePage';
import FeaturedPanelPage from './pages/admin/featured/FeaturedPanelPage';
import FeaturedProductsPage from './pages/admin/featured/FeaturedProductsPage';
import TopStoresPage from './pages/admin/stores/TopStoresPage';
import OtherStoresPage from './pages/admin/stores/OtherStoresPage';
import CategoriesPanelPage from './pages/admin/categories/CategoriesPanelPage';
import RegularProductsPage from './pages/admin/categories/RegularProductsPage';
import MainCategoriesPage from './pages/admin/categories/MainCategoriesPage';
import SubCategoriesPage from './pages/admin/categories/SubCategoriesPage';

// --- AUTH GUARD ---
const RequireAuth = () => {
  const token = localStorage.getItem('adminToken');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

// --- SIDEBAR COMPONENT ---
const SidebarItem = ({ title, icon: Icon, children, path, collapsed, setCollapsed }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const hasChildren = children && children.length > 0;
  
  useEffect(() => {
    if (children && children.some(c => c.path === location.pathname)) {
      setIsOpen(true);
    }
  }, [location, children]);

  if (!hasChildren) {
    return (
      <Link 
        to={path} 
        className={`flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-all overflow-hidden ${
          location.pathname === path ? 'bg-slate-800 text-white border-r-4 border-rose-600' : ''
        }`}
        title={collapsed ? title : ''}
      >
        <div className="min-w-[20px]"><Icon size={20} /></div>
        <span className={`font-medium whitespace-nowrap transition-all duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>{title}</span>
      </Link>
    );
  }

  return (
    <div>
      <button 
        onClick={() => { if (collapsed) setCollapsed(false); setIsOpen(!isOpen); }}
        className="w-full flex items-center justify-between px-4 py-3 text-slate-300 hover:bg-slate-800 hover:text-white transition-all overflow-hidden"
        title={collapsed ? title : ''}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-[20px]"><Icon size={20} /></div>
          <span className={`font-medium whitespace-nowrap transition-all duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>{title}</span>
        </div>
        {!collapsed && (<div>{isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</div>)}
      </button>
      <div className={`bg-slate-900 overflow-hidden transition-all duration-300 ${isOpen && !collapsed ? 'max-h-96' : 'max-h-0'}`}>
        {children.map((child, idx) => (
          <Link key={idx} to={child.path} className={`block pl-12 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800/50 whitespace-nowrap ${location.pathname === child.path ? 'text-rose-500 font-bold' : ''}`}>
            {child.title}
          </Link>
        ))}
      </div>
    </div>
  );
};

// --- ADMIN LAYOUT ---
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    if(window.confirm("Та гарахдаа итгэлтэй байна уу?")) {
      localStorage.removeItem('adminToken');
      window.location.href = '/login';
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className={`bg-slate-950 text-white flex-shrink-0 fixed h-full z-50 transition-all duration-300 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className={`font-bold text-xl whitespace-nowrap overflow-hidden transition-all duration-300 ${collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>Admin<span className="text-rose-600">Panel</span></div>
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hidden lg:block">{collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}</button>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400"><X size={24} /></button>
        </div>
        
        <nav className="flex-1 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
          <SidebarItem title="Хяналтын самбар" icon={LayoutDashboard} path="/admin" collapsed={collapsed} />
          
          <SidebarItem title="Нүүр хэсэг" icon={Image} collapsed={collapsed} setCollapsed={setCollapsed} children={[
            { title: '1. Үндсэн тохиргоо', path: '/admin/home/general' },
            { title: '2. Hero Панел', path: '/admin/home/hero' },
            { title: '3. Их зарагдсан', path: '/admin/home/best-sellers' },
            { title: '4. Хамтрагч дэлгүүр', path: '/admin/home/partners' },
            { title: '5. Хямдралын зар', path: '/admin/home/flash-sale' },
          ]} />

          <SidebarItem title="Онцлох хэсэг" icon={Tag} collapsed={collapsed} setCollapsed={setCollapsed} children={[
            { title: '1. Панел', path: '/admin/featured/panel' },
            { title: '2. Бараа', path: '/admin/featured/products' },
          ]} />

          <SidebarItem title="Дэлгүүрүүд" icon={Store} collapsed={collapsed} setCollapsed={setCollapsed} children={[
            { title: '1. Шилдэг дэлгүүр', path: '/admin/stores/top' },
            { title: '2. Бусад дэлгүүр', path: '/admin/stores/others' },
          ]} />

          <SidebarItem title="Ангилал" icon={ShoppingBag} collapsed={collapsed} setCollapsed={setCollapsed} children={[
            { title: '1. Панел', path: '/admin/categories/panel' },
            { title: '2. Энгийн бараа', path: '/admin/categories/products' },
            { title: '3. Үндсэн ангилал', path: '/admin/categories/main' },
            { title: '4. Барааны ангилал', path: '/admin/categories/sub' },
          ]} />

          {/* ШИНЭ: ТОХИРГООНЫ ХЭСЭГ */}
          <div className="my-2 border-t border-slate-800 pt-2">
             <SidebarItem title="Тохиргоо" icon={Settings} collapsed={collapsed} setCollapsed={setCollapsed} children={[
                { title: 'Профайл', path: '/admin/profile' },
             ]} />
          </div>

        </nav>

        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className={`w-full flex items-center gap-3 px-2 py-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all overflow-hidden ${collapsed ? 'justify-center' : ''}`} title="Гарах">
            <div className="min-w-[20px]"><LogOut size={20} /></div>
            <span className={`font-bold whitespace-nowrap transition-all duration-300 ${collapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'}`}>Гарах</span>
          </button>
        </div>
      </aside>

      <div className={`flex-1 flex flex-col transition-all duration-300 min-h-screen ${collapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <div className="lg:hidden bg-white p-4 shadow-sm flex items-center gap-4 sticky top-0 z-40">
           <button onClick={() => setSidebarOpen(true)} className="p-2 bg-slate-100 rounded text-slate-600"><Menu size={20}/></button>
           <span className="font-bold text-slate-800">Меню</span>
        </div>
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// --- APP ROUTER ---
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<RequireAuth />}>
          <Route element={<AdminLayout />}>
             <Route path="/admin" element={<DashboardPage />} />
             
             {/* Profile Route */}
             <Route path="/admin/profile" element={<ProfilePage />} />

             <Route path="/admin/home/general" element={<GeneralSettingsPage />} />
             <Route path="/admin/home/hero" element={<HeroSettingsPage />} />
             <Route path="/admin/home/best-sellers" element={<BestSellersPage />} />
             <Route path="/admin/home/partners" element={<PartnerStoresPage />} />
             <Route path="/admin/home/flash-sale" element={<FlashSalePage />} />
             
             <Route path="/admin/featured/panel" element={<FeaturedPanelPage />} />
             <Route path="/admin/featured/products" element={<FeaturedProductsPage />} />
             
             <Route path="/admin/stores/top" element={<TopStoresPage />} />
             <Route path="/admin/stores/others" element={<OtherStoresPage />} />
             
             <Route path="/admin/categories/panel" element={<CategoriesPanelPage />} />
             <Route path="/admin/categories/products" element={<RegularProductsPage />} />
             <Route path="/admin/categories/main" element={<MainCategoriesPage />} />
             <Route path="/admin/categories/sub" element={<SubCategoriesPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}