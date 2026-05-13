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

  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {

    async function loadCheckout() {

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const email = session.user.email

      setUserEmail(email)

      // FETCH CART ITEMS

      const { data: cartItems } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_email", email)

      const productIds =
        cartItems?.map(item => item.product_id) || []

      let products = []

      if (productIds.length > 0) {

        const { data } = await supabase
          .from("products")
          .select("*")
          .in("id", productIds)

        products = data || []
      }

      const mergedCart = (cartItems || []).map(item => ({

        ...item,

        product: products.find(
          p => p.id === item.product_id
        ),
      }))

      setCart(mergedCart)

      setLoading(false)
    }

    loadCheckout()

  }, [router])

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

  async function handleCheckout() {

    if (!customerName || !phone) {
      alert("Please fill all details")
      return
    }

    // CREATE ORDER

    const { data: order, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name: customerName,
          phone,
          email: userEmail,
          total_amount: total,
          status: "created",
        },
      ])
      .select()
      .single()

    if (error) {
      console.log(error)
      alert(error.message)
      return
    }

    // CREATE ORDER ITEMS

    const orderItems = cart.map(item => ({
  order_id: order.id,
  product_id: item.product_id,
  product_name: item.product?.name,
  quantity: item.quantity,
  size: item.size,
  item_price: item.product?.price,
}))

    const { error: orderItemsError } = await supabase
      .from("order_items")
      .insert(orderItems)

    if (orderItemsError) {
      console.log(orderItemsError)
      alert(orderItemsError.message)
      return
    }

    // CLEAR CART

    await supabase
      .from("cart_items")
      .delete()
      .eq("user_email", userEmail)

    // GO TO PAYMENT

    router.push(`/payment?order_id=${order.id}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center mb-6">

          <h1 className="text-3xl font-bold">
            Checkout
          </h1>

          <Link href="/cart">

            <button className="border px-4 py-2 rounded-xl bg-white">
              Back to Cart
            </button>

          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">

          {/* LEFT */}

          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-xl font-bold mb-4">
              Customer Details
            </h2>

            <input
              placeholder="Full Name"
              value={customerName}
              onChange={(e) =>
                setCustomerName(e.target.value)
              }
              className="w-full border p-3 rounded-xl mb-4"
            />

            <input
              placeholder="Phone Number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value)
              }
              className="w-full border p-3 rounded-xl"
            />

          </div>

          {/* RIGHT */}

          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-xl font-bold mb-4">
              Order Summary
            </h2>

            <div className="space-y-4">

              {cart.map((item) => (

                <div
                  key={item.id}
                  className="flex justify-between"
                >

                  <div>

                    <p className="font-semibold">
                      {item.product?.name}
                    </p>

                    <p className="text-sm text-gray-500">
                      {item.size} × {item.quantity}
                    </p>

                  </div>

                  <p className="font-semibold">
                    ₹
                    {Number(item.product?.price || 0) *
                      Number(item.quantity)}
                  </p>

                </div>
              ))}
            </div>

            <div className="border-t mt-6 pt-6 flex justify-between text-2xl font-bold">

              <span>Total</span>

              <span>₹{total}</span>

            </div>

            <button
              onClick={handleCheckout}
              className="w-full mt-6 bg-black text-white py-4 rounded-2xl text-lg font-semibold"
            >
              Continue to Payment
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}