"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [activeTab, setActiveTab] = useState("pending")
  const [search, setSearch] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchOrders() {
    setLoading(true)
    const { data } = await supabase.from("orders").select("*")
    setOrders(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    let filtered = orders.filter(o => o.status === activeTab)

    if (search) {
      filtered = filtered.filter(o =>
        o.phone?.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
  }, [orders, activeTab, search])

  async function updateStatus(orderId, newStatus) {
    await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId)

    fetchOrders()
  }

  async function openOrder(order) {
    setSelectedOrder(order)

    const { data } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", order.id)

    const productIds = data.map(i => i.product_id)

    const { data: products } = await supabase
      .from("products")
      .select("*")
      .in("id", productIds)

    const merged = data.map(item => ({
      ...item,
      product: products.find(p => p.id === item.product_id)
    }))

    setOrderItems(merged)
  }

  async function exportCSV() {
    const { data: orders } = await supabase.from("orders").select("*")
    const { data: items } = await supabase.from("order_items").select("*")
    const { data: products } = await supabase.from("products").select("*")

    const rows = []

    orders.forEach(order => {
      const orderItems = items.filter(i => i.order_id === order.id)

      orderItems.forEach(item => {
        const product = products.find(p => p.id === item.product_id)

        rows.push({
          date: new Date(order.created_at).toLocaleString(),
          order_id: order.id,
          name: order.customer_name,
          phone: order.phone,
          product: product?.name || "",
          size: item.size,
          quantity: item.quantity,
          item_total: (Number(product?.price) || 0) * item.quantity,
          order_total: order.total_amount,
          utr: order.utr || "",
          status: order.status
        })
      })
    })

    const header =
      "Date,Order ID,Name,Phone,Product,Size,Qty,Item Total,Order Total,UTR,Status\n"

    const csv =
      header +
      rows
        .map(r =>
          `${r.date},${r.order_id},${r.name},${r.phone},${r.product},${r.size},${r.quantity},${r.item_total},${r.order_total},${r.utr},${r.status}`
        )
        .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = "orders.csv"
    a.click()
  }

  // 📊 METRICS
  const pendingCount = orders.filter(o => o.status === "pending").length
  const confirmedCount = orders.filter(o => o.status === "confirmed").length
  const rejectedCount = orders.filter(o => o.status === "rejected").length

  const revenue = orders
    .filter(o => o.status === "confirmed")
    .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="p-6 max-w-5xl mx-auto">

      <h1 className="text-3xl font-bold mb-6">
        Admin Dashboard
      </h1>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Pending</p>
          <p className="text-2xl font-bold">{pendingCount}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Confirmed</p>
          <p className="text-2xl font-bold">{confirmedCount}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Rejected</p>
          <p className="text-2xl font-bold">{rejectedCount}</p>
        </div>

        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500">Revenue</p>
          <p className="text-2xl font-bold">₹{revenue}</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between mb-4">
        <input
          placeholder="Search by phone"
          className="border p-2 rounded"
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={exportCSV}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Export CSV
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6">
        {["pending", "confirmed", "rejected"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab
                ? "bg-black text-white"
                : "bg-gray-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders */}
      {filteredOrders.map(order => (
        <div key={order.id} className="bg-white p-4 rounded shadow mb-3">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">{order.customer_name}</p>
              <p className="text-sm">{order.phone}</p>
            </div>

            <p className="font-bold">₹{order.total_amount}</p>
          </div>

          <button
            onClick={() => openOrder(order)}
            className="mt-2 text-blue-600"
          >
            View Details
          </button>

          {activeTab === "pending" && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => updateStatus(order.id, "confirmed")}
                className="bg-green-600 text-white px-3 py-1 rounded"
              >
                Confirm
              </button>

              <button
                onClick={() => updateStatus(order.id, "rejected")}
                className="bg-red-600 text-white px-3 py-1 rounded"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-[400px]">
            <h2 className="text-xl font-bold mb-2">
              Order Details
            </h2>

            {orderItems.map((item, i) => (
              <div key={i} className="border p-2 mt-2">
                <p>{item.product?.name}</p>
                <p>Qty: {item.quantity}</p>
                <p>Size: {item.size}</p>
              </div>
            ))}

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 bg-black text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}