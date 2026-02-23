"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import emailjs from "@emailjs/browser"; // RESTORED

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");

  // Form States
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState("");
  const [prodOldPrice, setProdOldPrice] = useState("");
  const [prodDesc, setProdDesc] = useState(""); 
  const [prodStockCount, setProdStockCount] = useState<number>(0);
  const [categoryId, setCategoryId] = useState("");
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [offerTitle, setOfferTitle] = useState("");

  const fetchData = async () => {
    const { data: prodData } = await supabase.from("products").select("*, categories(name)").order('id', { ascending: false });
    const { data: ordData } = await supabase.from("orders").select("*").order('created_at', { ascending: false });
    const { data: catData } = await supabase.from("categories").select("*").order('name', { ascending: true });
    const { data: offData } = await supabase.from("offers").select("*").order('id', { ascending: false });
    
    setProducts(prodData || []);
    setOrders(ordData || []);
    setCategories(catData || []);
    setOffers(offData || []);
  };

  useEffect(() => {
    if (isAuthenticated) fetchData();
  }, [isAuthenticated]);

  // FULL EMAILJS LOGIC RESTORED
  const updateOrderStatus = async (order: any) => {
    if (!order || !order.id) return;
    let nextStatus = order.status === "Pending" ? "Shipped" : order.status === "Shipped" ? "Delivered" : "Delivered";
    
    const { error: updateError } = await supabase.from("orders").update({ status: nextStatus }).eq("id", order.id);
    
    if (!updateError) {
      if (order.customer_email && order.customer_email.includes('@')) {
        const templateParams = {
          customer_name: order.customer_name || "Valued Customer",
          customer_email: order.customer_email,
          order_id: order.id,
          status: nextStatus,
          total_price: `${order.currency || 'Rs.'} ${order.total_price}`,
        };
        
        try {
          await emailjs.send(
            "service_uqpm74w", 
            nextStatus === "Shipped" ? "template_7x017r7" : "template_pbyba6g",
            templateParams,
            "31ajJuFK8ia03HKZD"
          );
          console.log("Email Dispatched successfully.");
        } catch (err) { 
          console.error("EmailJS Error:", err); 
        }
      }
      fetchData();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
    if (uploadError) { alert(uploadError.message); setIsUploading(false); return; }
    const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(fileName);
    setTempImageUrl(publicUrl);
    setIsUploading(false);
  };

  const deleteItem = async (table: string, id: number) => {
    if(confirm("PERMANENTLY DELETE?")) { 
      await supabase.from(table).delete().eq("id", id); 
      fetchData(); 
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <form onSubmit={(e) => { e.preventDefault(); if (password === "YASAR786") setIsAuthenticated(true); }} className="w-full max-w-sm bg-zinc-900 border border-zinc-800 p-10 rounded-[40px]">
          <h1 className="text-xl font-black text-white mb-6 text-center tracking-tight uppercase italic">Terminal Auth</h1>
          <input type="password" placeholder="ENCRYPTED KEY" className="w-full bg-black border border-zinc-700 p-4 text-white outline-none mb-4 rounded-xl text-center font-black" onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-white text-black font-black py-4 rounded-xl uppercase text-[10px] tracking-widest hover:bg-emerald-500">LOGIN</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex justify-between items-center border-b border-zinc-900 pb-8">
          <h1 className="text-4xl font-black italic uppercase tracking-tighter">Admin Panel</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-[10px] font-black uppercase border border-zinc-800 px-6 py-2 rounded-full">Logout</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COL 1: CATS & BANNERS */}
          <div className="space-y-8">
            <section className="bg-zinc-900/40 p-6 border border-zinc-800/50 rounded-[35px]">
              <h3 className="text-[10px] font-black uppercase text-emerald-500 mb-4 tracking-widest">Collections</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                await supabase.from("categories").insert([{ name: catName, slug: catSlug.toLowerCase(), image_url: tempImageUrl }]);
                setCatName(""); setCatSlug(""); setTempImageUrl(""); fetchData();
              }} className="space-y-3 mb-6">
                <input placeholder="Name" value={catName} onChange={(e) => setCatName(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                <input placeholder="Slug" value={catSlug} onChange={(e) => setCatSlug(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                <input type="file" onChange={handleFileUpload} className="text-[8px]" />
                <button className="w-full bg-white text-black font-black py-3 rounded-lg text-[9px] uppercase">Add Collection</button>
              </form>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {categories.map(c => (
                  <div key={c.id} className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-zinc-800/50">
                    <span className="text-[9px] font-black uppercase italic">{c.name}</span>
                    <button onClick={() => deleteItem('categories', c.id)} className="text-red-500">&times;</button>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-zinc-900/40 p-6 border border-zinc-800/50 rounded-[35px]">
              <h3 className="text-[10px] font-black uppercase text-orange-500 mb-4 tracking-widest">Banners</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                await supabase.from("offers").insert([{ title: offerTitle, image_url: tempImageUrl, is_active: true }]);
                setOfferTitle(""); setTempImageUrl(""); fetchData();
              }} className="space-y-3 mb-6">
                <input placeholder="Title" value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                <input type="file" onChange={handleFileUpload} className="text-[8px]" />
                <button className="w-full bg-orange-500 text-black font-black py-3 rounded-lg text-[9px] uppercase">Deploy</button>
              </form>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {offers.map(o => (
                  <div key={o.id} className="relative aspect-[21/9] rounded-xl overflow-hidden border border-zinc-800">
                    <img src={o.image_url} className="w-full h-full object-cover opacity-60" />
                    <button onClick={() => deleteItem('offers', o.id)} className="absolute top-1 right-1 bg-red-500 text-[8px] p-1 rounded-full">&times;</button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* COL 2: PRODUCTS */}
          <div className="space-y-8">
            <section className="bg-zinc-900/40 p-6 border border-zinc-800/50 rounded-[35px]">
              <h3 className="text-[10px] font-black uppercase text-white mb-4 tracking-widest">Product Deployment</h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                await supabase.from("products").insert([{ 
                  name: prodName, price: Number(prodPrice), old_price: prodOldPrice ? Number(prodOldPrice) : null,
                  description: prodDesc, stock_count: prodStockCount, is_in_stock: prodStockCount > 0,
                  image_url: tempImageUrl, category_id: categoryId ? Number(categoryId) : null 
                }]);
                setProdName(""); setProdPrice(""); setProdOldPrice(""); setProdDesc(""); setProdStockCount(0); setTempImageUrl(""); fetchData();
              }} className="space-y-4 mb-6">
                <input placeholder="Name" value={prodName} onChange={(e) => setProdName(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Price" type="number" value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} className="bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                  <input placeholder="Qty" type="number" value={prodStockCount} onChange={(e) => setProdStockCount(Number(e.target.value))} className="bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                </div>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-[9px] uppercase">
                  <option value="">Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <input type="file" onChange={handleFileUpload} className="text-[8px]" />
                <button disabled={isUploading} className="w-full bg-emerald-500 text-black font-black py-4 rounded-xl text-[10px] uppercase">Add product</button>
              </form>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {products.map(p => (
                  <div key={p.id} className="bg-black/40 border border-zinc-800 p-3 rounded-xl flex justify-between items-center group">
                    <div className="flex items-center gap-3">
                        <img src={p.image_url} className="w-8 h-8 rounded object-cover grayscale group-hover:grayscale-0" />
                        <span className="text-[9px] font-black uppercase italic leading-none">{p.name}</span>
                    </div>
                    <button onClick={() => deleteItem('products', p.id)} className="text-[8px] font-black text-red-500">Remove</button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* COL 3: ORDERS & EMAIL TRIGGER */}
          <div className="space-y-6">
             <h3 className="text-zinc-600 font-black uppercase tracking-[0.5em] text-[10px] pl-4">Orders</h3>
             <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
               {orders.map(order => (
                 <div key={order.id} className="p-6 bg-zinc-900 border border-zinc-800 rounded-[35px]">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="block font-black text-white uppercase italic text-sm">{order.customer_name}</span>
                        <span className="text-[8px] text-zinc-500 uppercase">{order.customer_phone}</span>
                      </div>
                      {/* EMAIL TRIGGER ON STATUS CHANGE */}
                      <button onClick={() => updateOrderStatus(order)} className={`text-[8px] font-black px-4 py-2 rounded-full border transition-all ${order.status === 'Delivered' ? 'bg-emerald-500 text-black border-emerald-500' : 'text-zinc-400 border-zinc-700'}`}>
                        {order.status || 'Pending'}
                      </button>
                    </div>
                    <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                      <span className="font-black text-emerald-400 text-sm italic">Rs. {order.total_price}</span>
                      <button onClick={() => deleteItem('orders', order.id)} className="text-[8px] font-black text-zinc-700 hover:text-red-500">Archive</button>
                    </div>
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}