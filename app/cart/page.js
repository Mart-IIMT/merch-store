"use client"

import { useEffect, useState } from "react"
import {
  getCart,
  removeFromCart,
  updateQuantity
} from "@/lib/cart"
import Navbar from "@/components/Navbar"

export default function CartPage() {
  const [cart, setCart] = useState([])

  useEffect(() => {
    setCart(getCart())
  }, [])

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-6 max-w-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Cart</h1>

        {cart.map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center bg-white p-4 rounded shadow-sm mb-3"
          >
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-500">
                Size: {item.size}
              </p>
            </div>

            <input
              type="number"
              value={item.quantity}
              onChange={(e) => {
                updateQuantity(i, Number(e.target.value))
                setCart(getCart())
              }}
              className="border p-1 w-16 rounded"
            />

            <button
              onClick={() => {
                removeFromCart(i)
                setCart(getCart())
              }}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}

        <div className="bg-white p-4 rounded shadow-sm mt-4">
          <h2 className="font-semibold">
            Total: ₹{total}
          </h2>

          <button
            onClick={() =>
              (window.location.href = "/checkout")
            }
            className="mt-3 bg-black text-white w-full py-2 rounded"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}