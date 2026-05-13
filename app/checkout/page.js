"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { getCart, clearCart } from "@/lib/cart"
import Navbar from "@/components/Navbar"

export default function CheckoutPage() {
  const [cart, setCart] = useState([])
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")

  useEffect(() => {
    setCart(getCart())
  }, [])

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  async function placeOrder() {
    const { data: order } = await supabase
      .from("orders")
      .insert({
  customer_name: name,
  phone,
  total_amount: total,
  status: "created"
})
      .select()
      .single()

    for (const item of cart) {
      await supabase.from("order_items").insert({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size
      })
    }

    clearCart()

    window.location.href = `/payment?order_id=${order.id}`
  }

  return (
    <div>
      <Navbar />

      <div className="p-6">
        <h1>Checkout</h1>

        {cart.map((item, i) => (
          <p key={i}>
            {item.name} x {item.quantity}
          </p>
        ))}

        <h2>Total: ₹{total}</h2>

        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input placeholder="Phone" onChange={(e) => setPhone(e.target.value)} />

        <button onClick={placeOrder}>
          Proceed to Payment
        </button>
      </div>
    </div>
  )
}