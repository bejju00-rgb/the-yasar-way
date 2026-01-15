"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  }

  useEffect(() => {
    if (isLoggedIn) fetchProducts();
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 border border-gray-200">
          <h1 className="text-2xl font-black uppercase mb-4 italic">Admin Login</h1>
          <input 
            type="password" 
            className="w-full border-b-2 border-gray-200 py-3 mb-6 outline-none"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            onClick={() => password === "yasar123" && setIsLoggedIn(true)}
            className="w-full bg-black text-white py-4 font-bold text-xs"
          >
            ENTER
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-black italic uppercase mb-8">Inventory</h1>
      {products.map((p) => (
        <div key={p.id} className="flex justify-between p-4 border-b">
          <span>{p.name} - Rs.{p.price}</span>
        </div>
      ))}
    </div>
  );
}