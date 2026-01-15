"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // New State for Images
  const [tag, setTag] = useState("");

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*");
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("products").insert([{ 
      name, 
      price: Number(price), 
      image_url: imageUrl, // Saves the URL to DB
      "oldPrice": (Number(price) * 1.2).toFixed(0),
      tag 
    }]);
    setName(""); setPrice(""); setImageUrl(""); setTag("");
    fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-10 text-center">Admin Console</h1>
        
        <form onSubmit={addProduct} className="mb-16 bg-zinc-900/50 p-8 border border-zinc-800 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" className="bg-black border border-zinc-700 p-3 text-sm focus:border-white outline-none transition-all" required />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (PKR)" type="number" className="bg-black border border-zinc-700 p-3 text-sm focus:border-white outline-none transition-all" required />
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (from Supabase Storage)" className="bg-black border border-zinc-700 p-3 text-sm focus:border-white outline-none transition-all md:col-span-2" />
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag (NEW, BEST SELLER)" className="bg-black border border-zinc-700 p-3 text-sm focus:border-white outline-none transition-all md:col-span-2" />
            <button type="submit" className="md:col-span-2 bg-white text-black font-bold py-4 hover:invert transition-all uppercase text-xs tracking-widest">Add to Inventory</button>
          </div>
        </form>

        <div className="space-y-4">
          {products.map((p) => (
            <div key={p.id} className="flex justify-between items-center bg-zinc-900/30 p-4 border border-zinc-800">
              <div className="flex items-center gap-4">
                {p.image_url && <img src={p.image_url} className="w-12 h-12 object-cover border border-zinc-700" alt="" />}
                <div>
                  <p className="font-bold uppercase tracking-tighter italic">{p.name}</p>
                  <p className="text-zinc-500 text-[10px]">Rs. {p.price}</p>
                </div>
              </div>
              <button onClick={() => deleteProduct(p.id)} className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const [orders, setOrders] = useState<any[]>([]);

// Inside useEffect
const fetchOrders = async () => {
  const { data } = await supabase.from("orders").select("*").order('created_at', { ascending: false });
  if (data) setOrders(data);
};
fetchOrders();

// In the Return UI (at the bottom)
<div className="mt-20">
  <h2 className="text-xl font-bold uppercase mb-6">Recent Orders</h2>
  {orders.map((order) => (
    <div key={order.id} className="bg-zinc-900 p-6 border border-zinc-800 mb-4">
      <div className="flex justify-between">
        <p className="font-bold uppercase">{order.customer_name}</p>
        <p className="text-white font-bold">Rs. {order.total_price}</p>
      </div>
      <p className="text-zinc-500 text-xs">{order.customer_address}</p>
      <div className="mt-4 border-t border-zinc-800 pt-2">
        {order.items.map((item: any) => (
          <p key={item.id} className="text-[10px] text-zinc-400 uppercase">{item.name} x {item.quantity || 1}</p>
        ))}
      </div>
    </div>
  ))}
</div>