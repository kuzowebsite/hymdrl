import React from 'react';
import { Zap, Tag, Store, Heart } from 'lucide-react';

// STORES DATA
export const STORES = [
  { 
    id: 1,
    name: 'Shoppy', 
    logo: 'S', 
    color: 'bg-orange-500', 
    category: 'Tech',
    rating: 4.8,
    deals: 120,
    isTop: true,
    coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=60',
    description: 'Цахилгаан бараа, компьютер, гар утасны худалдаа.',
    tags: ['Албан ёсны', 'Шуурхай хүргэлт'],
    // 1. OFFICIAL BRANDS
    brands: [
        'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg', 
        'https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg',
        'https://upload.wikimedia.org/wikipedia/commons/b/b8/Dell_Logo.svg'
    ],
    // 2. STORE PEEK (Барааны жижиг зургууд)
    thumbnails: [
        'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=200&h=200&fit=crop'
    ],
    // 3. COUPON CODE
    coupon: 'SHOPPY10', 
    couponDesc: 'Бүх бараа 10% хямдрал',
    // 4. LOCATIONS
    addresses: ['Төв салбар: Сүхбаатар дүүрэг', 'Салбар 2: Зайсан Hill']
  },
  { 
    id: 2,
    name: 'Nomin', 
    logo: 'N', 
    color: 'bg-green-600', 
    category: 'Supermarket',
    rating: 4.5,
    deals: 350,
    isTop: true,
    coverImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=60',
    description: 'Хүнс болон гэр ахуйн барааны сүлжээ дэлгүүр.',
    tags: ['Хямд үнэ'],
    brands: [], 
    thumbnails: [
        'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1627483262769-04d0a1401487?w=200&h=200&fit=crop'
    ],
    coupon: null, // Купонгүй байж болно
    addresses: ['Улсын Их Дэлгүүр', 'Номин Юнайтед', 'Чуулга Номин']
  },
  { 
    id: 3,
    name: 'Technozone', 
    logo: 'T', 
    color: 'bg-black', 
    category: 'Tech',
    rating: 4.9,
    deals: 45,
    isTop: false,
    coverImage: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=800&auto=format&fit=crop&q=60',
    description: 'Apple болон бусад брэндийн албан ёсны борлуулагч.',
    tags: ['Apple Partner'],
    brands: ['https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'],
    thumbnails: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=200&h=200&fit=crop'
    ],
    coupon: 'TECH5',
    couponDesc: 'MacBook 5% хямдрал',
    addresses: ['Computer Mall', 'Shangri-La Mall']
  },
  { 
    id: 4,
    name: 'Goyo', 
    logo: 'G', 
    color: 'bg-slate-400', 
    category: 'Fashion',
    rating: 4.7,
    deals: 80,
    isTop: true,
    coverImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&auto=format&fit=crop&q=60',
    description: 'Монгол ноолууран хувцасны дэлхийн брэнд.',
    tags: ['100% Ноолуур'],
    brands: [],
    thumbnails: [
        'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=200&h=200&fit=crop',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop'
    ],
    coupon: 'GOYO20',
    couponDesc: 'Өвлийн загвар 20%',
    addresses: ['Goyo Factory Store', 'Galleria Ulaanbaatar']
  },
  // Бусад дэлгүүрүүд...
  { 
    id: 5, name: 'Next', logo: 'Nx', color: 'bg-red-600', category: 'Tech', rating: 4.6, deals: 95, isTop: false,
    coverImage: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&auto=format&fit=crop&q=60',
    description: 'Цахилгаан бараа, тавилга.', tags: ['Лизинг'], brands: [], thumbnails: [], coupon: null, addresses: ['Next Plaza']
  }
];

