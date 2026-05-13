"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get("order_id")

  const [order, setOrder] = useState(null)

  useEffect(() => {
    async function fetchOrder() {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      setOrder(data)
    }

    if (orderId) fetchOrder()
  }, [orderId])

  if (!order) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-6 max-w-xl mx-auto text-center">
        <h1 className="text-3xl font-semibold mb-2">
          🎉 Order Confirmed
        </h1>

        <p className="text-gray-600">
          Thank you! Your order has been received.
        </p>

        <p className="mt-4 text-sm">
          Order ID: {order.id}
        </p>

        <h2 className="mt-4 font-semibold">
          Total Paid: ₹{order.total_amount}
        </h2>

        <button
          onClick={() =>
            (window.location.href = "/products")
          }
          className="mt-6 bg-black text-white px-4 py-2 rounded"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  )
}