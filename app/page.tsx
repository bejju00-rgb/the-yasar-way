"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/data/cartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductCard from "@/components/ProductCard";

const countryConfig = {
  PK: { label: "Pakistan", currency: "Rs.", rate: 1, locale: "en-PK" },
  US: { label: "United States", currency: "$", rate: 0.0036, locale: "en-US" },
  GB: { label: "United Kingdom", currency: "£", rate: 0.0028, locale: "en-GB" },
  AE: { label: "UAE", currency: "AED", rate: 0.013, locale: "ar-AE" },
};

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [dbOffers, setDbOffers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  
  const { cart, addToCart, clearCart } = useCartStore();
  const [activeCountry, setActiveCountry] = useState<keyof typeof countryConfig>("PK");
  const config = countryConfig[activeCountry];
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const [prodRes, catRes, offRes] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('offers').select('*').eq('is_active', true)
      ]);

      if (prodRes.data) setDbProducts(prodRes.data);
      if (catRes.data) setCategories(catRes.data);
      if (offRes.data) setDbOffers(offRes.data);
      
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (dbOffers.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % dbOffers.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [dbOffers.length]);

  const formatPrice = (price: number) => {
    return (price * config.rate).toLocaleString(config.locale, {
      minimumFractionDigits: activeCountry === "PK" ? 0 : 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      
      {/* 1. LOADING OVERLAY */}
      <AnimatePresence>
        {loading && (
          <motion.div exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
            <motion.h1 
              initial={{ letterSpacing: "1.5em", opacity: 0 }}
              animate={{ letterSpacing: "0.5em", opacity: 1 }}
              className="text-white text-xs font-black uppercase italic tracking-widest"
            >
             THE YASAR WAY
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. NAVIGATION */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-8 sticky top-0 bg-white/80 backdrop-blur-xl z-50 border-b border-gray-100">
        <Link href="/" className="text-xl font-black tracking-tighter uppercase italic">THE YASAR WAY</Link>
        
        <div className="flex items-center space-x-8">
          <div className="relative group cursor-pointer hidden md:block">
            <span className="text-[10px] font-black uppercase tracking-widest border border-black/10 px-4 py-2 rounded-full hover:bg-black hover:text-white transition-all">
              {activeCountry} — {config.currency}
            </span>
            <div className="absolute top-full right-0 mt-2 bg-white border border-gray-100 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all flex flex-col min-w-[180px] rounded-2xl overflow-hidden">
              {Object.entries(countryConfig).map(([code, details]) => (
                <button key={code} onClick={() => setActiveCountry(code as any)} className="px-6 py-4 text-left hover:bg-zinc-50 text-[9px] font-black uppercase tracking-widest border-b border-gray-50 last:border-0">
                  {details.label}
                </button>
              ))}
            </div>
          </div>
          <Link href="/checkout" className="text-[10px] font-black tracking-widest bg-black text-white px-6 py-2 rounded-full hover:bg-emerald-500 transition-colors">
            BAG ({cart.length})
          </Link>
        </div>
      </nav>

      {/* 3. DYNAMIC HERO BANNERS */}
      <section className="relative w-full aspect-[16/9] md:h-[80vh] bg-zinc-100 overflow-hidden">
        {dbOffers.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.div key={currentSlide} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="relative w-full h-full">
              <img src={dbOffers[currentSlide].image_url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col items-center justify-end pb-20 text-white p-6">
                <motion.h2 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-center leading-none">
                  {dbOffers[currentSlide].title}
                </motion.h2>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-300 font-black uppercase italic tracking-tighter text-4xl">Establishing Link...</div>
        )}
      </section>

      {/* 4. DYNAMIC SECTIONS (CATEGORIES) */}
      <section className="py-32 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-16">
          <div className="flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-emerald-500 mb-2">Curated Series</p>
            <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter">Collections</h2>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 pb-2">HQ Source: {categories.length} Nodes</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {categories.map((cat) => (
            <Link 
              href={`/category/${cat.slug || cat.id}`} // FIX: Fallback to ID if slug is missing
              key={cat.id} 
              className="group relative aspect-[4/5] bg-zinc-100 rounded-[50px] overflow-hidden shadow-sm hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] transition-all duration-700 hover:-translate-y-4"
            >
              <img 
                src={cat.image_url} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-110" 
                alt={cat.name} 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/80 group-hover:via-transparent group-hover:to-black/40 transition-all duration-700" />
              <div className="absolute inset-0 p-10 flex flex-col justify-end">
                <div className="overflow-hidden">
                   <h3 className="text-3xl font-black uppercase italic text-white tracking-tighter group-hover:text-emerald-400 transition-colors duration-500">
                     {cat.name}
                   </h3>
                </div>
                <div className="mt-4 translate-y-20 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                  <span className="inline-block bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] px-8 py-4 rounded-full shadow-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                    View Collection
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. LATEST PRODUCTS */}
      <section className="py-32 px-6 md:px-12 bg-zinc-50 rounded-t-[60px]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center mb-20">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-center">New Drops</h2>
            <div className="h-1 w-20 bg-black mt-4" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {dbProducts.map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                config={config}
                onOpenModal={setSelectedProduct}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 6. PRODUCT MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="relative bg-white w-full max-w-6xl h-full md:h-[85vh] overflow-hidden flex flex-col md:flex-row rounded-[50px]">
              <div className="w-full md:w-1/2 h-[50%] md:h-full bg-zinc-100 p-8">
                <img src={selectedProduct.image_url} className="w-full h-full object-contain mix-blend-multiply" alt="" />
              </div>
              <div className="w-full md:w-1/2 h-[50%] md:h-full p-10 md:p-20 flex flex-col">
                <button onClick={() => setSelectedProduct(null)} className="self-end mb-8 text-[10px] font-black uppercase tracking-widest opacity-30 hover:opacity-100">✕ Close</button>
                <h2 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-[0.8] mb-8">{selectedProduct.name}</h2>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-3xl font-bold">{config.currency} {formatPrice(selectedProduct.price)}</span>
                  <span className="text-xs text-zinc-400 line-through">{config.currency} {formatPrice(selectedProduct.price * 1.2)}</span>
                </div>
                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest leading-loose mb-12 flex-grow">{selectedProduct.description || "Premium build quality. Engineered for the bold. Part of the Yasar Way collection."}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button onClick={() => { addToCart({ ...selectedProduct }); setSelectedProduct(null); }} className="bg-black text-white py-6 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-emerald-500 transition-colors">Add to Bag</button>
                  <button onClick={() => { clearCart(); addToCart({ ...selectedProduct }); router.push("/checkout"); }} className="border-2 border-black py-6 rounded-2xl font-black text-[10px] tracking-[0.3em] uppercase hover:bg-black hover:text-white transition-all">Buy Immediately</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </main>
  );
}