// CATEGORIES DATA
export const CATEGORIES = [
  { 
    id: 'Tech', 
    name: 'Технологи', 
    icon: <Zap />,
    // Cover зураг
    coverImage: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1600&auto=format&fit=crop&q=80',
    description: 'Ирээдүйг өнөөдөр мэдэр. Ухаалаг төхөөрөмжүүдийн ертөнц.',
    // Дэд ангиллууд
    subCategories: ['Бүгд', 'Утас', 'Laptop', 'Чихэвч', 'ТВ', 'Камер']
  },
  { 
    id: 'Fashion', 
    name: 'Хувцас загвар', 
    icon: <Tag />,
    coverImage: 'https://images.unsplash.com/photo-1490481651871-32d2e76f8b02?w=1600&auto=format&fit=crop&q=80',
    description: 'Өөрийн хэв маягийг тодорхойл. Шилдэг брэндүүдийн цуглуулга.',
    subCategories: ['Бүгд', 'Эрэгтэй', 'Эмэгтэй', 'Хүүхэд', 'Гутал', 'Аксессуар']
  },
  { 
    id: 'Home', 
    name: 'Гэр ахуй', 
    icon: <Store />,
    coverImage: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4f9d?w=1600&auto=format&fit=crop&q=80',
    description: 'Тав тухтай амьдралын үндэс. Гэрээ чимэглээрэй.',
    subCategories: ['Бүгд', 'Тавилга', 'Гал тогоо', 'Чимэглэл', 'Гэрэлтүүлэг']
  },
  { 
    id: 'Beauty', 
    name: 'Гоо сайхан', 
    icon: <Heart />,
    coverImage: 'https://images.unsplash.com/photo-1612817288484-927958329f6b?w=1600&auto=format&fit=crop&q=80',
    description: 'Өөртөө хайртай бай. Арьс арчилгаа болон нүүр будалт.',
    subCategories: ['Бүгд', 'Арьс арчилгаа', 'Нүүр будалт', 'Үнэртэй ус', 'Багц']
  },
];

// PRODUCTS DATA (ШИНЭЧИЛСЭН)
export const PRODUCTS = [
  { 
    id: 1, 
    name: 'iPhone 15 Pro Max', 
    originalPrice: '5,500,000₮', 
    price: '4,899,000₮', 
    discount: 11, 
    store: 'Shoppy', 
    rating: 4.8,
    isFeatured: true, // <--- ОНЦЛОХ БАРАА
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&auto=format&fit=crop&q=60', 
    // Олон зураг (Gallery)
    images: [
        'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1695048133169-13154f983847?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1695048132973-207a988c83aa?w=800&auto=format&fit=crop&q=60'
    ]
  },
  { 
    id: 2, 
    name: 'Sony WH-1000XM5', 
    originalPrice: '1,200,000₮', 
    price: '890,000₮', 
    discount: 25, 
    store: 'Technozone', 
    rating: 4.9,
    isFeatured: true, // <--- ОНЦЛОХ БАРАА
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&auto=format&fit=crop&q=60',
    images: [
        'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=60'
    ]
  },
  { 
    id: 3, 
    name: 'Air Jordan 1 Retro', 
    originalPrice: '850,000₮', 
    price: '425,000₮', 
    discount: 50, 
    store: 'Sportmaster', 
    rating: 4.7,
    isFeatured: false, // ЭНГИЙН БАРАА (Featured хуудсанд харагдахгүй)
    image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=60',
    images: ['https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=60']
  },
  { 
    id: 4, 
    name: 'MacBook Air M2', 
    originalPrice: '4,200,000₮', 
    price: '3,750,000₮', 
    discount: 10, 
    store: 'Technozone', 
    rating: 4.9,
    isFeatured: true, // <--- ОНЦЛОХ БАРАА
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=60',
    images: [
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=60',
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800&auto=format&fit=crop&q=60'
    ]
  },
  { 
    id: 5, 
    name: 'PlayStation 5 Slim', 
    originalPrice: '2,100,000₮', 
    price: '1,250,000₮', 
    discount: 35, 
    store: 'Next', 
    rating: 5.0,
    isFeatured: true, // <--- ОНЦЛОХ БАРАА
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=60',
    images: ['https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=60']
  },
  { 
    id: 6, 
    name: 'Өвлийн Куртка', 
    originalPrice: '600,000₮', 
    price: '300,000₮', 
    discount: 50, 
    store: 'Goyo', 
    rating: 4.5,
    isFeatured: false,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=60',
    images: ['https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=60']
  },
];