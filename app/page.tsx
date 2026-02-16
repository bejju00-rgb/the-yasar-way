"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/data/cartStore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [dbProducts, setDbProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { cart, addToCart, clearCart } = useCartStore();
  
  // REVIEW FORM STATE
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [productReviews, setProductReviews] = useState<any[]>([]); // Added for showing reviews

  const router = useRouter();
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

  // NEW: Fetch reviews when a product is selected
  useEffect(() => {
    if (selectedProduct) {
      const fetchReviews = async () => {
        const { data, error } = await supabase
          .from("reviews")
          .select("*")
          .eq("product_id", selectedProduct.id)
          .order("created_at", { ascending: false });

        if (!error && data) {
          setProductReviews(data);
        }
      };
      fetchReviews();
    } else {
      setProductReviews([]);
    }
  }, [selectedProduct]);

  // SUBMIT REVIEW FUNCTION
  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    setIsSubmittingReview(true);
    const { data, error } = await supabase.from("reviews").insert([
      {
        product_id: selectedProduct.id,
        customer_name: reviewName,
        rating: reviewRating,
        comment: reviewComment,
        is_verified: false 
      }
    ]).select();

    if (error) {
      alert("Error submitting review: " + error.message);
    } else {
      alert("Review submitted! Thank you for your feedback.");
      // Instantly update the list so the user sees their review
      if (data) setProductReviews([data[0], ...productReviews]);
      setReviewName("");
      setReviewComment("");
      setReviewRating(5);
    }
    setIsSubmittingReview(false);
  };

  return (
    <main className="min-h-screen bg-white text-black overflow-x-hidden">
      
      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 z-[100] flex">
            <motion.div initial={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }} className="h-full w-1/2 bg-black flex items-center justify-end">
              <span className="text-white text-2xl md:text-4xl font-black italic pr-2 md:pr-6 z-[110] whitespace-nowrap">THE YASAR</span>
            </motion.div>
            <motion.div initial={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 1, ease: [0.77, 0, 0.175, 1] }} className="h-full w-1/2 bg-black flex items-center justify-start">
              <span className="text-white text-2xl md:text-4xl font-black italic pl-2 md:pl-7 z-[110] whitespace-nowrap">WAY</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

      <section ref={shopSectionRef} className="py-12 md:py-20 px-4 md:px-8 max-w-7xl mx-auto scroll-mt-20">
        <h2 className="text-xl md:text-2xl font-black uppercase italic tracking-tighter mb-8 md:mb-12 text-center text-black">New Drops</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
          {dbProducts.map((product) => (
            <div key={product.id} className="group cursor-pointer" onClick={() => setSelectedProduct(product)}>
              <div className="aspect-[4/5] bg-gray-50 flex flex-col items-center justify-center border border-gray-100 relative overflow-hidden transition-all hover:shadow-lg text-black">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <span className="text-gray-200 text-xs font-bold uppercase italic">{product.name}</span>
                )}
                
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
              <div className="mt-3 md:mt-4 text-center px-1 text-black">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-emerald-600 font-bold text-[7px] md:text-[8px] uppercase tracking-tighter">
                    {product.sales_count || 0} SOLD
                  </span>
                  <span className="text-zinc-300 text-[8px]">|</span>
                  <span className="text-black font-bold text-[8px] md:text-[9px]">
                    ★ 5.0
                  </span>
                </div>

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

<AnimatePresence>
  {selectedProduct && (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="absolute inset-0 bg-black/90 backdrop-blur-sm" />
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col md:flex-row">
        <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-[210] text-black p-2 font-bold uppercase text-[10px] tracking-widest bg-white/80">Close [X]</button>
        
        <div className="w-full md:w-1/2 bg-gray-100">
          <img src={selectedProduct.image_url} alt={selectedProduct.name} className="w-full h-full object-cover" />
        </div>
        
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-start bg-white text-black">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold tracking-[0.3em] text-gray-400 uppercase">Original Premium</span>
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 text-[9px] font-black uppercase italic tracking-tighter">
              {selectedProduct.sales_count || 0} Pieces Sold
            </span>
          </div>

          <h2 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter mb-4 text-black block leading-none">
            {selectedProduct?.name}
          </h2>
          
          <div className="flex items-center gap-1 mb-6">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-black text-xs">★</span>
            ))}
            <span className="text-[10px] font-bold ml-2 uppercase tracking-widest text-black">(Verified Reviews)</span>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <span className="text-2xl font-black text-black">Rs. {selectedProduct.price}</span>
            {selectedProduct.oldPrice && <span className="text-gray-400 line-through">Rs. {selectedProduct.oldPrice}</span>}
          </div>

          <p className="text-gray-600 text-[10px] md:text-xs uppercase tracking-[0.15em] leading-loose mb-10">
            {selectedProduct.description || "Engineered for the modern man. This essential grooming piece from THE YASAR WAY collection delivers premium performance and unmatched style."}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-12">
            <button 
              onClick={() => {
                clearCart();
                addToCart(selectedProduct);
                router.push("/checkout");
              }}
              className="w-full bg-white text-black border-2 border-black py-5 font-bold text-[9px] md:text-[10px] tracking-[0.2em] uppercase hover:bg-zinc-100 transition-all order-2 md:order-1"
            >
              Buy It Now
            </button>

            <button 
              onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
              className="w-full bg-black text-white py-5 font-bold text-[9px] md:text-[10px] tracking-[0.2em] uppercase hover:bg-zinc-800 transition-all order-1 md:order-2"
            >
              Add To Cart
            </button>
          </div>

          {/* VIEW REVIEWS SECTION */}
          <div className="border-t border-gray-100 pt-10 mb-10">
            <h3 className="text-xs font-black uppercase italic tracking-[0.2em] mb-6 text-black">Customer Reviews ({productReviews.length})</h3>
            <div className="space-y-6 max-h-60 overflow-y-auto pr-2">
              {productReviews.length > 0 ? (
                productReviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-black">{review.customer_name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-[8px] ${i < review.rating ? 'text-black' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-500 italic">"{review.comment}"</p>
                  </div>
                ))
              ) : (
                <p className="text-[10px] text-gray-400 uppercase text-center italic">No reviews yet. Be the first!</p>
              )}
            </div>
          </div>

          <div className="border-t border-gray-100 pt-10">
            <h3 className="text-xs font-black uppercase italic tracking-[0.2em] mb-6 text-black">Leave Your Feedback</h3>
            <form onSubmit={submitReview} className="space-y-4">
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Your Name</label>
                <input 
                  type="text" 
                  value={reviewName} 
                  onChange={(e) => setReviewName(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 p-3 text-[10px] outline-none focus:border-black transition-all text-black"
                  placeholder="NAME"
                  required
                />
              </div>
              
              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button" 
                      onClick={() => setReviewRating(star)} 
                      className={`text-lg ${reviewRating >= star ? 'text-black' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[9px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Comment</label>
                <textarea 
                  value={reviewComment} 
                  onChange={(e) => setReviewComment(e.target.value)} 
                  className="w-full bg-gray-50 border border-gray-200 p-3 text-[10px] outline-none focus:border-black transition-all h-24 resize-none text-black"
                  placeholder="YOUR EXPERIENCE..."
                  required
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmittingReview}
                className="w-full bg-black text-white py-4 font-bold text-[9px] tracking-[0.3em] uppercase hover:bg-zinc-800 transition-all disabled:opacity-50"
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Review'}
              </button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  )}
</AnimatePresence>
    </main>
  );
}