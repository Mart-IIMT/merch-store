"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function OrdersPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [orders, setOrders] = useState([])

  useEffect(() => {

    async function loadOrders() {

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const email = session.user.email

      // FETCH ORDERS

      const { data: ordersData } = await supabase
        .from("orders")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })

      if (!ordersData) {
        setLoading(false)
        return
      }

      // FETCH ITEMS FOR EACH ORDER

      const enrichedOrders = await Promise.all(

        ordersData.map(async (order) => {

          const { data: items } = await supabase
            .from("order_items")
            .select("*")
            .eq("order_id", order.id)

          const productIds =
            items?.map(i => i.product_id) || []

          const { data: products } = await supabase
            .from("products")
            .select("*")
            .in("id", productIds)

          const mergedItems = items.map(item => ({
            ...item,
            product: products.find(
              p => p.id === item.product_id
            ),
          }))

          return {
            ...order,
            items: mergedItems,
          }
        })
      )

      setOrders(enrichedOrders)

      setLoading(false)
    }

    loadOrders()

  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-3xl font-bold">
            My Orders
          </h1>

          <Link href="/products">

            <button className="border px-4 py-2 rounded-xl bg-white">
              Continue Shopping
            </button>

          </Link>
        </div>

        {orders.length === 0 ? (

          <div className="bg-white rounded-2xl shadow p-6">
            No orders found
          </div>

        ) : (

          <div className="space-y-6">

            {orders.map((order) => (

              <div
                key={order.id}
                className="bg-white rounded-2xl shadow p-6"
              >

                <div className="flex justify-between items-start mb-6">

                  <div>

                    <p className="font-bold text-lg">
                      Order ID
                    </p>

                    <p className="text-gray-500 text-sm">
                      {order.id}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="font-bold text-xl">
                      ₹{order.total_amount}
                    </p>

                    <p
                      className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${
                        order.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : order.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {order.status}
                    </p>

                  </div>
                </div>

                <div className="space-y-4">

                  {order.items.map((item) => (

                    <div
                      key={item.id}
                      className="flex gap-4 border rounded-xl p-4"
                    >

                      <img
                        src={item.product?.image_url}
                        alt={item.product?.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />

                      <div className="flex-1">

                        <h2 className="font-bold">
                          {item.product?.name}
                        </h2>

                        <p className="text-gray-500">
                          Size: {item.size}
                        </p>

                        <p className="text-gray-500">
                          Qty: {item.quantity}
                        </p>

                      </div>

                      <p className="font-bold">
                        ₹
                        {Number(item.product?.price || 0) *
                          Number(item.quantity)}
                      </p>

                    </div>
                  ))}
                </div>

                <div className="mt-6 text-sm text-gray-500">

                  Ordered on:
                  {" "}
                  {new Date(order.created_at)
                    .toLocaleString()}

                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}