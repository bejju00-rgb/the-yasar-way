"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/data/cartStore";
import { motion } from "framer-motion";

// Syncing currency config with your Detail Page
const countryConfig = {
  PK: { label: "Pakistan", currency: "Rs.", rate: 1, locale: "en-PK" },
  US: { label: "United States", currency: "$", rate: 0.0036, locale: "en-US" },
  GB: { label: "United Kingdom", currency: "£", rate: 0.0028, locale: "en-GB" },
  AE: { label: "UAE", currency: "AED", rate: 0.013, locale: "ar-AE" },
};

// FIX: Added 'config' and 'onOpenModal' to the props definition
export default function ProductCard({ 
  product, 
  config, 
  onOpenModal 
}: { 
  product: any; 
  config: any; 
  onOpenModal: (product: any) => void 
}) {
  const router = useRouter();
  const { addToCart, clearCart } = useCartStore();
  
  // Uses the config passed from the Home page for perfect synchronization
  const activeCountry = (Object.keys(countryConfig).find(
    (key) => countryConfig[key as keyof typeof countryConfig].currency === config.currency
  ) as keyof typeof countryConfig) || "PK";

  const formatPrice = (price: number) => {
    return (price * config.rate).toLocaleString(config.locale, {
      minimumFractionDigits: activeCountry === "PK" ? 0 : 2,
      maximumFractionDigits: 2
    });
  };

  const handleDirectCheckout = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    clearCart();
    addToCart({ ...product });
    router.push("/checkout");
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); 
    addToCart({ ...product });
  };

  return (
    <motion.div 
      whileHover={{ y: -10 }}
      // FIX: Now uses onOpenModal to trigger the popup on the Home Page
      onClick={() => onOpenModal(product)}
      className="group cursor-pointer bg-white rounded-[40px] p-4 border border-zinc-100 shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      {/* IMAGE SECTION */}
      <div className="relative aspect-[4/5] rounded-[30px] overflow-hidden bg-zinc-50 mb-6">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
          style={{ transform: 'translate3d(0,0,0)' }} // Mac/Safari rendering fix
        />
        
        {/* QUICK ACTIONS OVERLAY */}
        <div className="absolute inset-x-4 bottom-4 flex gap-2 translate-y-12 group-hover:translate-y-0 transition-transform duration-500">
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-white/90 backdrop-blur-md text-black py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-colors"
          >
            Add To Bag
          </button>
          <button 
            onClick={handleDirectCheckout}
            className="flex-1 bg-black text-white py-3 rounded-2xl text-[8px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* INFO SECTION */}
      <div className="px-2 pb-2">
        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">
          {product.categories?.name || "The Yasar Way"}
        </p>
        <h3 className="text-sm font-black uppercase italic tracking-tighter mb-2 group-hover:text-emerald-500 transition-colors">
          {product.name}
        </h3>
        
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold">{config.currency} {formatPrice(product.price)}</span>
          {product.old_price && (
            <span className="text-[10px] text-zinc-300 line-through">
              {config.currency} {formatPrice(product.old_price)}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}