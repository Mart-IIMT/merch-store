"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function CartPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState([])

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

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Your Cart
        </h1>

        {cart.length === 0 ? (
          <div className="bg-white p-6 rounded-xl shadow">
            Cart is empty
          </div>
        ) : (
          <>
            <div className="space-y-4">

              {cart.map((item, index) => (

                <div
                  key={index}
                  className="bg-white p-4 rounded-xl shadow flex gap-4"
                >

                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded"
                  />

                  <div className="flex-1">

                    <h2 className="font-bold text-lg">
                      {item.name}
                    </h2>

                    <p>Size: {item.size}</p>

                    <p>Qty: {item.quantity}</p>

                    <p className="font-semibold">
                      ₹{item.price}
                    </p>

                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow mt-6">

              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span>₹{total}</span>
              </div>

              <Link href="/checkout">

                <button className="w-full mt-6 bg-black text-white py-3 rounded-xl">
                  Proceed to Checkout
                </button>

              </Link>

            </div>
          </>
        )}
      </div>
    </div>
  )
}