"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function CheckoutPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [cart, setCart] = useState([])

  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {

    async function checkAuth() {

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      setLoading(false)
    }

    checkAuth()

    const savedCart =
      JSON.parse(localStorage.getItem("cart")) || []

    setCart(savedCart)

  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  const total = cart.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.quantity),
    0
  )

  async function handleCheckout() {

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const email = user?.email || ""

    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: customerName,
          phone,
          email,
          total_amount: total,
          status: "created",
        },
      ])
      .select()
      .single()

    if (error) {
      alert("Error creating order")
      return
    }

    const orderItems = cart.map(item => ({
      order_id: order.id,
      product_id: item.id,
      quantity: item.quantity,
      size: item.size,
      item_price: item.price,
    }))

    await supabase
      .from("order_items")
      .insert(orderItems)

    router.push(`/payment?order_id=${order.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Checkout
        </h1>

        <div className="bg-white p-6 rounded-xl shadow">

          <input
            placeholder="Full Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border p-3 rounded mb-4"
          />

          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-3 rounded mb-4"
          />

          <div className="border-t pt-4">

            <h2 className="font-bold mb-4">
              Order Summary
            </h2>

            {cart.map((item, index) => (

              <div
                key={index}
                className="flex justify-between mb-2"
              >
                <span>
                  {item.name} × {item.quantity}
                </span>

                <span>
                  ₹{Number(item.price) * Number(item.quantity)}
                </span>
              </div>
            ))}

            <div className="flex justify-between font-bold text-xl mt-4">
              <span>Total</span>
              <span>₹{total}</span>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-black text-white py-3 rounded-xl"
            >
              Continue to Payment
            </button>

            <Link href="/cart">

              <button className="w-full mt-3 border py-3 rounded-xl">
                Back to Cart
              </button>

            </Link>

          </div>
        </div>
      </div>
    </div>
  )
}