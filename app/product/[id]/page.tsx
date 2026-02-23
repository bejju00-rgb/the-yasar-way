"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/data/cartStore";
import { motion } from "framer-motion";
import Link from "next/link";

const countryConfig = {
  PK: { label: "Pakistan", currency: "Rs.", rate: 1, locale: "en-PK" },
  US: { label: "United States", currency: "$", rate: 0.0036, locale: "en-US" },
  GB: { label: "United Kingdom", currency: "£", rate: 0.0028, locale: "en-GB" },
  AE: { label: "UAE", currency: "AED", rate: 0.013, locale: "ar-AE" },
};

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { cart, addToCart, clearCart } = useCartStore();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // LIVE VIEWER UPDATE LOGIC
  const [viewers, setViewers] = useState(Math.floor(Math.random() * (100 - 40 + 1) + 40));
  
  useEffect(() => {
    const updateInterval = () => {
      setViewers((prev) => {
        const change = Math.floor(Math.random() * 3) + 1;
        const isIncrease = Math.random() > 0.45; // Slight bias toward higher numbers
        const nextValue = isIncrease ? prev + change : prev - change;
        return Math.max(35, Math.min(120, nextValue)); // Keep within realistic bounds
      });

      const nextTick = Math.floor(Math.random() * (5000 - 3000 + 1)) + 3000;
      timer = setTimeout(updateInterval, nextTick);
    };

    let timer = setTimeout(updateInterval, 3000);
    return () => clearTimeout(timer);
  }, []);

  const [soldCount] = useState(Math.floor(Math.random() * (5000 - 1000 + 1) + 1000));
  const [activeCountry, setActiveCountry] = useState<keyof typeof countryConfig>("PK");
  const config = countryConfig[activeCountry];

  useEffect(() => {
    async function fetchProduct() {
      if (!id) return;
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name)")
        .eq("id", id) 
        .single();

      if (error || !data) {
        console.error("Product not found");
      } else {
        setProduct(data);
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const formatPrice = (price: number) => {
    return (price * config.rate).toLocaleString(config.locale, {
      minimumFractionDigits: activeCountry === "PK" ? 0 : 2,
      maximumFractionDigits: 2
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white text-[10px] font-black uppercase tracking-[0.5em]">
      Analyzing Specs...
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <h1 className="text-2xl font-black uppercase italic mb-4 text-red-500">404 / Void</h1>
      <Link href="/" className="text-[10px] font-bold border-b-2 border-black pb-1 uppercase">Back to Collection</Link>
    </div>
  );

  return (
    <main className="min-h-screen bg-white text-black selection:bg-black selection:text-white">
      {/* 1. MINI NAVIGATION */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-zinc-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link href="/" className="text-sm font-black italic tracking-tighter">THE YASAR WAY</Link>
        <Link href="/checkout" className="text-[10px] font-black tracking-widest bg-black text-white px-5 py-2 rounded-full">
          BAG ({cart.length})
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16">
        
        {/* LEFT: Image Section */}
        <div className="w-full lg:w-1/2">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="lg:sticky lg:top-32">
            <div className="relative aspect-[1/1] rounded-[40px] overflow-hidden bg-zinc-50 border border-zinc-100">
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </motion.div>
        </div>

        {/* RIGHT: Info Section */}
        <div className="w-full lg:w-1/2 flex flex-col">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              {product.name}
            </h1>
            
            <div className="flex items-center gap-4 mb-6">
              <span className="text-2xl font-bold text-red-600">{config.currency} {formatPrice(product.price)}</span>
              {product.old_price && (
                <span className="text-lg text-zinc-400 line-through">{config.currency} {formatPrice(product.old_price)}</span>
              )}
            </div>

            <p className="text-zinc-500 text-[11px] mb-8">Shipping calculated at checkout.</p>

            {/* SOCIAL PROOF SECTION */}
            <div className="space-y-4 mb-8">
              {/* Live Viewers */}
              <div className="flex items-center gap-2 text-[11px] font-medium text-zinc-600 tabular-nums">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                {viewers} people are watching this product now!
              </div>

              {/* In Stock */}
              <div className="flex items-center gap-2 text-[11px] font-medium text-emerald-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                In stock, ready to ship
              </div>

              {/* Sold Count Badge */}
              <div className="inline-block bg-[#2d2a1a] text-[#f4d66d] px-4 py-1.5 rounded-md text-[11px] font-bold border border-[#f4d66d]/20">
                {soldCount}+ Sold Within One Month
              </div>
            </div>

            {/* BUTTONS */}
            <div className="space-y-3 mb-10">
              <button 
                onClick={() => addToCart({ ...product })}
                className="w-full border-2 border-black py-4 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-zinc-50 transition-all"
              >
                Add to cart
              </button>
              <button 
                onClick={() => { clearCart(); addToCart({ ...product }); router.push("/checkout"); }}
                className="w-full bg-black text-white py-4 rounded-md font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all"
              >
                Buy it now
              </button>
            </div>

            {/* DELIVERY INFO */}
            <div className="bg-[#fdf9f0] border border-[#f3e6c9] p-4 rounded-md flex items-center gap-4 mb-10">
              <div className="text-xl">🚚</div>
              <p className="text-[11px] font-medium text-zinc-700">Expected delivery in 5-7 business days</p>
            </div>

            {/* TRUST TILES */}
            <div className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: "Approved product", icon: "🛡️" },
                { label: "Highest Quality Material", icon: "💎" },
                { label: "5000+ Happy Customers", icon: "👤" }
              ].map((tile, i) => (
                <div key={i} className="bg-[#f6f2eb] p-4 rounded-xl text-center flex flex-col items-center gap-2">
                  <span className="text-lg">{tile.icon}</span>
                  <span className="text-[9px] font-bold leading-tight uppercase">{tile.label}</span>
                </div>
              ))}
            </div>

            {/* ADVANCE PAYMENT OFFER */}
            <div className="bg-zinc-50 p-6 rounded-xl border border-dashed border-zinc-300">
              <h3 className="text-xs font-black mb-2 flex items-center gap-2">
                📌 Advance Payment Offer
              </h3>
              <p className="text-[11px] text-zinc-600 font-bold mb-1">Get Rs.200 Discount on advance payment.</p>
              <p className="text-[11px] text-zinc-500">For advance payment contact on WhatsApp: 03285900914</p>
            </div>

          </motion.div>
        </div>
      </div>
    </main>
  );
}