"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { addToCart } from "@/lib/cart"
import Navbar from "@/components/Navbar"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function ProductPage() {
  const params = useParams()

  const [product, setProduct] = useState(null)
  const [size, setSize] = useState("M")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    async function fetchProduct() {
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single()

      setProduct(data)
    }

    if (params?.id) fetchProduct()
  }, [params.id])

  if (!product) return <div className="p-6">Loading...</div>

  function handleAddToCart() {
    async function addToCart() {

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    router.push("/login")
    return
  }

  const email = user.email

  // CHECK EXISTING ITEM

  const { data: existing } = await supabase
    .from("cart_items")
    .select("*")
    .eq("user_email", email)
    .eq("product_id", product.id)
    .eq("size", selectedSize)
    .single()

  if (existing) {

    await supabase
      .from("cart_items")
      .update({
        quantity: existing.quantity + quantity,
      })
      .eq("id", existing.id)

  } else {

    await supabase
      .from("cart_items")
      .insert([
        {
          user_email: email,
          product_id: product.id,
          quantity,
          size: selectedSize,
        },
      ])
  }

  alert("Added to cart")
}

    alert("Added to cart")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-6">
        <div className="max-w-xl mx-auto bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-semibold mb-4">
            {product.name}
          </h1>

          <img
            src={product.image_url}
            className="rounded-lg mb-4"
          />

          <p className="text-lg font-medium mb-4">
            ₹{product.price}
          </p>

          <div className="space-y-3">
            <select
              onChange={(e) => setSize(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option>S</option>
              <option>M</option>
              <option>L</option>
            </select>

            <input
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Number(e.target.value))
              }
              className="border p-2 w-full rounded"
            />

            <button
              onClick={handleAddToCart}
              className="bg-black text-white w-full py-2 rounded"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}