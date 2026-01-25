"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/data/cartStore";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null); // State for the popup
  const { cart, addToCart } = useCartStore();
  
  const shopSectionRef = useRef<HTMLDivElement>(null);

  const slides = [
    { title: "ELEVATE YOUR", subtitle: "EVERYDAY", image: "https://your-image-url-1.jpg" },
    { title: "THE MODERN", subtitle: "STANDARD", image: "https://your-image-url-2.jpg" },
    { title: "DEFINING", subtitle: "THE WAY", image: "https://your-image-url-3.jpg" },
  ];

  const scrollToShop = () => {
    shopSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    async function getProducts() {
      const { data } = await supabase.from('products').select('*');
      if (data) setDbProducts(data);
    }
    getProducts();
    const timer = setTimeout(() => setLoading(false), 2000);
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => { clearTimeout(timer); clearInterval(slideTimer); };
  }, [slides.length]);

  return (
    <main className="min-h-screen bg-white text-black overflow-x-hidden">
      
      {/* 1. SLIDING DOORS ANIMATION */}
      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 z-[100] flex">
            <motion.div initial={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }} className="h-full w-1/2 bg-black flex items-center justify-end">
              <span className="text-white text-2xl md:text-4xl font-black italic pr-5 md:pr-7 z-[110] whitespace-nowrap">THE YASAR</span>
            </motion.div>
            <motion.div initial={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }} className="h-full w-1/2 bg-black flex items-center justify-start">
              <span className="text-white text-2xl md:text-4xl font-black italic pl-5 md:pl-7 z-[110] whitespace-nowrap">WAY</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. NAVIGATION BAR */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-6 border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link href="/" className="text-xl md:text-2xl font-black tracking-tighter uppercase italic">THE YASAR WAY</Link>
        <div className="hidden md:flex space-x-10 text-[10px] font-bold tracking-[0.2em]">
          <Link href="/" className="hover:text-gray-400 uppercase">Home</Link>
          <button onClick={scrollToShop} className="hover:text-gray-400 uppercase">Shop All</button>
        </div>
        <Link href="/checkout">
          <div className="text-[10px] font-bold tracking-widest border-b-2 border-black pb-1 cursor-pointer">
            CART ({cart.length})
          </div>
        </Link>
      </nav>

      {/* 3. HERO SLIDESHOW */}
      <section className="relative h-[70vh] md:h-[85vh] flex items-center justify-center overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div key={currentSlide} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="absolute inset-0">
            <img src={slides[currentSlide].image} alt="Hero" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <motion.span initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="text-[8px] md:text-[10px] font-bold tracking-[0.4em] text-gray-300 uppercase mb-4">
                Premium Grooming Essentials
              </motion.span>
              <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="text-4xl md:text-[100px] font-black uppercase italic leading-[0.9] tracking-tighter text-white">
                {slides[currentSlide].title} <br /> 
                <span className="text-gray-400">{slides[currentSlide].subtitle}</span>
              </motion.h1>
              <motion.button initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.9 }} onClick={scrollToShop} className="mt-8 md:mt-10 border-2 border-white text-white px-8 md:px-12 py-3 md:py-4 text-[10px] font-bold tracking-[0.3em] hover:bg-white hover:text-black transition-all">
                SHOP COLLECTION
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* 4. PRODUCT SECTION */}
      <section ref={shopSectionRef} className="py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-20">
        <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-8 md:mb-12 text-center">New Drops</h2>
        
        {/* Responsive Grid: 2 columns on mobile, 3 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {dbProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer" onClick={() => setSelectedProduct(product)}>
              <div className="aspect-[4/5] bg-gray-50 flex flex-col items-center justify-center border border-gray-100 relative overflow-hidden transition-all hover:shadow-lg">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <span className="text-gray-200 text-xs font-bold uppercase italic">{product.name}</span>
                )}
                
                {/* Sale Tag */}
                {product.tag && (
                  <span className="absolute top-2 left-2 bg-black text-white text-[8px] font-bold px-2 py-1 uppercase tracking-widest">
                    {product.tag}
                  </span>
                )}

                <button 
                  onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                  className="hidden md:block absolute bottom-0 w-full bg-black text-white py-4 text-[10px] font-bold tracking-widest translate-y-full group-hover:translate-y-0 transition-transform"
                >
                  ADD TO CART
                </button>
              </div>
              <div className="mt-3 md:mt-4 text-center">
                <h3 className="font-bold text-[10px] md:text-xs uppercase tracking-widest truncate">{product.name}</h3>
                <div className="flex flex-col md:flex-row items-center justify-center gap-1">
                  <span className="text-black font-bold text-[10px] md:text-xs">Rs. {product.price}</span>
                  {product.oldPrice && (
                    <span className="text-gray-400 line-through text-[8px] md:text-[10px]">Rs. {product.oldPrice}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. PRODUCT DETAIL MODAL (THE POPUP) */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-10 text-black p-2 font-bold uppercase text-[10px] tracking-widest">Close [X]</button>
              
              <div className="w-full md:w-1/2 bg-gray-100">
                <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>
              
              <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase mb-2">Original Premium</span>
                <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4">{selectedProduct.name}</h2>
                <div className="flex items-center gap-4 mb-8">
                  <span className="text-2xl font-black">Rs. {selectedProduct.price}</span>
                  {selectedProduct.oldPrice && <span className="text-gray-400 line-through">Rs. {selectedProduct.oldPrice}</span>}
                </div>
                <p className="text-gray-600 text-xs uppercase tracking-widest leading-loose mb-10">
                  Engineered for the modern man. This essential grooming piece from THE YASAR WAY collection delivers premium performance and unmatched style.
                </p>
                <button 
                  onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                  className="w-full bg-black text-white py-5 font-bold text-xs tracking-[0.3em] uppercase hover:bg-zinc-800 transition-all"
                >
                  ADD TO CART
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}