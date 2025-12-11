import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, ChevronDown, Grid, List, X, SlidersHorizontal, ArrowDownWideNarrow, Check, Scale, ExternalLink, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';

// FIREBASE IMPORTS
import { db } from '../firebase';
import { ref, onValue } from "firebase/database";

// Helper: Үнийг тоо руу хөрвүүлэх
const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    return parseInt(priceStr.replace(/[,₮]/g, ''), 10);
};

// --- COMPONENT: DEAL BANNER ---
const DealBanner = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (slides && slides.length > 0) {
        const timer = setInterval(() => {
          setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 3000);
        return () => clearInterval(timer);
    }
  }, [slides]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="hidden md:block relative h-[450px] rounded-3xl overflow-hidden shadow-2xl mb-10 group">
      <AnimatePresence mode='wait'>
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img 
            src={slides[currentSlide].bgImage} 
            alt="Deal Background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
          
          <div className="absolute inset-0 flex items-center container mx-auto px-12">
             <div className="text-white max-w-xl space-y-6">
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="inline-block bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Өдрийн онцлох
                </motion.div>
                <motion.h2 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="text-5xl font-black leading-tight whitespace-pre-line">
                  {slides[currentSlide].title}
                </motion.h2>
                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex items-center gap-4">
                  <span className="text-4xl font-bold text-yellow-400">{slides[currentSlide].subtitle}</span>
                </motion.div>
                <motion.a href={slides[currentSlide].link} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="inline-block bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 hover:text-yellow-900 transition mt-4">
                  {slides[currentSlide].buttonText}
                </motion.a>
             </div>
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute bottom-6 left-12 flex gap-2 z-10">
        {slides.map((_, idx) => (
          <button key={idx} onClick={() => setCurrentSlide(idx)} className={`w-2 h-2 rounded-full transition-all ${currentSlide === idx ? 'w-8 bg-white' : 'bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
};

// --- COMPONENT: PRODUCT LIST CARD ---
const ProductListCard = ({ product, onClick, onCompare }) => (
  <motion.div 
    initial={{ opacity: 0 }} 
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    onClick={() => onClick(product.id)}
    className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition flex gap-4 md:gap-6 items-center group cursor-pointer relative"
  >
    <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-100 rounded-xl overflow-hidden relative">
      <img src={product.mainImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
      <span className="absolute top-1 left-1 bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">-{product.discount}%</span>
    </div>
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase mb-1 block">{product.store}</span>
          <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-rose-600 transition">{product.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-rose-600">{product.price}₮</p>
          <p className="text-sm text-slate-400 line-through">{product.originalPrice}₮</p>
        </div>
      </div>
      <p className="text-sm text-slate-500 mt-2 line-clamp-2 hidden md:block">
        {product.description}
      </p>
      <button onClick={(e) => { e.stopPropagation(); onCompare(product); }} className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-rose-600 transition">
        <Scale size={16} /> Харьцуулах
      </button>
    </div>
  </motion.div>
);

// --- MAIN PAGE COMPONENT ---
const FeaturedPage = () => {
  const navigate = useNavigate();
  
  // State
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('default');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [compareItem, setCompareItem] = useState(null);
  const [filters, setFilters] = useState({ minPrice: '', maxPrice: '', stores: [], minDiscount: 0 });

  // Data from Firebase
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]); // To get list of stores for filter

  // FETCH DATA
  useEffect(() => {
    // 1. Panel Banners
    onValue(ref(db, 'content/featured/panel'), (snapshot) => {
        const data = snapshot.val();
        if(data) setBanners(Object.values(data).filter(item => item.isActive));
    });

    // 2. Products
    onValue(ref(db, 'content/featured/products'), (snapshot) => {
        const data = snapshot.val();
        if(data) {
            const list = Object.values(data).map(item => ({...item, image: item.mainImage})); // Map mainImage to image for Card compatibility
            setProducts(list);
            
            // Extract unique stores for filter
            const uniqueStores = [...new Set(list.map(p => p.store))];
            setStores(uniqueStores.map(s => ({ name: s })));
        }
        setLoading(false);
    });
  }, []);

  // Filter Logic
  useEffect(() => {
    let result = [...products];

    // Store Filter
    if (filters.stores.length > 0) {
        result = result.filter(p => filters.stores.includes(p.store));
    }
    
    // Price Filter
    if (filters.minPrice) result = result.filter(p => parsePrice(p.price) >= parseInt(filters.minPrice));
    if (filters.maxPrice) result = result.filter(p => parsePrice(p.price) <= parseInt(filters.maxPrice));

    // Discount Filter
    if (filters.minDiscount > 0) result = result.filter(p => p.discount >= filters.minDiscount);

    // Sort
    if (sortBy === 'price-asc') result.sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    if (sortBy === 'price-desc') result.sort((a, b) => parsePrice(b.price) - parsePrice(a.price));

    setDisplayedProducts(result); 
  }, [products, filters, sortBy]);

  const handleProductClick = (id) => {
    // Note: Since we are using Firebase, ensure ProductDetailPage can handle fetching by ID or pass data via state
    navigate(`/product/${id}`);
  };

  const toggleStoreFilter = (storeName) => {
    setFilters(prev => ({
      ...prev,
      stores: prev.stores.includes(storeName) ? prev.stores.filter(s => s !== storeName) : [...prev.stores, storeName]
    }));
  };

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-bold text-slate-800 mb-3 text-sm">Үнийн дүн (₮)</h3>
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-500" onChange={(e) => setFilters({...filters, minPrice: e.target.value})} />
          <span className="text-slate-400">-</span>
          <input type="number" placeholder="Max" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-rose-500" onChange={(e) => setFilters({...filters, maxPrice: e.target.value})} />
        </div>
      </div>
      <div>
        <h3 className="font-bold text-slate-800 mb-3 text-sm">Дэлгүүрүүд</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-2">
          {stores.map((store, idx) => (
            <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition">
              <input type="checkbox" className="accent-rose-600 w-4 h-4" checked={filters.stores.includes(store.name)} onChange={() => toggleStoreFilter(store.name)} />
              <span className="text-slate-600 text-sm font-medium">{store.name}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
         <h3 className="font-bold text-slate-800 mb-3 text-sm">Хямдрал</h3>
         <div className="space-y-2">
           {[10, 20, 30, 50].map((percent) => (
             <label key={percent} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
               <input type="radio" name="discount" className="accent-rose-600 w-4 h-4" checked={filters.minDiscount === percent} onChange={() => setFilters({...filters, minDiscount: percent})}/>
               <span className="text-slate-600 text-sm">{percent}% -иас дээш</span>
             </label>
           ))}
           <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded">
               <input type="radio" name="discount" className="accent-rose-600 w-4 h-4" checked={filters.minDiscount === 0} onChange={() => setFilters({...filters, minDiscount: 0})}/>
               <span className="text-slate-600 text-sm">Бүгд</span>
           </label>
         </div>
      </div>
    </div>
  );

  return (
    <div className="pt-24 pb-20 container mx-auto px-2 md:px-4 min-h-screen">
      <DealBanner slides={banners} />

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="hidden lg:block w-64 flex-shrink-0">
           <div className="sticky top-24 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 font-bold text-slate-900 pb-4 border-b border-slate-200 mb-4"><SlidersHorizontal size={20} /> Шүүлтүүр</div>
              <FilterContent />
           </div>
        </aside>

        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between mb-4 gap-2 bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative z-20">
             <button onClick={() => setMobileFilterOpen(true)} className="lg:hidden flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-200"><SlidersHorizontal size={14} /> Шүүх</button>
             <div className="text-xs text-slate-500 font-medium"><span className="font-bold text-slate-900">{displayedProducts.length}</span> онцлох бараа</div>
             <div className="flex items-center gap-2 ml-auto">
                <select className="bg-slate-50 text-xs font-medium border-none rounded-lg px-2 py-2 outline-none appearance-none pr-6 cursor-pointer" onChange={(e) => setSortBy(e.target.value)}>
                   <option value="default">Эрэмбэлэх</option><option value="price-asc">Үнэ: Бага &rarr; Их</option><option value="price-desc">Үнэ: Их &rarr; Бага</option>
                </select>
                <ArrowDownWideNarrow size={14} className="absolute right-24 md:right-28 top-3.5 text-slate-400 pointer-events-none"/>
                <div className="flex bg-slate-50 rounded-lg p-1 border border-slate-200">
                  <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow text-rose-600' : 'text-slate-400'}`}><Grid size={14}/></button>
                  <button onClick={() => setViewMode('list')} className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow text-rose-600' : 'text-slate-400'}`}><List size={14}/></button>
                </div>
             </div>
          </div>

          <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-6" : "flex flex-col gap-4"}>
            <AnimatePresence>
              {displayedProducts.map((product, idx) => (
                viewMode === 'grid' 
                  ? <div key={`${product.id}-${idx}`} onClick={() => handleProductClick(product.id)}><ProductCard product={product} onCompare={(p) => setCompareItem(p)} /></div>
                  : <ProductListCard key={`${product.id}-${idx}`} product={product} onClick={handleProductClick} onCompare={(p) => setCompareItem(p)} />
              ))}
            </AnimatePresence>
            {loading && [...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            {!loading && displayedProducts.length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-500"><AlertCircle size={40} className="mx-auto mb-4 text-slate-300"/><p>Таны хайсан шүүлтүүрээр онцлох бараа олдсонгүй.</p></div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-[60] flex justify-end">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileFilterOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="relative w-[85%] max-w-xs bg-white h-full shadow-2xl flex flex-col">
               <div className="flex justify-between items-center p-5 border-b border-slate-100"><h2 className="font-bold text-lg text-slate-900">Шүүлтүүр</h2><button onClick={() => setMobileFilterOpen(false)} className="p-2 bg-slate-50 rounded-full"><X size={20} /></button></div>
               <div className="flex-1 overflow-y-auto p-5 custom-scrollbar"><FilterContent /></div>
               <div className="p-5 border-t border-slate-100"><button onClick={() => setMobileFilterOpen(false)} className="w-full bg-rose-600 text-white py-3 rounded-xl font-bold hover:bg-rose-700 transition">Шүүж харах</button></div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FeaturedPage;