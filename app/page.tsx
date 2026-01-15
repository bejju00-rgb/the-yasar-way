"use client";
import { useState, useEffect, useRef } from "react"; // Added useRef
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/data/cartStore";
import Link from "next/link";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const { cart, addToCart } = useCartStore();
  
  // Reference for the product section to enable scrolling
  const shopSectionRef = useRef<HTMLDivElement>(null);

  const slides = [
  { 
    title: "ELEVATE YOUR", 
    subtitle: "EVERYDAY", 
    image: "https://your-image-url-1.jpg" // Replace with your actual URL
  },
  { 
    title: "THE MODERN", 
    subtitle: "STANDARD", 
    image: "https://your-image-url-2.jpg" 
  },
  { 
    title: "DEFINING", 
    subtitle: "THE WAY", 
    image: "https://your-image-url-3.jpg" 
  },
];

  // Smooth scroll function
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
        <Link href="/" className="text-2xl font-black tracking-tighter uppercase italic">THE YASAR WAY</Link>
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
<section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-black">
  <AnimatePresence mode="wait">
    <motion.div
      key={currentSlide}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      className="absolute inset-0"
    >
      {/* The Image */}
      <img 
        src={slides[currentSlide].image} 
        alt="Hero Background"
        className="w-full h-full object-cover opacity-60" // Opacity makes text pop
      />
      
      {/* The Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
        <motion.span 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[10px] font-bold tracking-[0.4em] text-gray-300 uppercase mb-4"
        >
          Premium Grooming Essentials
        </motion.span>
        
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-6xl md:text-[100px] font-black uppercase italic leading-[0.9] tracking-tighter text-white"
        >
          {slides[currentSlide].title} <br /> 
          <span className="text-gray-400">{slides[currentSlide].subtitle}</span>
        </motion.h1>

        <motion.button 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9 }}
          onClick={scrollToShop}
          className="mt-10 border-2 border-white text-white px-12 py-4 text-xs font-bold tracking-[0.3em] hover:bg-white hover:text-black transition-all"
        >
          SHOP COLLECTION
        </motion.button>
      </div>
    </motion.div>
  </AnimatePresence>
</section>

      {/* 4. PRODUCT SECTION */}
      <section ref={shopSectionRef} className="py-20 px-8 max-w-7xl mx-auto scroll-mt-20">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter mb-12 text-center">New Drops</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {dbProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="aspect-[4/5] bg-gray-50 flex flex-col items-center justify-center border border-gray-100 relative overflow-hidden transition-all hover:shadow-xl">
                
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <span className="text-gray-200 font-bold group-hover:scale-110 transition-transform duration-500 uppercase italic">
                    {product.name}
                  </span>
                )}

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