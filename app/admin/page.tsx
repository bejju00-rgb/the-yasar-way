"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import emailjs from "@emailjs/browser"; 

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");

  // Edit Tracking States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editType, setEditType] = useState<"product" | "category" | "offer" | null>(null);

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

  const startEditProduct = (p: any) => {
    setEditingId(p.id); setEditType("product");
    setProdName(p.name || ""); setProdPrice(p.price || ""); setProdOldPrice(p.old_price || "");
    setProdDesc(p.description || ""); setProdStockCount(p.stock_count || 0);
    setCategoryId(p.category_id || ""); setTempImageUrl(p.image_url || "");
  };

  const startEditCategory = (c: any) => {
    setEditingId(c.id); setEditType("category");
    setCatName(c.name || ""); setCatSlug(c.slug || ""); setTempImageUrl(c.image_url || "");
  };

  const startEditOffer = (o: any) => {
    setEditingId(o.id); setEditType("offer");
    setOfferTitle(o.title || ""); setTempImageUrl(o.image_url || "");
  };

  const cancelEdit = () => {
    setEditingId(null); setEditType(null);
    setProdName(""); setProdPrice(""); setProdOldPrice(""); setProdDesc(""); setProdStockCount(0);
    setCatName(""); setCatSlug(""); setOfferTitle(""); setTempImageUrl("");
  };

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
          await emailjs.send("service_uqpm74w", nextStatus === "Shipped" ? "template_7x017r7" : "template_pbyba6g", templateParams, "31ajJuFK8ia03HKZD");
        } catch (err) { console.error("EmailJS Error:", err); }
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
          
          <div className="space-y-8">
            <section className="bg-zinc-900/40 p-6 border border-zinc-800/50 rounded-[35px]">
              <h3 className="text-[10px] font-black uppercase text-emerald-500 mb-4 tracking-widest">
                {editingId && editType === "category" ? "Editing Collection" : "Collections"}
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const payload = { name: catName, slug: catSlug.toLowerCase(), image_url: tempImageUrl };
                const { error } = editingId && editType === "category" 
                  ? await supabase.from("categories").update(payload).eq("id", editingId)
                  : await supabase.from("categories").insert([payload]);
                if (error) alert(error.message);
                cancelEdit(); fetchData();
              }} className="space-y-3 mb-6">
                <input placeholder="Name" value={catName ?? ""} onChange={(e) => setCatName(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                <input placeholder="Slug" value={catSlug ?? ""} onChange={(e) => setCatSlug(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                <input type="file" onChange={handleFileUpload} className="text-[8px]" />
                <div className="flex gap-2">
                  <button className="flex-1 bg-white text-black font-black py-3 rounded-lg text-[9px] uppercase">
                    {editingId && editType === "category" ? "Update" : "Add Collection"}
                  </button>
                  {editingId && editType === "category" && <button type="button" onClick={cancelEdit} className="bg-zinc-800 px-4 rounded-lg text-[9px]">X</button>}
                </div>
              </form>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {categories.map(c => (
                  <div key={c.id} className="flex flex-col bg-black/40 p-3 rounded-xl border border-zinc-800/50 overflow-hidden">
                    {c.image_url && <img src={c.image_url} alt="" className="w-full h-auto max-h-32 object-contain rounded mb-2 grayscale hover:grayscale-0 transition-all" />}
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black uppercase italic">{c.name}</span>
                      <div className="flex gap-3">
                        <button onClick={() => startEditCategory(c)} className="text-emerald-500 text-[8px] font-bold uppercase">Edit</button>
                        <button onClick={() => deleteItem('categories', c.id)} className="text-red-500 text-sm">&times;</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-zinc-900/40 p-6 border border-zinc-800/50 rounded-[35px]">
              <h3 className="text-[10px] font-black uppercase text-orange-500 mb-4 tracking-widest">
                {editingId && editType === "offer" ? "Editing Banner" : "Banners"}
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const payload = { title: offerTitle, image_url: tempImageUrl, is_active: true };
                const { error } = editingId && editType === "offer"
                  ? await supabase.from("offers").update(payload).eq("id", editingId)
                  : await supabase.from("offers").insert([payload]);
                if (error) alert(error.message);
                cancelEdit(); fetchData();
              }} className="space-y-3 mb-6">
                <input placeholder="Title" value={offerTitle ?? ""} onChange={(e) => setOfferTitle(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                <input type="file" onChange={handleFileUpload} className="text-[8px]" />
                <div className="flex gap-2">
                  <button className="flex-1 bg-orange-500 text-black font-black py-3 rounded-lg text-[9px] uppercase">
                    {editingId && editType === "offer" ? "Update" : "Deploy Banner"}
                  </button>
                  {editingId && editType === "offer" && <button type="button" onClick={cancelEdit} className="bg-zinc-800 px-4 rounded-lg text-[9px]">X</button>}
                </div>
              </form>
              <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto">
                {offers.map(o => (
                  <div key={o.id} className="relative w-full rounded-xl overflow-hidden border border-zinc-800 group bg-black/40">
                    <img src={o.image_url} className="w-full h-auto object-contain opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 bg-black/60 transition-opacity">
                      <button onClick={() => startEditOffer(o)} className="bg-white text-black text-[8px] px-3 py-1 rounded font-black">EDIT</button>
                      <button onClick={() => deleteItem('offers', o.id)} className="bg-red-500 text-white text-[8px] px-3 py-1 rounded font-black">DELETE</button>
                    </div>
                    <div className="p-2 text-center bg-black/20 border-t border-zinc-800">
                        <p className="text-[8px] font-black uppercase tracking-widest italic">{o.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-zinc-900/40 p-6 border border-zinc-800/50 rounded-[35px]">
              <h3 className="text-[10px] font-black uppercase text-white mb-4 tracking-widest">
                {editingId && editType === "product" ? "Editing Product" : "Product Deployment"}
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const payload = { 
                  name: prodName, price: Number(prodPrice), old_price: prodOldPrice ? Number(prodOldPrice) : null,
                  description: prodDesc, stock_count: Number(prodStockCount), is_in_stock: Number(prodStockCount) > 0,
                  image_url: tempImageUrl, category_id: categoryId ? Number(categoryId) : null 
                };
                const { error } = editingId && editType === "product"
                  ? await supabase.from("products").update(payload).eq("id", editingId)
                  : await supabase.from("products").insert([payload]);
                
                if (error) alert(error.message);
                else { cancelEdit(); fetchData(); alert("SUCCESS"); }
              }} className="space-y-4 mb-6">
                <input placeholder="Product Name" value={prodName ?? ""} onChange={(e) => setProdName(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-500 uppercase ml-1">Current Price</label>
                    <input placeholder="Price" type="number" value={prodPrice ?? ""} onChange={(e) => setProdPrice(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-500 uppercase ml-1">Old Price (Optional)</label>
                    <input placeholder="Old Price" type="number" value={prodOldPrice ?? ""} onChange={(e) => setProdOldPrice(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Stock Qty" type="number" value={prodStockCount ?? 0} onChange={(e) => setProdStockCount(Number(e.target.value))} className="bg-black border border-zinc-800 p-3 rounded-lg text-xs" required />
                  <select value={categoryId ?? ""} onChange={(e) => setCategoryId(e.target.value)} className="bg-black border border-zinc-800 p-3 rounded-lg text-[9px] uppercase">
                    <option value="">Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <textarea placeholder="Description" value={prodDesc ?? ""} onChange={(e) => setProdDesc(e.target.value)} className="w-full bg-black border border-zinc-800 p-3 rounded-lg text-xs h-20" />
                <div className="space-y-1">
                   <input type="file" onChange={handleFileUpload} className="text-[8px]" />
                   {isUploading && <p className="text-[8px] text-emerald-500 animate-pulse uppercase">Uploading Image...</p>}
                </div>
                <div className="flex gap-2">
                  <button disabled={isUploading} className="flex-1 bg-emerald-500 text-black font-black py-4 rounded-xl text-[10px] uppercase">
                    {editingId && editType === "product" ? "Update Product" : "Add product"}
                  </button>
                  {editingId && editType === "product" && <button type="button" onClick={cancelEdit} className="bg-zinc-800 px-6 rounded-xl text-[10px] uppercase font-black">Cancel</button>}
                </div>
              </form>
              <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                {products.map(p => (
                  <div key={p.id} className="bg-black/40 border border-zinc-800 p-4 rounded-xl flex flex-col gap-3 group">
                    <div className="flex gap-4">
                        <img src={p.image_url} className="w-16 h-auto max-h-16 rounded object-contain bg-black/50" />
                        <div className="flex flex-col justify-center">
                            <span className="text-[10px] font-black uppercase italic leading-none">{p.name}</span>
                            <span className="text-[8px] text-zinc-500 mt-1">Stock: {p.stock_count}</span>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2 border-t border-zinc-900">
                      <button onClick={() => startEditProduct(p)} className="text-[8px] font-black text-emerald-500 uppercase">Edit Product</button>
                      <button onClick={() => deleteItem('products', p.id)} className="text-[8px] font-black text-red-500 uppercase">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

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
                      <button onClick={() => updateOrderStatus(order)} className={`text-[8px] font-black px-4 py-2 rounded-full border transition-all ${order.status === 'Delivered' ? 'bg-emerald-500 text-black border-emerald-500' : 'text-zinc-400 border-zinc-700'}`}>
                        {order.status || 'Pending'}
                      </button>
                    </div>
                    <div className="flex justify-between items-center border-t border-zinc-800 pt-4">
                      <span className="font-black text-emerald-400 text-sm italic">Rs. {order.total_price}</span>
                      <button onClick={() => deleteItem('orders', order.id)} className="text-[8px] font-black text-zinc-700 hover:text-red-500 uppercase">Archive</button>
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