"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"

export default function PaymentPage() {

  const searchParams = useSearchParams()

  const orderId = searchParams.get("order_id")

  const [amount, setAmount] = useState(0)

  const [orderData, setOrderData] = useState(null)

  const [items, setItems] = useState([])

  const [utr, setUtr] = useState("")

  const [file, setFile] = useState(null)

  const [loading, setLoading] = useState(false)

  useEffect(() => {

    async function fetchOrder() {

      if (!orderId) return

      // FETCH ORDER

      const { data: orderData, error: orderError } =
        await supabase
          .from("orders")
          .select("*")
          .eq("id", orderId)
          .single()

      if (orderError) {
        console.log(orderError)
        return
      }

      // FETCH ORDER ITEMS

      const { data: itemsData, error: itemsError } =
        await supabase
          .from("order_items")
          .select("*")
          .eq("order_id", orderId)

      if (itemsError) {
        console.log(itemsError)
        return
      }

      // FETCH PRODUCTS

      const productIds =
        itemsData.map((i) => i.product_id)

      const { data: products } =
        await supabase
          .from("products")
          .select("*")
          .in("id", productIds)

      // MERGE DATA

      const merged = itemsData.map((item) => ({

        ...item,

        product:
          products?.find(
            (p) => p.id === item.product_id
          ),

      }))

      setItems(merged)

      setAmount(
        Number(orderData.total_amount) || 0
      )

      setOrderData(orderData)
    }

    fetchOrder()

  }, [orderId])

  async function submitPayment() {

    if (!utr || !file) {

      alert("Enter UTR and upload screenshot")

      return
    }

    setLoading(true)

    // FILE EXTENSION

    const extension =
      file.name.split(".").pop()

    const fileName =
      `payment-${orderId}-${Date.now()}.${extension}`

    // UPLOAD FILE

    const { error: uploadError } =
      await supabase.storage
        .from("payments")
        .upload(fileName, file)

    if (uploadError) {

      alert(uploadError.message)

      setLoading(false)

      return
    }

    // GET PUBLIC URL

    const { data } =
      supabase.storage
        .from("payments")
        .getPublicUrl(fileName)

    const fileUrl = data.publicUrl

    // UPDATE ORDER

    const { error } =
      await supabase
        .from("orders")
        .update({

  utr: utr,

  screenshot_url: fileUrl,

  payments: fileUrl,

  timestamp: new Date(),

  status: "paid",

})
        .eq("id", orderId)

    if (error) {

      alert(error.message)

      setLoading(false)

      return
    }

    // SEND EMAILS

    await fetch("/api/send-order-email", {

      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({

        customerName:
          orderData?.customer_name || "Customer",

        customerEmail:
          orderData?.email,

        orderId,

        totalAmount: amount,
      }),
    })

    // REDIRECT

    window.location.href =
      `/success?order_id=${orderId}`
  }

  return (

    <div>

      <Navbar />

      <div className="p-6 max-w-xl mx-auto">

        <h1 className="text-2xl font-bold mb-4">
          Complete Payment
        </h1>

        <p className="mb-4">
          Order ID: {orderId}
        </p>

        {/* ORDER SUMMARY */}

        <h3 className="font-semibold mt-4 mb-2">
          Order Summary
        </h3>

        {items.length === 0 && (

          <p className="text-gray-500">
            Loading items...
          </p>

        )}

        {items.map((item, i) => (

          <div
            key={i}
            className="flex gap-3 items-center border p-3 rounded mb-2"
          >

            <img
              src={item.product?.image_url}
              className="w-16 h-16 object-cover rounded"
            />

            <div>

              <p className="font-medium">
                {item.product?.name || "Product"}
              </p>

              <p className="text-sm text-gray-600">

                Size: {item.size} | Qty: {item.quantity}

              </p>

              <p className="text-sm">

                ₹{
                  (Number(item.product?.price) || 0)
                  * item.quantity
                }

              </p>

            </div>

          </div>
        ))}

        <h2 className="text-lg font-semibold mt-3">

          Total: ₹{amount}

        </h2>

        <hr className="my-4" />

        {/* QR */}

        <h3 className="font-semibold">
          Scan & Pay
        </h3>

        <img
          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=yourupi@bank&pn=YourName&am=${amount}`}
          className="my-4"
        />

        <p>
          UPI ID: yourupi@bank
        </p>

        <hr className="my-4" />

        {/* PAYMENT INPUTS */}

        <h3 className="font-semibold">
          Enter Payment Details
        </h3>

        <input
          placeholder="Enter UTR"
          className="border p-2 w-full mt-2"
          onChange={(e) =>
            setUtr(e.target.value)
          }
        />

        <input
          type="file"
          accept="image/*"
          className="mt-3"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

        <button
          onClick={submitPayment}
          disabled={loading}
          className="mt-4 bg-black text-white px-4 py-2 rounded w-full"
        >

          {loading
            ? "Submitting..."
            : "Submit Payment"}

        </button>

      </div>
    </div>
  )
}