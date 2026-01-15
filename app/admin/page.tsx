"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPanel() {
  // 1. ALL STATE HOOKS (Must be at the top)
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tag, setTag] = useState("");

  // 2. DATA FETCHING LOGIC
  const fetchData = async () => {
    // Fetch Products
    const { data: prodData } = await supabase.from("products").select("*");
    if (prodData) setProducts(prodData);

    // Fetch Orders
    const { data: ordData } = await supabase.from("orders").select("*").order('created_at', { ascending: false });
    if (ordData) setOrders(ordData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 3. ACTIONS
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("products").insert([{ 
      name, 
      price: Number(price), 
      image_url: imageUrl, 
      "oldPrice": (Number(price) * 1.2).toFixed(0),
      tag 
    }]);
    setName(""); setPrice(""); setImageUrl(""); setTag("");
    fetchData();
  };

  const deleteProduct = async (id: number) => {
    await supabase.from("products").delete().eq("id", id);
    fetchData();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-10 text-center">Admin Console</h1>
        
        {/* ADD PRODUCT FORM */}
        <form onSubmit={addProduct} className="mb-16 bg-zinc-900/50 p-8 border border-zinc-800 backdrop-blur-sm">
          <h2 className="text-xl font-bold uppercase mb-6 tracking-widest">Add to Inventory</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" className="bg-black border border-zinc-700 p-3 text-sm focus:border-white outline-none transition-all" required />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (PKR)" type="number" className="bg-black border border-zinc-700 p-3 text-sm focus:border-white outline-none transition-all" required />
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (from Supabase Storage)" className="bg-black border border-zinc-700 p-3 text-sm focus:border-white outline-none transition-all md:col-span-2" />
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag (NEW, BEST SELLER)" className="bg-black border border-zinc-700 p-3 text-sm focus:border-white outline-none transition-all md:col-span-2" />
            <button type="submit" className="md:col-span-2 bg-white text-black font-bold py-4 hover:invert transition-all uppercase text-xs tracking-widest">Update Storefront</button>
          </div>
        </form>

        {/* LIVE INVENTORY */}
        <div className="space-y-4 mb-20">
          <h2 className="text-xl font-bold uppercase mb-6 tracking-widest">Current Inventory</h2>
          {products.map((p) => (
            <div key={p.id} className="flex justify-between items-center bg-zinc-900/30 p-4 border border-zinc-800">
              <div className="flex items-center gap-4">
                {p.image_url && <img src={p.image_url} className="w-12 h-16 object-cover border border-zinc-700" alt="" />}
                <div>
                  <p className="font-bold uppercase tracking-tighter italic">{p.name}</p>
                  <p className="text-zinc-500 text-[10px]">Rs. {p.price}</p>
                </div>
              </div>
              <button onClick={() => deleteProduct(p.id)} className="text-red-500 text-[10px] font-bold uppercase tracking-widest hover:underline">Remove</button>
            </div>
          ))}
        </div>

        {/* RECENT ORDERS */}
        <div className="mt-20">
          <h2 className="text-xl font-bold uppercase mb-6 tracking-widest">Recent Orders</h2>
          {orders.length === 0 ? (
            <p className="text-zinc-600 uppercase text-xs tracking-widest">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-zinc-900/50 p-6 border border-zinc-800 mb-4 rounded-sm">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold uppercase text-lg italic tracking-tighter">{order.customer_name}</p>
                    <p className="text-zinc-500 text-[10px] uppercase tracking-widest">{order.payment_method || 'COD'}</p>
                  </div>
                  <p className="text-white font-black text-xl italic">Rs. {order.total_price}</p>
                </div>
                <p className="text-zinc-400 text-xs mb-4 p-3 bg-black/40 rounded border border-zinc-800">{order.customer_address}</p>
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Items Ordered:</p>
                  {order.items && Array.isArray(order.items) ? (
                    order.items.map((item: any, idx: number) => (
                      <p key={idx} className="text-xs text-zinc-300 uppercase italic mb-1">
                        {item.name} <span className="text-zinc-600 font-normal">x {item.quantity || 1}</span>
                      </p>
                    ))
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No item data available</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}