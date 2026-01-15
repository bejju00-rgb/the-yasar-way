"use client";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/data/cartStore";
import { useState } from "react";

export default function CheckoutPage() {
  const { cart, clearCart } = useCartStore();
  const [method, setMethod] = useState("COD");
  const [formData, setFormData] = useState({ name: "", phone: "", address: "" });

  const totalPrice = cart.reduce((acc, item) => acc + (parseInt(item.price.replace(/,/g, '')) * item.quantity), 0);

  const handleOrder = () => {
    const orderDetails = cart.map(i => `${i.name} (x${i.quantity})`).join(", ");
    const message = `*NEW ORDER - THE YASAR WAY*%0A%0A` +
                    `*Name:* ${formData.name}%0A` +
                    `*Phone:* ${formData.phone}%0A` +
                    `*Address:* ${formData.address}%0A` +
                    `*Method:* ${method}%0A` +
                    `*Items:* ${orderDetails}%0A` +
                    `*Total:* Rs. ${totalPrice}`;

    // Replace with your actual WhatsApp number
    const whatsappNumber = "923001234567"; 
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
    clearCart();
    alert("Order Sent! Please check WhatsApp to confirm.");
  };

  return (
    <div className="min-h-screen bg-white text-black p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-10">Checkout</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left: Shipping Info */}
        <div className="space-y-6">
          <h2 className="font-bold uppercase tracking-widest text-sm border-b pb-2">Shipping Details</h2>
          <input 
            placeholder="Full Name" 
            className="w-full border-b border-gray-300 py-3 outline-none focus:border-black transition-colors"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <input 
            placeholder="Phone Number (WhatsApp)" 
            className="w-full border-b border-gray-300 py-3 outline-none focus:border-black transition-colors"
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          <textarea 
            placeholder="Full Address" 
            className="w-full border-b border-gray-300 py-3 outline-none focus:border-black transition-colors"
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
        </div>

        {/* Right: Payment Method */}
        <div className="space-y-6">
          <h2 className="font-bold uppercase tracking-widest text-sm border-b pb-2">Payment Method</h2>
          <div className="space-y-3">
            {["Cash on Delivery", "JazzCash", "NayaPay"].map((m) => (
              <label key={m} className={`flex items-center p-4 border cursor-pointer transition-all ${method === m ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  className="accent-black" 
                  checked={method === m}
                  onChange={() => setMethod(m)} 
                />
                <span className="ml-4 font-bold text-xs uppercase tracking-widest">{m}</span>
              </label>
            ))}
          </div>

          <div className="bg-gray-50 p-6 mt-6">
            <div className="flex justify-between font-bold uppercase text-xs tracking-widest mb-2">
              <span>Subtotal</span>
              <span>Rs. {totalPrice}</span>
            </div>
            <div className="flex justify-between font-bold uppercase text-xs tracking-widest text-green-600">
              <span>Shipping</span>
              <span>FREE</span>
            </div>
            <button 
              onClick={handleOrder}
              className="w-full bg-black text-white mt-6 py-4 font-bold text-xs tracking-[0.3em] hover:bg-gray-800 transition-all"
            >
              PLACE ORDER VIA WHATSAPP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}