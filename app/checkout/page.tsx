"use client";
import { useCartStore } from "@/data/cartStore";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, removeFromCart, clearCart } = useCartStore();

  const totalPrice = cart.reduce((acc, item: any) => {
    const price = typeof item.price === 'string' 
      ? parseInt(item.price.replace(/[^0-9]/g, '')) 
      : (typeof item.price === 'number' ? item.price : 0);
    return acc + (price * (item.quantity || 1));
  }, 0);

  return (
    <div className="min-h-screen bg-white text-black p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-[10px] font-bold tracking-widest uppercase hover:underline">← Back to Shop</Link>
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mt-6 mb-10 border-b-4 border-black pb-4">Your Bag</h1>

        {cart.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-zinc-400 uppercase tracking-widest text-sm mb-6">Your bag is currently empty.</p>
            <Link href="/" className="bg-black text-white px-8 py-3 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all">Start Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* ITEM LIST */}
            <div className="lg:col-span-2 space-y-8">
              {cart.map((item: any) => (
                <div key={item.id} className="flex gap-6 border-b border-zinc-100 pb-8 relative group">
                  <div className="w-24 h-32 bg-zinc-50 border border-zinc-100 flex-shrink-0">
                    {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" alt="" />}
                  </div>
                  <div className="flex-grow">
                    <h2 className="font-black uppercase italic text-lg tracking-tighter">{item.name}</h2>
                    <p className="text-zinc-400 text-xs mt-1 uppercase tracking-widest">{item.tag || 'Grooming Essential'}</p>
                    <p className="font-bold text-sm mt-4">Rs. {item.price}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="mt-6 text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline"
                    >
                      Remove Item
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SUMMARY BOX */}
            <div className="bg-zinc-50 p-8 h-fit border border-zinc-100">
              <h2 className="font-bold uppercase tracking-[0.2em] text-xs mb-6">Order Summary</h2>
              <div className="flex justify-between border-b border-zinc-200 pb-4 mb-4">
                <span className="text-sm">Subtotal</span>
                <span className="font-bold">Rs. {totalPrice}</span>
              </div>
              <div className="flex justify-between mb-8">
                <span className="text-sm">Shipping</span>
                <span className="text-[10px] font-bold uppercase text-zinc-400">Calculated at next step</span>
              </div>
              <button className="w-full bg-black text-white py-4 font-bold text-xs tracking-widest uppercase hover:bg-zinc-800 transition-all">
                Proceed to Payment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}