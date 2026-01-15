"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [tag, setTag] = useState("");

  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*");
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    // Using "oldPrice" with capital P to match your DB fix
    await supabase.from("products").insert([{ 
      name, 
      price: Number(price), 
      "oldPrice": (Number(price) * 1.2).toFixed(0), // Auto-generate a fake old price
      tag 
    }]);
    setName(""); setPrice(""); setTag("");
    fetchProducts();
  };

  const deleteProduct = async (id: number) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Inventory</h1>
        <p className="text-zinc-500 mb-10 tracking-widest text-xs uppercase">The Yasar Way Control Center</p>

        {/* ADD PRODUCT FORM */}
        <form onSubmit={addProduct} className="mb-16 bg-zinc-900/50 p-8 border border-zinc-800 backdrop-blur-sm">
          <h2 className="text-sm font-bold mb-6 tracking-[0.3em] uppercase">Add New Drop</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" className="bg-black border border-zinc-700 p-3 text-sm focus:border-white outline-none transition-all" required />
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (PKR)" type="number" className="bg-black border border-zinc-700 p-3 text-sm focus:border-white outline-none transition-all" required />
            <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag (e.g., NEW, SALE)" className="bg-black border border-zinc-700 p-3 text-sm focus:border-white outline-none transition-all md:col-span-2" />
            <button type="submit" className="md:col-span-2 bg-white text-black font-bold py-4 hover:invert transition-all uppercase text-xs tracking-widest">Update Storefront</button>
          </div>
        </form>

        {/* LIVE INVENTORY */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold mb-6 tracking-[0.3em] uppercase">Live on Site</h2>
          {products.map((p) => (
            <div key={p.id} className="flex justify-between items-center bg-zinc-900/30 p-6 border border-zinc-800 hover:border-zinc-500 transition-all">
              <div>
                <p className="font-bold uppercase tracking-tighter text-lg italic">{p.name}</p>
                <p className="text-zinc-500 text-xs mt-1">Rs. {p.price} <span className="ml-2 text-[10px] bg-zinc-800 px-2 py-0.5">{p.tag || 'Standard'}</span></p>
              </div>
              <button onClick={() => deleteProduct(p.id)} className="text-zinc-500 hover:text-red-500 text-[10px] font-bold tracking-widest uppercase transition-colors">Delete</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}