import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Zap, TrendingUp, Sparkles, CheckCircle, Mic, ExternalLink, AlertCircle, Flame } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import { Link } from 'react-router-dom';

// FIREBASE IMPORTS
import { db } from '../firebase';
import { ref, onValue } from "firebase/database";

// --- SUB-COMPONENTS (CountdownTimer, etc.) хэвээрээ байна ---
const CountdownTimer = () => {
  const [time, setTime] = useState({ hours: 4, minutes: 59, seconds: 59 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="flex gap-2 text-center">
      {Object.entries(time).map(([unit, val]) => (
        <div key={unit} className="bg-white/10 backdrop-blur rounded px-3 py-1 min-w-[50px] border border-white/10">
          <span className="font-mono text-xl font-bold text-white block">{String(val).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase text-white/60">{unit === 'hours' ? 'Цаг' : unit === 'minutes' ? 'Мин' : 'Сек'}</span>
        </div>
      ))}
    </div>
  );
};

// --- MAIN PAGE ---
const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [flashIndex, setFlashIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  
  // DATA STATES FROM FIREBASE
  const [heroSlides, setHeroSlides] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [flashSales, setFlashSales] = useState([]);

  // FETCH DATA
  useEffect(() => {
    const fetchData = () => {
      // 1. Hero Slides
      onValue(ref(db, 'content/home/hero'), (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.values(data).filter(item => item.isActive); // Зөвхөн идэвхтэйг
          setHeroSlides(list);
        }
      });

      // 2. Best Sellers
      onValue(ref(db, 'content/home/bestSellers'), (snapshot) => {
        const data = snapshot.val();
        if (data) setBestSellers(Object.values(data));
      });

      // 3. Partners
      onValue(ref(db, 'content/home/partners'), (snapshot) => {
        const data = snapshot.val();
        if (data) setPartners(Object.values(data));
      });

      // 4. Flash Sales
      onValue(ref(db, 'content/home/flashSales'), (snapshot) => {
        const data = snapshot.val();
        if (data) setFlashSales(Object.values(data));
        setLoading(false);
      });
    };

    fetchData();
  }, []);

  // SLIDER LOGIC
  useEffect(() => {
    if (heroSlides.length > 0) {
        const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length), 4000);
        return () => clearInterval(timer);
    }
  }, [heroSlides]);

  useEffect(() => {
    if (flashSales.length > 0) {
        const timer = setInterval(() => setFlashIndex((prev) => (prev + 1) % flashSales.length), 4000);
        return () => clearInterval(timer);
    }
  }, [flashSales]);

  // SCROLL LOGIC
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;
    let animationFrameId;
    const scroll = () => {
      if (!isPaused) {
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth / 2) {
          scrollContainer.scrollLeft = 0;
        } else {
          scrollContainer.scrollLeft += 1;
        }
      }
      animationFrameId = requestAnimationFrame(scroll);
    };
    animationFrameId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, bestSellers]); // Re-run when bestSellers loads

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-10 h-10 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="pb-20 bg-[#F8FAFC]">
      
      {/* HERO SECTION */}
      {heroSlides.length > 0 && (
      <section className="relative h-[600px] overflow-hidden">
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-0"
          >
            <img src={heroSlides[currentSlide].image} alt="Hero" className="w-full h-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div 
              key={currentSlide + "text"}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl text-white mb-8"
            >
              <span className="bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 inline-block shadow-lg">Онцлох</span>
              <h1 className="text-5xl md:text-7xl font-black mb-4 leading-tight">{heroSlides[currentSlide].title}</h1>
              <p className="text-xl text-white/80">{heroSlides[currentSlide].subtitle}</p>
              <button className="mt-6 bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-rose-600 hover:text-white transition">
                 {heroSlides[currentSlide].buttonText}
              </button>
            </motion.div>
          </AnimatePresence>
            
          <div className="bg-white p-2 rounded-2xl shadow-2xl flex items-center max-w-lg transform hover:scale-105 transition-transform duration-300 relative border-2 border-transparent focus-within:border-rose-100">
            <Search className="text-slate-400 ml-3 w-6 h-6" />
            <input 
              type="text" 
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Хайх: iPhone 15, Пүүз..." 
              className="w-full px-4 py-3 outline-none text-slate-800 placeholder:text-slate-400 font-medium bg-transparent"
            />
            <button className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-rose-600 transition">Хайх</button>
          </div>
        </div>
      </section>
      )}

      {/* --- BEST SELLING MARQUEE --- */}
      {bestSellers.length > 0 && (
      <section className="container mx-auto px-4 -mt-16 relative z-30 mb-20">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-2 mb-6 ml-2">
             <div className="bg-orange-100 p-2 rounded-lg">
                <Flame className="text-orange-600 w-5 h-5" />
             </div>
             <h3 className="font-bold text-lg text-slate-900">Хамгийн их зарагдсан</h3>
          </div>
          
          <div className="relative w-full">
             <div className="absolute left-0 top-0 bottom-0 w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
             <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

             <div 
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto no-scrollbar scroll-smooth"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
                style={{ scrollBehavior: 'auto' }}
             >
                {/* Firebase-аас ирсэн датаг 2 дахин давтаж loop хийнэ */}
                {[...bestSellers, ...bestSellers].map((product, idx) => (
                    <a 
                      key={`${product.id}-${idx}`} 
                      href={product.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="min-w-[200px] bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col gap-3 hover:bg-white hover:shadow-lg transition-all cursor-pointer group relative flex-shrink-0"
                    >
                        <div className="h-32 rounded-lg overflow-hidden relative bg-white">
                           <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500"/>
                           
                           <div className="absolute top-1 right-1 bg-white/90 p-1 rounded-full shadow-sm z-10">
                              <div className="w-6 h-6 rounded-full bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                                <img src={product.storeLogo} alt="S" className="w-full h-full object-contain p-0.5" />
                              </div>
                           </div>

                           <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded backdrop-blur">
                              {product.soldCount} ширхэг
                           </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-1">{product.name}</h4>
                          <p className="text-xs text-rose-600 font-bold mt-1">{product.price}</p>
                        </div>
                    </a>
                ))}
             </div>
          </div>
        </div>
      </section>
      )}

      {/* BRANDS */}
      {partners.length > 0 && (
      <section className="mt-12">
         <p className="text-center text-slate-400 text-sm font-semibold uppercase tracking-widest mb-6">Хамтрагч дэлгүүрүүд</p>
         <div className="w-full overflow-hidden bg-white border-y border-slate-100 py-6">
            <div className="relative w-full">
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
              <motion.div className="flex gap-16 w-max" animate={{ x: ["0%", "-50%"] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }}>
                {[...partners, ...partners].map((brand, idx) => (
                  <a key={idx} href={brand.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden p-1">
                        {brand.logo ? <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" /> : brand.name[0]}
                    </div>
                    <span className="font-bold text-xl text-slate-800">{brand.name}</span>
                  </a>
                ))}
              </motion.div>
            </div>
          </div>
      </section>
      )}

      {/* FLASH SALE */}
      {flashSales.length > 0 && (
      <section className="mt-16 py-16 text-white relative overflow-hidden min-h-[500px] flex items-center">
        <AnimatePresence mode='wait'>
          <motion.div
            key={flashIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0"
          >
             <img src={flashSales[flashIndex].bgImage} alt="Background" className="w-full h-full object-cover"/>
             <div className="absolute inset-0 bg-black/60" />
          </motion.div>
        </AnimatePresence>

        <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={flashIndex + "text"}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-4 border border-white/20 animate-pulse">
                  <Zap size={14} fill="currentColor" /> FLASH SALE
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight whitespace-pre-line">{flashSales[flashIndex].title}</h2>
                <p className="text-white/80 text-lg mb-8 max-w-md">{flashSales[flashIndex].description}</p>
              </motion.div>
            </AnimatePresence>
            <CountdownTimer />
          </div>

          <AnimatePresence mode="wait">
            <motion.div 
              key={flashIndex + "card"}
              initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
              transition={{ duration: 0.5 }}
              className="bg-white text-slate-900 p-4 rounded-3xl shadow-2xl max-w-xs w-full rotate-3 hover:rotate-0 transition-all duration-300"
            >
              <div className="relative h-48 bg-slate-100 rounded-2xl overflow-hidden mb-4">
                 <img src={flashSales[flashIndex].productImage} alt="Product" className="w-full h-full object-cover" />
                 <span className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded">-{flashSales[flashIndex].discountPercent}%</span>
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg leading-tight">{flashSales[flashIndex].productName}</h3>
                <div className="text-xs font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">{flashSales[flashIndex].stock} ш</div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl font-bold">{flashSales[flashIndex].price}₮</span>
                <span className="text-sm text-slate-400 line-through">{flashSales[flashIndex].oldPrice}₮</span>
              </div>
              <a href={flashSales[flashIndex].link} target="_blank" rel="noreferrer" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition flex items-center justify-center gap-2">
                <ExternalLink size={18} /> Дэлгэрэнгүй
              </a>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
      )}

    </div>
  );
};

export default HomePage;