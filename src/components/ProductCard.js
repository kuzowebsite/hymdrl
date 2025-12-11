import React from 'react';
import { motion } from 'framer-motion';
import { Star, Scale } from 'lucide-react';

const ProductCard = ({ product, onCompare }) => (
  <motion.div 
    layout
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    whileHover={{ y: -5 }}
    className="group bg-white rounded-lg md:rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 relative flex flex-col h-full"
  >
    {/* Image Section */}
    <div className="relative h-24 sm:h-32 md:h-60 bg-gray-100 overflow-hidden">
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
      />
      {/* Discount Badge - Mobile дээр маш жижиг */}
      <span className="absolute top-1 left-1 md:top-3 md:left-3 bg-rose-600 text-white text-[8px] md:text-[10px] font-bold px-1.5 py-0.5 md:px-2 md:py-1 rounded shadow-sm z-10">
        -{product.discount}%
      </span>
      
      {/* Compare Button */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onCompare(product);
        }}
        className="absolute top-1 right-1 md:top-3 md:right-3 w-6 h-6 md:w-8 md:h-8 bg-white/80 backdrop-blur rounded-full flex items-center justify-center hover:bg-slate-900 hover:text-white transition shadow-sm z-10"
      >
        <Scale size={12} className="md:w-4 md:h-4" />
      </button>
    </div>

    {/* Content Section */}
    <div className="p-2 md:p-4 flex-1 flex flex-col justify-between">
      <div>
        {/* Store & Rating - Гар утсан дээр НУУНА (3 баганад багтахгүй тул) */}
        <div className="hidden md:flex justify-between items-center mb-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">{product.store}</span>
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
            <Star size={12} fill="currentColor"/> {product.rating}
          </div>
        </div>
        
        {/* Title - Mobile дээр 2 мөрөнд багтааж, жижиг фонтоор */}
        <h3 className="font-bold text-slate-900 mb-1 line-clamp-2 text-[10px] sm:text-xs md:text-sm leading-tight h-7 md:h-10 group-hover:text-rose-600 transition-colors">
          {product.name}
        </h3>
      </div>
      
      {/* Price Section */}
      <div className="flex flex-col md:flex-row md:items-baseline gap-0 md:gap-2 pt-1 border-t border-slate-50 mt-1">
        <span className="text-xs sm:text-sm md:text-lg font-bold text-rose-600 truncate">{product.price}</span>
        {/* Old Price - Mobile дээр хэт жижиг харагдвал нууж болно, эсвэл маш жижгээр үлдээнэ */}
        <span className="text-[8px] md:text-xs text-slate-400 line-through truncate hidden sm:block">{product.originalPrice}</span>
      </div>
    </div>
  </motion.div>
);

export default ProductCard;