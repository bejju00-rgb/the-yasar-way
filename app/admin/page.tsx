"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  // App State
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState<number | null>(null); // Track specific order ID

  // Form State
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState(""); // Custom Sale Price
  const [imageUrl, setImageUrl] = useState("");
  const [tag, setTag] = useState("");

  const fetchData = async () => {
    const { data: prodData } = await supabase.from("products").select("*").order('created_at', { ascending: false });
    if (prodData) setProducts(prodData);

    const { data: ordData } = await supabase.from("orders").select("*").order('created_at', { ascending: false });
    if (ordData) setOrders(ordData);
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "YASAR786") {
      setIsAuthenticated(true);
    } else {
      alert("Access Denied.");
    }
  };

  const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.total_price), 0);

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use manual oldPrice if provided, otherwise auto-calculate 20% higher for "Sale" look
    const finalOldPrice = oldPrice ? Number(oldPrice) : (Number(price) * 1.2).toFixed(0);
    
    await supabase.from("products").insert([{ 
      name, 
      price: Number(price), 
      image_url: imageUrl, 
      "oldPrice": finalOldPrice, 
      tag 
    }]);
    
    setName(""); setPrice(""); setOldPrice(""); setImageUrl(""); setTag("");
    fetchData();
  };

  const deleteProduct = async (id: number) => {
    if(confirm("Delete this product?")) {
      await supabase.from("products").delete().eq("id", id);
      fetchData();
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    setIsUpdating(id); // Set loading for this specific button
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (error) {
      alert("Update failed: " + error.message);
    }
    
    await fetchData();
    setIsUpdating(null); // Remove loading state
  };

  const downloadCSV = () => {
    const headers = ["ID", "Customer", "Phone", "Address", "Method", "Total", "Status"];
    const rows = orders.map(o => [o.id, o.customer_name, o.customer_phone, `"${o.customer_address}"`, o.payment_method, o.total_price, o.status || 'Pending']);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `YasarWay_Orders_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-zinc-900 p-8 border border-zinc-800">
          <h1 className="text-2xl font-black italic uppercase text-white mb-6 tracking-tighter">HQ ACCESS</h1>
          <input 
            type="password" 
            placeholder="Enter Master Password" 
            className="w-full bg-black border border-zinc-700 p-4 text-white outline-none mb-4 focus:border-white transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className="w-full bg-white text-black font-bold py-4 uppercase tracking-widest text-xs hover:bg-zinc-200 transition-all">Authorize</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 border-b border-zinc-800 pb-8">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.4em] mb-2">Internal Management</p>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">THE YASAR WAY</h1>
          </div>
          <button onClick={downloadCSV} className="text-[10px] font-bold uppercase border border-zinc-700 px-6 py-3 hover:bg-white hover:text-black transition-all tracking-widest">Export Orders</button>
        </div>

        {/* REVENUE STATS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            <div className="md:col-span-2 bg-zinc-900 border border-zinc-800 p-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Total Accumulated Revenue</p>
                <p className="text-6xl font-black italic tracking-tighter">Rs. {totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-10 flex flex-col justify-center">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Orders Count</p>
                <p className="text-4xl font-black italic tracking-tighter">{orders.length}</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* LEFT: INVENTORY */}
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold uppercase italic border-b border-zinc-800 pb-2 mb-6 tracking-widest">Inventory Management</h2>
              <form onSubmit={addProduct} className="grid grid-cols-2 gap-3 bg-zinc-900/30 p-6 border border-zinc-800">
                <div className="col-span-2">
                    <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Product Title</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Matte Wax" className="w-full bg-black p-3 text-sm border border-zinc-800 outline-none focus:border-zinc-500" required />
                </div>
                <div>
                    <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Current Price (PKR)</label>
                    <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="1500" type="number" className="w-full bg-black p-3 text-sm border border-zinc-800 outline-none focus:border-zinc-500" required />
                </div>
                <div>
                    <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Old Price (For Sale)</label>
                    <input value={oldPrice} onChange={(e) => setOldPrice(e.target.value)} placeholder="2000" type="number" className="w-full bg-black p-3 text-sm border border-zinc-800 outline-none focus:border-zinc-500" />
                </div>
                <div className="col-span-2">
                    <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Image URL</label>
                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="w-full bg-black p-3 text-sm border border-zinc-800 outline-none focus:border-zinc-500" />
                </div>
                <div className="col-span-2">
                    <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Product Tag</label>
                    <input value={tag} onChange={(e) => setTag(e.target.value)} placeholder="NEW, BEST SELLER, 20% OFF" className="w-full bg-black p-3 text-sm border border-zinc-800 outline-none focus:border-zinc-500" />
                </div>
                <button className="col-span-2 bg-white text-black font-bold py-4 uppercase text-[10px] tracking-[0.3em] mt-2 hover:invert transition-all">Update Digital Catalog</button>
              </form>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase italic border-b border-zinc-800 pb-2 mb-6">Live Catalog</h2>
              <div className="grid grid-cols-1 gap-2">
                {products.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-zinc-900/40 p-4 border border-zinc-800 group">
                    <div className="flex items-center gap-4">
                      {p.image_url ? (
                        <img src={p.image_url} className="w-12 h-12 object-cover border border-zinc-800" alt="" />
                      ) : (
                        <div className="w-12 h-12 bg-black border border-zinc-800" />
                      )}
                      <div>
                        <p className="font-bold text-xs uppercase italic">{p.name}</p>
                        <p className="text-zinc-500 text-[10px]">
                            Rs. {p.price} <span className="line-through ml-2 opacity-50">{p.oldPrice}</span>
                        </p>
                      </div>
                    </div>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-500 opacity-0 group-hover:opacity-100 text-[9px] font-bold uppercase tracking-widest transition-all hover:underline">Remove</button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT: ORDERS */}
          <div>
            <h2 className="text-xl font-bold uppercase italic border-b border-zinc-800 pb-2 mb-6 tracking-widest">Order Stream</h2>
            <div className="space-y-4">
              {orders.length === 0 && <p className="text-zinc-600 uppercase text-[10px] tracking-widest italic text-center py-20">No orders recorded yet.</p>}
              {orders.map((order) => (
                <div key={order.id} className={`p-6 border transition-all duration-500 ${order.status === 'Shipped' ? 'bg-zinc-900/20 border-zinc-900 opacity-40' : 'bg-zinc-900 border-zinc-800 shadow-xl shadow-white/5'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-black italic uppercase text-lg leading-none tracking-tighter">{order.customer_name}</p>
                        <span className={`text-[8px] font-bold px-2 py-0.5 rounded ${order.status === 'Shipped' ? 'bg-zinc-800 text-zinc-400' : 'bg-green-500 text-black'}`}>
                            {order.status || 'PENDING'}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">{order.payment_method} • {order.customer_phone}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-black italic text-xl leading-none">Rs. {order.total_price}</p>
                        <p className="text-[8px] text-zinc-600 mt-1 uppercase">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="bg-black/40 p-3 rounded border border-zinc-800/50 mb-4">
                    <p className="text-[10px] text-zinc-400 uppercase leading-relaxed italic">{order.customer_address}</p>
                  </div>

                  {order.status !== 'Shipped' && (
                    <button 
                      disabled={isUpdating === order.id}
                      onClick={() => updateStatus(order.id, 'Shipped')}
                      className="w-full bg-white text-black text-[9px] font-bold py-3 uppercase tracking-[0.3em] hover:bg-zinc-200 transition-all disabled:opacity-50"
                    >
                      {isUpdating === order.id ? 'Updating...' : 'Confirm Shipment'}
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