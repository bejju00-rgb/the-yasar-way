"use client";
import { useState, useEffect } from "react";
import { useCartStore } from "@/data/cartStore";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, removeFromCart, clearCart } = useCartStore();
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  
  // State for shipping
  const [selectedCity, setSelectedCity] = useState("");
  const [shippingFee, setShippingFee] = useState(0);

  // Shipping Logic
  const calculateShipping = (city: string) => {
    const local = ["Karachi"];
    const zoneA = ["Lahore", "Islamabad", "Faisalabad", "Rawalpindi", "Sialkot"];

    if (!city) return 0;
    if (local.includes(city)) return 200;
    if (zoneA.includes(city)) return 350;
    return 500; // All other regions (TCS Zone B/C)
  };

  // Update shipping fee whenever city changes
  useEffect(() => {
    setShippingFee(calculateShipping(selectedCity));
  }, [selectedCity]);

  const subtotal = cart.reduce((acc, item: any) => {
    const price = typeof item.price === 'string' 
      ? parseInt(item.price.replace(/[^0-9]/g, '')) 
      : (typeof item.price === 'number' ? item.price : 0);
    return acc + (price * (item.quantity || 1));
  }, 0);

  // Final total including shipping
  const finalTotal = subtotal + shippingFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCity) return alert("Please select a city for delivery.");
    
    setIsOrdering(true);

    const formData = new FormData(e.target as HTMLFormElement);
    const orderData = {
      customer_name: formData.get("name"),
      customer_email: formData.get("email"),
      customer_phone: formData.get("phone"),
      customer_address: `${selectedCity} - ${formData.get("address")}`,
      payment_method: paymentMethod,
      total_price: finalTotal,
      items: cart,
      status: 'Pending'
    };

    const { error } = await supabase.from("orders").insert([orderData]);

    if (!error) {
      const itemDetails = cart.map((i: any) => `- ${i.name} (Rs. ${i.price})`).join('%0A');
      const message = `*THE YASAR WAY - NEW ORDER*%0A%0A*Customer:* ${orderData.customer_name}%0A*City:* ${selectedCity}%0A*Phone:* ${orderData.customer_phone}%0A*Address:* ${formData.get("address")}%0A*Method:* ${paymentMethod}%0A%0A*Items:*%0A${itemDetails}%0A%0A*Subtotal:* Rs. ${subtotal}%0A*Shipping (TCS):* Rs. ${shippingFee}%0A*TOTAL:* Rs. ${finalTotal}`;
      
      const whatsappNumber = "923247875183"; 
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      
      setOrderComplete(true);
      clearCart();

      // SAFARI/iOS FIX: Use window.location.href instead of window.open
      // Wrapped in a small timeout to ensure the "Order Placed" state renders first
      setTimeout(() => {
        window.location.href = whatsappUrl;
      }, 300);

    } else {
      alert("Something went wrong: " + error.message);
    }
    setIsOrdering(false);
  };

  if (orderComplete) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-white">
      <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <h1 className="text-4xl font-black italic uppercase tracking-tighter">Order Placed</h1>
      <p className="mt-4 text-zinc-500 uppercase tracking-widest text-[10px] max-w-xs">Connecting to WhatsApp for confirmation...</p>
      <Link href="/" className="mt-10 border-b-2 border-black font-bold text-xs uppercase italic pb-1">Back to Shop</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <Link href="/" className="text-[10px] font-bold tracking-widest uppercase hover:text-zinc-400">← Return to Collection</Link>
        
        {cart.length === 0 ? (
          <div className="py-24 text-center">
            <h2 className="text-2xl font-black italic uppercase mb-4">Your bag is empty</h2>
            <Link href="/" className="inline-block bg-black text-white px-10 py-4 font-bold text-[10px] tracking-widest uppercase">Shop Now</Link>
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 border-b-4 border-black inline-block">Shipping</h2>
              <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
                <input name="name" placeholder="Full Name" className="w-full border-2 border-zinc-100 p-4 outline-none focus:border-black transition-all bg-zinc-50/50" required />
                <input name="email" type="email" placeholder="Gmail Address" className="w-full border-2 border-zinc-100 p-4 outline-none focus:border-black transition-all bg-zinc-50/50" required />
                <input name="phone" placeholder="WhatsApp Number" className="w-full border-2 border-zinc-100 p-4 outline-none focus:border-black transition-all bg-zinc-50/50" required />
                
                <select 
                  required
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full border-2 border-zinc-100 p-4 outline-none focus:border-black transition-all bg-zinc-50/50 text-[10px] font-bold uppercase tracking-widest"
                >
                  <option value="">Select City (For TCS Rates)</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Islamabad">Islamabad</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Rawalpindi">Rawalpindi</option>
                  <option value="Sialkot">Sialkot</option>
                  <option value="Abbottabad">Abbottabad</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Multan">Multan</option>
                  <option value="Quetta">Quetta</option>
                  <option value="Gujranwala">Gujranwala</option>
                  <option value="Other">Other Regions (Pakistan)</option>
                </select>

                <textarea name="address" placeholder="House #, Street, Area Name" className="w-full border-2 border-zinc-100 p-4 outline-none focus:border-black transition-all bg-zinc-50/50" rows={4} required />
              </form>

              <div className="mt-12">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter mb-8 border-b-4 border-black inline-block">Payment</h2>
                <div className="grid grid-cols-3 gap-3">
                  {['COD', 'JazzCash', 'NayaPay'].map((method) => (
                    <button 
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`py-4 border-2 font-bold text-[10px] tracking-widest uppercase transition-all ${paymentMethod === method ? 'bg-black text-white border-black' : 'border-zinc-100 text-zinc-400 hover:border-zinc-300'}`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-zinc-50 p-8 rounded-sm h-fit">
              <h2 className="font-bold uppercase tracking-widest text-xs mb-8">Summary</h2>
              <div className="space-y-6 mb-10 max-h-[400px] overflow-y-auto pr-2">
                {cart.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center group">
                    <div className="flex gap-4">
                      <div className="w-12 h-16 bg-white border flex-shrink-0">
                        {item.image_url && <img src={item.image_url} className="w-full h-full object-cover" alt="" />}
                      </div>
                      <div>
                        <p className="font-black italic uppercase text-xs">{item.name}</p>
                        <button onClick={() => removeFromCart(item.id)} className="text-[9px] text-red-500 font-bold uppercase mt-1">Remove</button>
                      </div>
                    </div>
                    <span className="font-bold text-xs italic">Rs. {item.price}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t-2 border-zinc-200 pt-6">
                <div className="flex justify-between mb-2">
                  <span className="text-zinc-500 uppercase text-[10px] font-bold">Subtotal</span>
                  <span className="text-[10px] font-bold uppercase">Rs. {subtotal}</span>
                </div>
                <div className="flex justify-between mb-4">
                  <span className="text-zinc-500 uppercase text-[10px] font-bold">TCS Shipping</span>
                  <span className="text-[10px] font-bold uppercase">{shippingFee > 0 ? `Rs. ${shippingFee}` : 'Select City'}</span>
                </div>
                <div className="flex justify-between text-xl font-black italic uppercase">
                  <span>Total</span>
                  <span>Rs. {finalTotal}</span>
                </div>
              </div>

              <button 
                type="submit" 
                form="checkout-form"
                disabled={isOrdering}
                className="w-full bg-black text-white py-5 mt-10 font-bold text-xs tracking-[0.3em] uppercase hover:bg-zinc-800 transition-all disabled:bg-zinc-300"
              >
                {isOrdering ? "Processing..." : "Place Order"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}