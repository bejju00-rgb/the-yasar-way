"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminPanel() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = async () => {
    const { data: prodData } = await supabase.from("products").select("*");
    if (prodData) setProducts(prodData);

    const { data: ordData } = await supabase.from("orders").select("*").order('created_at', { ascending: false });
    if (ordData) setOrders(ordData);
  };

  useEffect(() => { fetchData(); }, []);

  // --- REVENUE LOGIC ---
  const totalRevenue = orders.reduce((acc, curr) => acc + Number(curr.total_price), 0);
  const shippedRevenue = orders
    .filter(o => o.status === 'Shipped')
    .reduce((acc, curr) => acc + Number(curr.total_price), 0);

  // --- DOWNLOAD CSV LOGIC ---
  const downloadCSV = () => {
    const headers = ["Order ID", "Customer Name", "Phone", "Address", "Method", "Total Price", "Status", "Date"];
    const rows = orders.map(o => [
      o.id,
      o.customer_name,
      o.customer_phone,
      `"${o.customer_address.replace(/"/g, '""')}"`, // Handle commas in addresses
      o.payment_method,
      o.total_price,
      o.status || 'Pending',
      new Date(o.created_at).toLocaleDateString()
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    
    link.setAttribute("href", url);
    link.setAttribute("download", `YasarWay_Orders_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const updateStatus = async (id: number, newStatus: string) => {
    setIsUpdating(true);
    await supabase.from("orders").update({ status: newStatus }).eq("id", id);
    await fetchData();
    setIsUpdating(false);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <h1 className="text-5xl font-black italic uppercase tracking-tighter">THE YASAR WAY <span className="text-zinc-700">HQ</span></h1>
            <button 
                onClick={downloadCSV}
                className="bg-zinc-800 hover:bg-white hover:text-black transition-all text-[10px] font-bold uppercase tracking-[0.2em] px-6 py-3 border border-zinc-700"
            >
                Export Orders (CSV)
            </button>
        </div>
        
        {/* REVENUE CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <div className="bg-zinc-900 border border-zinc-800 p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Total Sales Volume</p>
            <p className="text-4xl font-black italic">Rs. {totalRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 p-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">Confirmed (Shipped)</p>
            <p className="text-4xl font-black italic text-green-500 text-opacity-80">Rs. {shippedRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* ORDERS LIST */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold uppercase italic tracking-widest border-b border-zinc-800 pb-2">Active Orders</h2>
          {orders.map((order) => (
            <div key={order.id} className={`p-6 border transition-all ${order.status === 'Shipped' ? 'bg-zinc-900/20 border-zinc-900 opacity-40' : 'bg-zinc-900/50 border-zinc-800'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-bold uppercase text-lg italic">{order.customer_name}</p>
                    <span className={`text-[8px] px-2 py-0.5 font-bold uppercase rounded ${order.status === 'Shipped' ? 'bg-zinc-800 text-zinc-500' : 'bg-white text-black'}`}>
                      {order.status || 'Pending'}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest">{order.payment_method} • {order.customer_phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-black text-xl italic leading-none">Rs. {order.total_price}</p>
                  {order.status !== 'Shipped' && (
                    <button 
                      disabled={isUpdating}
                      onClick={() => updateStatus(order.id, 'Shipped')}
                      className="mt-3 text-[9px] bg-white text-black px-4 py-1.5 font-bold uppercase hover:invert"
                    >
                      Mark Shipped
                    </button>
                  )}
                </div>
              </div>
              <p className="text-zinc-500 text-[11px] mt-4 uppercase italic tracking-tighter">{order.customer_address}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}