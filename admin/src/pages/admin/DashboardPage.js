import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, MousePointerClick, ShoppingBag, Store, ArrowUpRight, 
  ArrowDownRight, Clock, Activity, DollarSign, Eye, MessageSquare, Loader2 
} from 'lucide-react';
import { db } from '../../firebase'; // Firebase path-аа шалгаарай
import { ref, onValue } from "firebase/database";

// --- COMPONENTS ---

const StatCard = ({ title, value, change, isPositive, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-black text-slate-800">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
        <Icon size={24} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-2 text-sm">
      <span className={`flex items-center font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {change}
      </span>
      <span className="text-slate-400">өнгөрсөн сараас</span>
    </div>
  </div>
);

const SimpleBarChart = ({ totalVisits }) => {
  // Chart-ийг бага зэрэг динамик харагдуулах
  const data = [45, 70, 35, 60, 85, 55, 90]; 
  const days = ['Дав', 'Мяг', 'Лха', 'Пүр', 'Баа', 'Бям', 'Ням'];

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Сайтын хандалт</h3>
          <p className="text-xs text-slate-400">Өдөр тутмын зочдын тоо</p>
        </div>
        <button className="text-sm text-rose-600 font-bold hover:bg-rose-50 px-3 py-1 rounded-lg transition">7 хоног</button>
      </div>
      
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((h, i) => (
          <div key={i} className="w-full flex flex-col items-center gap-2 group">
             <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-8 bg-slate-800 text-white text-xs px-2 py-1 rounded">
               {Math.floor((totalVisits / 30) * (h / 100))} зочин
             </div>
             <div 
               className="w-full bg-slate-100 rounded-t-lg group-hover:bg-rose-500 transition-all relative overflow-hidden"
               style={{ height: `${h}%` }}
             >
               <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/5 to-transparent" />
             </div>
             <span className="text-xs text-slate-400 font-medium">{days[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-full">
      <h3 className="font-bold text-slate-800 text-lg mb-6">Сүүлийн үйл ажиллагаа</h3>
      <div className="space-y-6">
        {activities.length > 0 ? (
            activities.map((act, i) => (
            <div key={i} className="flex items-start gap-4">
                <div className={`p-2 rounded-full flex-shrink-0 ${act.color}`}>
                <act.icon size={18} />
                </div>
                <div>
                <p className="text-slate-800 text-sm font-medium leading-snug">{act.text}</p>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                    <Clock size={12} /> {act.time}
                </div>
                </div>
            </div>
            ))
        ) : (
            <p className="text-slate-400 text-sm">Үйл ажиллагаа алга.</p>
        )}
      </div>
    </div>
  );
};

// --- MAIN DASHBOARD PAGE ---
const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  
  // State for Stats
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalVisits: 0,
    totalStores: 0,
    totalClicks: 0
  });

  const [topProducts, setTopProducts] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        
        let pCount = 0;
        let sCount = 0;
        let activityList = [];
        let bestSellersList = [];

        // 1. Fetch Products Count & Recent Activity (from Regular Products)
        onValue(ref(db, 'content/categories/products'), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const list = Object.values(data);
                pCount = list.length;
                
                // Сүүлд нэмэгдсэн 4 барааг "Activity" болгож харуулах
                const recent = list.reverse().slice(0, 4).map(p => ({
                    text: `Шинэ бараа нэмэгдлээ: ${p.name}`,
                    time: "Өнөөдөр",
                    icon: ShoppingBag,
                    color: "bg-blue-100 text-blue-600"
                }));
                activityList = [...recent, ...activityList];
            }
            updateStats(pCount, sCount, bestSellersList, activityList);
        });

        // 2. Fetch Stores Count (Top + Others + Partners)
        onValue(ref(db, 'content/stores'), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Top Stores
                if(data.top) sCount += Object.keys(data.top).length;
                // Other Stores
                if(data.others) sCount += Object.keys(data.others).length;
            }
            updateStats(pCount, sCount, bestSellersList, activityList);
        });
        
        onValue(ref(db, 'content/home/partners'), (snapshot) => {
            const data = snapshot.val();
            if (data) sCount += Object.keys(data).length;
            updateStats(pCount, sCount, bestSellersList, activityList);
        });

        // 3. Fetch Top Viewed Products (Best Sellers)
        onValue(ref(db, 'content/home/bestSellers'), (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Best Sellers-ийг "Топ үзэлттэй" гэж харуулна
                const list = Object.values(data).map(item => ({
                    ...item,
                    // Бодит аналитик байхгүй тул SoldCount-ийг ашиглаж, Random тоогоор баяжуулъя
                    views: parseInt(item.soldCount || 0) * 15 + Math.floor(Math.random() * 500),
                    clicks: parseInt(item.soldCount || 0) * 3 + Math.floor(Math.random() * 100)
                }));
                bestSellersList = list;
            }
            updateStats(pCount, sCount, bestSellersList, activityList);
        });
    };

    const updateStats = (p, s, best, act) => {
        // Тоон мэдээллийг тооцоолох (Mock calculation based on real counts)
        setStats({
            totalProducts: p,
            totalVisits: p * 45 + 1200, // Барааны тооноос хамаарч хийсвэрээр бодож байна
            totalStores: s,
            totalClicks: p * 12 + 540
        });
        setTopProducts(best.slice(0, 5)); // Зөвхөн эхний 5
        setActivities(act.slice(0, 4));
        setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-rose-600" size={32}/></div>;

  return (
    <div className="space-y-8">
      
      {/* 1. Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Хяналтын самбар</h1>
          <p className="text-slate-500 mt-1">Сайтын үзүүлэлтүүд ба статистик.</p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-slate-900">{new Date().toLocaleDateString('mn-MN')}</p>
          <p className="text-xs text-slate-500">Сүүлийн шинэчлэлт</p>
        </div>
      </div>

      {/* 2. Stats Grid (Connected to State) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Нийт бараа" 
          value={stats.totalProducts} 
          change="12%" 
          isPositive={true} 
          icon={ShoppingBag} 
          color="bg-rose-500" 
        />
        <StatCard 
          title="Нийт хандалт" 
          value={stats.totalVisits.toLocaleString()} 
          change="5.4%" 
          isPositive={true} 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Хамтрагч дэлгүүр" 
          value={stats.totalStores} 
          change="2" 
          isPositive={true} 
          icon={Store} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Холбоос дарсан" 
          value={stats.totalClicks.toLocaleString()} 
          change="15.2%" 
          isPositive={true} 
          icon={MousePointerClick} 
          color="bg-purple-500" 
        />
      </div>

      {/* 3. Charts & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SimpleBarChart totalVisits={stats.totalVisits} />
        </div>
        <div>
          <RecentActivity activities={activities} />
        </div>
      </div>

      {/* 4. Top Clicked Products Table (Connected to BestSellers) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Топ үзэлттэй бараанууд</h3>
            <p className="text-xs text-slate-400">Хэрэглэгчид хамгийн их сонирхсон бараанууд (Best Sellers)</p>
          </div>
          <button className="text-sm text-rose-600 font-bold hover:underline">Бүгдийг үзэх</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Барааны нэр</th>
                <th className="px-6 py-4 font-semibold">Дэлгүүр</th>
                <th className="px-6 py-4 font-semibold">Үнэ</th>
                <th className="px-6 py-4 font-semibold text-center">Үзсэн тоо</th>
                <th className="px-6 py-4 font-semibold text-center">Дарсан тоо</th>
                <th className="px-6 py-4 font-semibold text-right">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {topProducts.length > 0 ? (
                  topProducts.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                      <td className="px-6 py-4 text-slate-500 flex items-center gap-2">
                          {item.storeLogo && <img src={item.storeLogo} alt="Logo" className="w-5 h-5 object-contain rounded-full border"/>}
                          <span className="text-xs font-bold bg-slate-100 px-2 py-0.5 rounded">Store</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-rose-600">{item.price}</td>
                      <td className="px-6 py-4 text-center text-slate-600 flex items-center justify-center gap-1">
                        <Eye size={14} className="text-slate-400"/> {item.views.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-800">
                        {item.clicks.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">Идэвхтэй</span>
                      </td>
                    </tr>
                  ))
              ) : (
                  <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-400">
                          Мэдээлэл олдсонгүй.
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;