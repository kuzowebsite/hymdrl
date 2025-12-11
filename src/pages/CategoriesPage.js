import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronRight, Flame, PackageOpen, Layers, Zap, Shirt, Home, Smile, 
  Dumbbell, Baby, Car, Book, Coffee, Monitor, Smartphone, Watch, Loader2, AlertCircle 
} from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard'; // Ensure you have this component
import { db } from '../firebase';
import { ref, onValue } from "firebase/database";

const iconMap = {
  Zap: <Zap size={20} />, Shirt: <Shirt size={20} />, Home: <Home size={20} />,
  Smile: <Smile size={20} />, Dumbbell: <Dumbbell size={20} />, Baby: <Baby size={20} />,
  Car: <Car size={20} />, Book: <Book size={20} />, Coffee: <Coffee size={20} />,
  Monitor: <Monitor size={20} />, Smartphone: <Smartphone size={20} />, Watch: <Watch size={20} />,
  Layers: <Layers size={20} />
};

const CategoriesPage = () => {
  const navigate = useNavigate();
  
  const [categories, setCategories] = useState([]);     
  const [subCategories, setSubCategories] = useState([]); 
  const [panels, setPanels] = useState([]);             
  const [allProducts, setAllProducts] = useState([]);   
  
  const [activeCategory, setActiveCategory] = useState(null); 
  const [activeSubCat, setActiveSubCat] = useState('All');
  const [loading, setLoading] = useState(true);
  const [displayProducts, setDisplayProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch all data in parallel logic (listeners)
      onValue(ref(db, 'content/categories/main'), (s) => {
        const data = s.val();
        if (data) {
          const list = Object.keys(data).map(key => ({ id: key, ...data[key] })).filter(c => c.status === 'Active');
          setCategories(list);
          if (!activeCategory && list.length > 0) setActiveCategory(list[0].id);
        }
      });

      onValue(ref(db, 'content/categories/sub'), (s) => {
        const data = s.val();
        if (data) setSubCategories(Object.keys(data).map(key => ({ id: key, ...data[key] })).filter(x => x.status === 'Active'));
      });

      onValue(ref(db, 'content/categories/panel'), (s) => {
        const data = s.val();
        if (data) setPanels(Object.keys(data).map(key => ({ id: key, ...data[key] })));
      });

      onValue(ref(db, 'content/categories/products'), (s) => {
        const data = s.val();
        if (data) {
            setAllProducts(Object.keys(data).map(key => ({
                id: key, ...data[key],
                image: data[key].mainImage || data[key].image, 
                isFeatured: parseInt(data[key].discount || 0) >= 20 
            })));
        }
        setLoading(false);
      });
    };
    fetchData();
    // eslint-disable-next-line
  }, []); 

  useEffect(() => {
    if (!activeCategory) return;
    setLoading(true);
    const timer = setTimeout(() => {
      let filtered = allProducts.filter(p => p.category === activeCategory);
      if (activeSubCat !== 'All') filtered = filtered.filter(p => p.subCategory === activeSubCat);
      setDisplayProducts(filtered);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeCategory, activeSubCat, allProducts]);

  const handleProductClick = (id) => navigate(`/product/${id}`);

  const currentPanel = panels.find(p => p.categoryId === activeCategory) || {
    name: categories.find(c => c.id === activeCategory)?.name || activeCategory,
    description: 'Шилдэг брэнд, чанартай бүтээгдэхүүнүүд.',
    coverImage: null
  };

  const currentSubCats = subCategories.filter(s => s.parentId === activeCategory);
  const highlightProducts = displayProducts.filter(p => p.isFeatured);
  const regularProducts = displayProducts.filter(p => !p.isFeatured);

  // --- WIDE CARD COMPONENT (Used for both Featured & Regular) ---
  const WideProductCard = ({ product, isFeatured = false }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={() => handleProductClick(product.id)}
      className={`group bg-white rounded-3xl p-4 border border-slate-100 shadow-lg hover:shadow-2xl transition-all cursor-pointer flex flex-col md:flex-row gap-6 items-center h-full ${isFeatured ? 'ring-2 ring-orange-100' : ''}`}
    >
      <div className="w-full md:w-1/2 h-48 md:h-56 bg-gray-100 rounded-2xl overflow-hidden relative">
          <img src={product.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
          {product.discount > 0 && (
            <span className="absolute top-3 left-3 bg-rose-600 text-white font-bold text-xs px-2 py-1 rounded shadow-md">-{product.discount}%</span>
          )}
      </div>
      
      <div className="flex-1 w-full text-center md:text-left flex flex-col justify-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">{product.store}</span>
          <h4 className="text-xl font-black text-slate-900 mb-2 leading-tight group-hover:text-rose-600 transition line-clamp-2">{product.name}</h4>
          <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
            <span className="text-2xl font-bold text-rose-600">{product.price}₮</span>
            {product.originalPrice && <span className="text-sm text-slate-400 line-through">{product.originalPrice}₮</span>}
          </div>
          <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-rose-600 transition">Дэлгэрэнгүй</button>
      </div>
    </motion.div>
  );

  if (!activeCategory && loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-rose-600" size={32}/></div>;

  return (
    <div className="pt-24 pb-20 container mx-auto px-2 md:px-4 min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* SIDEBAR */}
        <aside className="w-full lg:w-64 flex-shrink-0">
           <div className="sticky top-24">
              <h2 className="text-xl font-black text-slate-900 mb-6 hidden lg:block px-2">Ангилал</h2>
              <div className="flex lg:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); setActiveSubCat('All'); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${
                      activeCategory === cat.id ? 'bg-slate-900 text-white shadow-lg scale-105' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-100'
                    }`}
                  >
                    <span className={activeCategory === cat.id ? 'text-yellow-400' : 'text-slate-400'}>{iconMap[cat.icon] || <Layers size={20}/>}</span>
                    <span className="font-bold text-sm md:text-base">{cat.name}</span>
                    {activeCategory === cat.id && <ChevronRight size={16} className="ml-auto hidden lg:block" />}
                  </button>
                ))}
              </div>
           </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
           {/* PANEL */}
           <AnimatePresence mode='wait'>
             <motion.div 
               key={activeCategory}
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="relative h-[300px] md:h-[400px] rounded-3xl overflow-hidden mb-10 shadow-2xl group bg-slate-800"
             >
                {currentPanel.coverImage && <img src={currentPanel.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />}
                <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-16 text-white max-w-2xl">
                   <span className="inline-block bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider w-fit mb-4">{activeCategory}</span>
                   <h1 className="text-3xl md:text-6xl font-black mb-4 leading-tight">{currentPanel.name}</h1>
                   <p className="text-white/80 text-lg md:text-xl leading-relaxed">{currentPanel.description}</p>
                </div>
             </motion.div>
           </AnimatePresence>

           {/* CHIPS */}
           {currentSubCats.length > 0 && (
             <div className="mb-10">
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                   <button onClick={() => setActiveSubCat('All')} className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold border transition-all whitespace-nowrap ${activeSubCat === 'All' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200'}`}>Бүгд</button>
                   {currentSubCats.map((sub) => (
                     <button key={sub.id} onClick={() => setActiveSubCat(sub.id)} className={`px-5 py-2.5 rounded-full text-xs md:text-sm font-bold border transition-all whitespace-nowrap ${activeSubCat === sub.id ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-slate-600 border-slate-200'}`}>{sub.name}</button>
                   ))}
                </div>
             </div>
           )}

           {/* 1. ONTSLOH BARAA */}
           {loading ? <div className="grid md:grid-cols-2 gap-6 mb-12"><SkeletonCard /><SkeletonCard /></div> : highlightProducts.length > 0 && (
             <section className="mb-12">
                <div className="flex items-center gap-2 mb-6 text-orange-600">
                   <div className="bg-orange-100 p-2 rounded-lg"><Flame size={20} fill="currentColor" /></div>
                   <h3 className="text-xl font-bold text-slate-900">Онцгой хямдрал</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {highlightProducts.map((product) => <WideProductCard key={product.id} product={product} isFeatured={true} />)}
                </div>
             </section>
           )}

           {/* 2. ENGIIN BARAA (SAME DESIGN) */}
           <section>
              <div className="flex items-center gap-2 mb-6 text-blue-600">
                 <div className="bg-blue-100 p-2 rounded-lg"><PackageOpen size={20} /></div>
                 <h3 className="text-xl font-bold text-slate-900">Бусад санал</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {loading ? [...Array(4)].map((_, i) => <SkeletonCard key={i} />) : regularProducts.map((product) => (
                    <WideProductCard key={product.id} product={product} />
                 ))}
                 {!loading && regularProducts.length === 0 && (
                    <div className="col-span-full py-20 text-center text-slate-400 flex flex-col items-center">
                       <AlertCircle size={40} className="mb-2 opacity-50"/><p>Энэ ангилалд одоогоор өөр бараа алга.</p>
                    </div>
                 )}
              </div>
           </section>

        </main>
      </div>
    </div>
  );
};

export default CategoriesPage;