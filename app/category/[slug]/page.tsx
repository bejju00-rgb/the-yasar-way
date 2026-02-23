"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/data/cartStore";

const countryConfig = {
  PK: { label: "Pakistan", currency: "Rs.", rate: 1, locale: "en-PK" },
  US: { label: "United States", currency: "$", rate: 0.0036, locale: "en-US" },
  GB: { label: "United Kingdom", currency: "£", rate: 0.0028, locale: "en-GB" },
  AE: { label: "UAE", currency: "AED", rate: 0.013, locale: "ar-AE" },
};

export default function CategoryPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  
  const { cart } = useCartStore();
  const [activeCountry, setActiveCountry] = useState<keyof typeof countryConfig>("PK");
  const config = countryConfig[activeCountry];

  useEffect(() => {
    async function fetchCategoryData() {
      const { data: catData, error: catError } = await supabase
        .from("categories")
        .select("*")
        .eq("slug", slug)
        .single();

      if (catError || !catData) {
        setLoading(false);
        return;
      }

      setCategory(catData);

      const { data: prodData } = await supabase
        .from("products")
        .select("*")
        .eq("category_id", catData.id)
        .order("created_at", { ascending: false });

      setProducts(prodData || []);
      setLoading(false);
    }

    if (slug) fetchCategoryData();
  }, [slug]);

  const formatPrice = (price: number) => {
    return (price * config.rate).toLocaleString(config.locale, {
      minimumFractionDigits: activeCountry === "PK" ? 0 : 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <p className="text-white font-black uppercase tracking-[0.5em] animate-pulse text-[10px]">Accessing Sector...</p>
    </div>
  );

  if (!category) return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-black uppercase italic mb-4">404 / Void</h1>
      <Link href="/" className="text-[10px] font-bold border-b-2 border-black pb-1 uppercase">Return to HQ</Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-white">
      {/* NAVIGATION BAR */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-8 sticky top-0 bg-white/80 backdrop-blur-xl z-[100] border-b border-gray-100">
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

      {/* HEADER SECTION */}
      <section className="relative h-[40vh] bg-black overflow-hidden flex items-center justify-center">
        <img src={category.image_url} className="absolute inset-0 w-full h-full object-cover opacity-40 grayscale" alt="" />
        <div className="relative z-10 text-center text-white px-6">
          <Link href="/" className="text-[9px] font-black tracking-[0.4em] uppercase opacity-50 hover:opacity-100 mb-4 block">← Back to HQ</Link>
          <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">{category.name}</h1>
          <p className="text-[10px] font-bold tracking-[0.5em] uppercase mt-4 text-emerald-400">{products.length} Units Found</p>
        </div>
      </section>

      {/* PRODUCT GRID */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-16">
          {products.map((product) => (
            <motion.div 
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
              onClick={() => router.push(`/product/${product.id}`)}
            >
              {/* THE ELEVATED CARD CONTAINER */}
              <div className="relative aspect-[3/4] bg-zinc-50 rounded-[45px] overflow-hidden border border-zinc-100 shadow-sm transition-all duration-700 group-hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] group-hover:-translate-y-4">
                <img 
                  src={product.image_url} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={product.name} 
                />
                
                {/* DARK OVERLAY ON HOVER */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                
                {/* VIEW PRODUCT BUTTON SLIDE-UP */}
                <div className="absolute inset-0 flex items-end justify-center pb-8 px-6">
                  <div className="translate-y-24 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] w-full">
                    <div className="bg-white text-black py-4 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-center shadow-2xl group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                      View Product
                    </div>
                  </div>
                </div>
              </div>

              {/* PRODUCT INFO */}
              <div className="mt-8 px-4 text-center">
                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 group-hover:text-emerald-500 transition-colors duration-300">
                  {product.name}
                </h4>
                <div className="flex items-center justify-center gap-3 mt-2">
                   <p className="text-lg font-black italic tracking-tighter text-zinc-900">
                     {config.currency} {formatPrice(product.price)}
                   </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </main>
  );
}