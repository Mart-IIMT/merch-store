"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"

export default function ProductsPage() {

  const router = useRouter()

  const [products, setProducts] = useState([])

  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function checkUserAndFetch() {

      const {
        data: { user },
      } = await supabase.auth.getUser()

      // NOT LOGGED IN

      if (!user) {

        router.push("/login")

        return
      }

      // DOMAIN RESTRICTION

      if (
        !user.email.endsWith(
          "@iimtrichy.ac.in"
        )
      ) {

        alert(
          "Only IIM Trichy email IDs are allowed"
        )

        await supabase.auth.signOut()

        router.push("/login")

        return
      }

      // FETCH PRODUCTS

      const { data, error } =
        await supabase
          .from("products")
          .select("*")

      if (error) {

        console.log(error)

        setLoading(false)

        return
      }

      setProducts(data || [])

      setLoading(false)
    }

    checkUserAndFetch()

  }, [router])

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center">

        Loading...

      </div>

    )
  }

  return (

    <div className="min-h-screen bg-gray-50">

      <Navbar />

      <div className="p-6 max-w-6xl mx-auto">

        <h1 className="text-3xl font-semibold mb-6">

          Products

        </h1>

        <div className="grid md:grid-cols-3 gap-6">

          {products.map((p) => (

            <Link
              key={p.id}
              href={`/product/${p.id}`}
            >

              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition cursor-pointer">

                <img
                  src={p.image_url}
                  className="w-full h-60 object-cover"
                />

                <div className="p-4">

                  <h3 className="font-medium">

                    {p.name}

                  </h3>

                  <p className="text-gray-600 mt-1">

                    ₹{p.price}

                  </p>

                </div>

              </div>

            </Link>

          ))}

        </div>

      </div>

    </div>
  )
}