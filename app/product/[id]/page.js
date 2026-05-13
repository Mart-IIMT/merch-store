"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

export default function ProductPage() {

  const params = useParams()
  const router = useRouter()

  const [product, setProduct] = useState(null)

  const [selectedSize, setSelectedSize] = useState("M")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {

    async function fetchProduct() {

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", params.id)
        .single()

      console.log(data)
      console.log(error)

      setProduct(data)
    }

    fetchProduct()

  }, [params.id])

  async function addToCart() {

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    if (!product) {
      alert("Product not loaded")
      return
    }

    const email = user.email

    const payload = {
      user_email: email,
      product_id: product.id,
      quantity: quantity,
      size: selectedSize,
    }

    console.log(payload)

    const { error } = await supabase
      .from("cart_items")
      .insert([payload])

    console.log(error)

    if (error) {
  console.log(error)
  alert(error.message)
  return
}

    alert("Added to cart")

    router.push("/cart")
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-5xl mx-auto">

        <Link href="/products">

          <button className="mb-6 border px-4 py-2 rounded-xl bg-white">
            ← Back to Products
          </button>

        </Link>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow p-6">

          <img
            src={product.image_url}
            alt={product.name}
            className="w-full rounded-2xl"
          />

          <div>

            <h1 className="text-4xl font-bold mb-4">
              {product.name}
            </h1>

            <p className="text-gray-600 mb-6">
              {product.description}
            </p>

            <p className="text-3xl font-bold mb-6">
              ₹{product.price}
            </p>

            <div className="mb-6">

              <p className="font-semibold mb-2">
                Size
              </p>

              <div className="flex gap-3">

                {["S", "M", "L", "XL"].map((size) => (

                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-xl border ${
                      selectedSize === size
                        ? "bg-black text-white"
                        : "bg-white"
                    }`}
                  >
                    {size}
                  </button>

                ))}
              </div>
            </div>

            <div className="mb-6">

              <p className="font-semibold mb-2">
                Quantity
              </p>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(Number(e.target.value))
                }
                className="border p-2 rounded-xl w-24"
              />

            </div>

            <button
              onClick={addToCart}
              className="w-full bg-black text-white py-4 rounded-2xl text-lg font-semibold"
            >
              Add to Cart
            </button>

          </div>
        </div>
      </div>
    </div>
  )
}