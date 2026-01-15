"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // App State
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [tag, setTag] = useState("");

  const fetchData = async () => {
    const { data: prodData } = await supabase.from("products").select("*");
    if (prodData) setProducts(prodData);

    const { data: ordData } = await supabase.from("orders").select("*").order('created_at', { ascending: false });
    if (ordData) setOrders(ordData);
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  // --- AUTH LOGIC ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "YASAR786") { // SET YOUR PASSWORD HERE
      setIsAuthenticated(true);
    } else {
      alert("Access Denied.");
    }
  };

  // --- REVENUE LOGIC ---
  const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.total_price), 0);

  // --- PRODUCT LOGIC ---
  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.from("products").insert([{ 
      name, price: Number(price), image_url: imageUrl, "oldPrice": (Number(price) * 1.2).toFixed(0), tag 
    }]);
    setName(""); setPrice(""); setImageUrl(""); setTag("");
    fetchData();
  };

  const deleteProduct = async (id: number) => {
    if(confirm("Delete this product?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchData();
    }
  };

  // --- ORDER LOGIC ---
  const updateStatus = async (id: number, newStatus: string) => {
    setIsUpdating(true);
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    await fetchData();
    setIsUpdating(false);
  };

  const downloadCSV = () => {
    const headers = ["ID", "Customer", "Phone", "Address", "Method", "Total", "Status"];
    const rows = orders.map(o => [o.id, o.customer_name, o.customer_phone, `"${o.customer_address}"`, o.payment_method, o.total_price, o.status || 'Pending']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "YasarWay_Orders.csv";
    link.click();
  };

  // --- LOGIN UI ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-zinc-900 p-8 border border-zinc-800">
          <h1 className="text-2xl font-black italic uppercase text-white mb-6">HQ ACCESS</h1>
          <input 
            type="password" 
            placeholder="Enter Master Password" 
            className="w-full bg-black border border-zinc-700 p-4 text-white outline-none mb-4 focus:border-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-white text-black font-bold py-4 uppercase tracking-widest text-xs">Authorize</button>
        </form>
      </div>
    );
  }

  // --- MAIN ADMIN UI ---
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] mb-2">Internal Management</p>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">THE YASAR WAY</h1>
          </div>
          <button onClick={downloadCSV} className="text-[10px] font-bold uppercase border border-zinc-700 px-6 py-3 hover:bg-white hover:text-black transition-all">Export Orders</button>
        </div>

        {/* STATS */}
        <div className="bg-zinc-900 border border-zinc-800 p-10 mb-12">
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Total Accumulated Revenue</p>
          <p className="text-6xl font-black italic tracking-tighter">Rs. {totalRevenue.toLocaleString()}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* LEFT: INVENTORY MANAGEMENT */}
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold uppercase italic border-b border-zinc-800 pb-2 mb-6">Add Product</h2>
              <form onSubmit={addProduct} className="grid grid-cols-2 gap-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="bg-zinc-900 p-3 text-sm border border-zinc-800 outline-none focus:border-white" required />
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" type="number" className="bg-zinc-900 p-3 text-sm border border-zinc-800 outline-none focus:border-white" required />
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL" className="col-span-2 bg-zinc-900 p-3 text-sm border border-zinc-800 outline-none focus:border-white" />
                <button className="col-span-2 bg-white text-black font-bold py-3 uppercase text-[10px] tracking-widest">Update Catalog</button>
              </form>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase italic border-b border-zinc-800 pb-2 mb-6">Live Inventory</h2>
              <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-zinc-900/40 p-3 border border-zinc-800 group">
                    <div className="flex items-center gap-4">
                      <img src={p.image_url} className="w-10 h-10 object-cover" alt="" />
                      <div>
                        <p className="font-bold text-xs uppercase">{p.name}</p>
                        <p className="text-zinc-500 text-[10px]">Rs. {p.price}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-500 opacity-0 group-hover:opacity-100 text-[9px] font-bold uppercase tracking-widest transition-all">Delete</button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: ORDER MANAGEMENT */}
          <div>
            <h2 className="text-xl font-bold uppercase italic border-b border-zinc-800 pb-2 mb-6">Order Stream</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className={`p-6 border ${order.status === 'Shipped' ? 'bg-zinc-900/20 border-zinc-900 opacity-40' : 'bg-zinc-900 border-zinc-800'}`}>
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="font-black italic uppercase leading-none">{order.customer_name}</p>
                      <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold">{order.payment_method} • {order.customer_phone}</p>
                    </div>
                    <p className="font-black italic text-xl">Rs. {order.total_price}</p>
                  </div>
                  <p className="text-[10px] text-zinc-400 mb-4 uppercase">{order.customer_address}</p>
                  {order.status !== 'Shipped' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'Shipped')}
                      className="w-full bg-white text-black text-[9px] font-bold py-2 uppercase tracking-[0.2em]"
                    >
                      Mark as Shipped
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}