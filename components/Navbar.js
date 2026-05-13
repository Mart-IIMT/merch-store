"use client"

import { useEffect, useState } from "react"
import { getCart } from "@/lib/cart"

export default function Navbar() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    setCount(getCart().length)
  }, [])

  return (
    <div className="flex justify-between items-center px-6 py-4 bg-white border-b shadow-sm">
      <a href="/products" className="text-xl font-semibold">
        Merch Store
      </a>

      <div className="flex gap-6 text-sm">
        <a href="/products" className="text-gray-600 hover:text-black">
          Products
        </a>
        <a href="/track" className="text-gray-600 hover:text-black">
          Track
        </a>
        <a href="/cart" className="text-gray-600 hover:text-black">
          Cart ({count})
        </a>
      </div>
    </div>
  )
}