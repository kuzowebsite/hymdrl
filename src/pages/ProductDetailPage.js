import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, ShoppingBag, ShieldCheck, Truck, Share2, Loader2, Image as ImageIcon } from 'lucide-react';
import { db } from '../firebase';
import { ref, get } from "firebase/database";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  // --- FETCH PRODUCT DATA ---
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        // Бид барааг аль категорид байгааг мэдэхгүй тул боломжит бүх замуудаар хайх хэрэгтэй
        // 1. Featured Products
        const featuredSnap = await get(ref(db, `content/featured/products/${id}`));
        if (featuredSnap.exists()) {
          setupProduct(featuredSnap.val());
          return;
        }

        // 2. Best Sellers
        const bestSellerSnap = await get(ref(db, `content/home/bestSellers/${id}`));
        if (bestSellerSnap.exists()) {
          setupProduct(bestSellerSnap.val());
          return;
        }

        // 3. Flash Sales
        const flashSnap = await get(ref(db, `content/home/flashSales/${id}`));
        if (flashSnap.exists()) {
          setupProduct(flashSnap.val());
          return;
        }

        // 4. Regular Products (Categories)
        // Энийг хайхад жаахан төвөгтэй учир нь ID-гаар шууд хандах боломжгүй (parent нь мэдэгдэхгүй бол)
        // Гэхдээ одоогоор дээрх 3-аас олдсонгүй гэж үзье.
        
        // Хэрэв олдохгүй бол:
        setProduct(null);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
    window.scrollTo(0, 0);
  }, [id]);

  // Data Normalization Helper
  const setupProduct = (data) => {
    // Админ дээр өөр өөр хэсэгт зурагны нэрийг өөр өөрөөр хадгалсан байж магадгүй (mainImage, image, productImage)
    // Тэдгээрийг нэгтгэж 'image' гэдэг хувьсагчид онооно.
    const mainImg = data.mainImage || data.image || data.productImage || null;
    
    const formattedProduct = {
      ...data,
      image: mainImg,
      gallery: data.gallery || [mainImg], // Галерей байхгүй бол үндсэн зургийг хийнэ
      rating: data.rating || 5.0, // Default rating
      discount: data.discount || data.discountPercent || 0,
      description: data.description || "Тайлбар байхгүй.",
      store: data.store || "Hyamdral.mn"
    };

    setProduct(formattedProduct);
    setSelectedImage(mainImg);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 bg-gray-50">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Бүтээгдэхүүн олдсонгүй 😔</h2>
        <p className="text-slate-500 mb-6">Таны хайсан бараа устгагдсан эсвэл байхгүй байна.</p>
        <button onClick={() => navigate('/')} className="bg-rose-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-rose-700 transition">
          Нүүр хуудас руу буцах
        </button>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 container mx-auto px-4 min-h-screen">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-6 font-medium transition">
        <ArrowLeft size={20} /> Буцах
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        
        {/* --- IMAGE GALLERY SECTION --- */}
        <div className="space-y-4">
           {/* MAIN IMAGE */}
           <div className="bg-white rounded-3xl overflow-hidden h-[350px] md:h-[500px] relative group border border-slate-100 shadow-sm flex items-center justify-center">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.name} 
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-500" 
                />
              ) : (
                <div className="text-slate-300 flex flex-col items-center">
                   <ImageIcon size={64} />
                   <span className="text-sm mt-2">Зураггүй</span>
                </div>
              )}
              
              {product.discount > 0 && (
                <div className="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-md">
                  -{product.discount}%
                </div>
              )}
           </div>

           {/* THUMBNAILS */}
           {product.gallery && product.gallery.length > 1 && (
             <div className="grid grid-cols-6 gap-2">
                {product.gallery.slice(0, 6).map((img, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square bg-white rounded-xl border-2 cursor-pointer overflow-hidden p-1 transition-all ${selectedImage === img ? 'border-rose-600 ring-2 ring-rose-100' : 'border-slate-100 hover:border-slate-300'}`}
                  >
                     <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain rounded-lg" />
                  </div>
                ))}
             </div>
           )}
        </div>

        {/* --- INFO SECTION --- */}
        <div className="space-y-6 md:space-y-8 py-2">
           <div>
             <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full">{product.store}</span>
                <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded-lg">
                  <Star fill="currentColor" size={16}/> {product.rating}
                </div>
             </div>
             <h1 className="text-2xl md:text-4xl font-black text-slate-900 mb-4 leading-tight">{product.name}</h1>
             
             {/* Тайлбар хэсэг (HTML line break дэмжих) */}
             <p className="text-slate-500 text-sm md:text-lg leading-relaxed whitespace-pre-line">
               {product.description}
             </p>
           </div>

           <div className="p-5 md:p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-5">
              <div className="flex items-end gap-3 md:gap-4">
                 <span className="text-3xl md:text-4xl font-bold text-slate-900">{product.price}</span>
                 {product.originalPrice && product.originalPrice !== product.price && (
                    <span className="text-lg md:text-xl text-slate-400 line-through mb-1 decoration-2">{product.originalPrice}</span>
                 )}
              </div>
              <div className="flex gap-3">
                 {product.link ? (
                   <a 
                     href={product.link} 
                     target="_blank" 
                     rel="noreferrer" 
                     className="flex-1 bg-slate-900 text-white py-3 md:py-4 rounded-xl font-bold hover:bg-rose-600 transition flex items-center justify-center gap-2 text-sm md:text-base shadow-lg shadow-slate-200"
                   >
                     <ShoppingBag size={20} /> Дэлгүүр рүү очих
                   </a>
                 ) : (
                   <button disabled className="flex-1 bg-gray-200 text-gray-500 py-3 rounded-xl font-bold cursor-not-allowed">
                     Линк байхгүй
                   </button>
                 )}
                 <button className="p-3 md:p-4 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-500 transition"><Share2 size={20} /></button>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                 <div className="bg-green-100 p-2.5 rounded-full text-green-600"><ShieldCheck size={20}/></div>
                 <div>
                   <p className="font-bold text-slate-900 text-sm">Баталгаа</p>
                   <p className="text-xs text-slate-500">{product.warranty || "Мэдээлэлгүй"}</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                 <div className="bg-blue-100 p-2.5 rounded-full text-blue-600"><Truck size={20}/></div>
                 <div>
                   <p className="font-bold text-slate-900 text-sm">Хүргэлт</p>
                   <p className="text-xs text-slate-500">{product.delivery || "Мэдээлэлгүй"}</p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;