"use client";
import { useState, useEffect } from "react";
import { useCartStore } from "@/data/cartStore";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

const countryConfig = {
  PK: { label: "Pakistan", currency: "Rs.", rate: 1, locale: "en-PK" },
  US: { label: "United States", currency: "$", rate: 0.0036, locale: "en-US" },
  GB: { label: "United Kingdom", currency: "£", rate: 0.0028, locale: "en-GB" },
  EU: { label: "Europe", currency: "€", rate: 0.0033, locale: "de-DE" },
  AE: { label: "UAE", currency: "AED", rate: 0.013, locale: "ar-AE" },
  CA: { label: "Canada", currency: "C$", rate: 0.0048, locale: "en-CA" },
};

const paymentDetails: any = {
  JazzCash: { title: "JazzCash", account: "03285900914", name: "Yasar Way Store" },
  EasyPaisa: { title: "EasyPaisa", account: "03285900914", name: "Yasar Way Store" },
  Bank: { title: "Bank Transfer", account: "PK00 MEZN 0000 1234 5678", name: "Meezan Bank Ltd" },
  COD: { title: "Cash on Delivery" }
};

export default function CheckoutPage() {
  const { cart, removeFromCart, clearCart } = useCartStore();
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [activeCountry, setActiveCountry] = useState<keyof typeof countryConfig>("PK");
  const config = countryConfig[activeCountry];
  const [selectedCity, setSelectedCity] = useState("");
  const [shippingFee, setShippingFee] = useState(0);

  const formatPrice = (price: number) => {
    const converted = price * config.rate;
    return converted.toLocaleString(config.locale, {
      minimumFractionDigits: activeCountry === "PK" ? 0 : 2,
      maximumFractionDigits: 2
    });
  };

  useEffect(() => {
    const fee = activeCountry !== "PK" ? 2500 : 199;
    setShippingFee(selectedCity ? fee : 0);
  }, [selectedCity, activeCountry]);

  const subtotal = cart.reduce((acc, item: any) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.]/g, '')) : (item.price || 0);
    return acc + (price * (item.quantity || 1));
  }, 0);

  const discount = (paymentMethod !== "COD" && activeCountry === "PK") ? 400 : 0;
  const finalTotal = subtotal + shippingFee - discount;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert("BAG EMPTY");
    setIsOrdering(true);
    const formData = new FormData(e.target as HTMLFormElement);
    const orderData = {
      customer_name: formData.get("name"),
      customer_email: formData.get("email"),
      customer_phone: formData.get("phone"),
      customer_address: `${selectedCity} - ${formData.get("address")}`,
      payment_method: paymentMethod,
      total_price: finalTotal,
      currency: config.currency,
      items: cart, 
      status: 'Pending'
    };
    const { error } = await supabase.from("orders").insert([orderData]);
    if (!error) { setOrderComplete(true); clearCart(); } else { alert("Error: " + error.message); }
    setIsOrdering(false);
  };

  if (orderComplete) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-6 bg-white">
      <h1 className="text-3xl font-bold mb-4">Thank you for your purchase!</h1>
      <p className="text-zinc-500 mb-8">Order received. We will contact you on WhatsApp shortly.</p>
      <Link href="/" className="bg-[#1773b0] text-white px-8 py-4 rounded-md font-bold">Continue Shopping</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1100px] mx-auto flex flex-col lg:flex-row">
        
        {/* LEFT SIDE: Form */}
        <div className="flex-[1.2] p-6 md:p-12 lg:border-r border-zinc-200">
          <header className="mb-8">
            <h1 className="text-xl font-bold tracking-tight mb-8">the-yasar-way</h1>
            <div className="flex gap-2 text-[11px] text-zinc-500">
              <Link href="/" className="text-[#1773b0]">Cart</Link> {">"} <span>Information</span> {">"} <span>Shipping</span> {">"} <span>Payment</span>
            </div>
          </header>

          <form onSubmit={handlePlaceOrder} className="space-y-8">
            <section>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Contact</h3>
                <Link href="#" className="text-[11px] text-[#1773b0] underline">Log in</Link>
              </div>
              <input name="email" type="email" placeholder="Email or mobile phone number" className="w-full border border-zinc-300 rounded-md p-3 text-sm focus:ring-1 focus:ring-[#1773b0] outline-none" required />
            </section>

            <section>
              <h3 className="text-lg font-medium mb-4">Delivery</h3>
              <div className="space-y-3">
                <select value={activeCountry} onChange={(e) => setActiveCountry(e.target.value as any)} className="w-full border border-zinc-300 rounded-md p-3 text-sm bg-white">
                  {Object.entries(countryConfig).map(([code, details]) => (
                    <option key={code} value={code}>{details.label}</option>
                  ))}
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <input name="name" placeholder="First name" className="border border-zinc-300 rounded-md p-3 text-sm outline-none" required />
                  <input placeholder="Last name" className="border border-zinc-300 rounded-md p-3 text-sm outline-none" required />
                </div>
                <input name="address" placeholder="Address" className="w-full border border-zinc-300 rounded-md p-3 text-sm outline-none" required />
                <div className="grid grid-cols-3 gap-3">
                  <select required value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="border border-zinc-300 rounded-md p-3 text-sm bg-white outline-none">
                    <option value="">City</option>
                    {["Karachi", "Lahore", "Islamabad", "Faisalabad", "Rawalpindi", "Sahiwal", "Other Regions"].map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  <input placeholder="Postal code (optional)" className="border border-zinc-300 rounded-md p-3 text-sm outline-none" />
                </div>
                <input name="phone" placeholder="Phone" className="w-full border border-zinc-300 rounded-md p-3 text-sm outline-none" required />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-medium mb-4">Payment</h3>
              <p className="text-[12px] text-zinc-500 mb-4">All transactions are secure and encrypted.</p>
              <div className="border border-zinc-200 rounded-md overflow-hidden">
                {['COD', 'JazzCash', 'EasyPaisa', 'Bank'].map((method) => (
                  <label key={method} className={`flex items-center gap-3 p-4 cursor-pointer border-b border-zinc-200 last:border-0 ${paymentMethod === method ? 'bg-[#f0f5ff]' : 'bg-white'}`}>
                    <input type="radio" checked={paymentMethod === method} onChange={() => setPaymentMethod(method)} className="w-4 h-4 accent-[#1773b0]" />
                    <span className="text-sm font-medium">{paymentDetails[method].title}</span>
                  </label>
                ))}
              </div>
              
              {paymentMethod !== 'COD' && (
                <div className="mt-4 bg-[#f9f9f9] border border-zinc-200 p-4 rounded-md text-sm">
                  <p className="font-bold text-emerald-700 mb-2">Advance Payment Details:</p>
                  <p>Account: {paymentDetails[paymentMethod].account}</p>
                  <p>Name: {paymentDetails[paymentMethod].name}</p>
                  <p className="text-[11px] mt-2 text-zinc-500 italic">Please send screenshot on WhatsApp after payment.</p>
                </div>
              )}
            </section>

            <button type="submit" disabled={isOrdering} className="w-full bg-[#1773b0] text-white py-5 rounded-md font-bold text-sm transition-all hover:bg-[#146196]">
              {isOrdering ? "Processing..." : "Complete order"}
            </button>
          </form>
        </div>

        {/* RIGHT SIDE: Summary */}
        <div className="flex-[0.8] p-6 md:p-12 bg-[#fafafa]">
          <div className="space-y-6">
            {cart.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-4 group">
                <div className="relative">
                  <div className="w-16 h-16 bg-white border border-zinc-200 rounded-md overflow-hidden">
                    <img src={item.image_url} className="w-full h-full object-cover" alt="" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">{item.quantity}</span>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium">{item.name}</p>
                  {/* REMOVE BUTTON ADDED HERE */}
                  <button 
                    onClick={() => removeFromCart(item.id)} 
                    className="text-[10px] text-red-500 hover:underline mt-1 font-bold"
                  >
                    Remove
                  </button>
                </div>
                <p className="text-xs font-medium">{config.currency} {formatPrice(item.price)}</p>
              </div>
            ))}

            <div className="pt-6 border-t border-zinc-200 space-y-2">
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Subtotal</span>
                <span>{config.currency} {formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Shipping</span>
                <span>{shippingFee > 0 ? `${config.currency} ${formatPrice(shippingFee)}` : 'Enter shipping address'}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-emerald-600 font-medium">
                  <span>Discount (Advance Payment)</span>
                  <span>-{config.currency} {formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-4 text-lg font-bold">
                <span>Total</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500 font-normal">{activeCountry}</span>
                  <span>{config.currency} {formatPrice(finalTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}