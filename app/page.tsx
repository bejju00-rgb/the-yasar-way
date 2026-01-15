"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/data/cartStore";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const { cart, addToCart } = useCartStore();

  const slides = [
    { title: "ELEVATE YOUR", subtitle: "EVERYDAY", color: "bg-[#fcfcfc]" },
    { title: "THE MODERN", subtitle: "STANDARD", color: "bg-[#f4f4f4]" },
    { title: "DEFINING", subtitle: "THE WAY", color: "bg-[#eeeeee]" },
  ];

  useEffect(() => {
    // 1. Load products from Supabase
    async function getProducts() {
      const { data } = await supabase.from('products').select('*');
      if (data) setDbProducts(data);
    }
    getProducts();

    // 2. Entrance Animation Timer
    const timer = setTimeout(() => setLoading(false), 2000);
    
    // 3. Slideshow Timer
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearInterval(slideTimer);
    };
  }, [slides.length]);

  return (
    <main className="min-h-screen bg-white text-black overflow-hidden">
      
      {/* 1. SLIDING DOORS ANIMATION */}
      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 z-[100] flex">
            <motion.div 
              initial={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
              className="h-full w-1/2 bg-black flex items-center justify-end"
            >
              <span className="text-white text-4xl font-black italic mr-[-60px] z-[110]">THE YASAR</span>
            </motion.div>
            <motion.div 
              initial={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }}
              className="h-full w-1/2 bg-black flex items-center justify-start"
            >
              <span className="text-white text-4xl font-black italic ml-[-40px] z-[110]">WAY</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. NAVIGATION BAR */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="text-2xl font-black tracking-tighter uppercase italic">THE YASAR WAY</div>
        <div className="hidden md:flex space-x-10 text-[10px] font-bold tracking-[0.2em]">
          <a href="#" className="hover:text-gray-400 uppercase">Home</a>
          <a href="#" className="hover:text-gray-400 uppercase">Shop All</a>
        </div>
        <Link href="/checkout">
          <div className="text-[10px] font-bold tracking-widest border-b-2 border-black pb-1 cursor-pointer">
            CART ({cart.length})
          </div>
        </Link>
      </nav>

      {/* 3. HERO SLIDESHOW */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className={`absolute inset-0 flex flex-col items-center justify-center text-center px-4 ${slides[currentSlide].color}`}
          >
            <span className="text-[10px] font-bold tracking-[0.4em] text-gray-400 uppercase mb-4">Premium Grooming Essentials</span>
            <h1 className="text-6xl md:text-[100px] font-black uppercase italic leading-[0.9] tracking-tighter">
              {slides[currentSlide].title} <br /> 
              <span className="text-gray-300">{slides[currentSlide].subtitle}</span>
            </h1>
            <button className="mt-10 border-2 border-black text-black px-12 py-4 text-xs font-bold tracking-[0.3em] hover:bg-black hover:text-white transition-all">
              SHOP COLLECTION
            </button>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 4. PRODUCT SECTION */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-12 text-center">New Drops</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dbProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-gray-50 flex flex-col items-center justify-center border border-gray-100 relative overflow-hidden transition-all hover:shadow-xl">
                <span className="text-gray-200 font-bold group-hover:scale-110 transition-transform duration-500 uppercase italic">
                  {product.name}
                </span>
                {/* ADD TO CART BUTTON OVERLAY */}
                <button 
                  onClick={() => addToCart(product)}
                  className="absolute bottom-0 w-full bg-black text-white py-4 text-[10px] font-bold tracking-widest translate-y-full group-hover:translate-y-0 transition-transform"
                >
                  ADD TO CART
                </button>
              </div>
              <div className="mt-4 text-center">
                <h3 className="font-bold text-xs uppercase tracking-widest">{product.name}</h3>
                <span className="text-black font-bold text-xs">Rs. {product.price}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}