"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"

export default function CheckoutPage() {

  const router = useRouter()

  const [cart, setCart] = useState([])

  const [loading, setLoading] = useState(true)

  const [customerName, setCustomerName] =
    useState("")
const [phone, setPhone] =
  useState("")
  const [rollNo, setRollNo] =
  useState("")

const [batch, setBatch] =
  useState("")

const [comments, setComments] =
  useState("")

  useEffect(() => {

    fetchCart()

  }, [])

  async function fetchCart() {

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {

      router.push("/login")

      return
    }

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        *,
        products (*)
      `)
      .eq("user_email", user.email)

    if (error) {

      console.log(error)

      setLoading(false)

      return
    }

    const formatted = (data || []).map(item => ({

      ...item,

      product: item.products,

    }))

    setCart(formatted)

    setLoading(false)
  }

  const total = cart.reduce(

    (sum, item) =>

      sum +
      (
        Number(item.product?.price || 0)
        * item.quantity
      ),

    0
  )

  async function placeOrder() {

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {

      alert("Please login")

      return
    }

    if (
      !customerName ||
      !phone
    ) {

      alert("Please fill all details")

      return
    }

    // CREATE ORDER

    const { data: order, error: orderError } =
      await supabase
        .from("orders")
        .insert([
          {
            customer_name: customerName,
            phone,
            email: user.email,
            total_amount: total,
            status: "created",
          },
        ])
        .select()
        .single()

    if (orderError) {

      console.log(orderError)

      alert(orderError.message)

      return
    }

    // CREATE ORDER ITEMS

    const orderItems = cart.map(item => ({

      order_id: order.id,

      product_id: item.product_id,

      product_name: item.product?.name,

      quantity: item.quantity,

      size: item.size,

      custom_name: item.custom_name,

      item_price: item.product?.price,

    }))

    const { error: itemError } =
      await supabase
        .from("order_items")
        .insert(orderItems)

    if (itemError) {

      console.log(itemError)

      alert(itemError.message)

      return
    }

    // CLEAR CART

    await supabase
      .from("cart_items")
      .delete()
      .eq("user_email", user.email)

    // REDIRECT

    router.push(`/payment?order_id=${order.id}`)
  }

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        Loading...

      </div>

    )
  }

  return (

    <div className="min-h-screen bg-gray-100">

      <Navbar />

      <div className="max-w-6xl mx-auto p-6">

        <h1 className="text-4xl font-bold mb-8">

          Checkout

        </h1>

        <div className="grid md:grid-cols-2 gap-8">

          {/* LEFT */}

          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-2xl font-semibold mb-6">

              Customer Details

            </h2>

            <div className="space-y-4">

              <input
                type="text"
                placeholder="Full Name"
                value={customerName}
                onChange={(e) =>
                  setCustomerName(e.target.value)
                }
                className="w-full border p-3 rounded-xl"
              />

              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
                className="w-full border p-3 rounded-xl"
              />

            </div>

          </div>

          {/* RIGHT */}

          <div className="bg-white rounded-2xl shadow p-6">

            <h2 className="text-2xl font-semibold mb-6">

              Order Summary

            </h2>

            <div className="space-y-4">

              {cart.map((item) => (

                <div
                  key={item.id}
                  className="flex gap-4 border rounded-xl p-4"
                >

                  <img
                    src={item.product?.image_url}
                    alt={item.product?.name}
                    className="w-20 h-20 object-cover rounded-xl"
                  />

                  <div className="flex-1">

                    <h3 className="font-semibold">

                      {item.product?.name}

                    </h3>

                    <p className="text-gray-500 text-sm">

                      Size: {item.size}

                    </p>

                    {item.custom_name && (

                      <p className="text-gray-500 text-sm">

                        Custom Name:
                        {" "}
                        {item.custom_name}

                      </p>

                    )}

                    <p className="text-gray-500 text-sm">

                      Qty: {item.quantity}

                    </p>

                    <p className="font-bold mt-2">

                      ₹
                      {
                        Number(item.product?.price || 0)
                        * item.quantity
                      }

                    </p>

                  </div>

                </div>

              ))}

            </div>

            <div className="border-t mt-6 pt-6">

              <div className="flex justify-between items-center">

                <h2 className="text-2xl font-bold">

                  Total

                </h2>

                <h2 className="text-3xl font-bold">

                  ₹{total}

                </h2>

              </div>

              <button
                onClick={placeOrder}
                className="w-full mt-6 bg-black text-white py-4 rounded-2xl text-lg font-semibold"
              >

                Proceed to Payment

              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}