"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import emailjs from '@emailjs/browser';

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState(""); 
  const [price, setPrice] = useState("");
  const [oldPrice, setOldPrice] = useState(""); 
  const [imageUrl, setImageUrl] = useState("");
  const [tag, setTag] = useState("");
  const [stock, setStock] = useState(""); 

  const fetchData = async () => {
    // FIXED: Changed 'created_at' to 'id' to resolve your console error
    const { data: prodData, error: prodError } = await supabase
      .from("products")
      .select("*")
      .order('id', { ascending: false });
    
    if (prodError) console.error("Product fetch error:", prodError.message);
    else setProducts(prodData || []);

    const { data: ordData, error: ordError } = await supabase
      .from("orders")
      .select("*")
      .order('created_at', { ascending: false });
    
    if (ordError) console.error("Order fetch error:", ordError.message);
    else setOrders(ordData || []);
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "YASAR786") setIsAuthenticated(true);
    else alert("Access Denied.");
  };

  // --- EMAILJS LOGIC ---
  const sendStatusEmail = async (order: any, status: string) => {
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!;
    const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!;
    
    const templateId = status === "Shipped" 
      ? process.env.NEXT_PUBLIC_EMAILJS_SHIPMENT_TEMPLATE_ID! 
      : process.env.NEXT_PUBLIC_EMAILJS_DELIVERY_TEMPLATE_ID!;
    
    const templateParams = {
      customer_name: order.customer_name,
      customer_email: order.customer_email, // Make sure this column exists in Supabase
      order_id: order.id,
      status: status,
    };

    try {
      await emailjs.send(serviceId, templateId, templateParams, publicKey);
      console.log(`${status} email sent!`);
    } catch (err) {
      console.error("Email failed:", err);
    }
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalOldPrice = oldPrice ? Number(oldPrice) : (Number(price) * 1.2).toFixed(0);
    
    const productData: any = { 
      name, 
      description,
      price: Number(price), 
      image_url: imageUrl, 
      oldPrice: Number(finalOldPrice),
      tag,
      sales_count: 0 
    };

    if (stock) productData.stock = Number(stock);

    const { error } = await supabase.from("products").insert([productData]);
    
    if (error) {
      alert("Failed to add: " + error.message);
    } else {
      setName(""); setDescription(""); setPrice(""); setOldPrice(""); setImageUrl(""); setTag(""); setStock("");
      fetchData();
    }
  };

  const deleteProduct = async (id: number) => {
    if(confirm("Permanently remove this item from catalog?")) {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) alert("Delete failed: " + error.message);
      fetchData();
    }
  };

  // UPDATED: Now handles Shipment -> Delivery flow + Email triggers
  const updateStatus = async (order: any, newStatus: string) => {
    setIsUpdating(order.id);
    
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", order.id);
    
    if (error) {
      alert("Update failed: " + error.message);
    } else {
      // Increment sales only when first shipped
      if (newStatus === "Shipped") {
        const { data: product } = await supabase
          .from("products")
          .select("sales_count")
          .eq("id", order.product_id)
          .single();

        await supabase
          .from("products")
          .update({ sales_count: (product?.sales_count || 0) + 1 })
          .eq("id", order.product_id);
      }

      // Automatically send the email
      await sendStatusEmail(order, newStatus);
    }
    
    await fetchData();
    setIsUpdating(null);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-zinc-900 p-8 border border-zinc-800">
          <h1 className="text-2xl font-black italic uppercase text-white mb-6 tracking-tighter text-center">HQ ACCESS</h1>
          <input type="password" placeholder="Master Password" className="w-full bg-black border border-zinc-700 p-4 text-white outline-none mb-4 focus:border-white transition-all text-center" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-white text-black font-bold py-4 uppercase tracking-[0.3em] text-xs hover:bg-zinc-200 transition-all">Authorize</button>
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-12">
            <section>
              <h2 className="text-xl font-bold uppercase italic border-b border-zinc-800 pb-2 mb-6 tracking-widest">Inventory Management</h2>
              <form onSubmit={addProduct} className="grid grid-cols-2 gap-3 bg-zinc-900/30 p-6 border border-zinc-800">
                <div className="col-span-2">
                    <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Product Title</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-black p-3 text-sm border border-zinc-800 outline-none focus:border-zinc-500 text-white" required />
                </div>
                <div className="col-span-2">
                    <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-black p-3 text-sm border border-zinc-800 outline-none focus:border-zinc-500 text-white h-24 resize-none" placeholder="Details about the product..." required />
                </div>
                <div>
                    <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Price</label>
                    <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" className="w-full bg-black p-3 text-sm border border-zinc-800 outline-none focus:border-zinc-500 text-white" required />
                </div>
                <div>
                    <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Stock Quantity</label>
                    <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" className="w-full bg-black p-3 text-sm border border-zinc-800 outline-none focus:border-zinc-500 text-white" placeholder="0" />
                </div>
                <div className="col-span-2">
                    <label className="text-[9px] uppercase text-zinc-500 font-bold mb-1 block">Image URL</label>
                    <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full bg-black p-3 text-sm border border-zinc-800 outline-none focus:border-zinc-500 text-white" />
                </div>
                <button className="col-span-2 bg-white text-black font-bold py-4 uppercase text-[10px] tracking-[0.3em] mt-2 hover:invert transition-all">Update Digital Catalog</button>
              </form>
            </section>

            <section>
              <h2 className="text-xl font-bold uppercase italic border-b border-zinc-800 pb-2 mb-6 tracking-widest">Live Catalog</h2>
              <div className="grid grid-cols-1 gap-2 max-h-[500px] overflow-y-auto pr-2">
                {products.length === 0 && <p className="text-zinc-600 uppercase text-[9px] tracking-widest italic">No products found.</p>}
                {products.map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-zinc-900/40 p-4 border border-zinc-800 group">
                    <div className="flex items-center gap-4">
                      <img src={p.image_url || 'https://via.placeholder.com/50'} className="w-12 h-12 object-cover border border-zinc-800" alt="" />
                      <div>
                        <p className="font-bold text-xs uppercase italic text-white">{p.name}</p>
                        <p className="text-zinc-500 text-[10px] uppercase">
                            Rs. {p.price} • {p.stock || 0} In Stock
                        </p>
                        <p className="text-emerald-500 text-[9px] font-bold uppercase mt-1 tracking-tighter">
                          {p.sales_count || 0} PIECES SOLD 
                        </p>
                      </div>
                    </div>
                    <button onClick={() => deleteProduct(p.id)} className="text-red-500 opacity-0 group-hover:opacity-100 text-[9px] font-bold uppercase tracking-widest transition-all hover:underline">Remove</button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div>
            <h2 className="text-xl font-bold uppercase italic border-b border-zinc-800 pb-2 mb-6 tracking-widest">Order Stream</h2>
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className={`p-6 border ${order.status === 'Delivered' ? 'bg-zinc-900/20 border-zinc-900 opacity-40' : 'bg-zinc-900 border-zinc-800 shadow-xl'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-black italic uppercase text-lg tracking-tighter text-white">{order.customer_name}</p>
                      <p className="text-zinc-500 text-[9px] uppercase tracking-widest">{order.customer_address}</p>
                    </div>
                    <p className="font-black italic text-xl text-white">Rs. {order.total_price}</p>
                  </div>
                  
                  {/* BUTTON TOGGLE LOGIC */}
                  {(!order.status || order.status === 'Pending') && (
                    <button 
                      onClick={() => updateStatus(order, 'Shipped')} 
                      disabled={isUpdating === order.id}
                      className="w-full bg-white text-black text-[9px] font-bold py-3 uppercase tracking-[0.3em] hover:invert transition-all"
                    >
                      {isUpdating === order.id ? 'Processing...' : 'Confirm Shipment'}
                    </button>
                  )}

                  {order.status === 'Shipped' && (
                    <button 
                      onClick={() => updateStatus(order, 'Delivered')} 
                      disabled={isUpdating === order.id}
                      className="w-full bg-emerald-500 text-black text-[9px] font-bold py-3 uppercase tracking-[0.3em] hover:bg-emerald-400 transition-all"
                    >
                      {isUpdating === order.id ? 'Processing...' : 'Confirm Delivered'}
                    </button>
                  )}

                  {order.status === 'Delivered' && (
                    <div className="text-center py-2 border border-zinc-800 text-[8px] uppercase tracking-widest text-zinc-500">
                      Order Fulfilled
                    </div>
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