"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [tag, setTag] = useState("");

  // 1. Fetch products to show in the list
  const fetchProducts = async () => {
    const { data } = await supabase.from("products").select("*");
    if (data) setProducts(data);
  };

  useEffect(() => { fetchProducts(); }, []);

  // 2. Function to add a new product
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("products").insert([{ name, price: Number(price), tag }]);
    setName(""); setPrice(""); setTag("");
    fetchProducts(); // Refresh list
  };

  // 3. Function to delete a product
  const deleteProduct = async (id: number) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts(); // Refresh list
  };

  return (
    <div className="min-h-screen bg-black text-white p-10 font-sans">
      <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-10">Inventory Management</h1>

      {/* ADD NEW PRODUCT FORM */}
      <form onSubmit={addProduct} className="mb-20 bg-zinc-900 p-8 rounded-lg border border-zinc-800 max-w-xl">
        <h2 className="text-xl font-bold mb-6 uppercase">Add New Drop</h2>
        <div className="space-y-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Product Name" className="w-full bg-black border border-zinc-700 p-3 rounded" required />
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price (e.g. 1200)" type="number" className="w-full bg-black border border-zinc-700 p-3 rounded" required />
          <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="Tag (e.g. NEW or BEST SELLER)" className="w-full bg-black border border-zinc-700 p-3 rounded" />
          <button type="submit" className="w-full bg-white text-black font-bold py-3 hover:bg-zinc-200 transition-all uppercase italic">List Product</button>
        </div>
      </form>

      {/* CURRENT INVENTORY LIST */}
      <div className="grid gap-4">
        <h2 className="text-xl font-bold uppercase mb-4">Live Products</h2>
        {products.map((p) => (
          <div key={p.id} className="flex justify-between items-center bg-zinc-900 p-6 border-l-4 border-white">
            <div>
              <p className="font-bold uppercase tracking-widest">{p.name}</p>
              <p className="text-zinc-400 text-sm italic">Rs. {p.price}</p>
            </div>
            <button onClick={() => deleteProduct(p.id)} className="text-red-500 text-xs font-bold hover:underline uppercase">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
}