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

    async function loadCart() {

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const email = session.user.email

      // FETCH CART ITEMS

      const { data: cartItems } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_email", email)

      // FETCH PRODUCTS

      const productIds =
        cartItems?.map(item => item.product_id) || []

      const { data: products } = await supabase
        .from("products")
        .select("*")
        .in("id", productIds)

      // MERGE DATA

      const mergedCart = cartItems.map(item => {

        const product =
          products.find(p => p.id === item.product_id)

        return {
          ...item,
          product,
        }
      })

      setCart(mergedCart)

      setLoading(false)
    }

    loadCart()

  }, [])

  async function removeItem(cartItemId) {

    await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId)

    setCart(cart.filter(item => item.id !== cartItemId))
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  const total = cart.reduce(
    (sum, item) =>
      sum +
      Number(item.product?.price || 0) *
      Number(item.quantity),
    0
  )

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-3xl font-bold">
            Your Cart
          </h1>

          <Link href="/products">

            <button className="border px-4 py-2 rounded-xl bg-white">
              Continue Shopping
            </button>

          </Link>
        </div>

        {cart.length === 0 ? (

          <div className="bg-white p-6 rounded-xl shadow">
            Cart is empty
          </div>

        ) : (

          <>
            <div className="space-y-4">

              {cart.map((item) => (

                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow p-4 flex gap-4"
                >

                  <img
                    src={item.product?.image_url}
                    alt={item.product?.name}
                    className="w-24 h-24 rounded-xl object-cover"
                  />

                  <div className="flex-1">

                    <h2 className="text-xl font-bold">
                      {item.product?.name}
                    </h2>

                    <p className="text-gray-500">
                      Size: {item.size}
                    </p>

                    <p className="text-gray-500">
                      Quantity: {item.quantity}
                    </p>

                    <p className="font-bold mt-2">
                      ₹
                      {Number(item.product?.price || 0) *
                        Number(item.quantity)}
                    </p>

                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500"
                  >
                    Remove
                  </button>

                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow p-6 mt-6">

              <div className="flex justify-between text-2xl font-bold">

                <span>Total</span>

                <span>₹{total}</span>

              </div>

              <Link href="/checkout">

                <button className="w-full mt-6 bg-black text-white py-4 rounded-2xl text-lg font-semibold">
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