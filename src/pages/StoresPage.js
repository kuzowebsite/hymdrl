import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, TrendingUp, ExternalLink, ArrowRight, Check, ArrowDownWideNarrow, MapPin, X, Ticket, Copy, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { ref, onValue } from "firebase/database";

const STORE_CATEGORIES = [
  { id: 'All', name: 'Бүгд' },
  { id: 'Tech', name: 'Цахилгаан бараа' },
  { id: 'Fashion', name: 'Хувцас загвар' },
  { id: 'Supermarket', name: 'Супермаркет' },
];

const StoresPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedStoreAddress, setSelectedStoreAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  // DATA STATES
  const [topStores, setTopStores] = useState([]);
  const [otherStores, setOtherStores] = useState([]);
  
  // ALL STORES COMBINED
  const [allStores, setAllStores] = useState([]);

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
        let loadedTop = [];
        let loadedOther = [];

        // 1. Get Top Stores
        onValue(ref(db, 'content/stores/top'), (snapshot) => {
            const data = snapshot.val();
            if(data) loadedTop = Object.keys(data).map(key => ({ id: key, ...data[key], isTop: true }));
            setTopStores(loadedTop);
            combineStores(loadedTop, loadedOther);
        });

        // 2. Get Other Stores
        onValue(ref(db, 'content/stores/others'), (snapshot) => {
            const data = snapshot.val();
            if(data) loadedOther = Object.keys(data).map(key => ({ id: key, ...data[key], isTop: false }));
            setOtherStores(loadedOther);
            combineStores(loadedTop, loadedOther);
        });
    };

    fetchData();
  }, []);

  const combineStores = (top, other) => {
      setAllStores([...top, ...other]);
      setLoading(false);
  };

  // --- AUTO SCROLL LOGIC ---
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || topStores.length < 4) return;

    let animationFrameId;
    const scroll = () => {
      if (!isPaused) {
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += 0.5; 
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, topStores]);

  // --- FILTER & SORT ---
  const getProcessedStores = () => {
    let result = allStores.filter(store => {
      // Note: Admin дээр категори сонгох хэсэг хийгээгүй тул одоогоор 'All' гэж үзье эсвэл нэрээр нь шүүе
      // const matchesCategory = activeCategory === 'All' || store.category === activeCategory;
      const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });

    if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'deals') result.sort((a, b) => (b.dealsCount || 0) - (a.dealsCount || 0));

    return result;
  };

  const filteredStores = getProcessedStores();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-rose-600" size={32}/></div>;

  return (
    <div className="pt-24 pb-20 container mx-auto px-2 md:px-4 min-h-screen">
      
      {/* 1. HEADER & TOP STORES */}
      {topStores.length > 0 && (
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-2 flex items-center gap-2 px-2">
          Шилдэг Дэлгүүрүүд <TrendingUp className="text-rose-600" />
        </h1>
        <p className="text-slate-500 mb-6 px-2 text-sm md:text-base">Хэрэглэгчдийн хамгийн их итгэлийг хүлээсэн түншүүд.</p>

        <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto no-scrollbar py-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
        >
          {/* Loop twice for infinite effect */}
          {(topStores.length > 3 ? [...topStores, ...topStores] : topStores).map((store, idx) => (
            <motion.div 
              key={`${store.id}-${idx}`}
              whileHover={{ scale: 0.98 }}
              className="relative rounded-2xl overflow-hidden shadow-lg group cursor-pointer h-40 md:h-48 min-w-[280px] md:min-w-[350px] flex-shrink-0"
            >
              <div className="absolute inset-0">
                {store.coverImage ? <img src={store.coverImage} alt={store.name} className="w-full h-full object-cover transition duration-700 group-hover:scale-110" /> : <div className="w-full h-full bg-slate-800"/>}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
              </div>
              
              <div className="relative z-10 p-4 md:p-6 h-full flex flex-col justify-end text-white">
                 <div className="flex items-center gap-3 mb-1">
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full bg-white flex items-center justify-center font-bold text-xs md:text-sm border-2 border-white/20 overflow-hidden`}>
                      {store.logo ? <img src={store.logo} alt="Logo" className="w-full h-full object-contain p-1"/> : store.name[0]}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg md:text-xl leading-none">{store.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-400 text-[10px] md:text-xs mt-1">
                        <Star size={12} fill="currentColor" /> 5.0
                      </div>
                    </div>
                 </div>
                 <p className="text-[10px] md:text-xs text-white/70 line-clamp-1">{store.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      )}

      {/* 2. FILTER & SEARCH */}
      <div className="bg-[#F8FAFC]/95 backdrop-blur py-2 md:py-4 mb-6 sticky top-16 z-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-3">
           <div className="flex gap-2 overflow-x-auto w-full lg:w-auto no-scrollbar pb-1 px-2">
             {STORE_CATEGORIES.map((cat) => (
               <button 
                 key={cat.id}
                 onClick={() => setActiveCategory(cat.id)}
                 className={`px-4 py-2 rounded-full text-xs md:text-sm font-bold whitespace-nowrap transition-all ${
                   activeCategory === cat.id ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                 }`}
               >
                 {cat.name}
               </button>
             ))}
           </div>

           <div className="flex items-center gap-2 w-full lg:w-auto px-2">
             <div className="relative">
                <select className="bg-white border border-slate-200 text-slate-700 text-xs md:text-sm font-bold rounded-xl px-3 py-2.5 pr-8 appearance-none outline-none focus:border-rose-500 cursor-pointer" onChange={(e) => setSortBy(e.target.value)}>
                  <option value="default">Эрэмбэлэх</option><option value="rating">Үнэлгээ</option><option value="deals">Хямдрал</option>
                </select>
                <ArrowDownWideNarrow size={14} className="absolute right-2 top-3 text-slate-400 pointer-events-none"/>
             </div>
             <div className="relative w-full lg:w-80">
               <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
               <input type="text" placeholder="Дэлгүүр хайх..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm focus:border-rose-500 outline-none transition"/>
             </div>
           </div>
        </div>
      </div>

      {/* 3. STORE GRID */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        <AnimatePresence>
          {filteredStores.map((store) => (
            <motion.div 
              key={store.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl md:rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full"
            >
              {/* Cover Image */}
              <div className="h-20 md:h-28 w-full relative bg-gray-100">
                {store.coverImage ? (
                    <img src={store.coverImage} alt="Cover" className="w-full h-full object-cover group-hover:opacity-90 transition" />
                ) : (
                    <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">No Image</div>
                )}
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition" />
              </div>

              <div className="p-3 md:px-5 md:pb-5 relative flex-1 flex flex-col">
                 {/* Floating Logo */}
                 <div className="absolute -top-6 left-3 md:-top-8 md:left-5">
                    <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white flex items-center justify-center text-slate-900 text-lg md:text-2xl font-bold border-[3px] md:border-4 border-white shadow-md overflow-hidden`}>
                      {store.logo ? <img src={store.logo} alt="Logo" className="w-full h-full object-contain p-1"/> : store.name[0]}
                    </div>
                 </div>

                 {/* Top Right Icons */}
                 <div className="flex justify-end pt-1 md:pt-3 gap-1 md:gap-2">
                    {store.branches && store.branches.length > 0 && (
                        <button onClick={() => setSelectedStoreAddress(store)} className="p-1.5 md:p-2 rounded-full bg-slate-50 text-slate-400 hover:text-rose-600">
                        <MapPin size={14} className="md:w-4 md:h-4" />
                        </button>
                    )}
                    <a href={store.siteLink || store.link} target="_blank" rel="noreferrer" className="p-1.5 md:p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900">
                      <ExternalLink size={14} className="md:w-4 md:h-4" />
                    </a>
                 </div>

                 {/* Main Info */}
                 <div className="mt-2 md:mt-2">
                    <h3 className="text-sm md:text-lg font-bold text-slate-900 flex items-center gap-1 line-clamp-1">
                      {store.name} 
                      {store.isTop && <Check size={12} strokeWidth={4} className="text-blue-500 md:w-4 md:h-4"/>}
                    </h3>
                    
                    {/* Rating & Deals */}
                    <div className="flex flex-wrap items-center gap-1 text-slate-500 text-[10px] md:text-xs mb-1 md:mb-2">
                       <Star size={10} fill="currentColor" className="text-yellow-400"/> 
                       <span className="font-bold text-slate-700">5.0</span>
                       {store.dealsCount && (
                           <>
                            <span className="hidden md:inline">•</span>
                            <span className="text-rose-600 font-bold block md:inline w-full md:w-auto">{store.dealsCount} хямдрал</span>
                           </>
                       )}
                    </div>
                    
                    <p className="text-[10px] md:text-xs text-slate-500 line-clamp-2 mb-2 md:mb-4 h-8 hidden md:block">{store.description}</p>
                 </div>

                 {/* Best Seller (Only for Other Stores) */}
                 {store.bestSellerImage && (
                   <div className="mb-3 md:mb-4">
                      <div className="flex gap-1 md:gap-2">
                           <div className="w-8 h-8 md:w-12 md:h-12 rounded md:rounded-lg bg-gray-100 overflow-hidden border border-slate-100">
                              <img src={store.bestSellerImage} alt="" className="w-full h-full object-cover" />
                           </div>
                      </div>
                   </div>
                 )}

                 {/* Button */}
                 <div className="mt-auto">
                    <a href={store.siteLink || store.link} target="_blank" rel="noreferrer" className="w-full py-2 md:py-2.5 rounded-lg md:rounded-xl font-bold flex items-center justify-center gap-1 md:gap-2 bg-slate-50 text-slate-900 hover:bg-slate-900 hover:text-white transition-all text-xs md:text-sm">
                      Дэлгүүр <ArrowRight size={14} className="md:w-4 md:h-4" />
                    </a>
                 </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center py-20 text-slate-400">Хайлт илэрцгүй байна.</div>
      )}

      {/* --- ADDRESS MODAL --- */}
      <AnimatePresence>
        {selectedStoreAddress && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedStoreAddress(null)} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-900 font-bold overflow-hidden`}>
                          {selectedStoreAddress.logo ? <img src={selectedStoreAddress.logo} className="w-full h-full object-contain p-1"/> : selectedStoreAddress.name[0]}
                      </div>
                      <div><h3 className="font-bold text-slate-900">{selectedStoreAddress.name}</h3><p className="text-xs text-slate-500">Салбарын байршил</p></div>
                   </div>
                   <button onClick={() => setSelectedStoreAddress(null)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100"><X size={18}/></button>
                </div>
                <div className="p-5 space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                   {selectedStoreAddress.branches && selectedStoreAddress.branches.map((branch, idx) => (
                       <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                          <MapPin size={18} className="text-rose-600 mt-0.5 flex-shrink-0" />
                          <div>
                              <p className="text-sm text-slate-700 font-bold">{branch.name}</p>
                              {branch.link && <a href={branch.link} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">Google Maps</a>}
                          </div>
                       </div>
                   ))}
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StoresPage;