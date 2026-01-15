"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Make sure you created this file!

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState([]);

  // 1. Fetch products from Supabase when the page loads
  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
    }
  }, [isLoggedIn]);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    if (data) setProducts(data);
  }

  // 2. Update price in Supabase
  async function updatePrice(id, newPrice) {
    const { error } = await supabase
      .from('products')
      .update({ price: newPrice })
      .eq('id', id);

    if (error) alert("Error updating price");
    else fetchProducts(); // Refresh the list
  }

  const handleLogin = () => {
    if (password === "yasar123") setIsLoggedIn(true);
    else alert("Incorrect Password");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 border border-gray-200 w-full max-w-md">
          <h1 className="text-2xl font-black uppercase mb-6 tracking-tighter italic">Admin Login</h1>
          <input 
            type="password" 
            className="w-full border-b-2 border-gray-200 py-3 mb-6 outline-none focus:border-black"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin} className="w-full bg-black text-white py-4 font-bold text-xs tracking-widest">ENTER SYSTEM</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-10">Live Inventory Management</h1>
        <div className="grid grid-cols-1 gap-4">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between p-6 border border-gray-100">
              <div>
                <h3 className="font-bold text-sm uppercase">{product.name}</h3>
                <p className="text-xs text-gray-500">Current: Rs. {product.price}</p>
              </div>
              <button 
                onClick={() => {
                  const p = prompt("Enter new price:");
                  if(p) updatePrice(product.id, p);
                }}
                className="text-[10px] font-bold border border-black px-4 py-2 hover:bg-black hover:text-white transition-all"
              >
                UPDATE PRICE
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}