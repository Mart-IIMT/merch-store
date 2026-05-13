"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"

export default function TrackPage() {
  const [phone, setPhone] = useState("")
  const [orders, setOrders] = useState([])

  async function fetchOrders() {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .eq("phone", phone)

    setOrders(data)
  }

  return (
    <div>
      <Navbar />

      <div className="p-6">
        <input onChange={(e) => setPhone(e.target.value)} />
        <button onClick={fetchOrders}>Track</button>

        {orders.map((o) => (
          <div key={o.id}>
            <p>{o.status}</p>
            <p>₹{o.total_amount}</p>
          </div>
        ))}
      </div>
    </div>
  )
}