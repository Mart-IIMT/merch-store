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

      if (error) {
        console.log(error)
        return
      }

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

    // CHECK IF ITEM ALREADY EXISTS

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_email", email)
      .eq("product_id", product.id)
      .eq("size", selectedSize)
      .maybeSingle()

    if (existing) {

      const { error } = await supabase
        .from("cart_items")
        .update({
          quantity: existing.quantity + quantity,
        })
        .eq("id", existing.id)

      if (error) {
        console.log(error)
        alert(error.message)
        return
      }

    } else {

      const { error } = await supabase
        .from("cart_items")
        .insert([
          {
            user_email: email,
            product_id: product.id,
            quantity,
            size: selectedSize,
          },
        ])

      if (error) {
        console.log(error)
        alert(error.message)
        return
      }
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

        <div className="flex justify-between items-center mb-6">

          <Link href="/products">

            <button className="border px-4 py-2 rounded-xl bg-white">
              ← Back to Products
            </button>

          </Link>

          <Link href="/cart">

            <button className="border px-4 py-2 rounded-xl bg-white">
              View Cart
            </button>

          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-8 bg-white rounded-2xl shadow p-6">

          {/* IMAGE */}

          <div>

            <img
              src={product.image_url}
              alt={product.name}
              className="w-full rounded-2xl object-cover"
            />

          </div>

          {/* DETAILS */}

          <div>

            <h1 className="text-4xl font-bold mb-4">
              {product.name}
            </h1>

            <p className="text-gray-600 mb-6">
              {product.description}
            </p>

            <p className="text-3xl font-bold mb-8">
              ₹{product.price}
            </p>

            {/* SIZE */}

            <div className="mb-6">

              <p className="font-semibold mb-3">
                Select Size
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

            {/* QUANTITY */}

            <div className="mb-8">

              <p className="font-semibold mb-3">
                Quantity
              </p>

              <div className="flex items-center gap-4">

                <button
                  onClick={() =>
                    setQuantity(Math.max(1, quantity - 1))
                  }
                  className="border px-4 py-2 rounded-xl bg-white"
                >
                  -
                </button>

                <span className="text-xl font-bold">
                  {quantity}
                </span>

                <button
                  onClick={() =>
                    setQuantity(quantity + 1)
                  }
                  className="border px-4 py-2 rounded-xl bg-white"
                >
                  +
                </button>

              </div>
            </div>

            {/* ACTIONS */}

            <div className="flex gap-4">

              <button
                onClick={addToCart}
                className="flex-1 bg-black text-white py-4 rounded-2xl text-lg font-semibold"
              >
                Add to Cart
              </button>

              <button
  onClick={async () => {

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const email = user.email

    // CHECK IF ITEM EXISTS

    const { data: existing } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_email", email)
      .eq("product_id", product.id)
      .eq("size", selectedSize)
      .maybeSingle()

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

    router.push("/checkout")

  }}
  className="flex-1 border py-4 rounded-2xl text-lg font-semibold bg-white"
>
  Checkout
</button>

            </div>

          </div>
        </div>
      </div>
    </div>
  )
}