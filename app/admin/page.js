"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function AdminPage() {

  const router = useRouter()

  const [loading, setLoading] = useState(true)

  const [orders, setOrders] = useState([])

  const [searchPhone, setSearchPhone] = useState("")

  useEffect(() => {

    async function checkAdmin() {

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      const email = session.user.email

      // ALLOWED ADMINS

      const allowedAdmins = [
        "mart@iimtrichy.ac.in",
      ]

      if (!allowedAdmins.includes(email)) {

        alert("Access denied")

        router.push("/products")

        return
      }

      loadOrders()

      setLoading(false)
    }

    async function loadOrders() {

      const { data, error } = await supabase
  .from("orders")
  .select(`
    *,
    order_items (
      *,
      products (
        name,
        image_url
      )
    )
  `)
  .order("timestamp", { ascending: false })

      if (error) {
        console.log(error)
        return
      }

      setOrders(data || [])
    }

    checkAdmin()

  }, [router])

  

  function exportCSV() {

    const headers = [
      "Customer Name",
      "Phone",
      "Email",
      "Total Amount",
      "Status",
      "Created At",
    ]

    const rows = filteredOrders.map(order => [
      order.customer_name,
      order.phone,
      order.email,
      order.total_amount,
      order.status,
      order.created_at,
    ])

    const csvContent =
      [
        headers.join(","),
        ...rows.map(row => row.join(",")),
      ].join("\n")

    const blob = new Blob(
      [csvContent],
      { type: "text/csv;charset=utf-8;" }
    )

    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")

    link.href = url

    link.setAttribute(
      "download",
      "orders.csv"
    )

    document.body.appendChild(link)

    link.click()

    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    )
  }

  const filteredOrders = orders.filter(order =>
    order.phone?.includes(searchPhone)
  )

  const totalRevenue = filteredOrders.reduce(
    (sum, order) =>
      sum + Number(order.total_amount || 0),
    0
  )

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between items-center mb-8">

          <div>

            <h1 className="text-4xl font-bold">
              Admin Dashboard
            </h1>

            <p className="text-gray-500 mt-2">
              Manage all customer orders
            </p>

          </div>

          <button
            onClick={exportCSV}
            className="bg-black text-white px-5 py-3 rounded-xl"
          >
            Export CSV
          </button>

        </div>

        {/* METRICS */}

        <div className="grid md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500 mb-2">
              Total Orders
            </p>

            <h2 className="text-4xl font-bold">
              {filteredOrders.length}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500 mb-2">
              Revenue
            </p>

            <h2 className="text-4xl font-bold">
              ₹{totalRevenue}
            </h2>

          </div>

          <div className="bg-white rounded-2xl shadow p-6">

            <p className="text-gray-500 mb-2">
              Confirmed Orders
            </p>

            <h2 className="text-4xl font-bold">

              {
                filteredOrders.filter(
                  o => o.status === "confirmed"
                ).length
              }

            </h2>

          </div>

        </div>

        {/* SEARCH */}

        <div className="bg-white rounded-2xl shadow p-6 mb-8">

          <input
            placeholder="Search by phone number"
            value={searchPhone}
            onChange={(e) =>
              setSearchPhone(e.target.value)
            }
            className="w-full border p-3 rounded-xl"
          />

        </div>

        {/* ORDERS */}

        <div className="space-y-6">

          {filteredOrders.map((order) => (

            <div
              key={order.id}
              className="bg-white rounded-2xl shadow p-6"
            >

              <div className="grid md:grid-cols-4 gap-6">

                <div>

                  <p className="text-gray-500 text-sm">
                    Customer
                  </p>

                  <p className="font-bold">
                    {order.customer_name}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500 text-sm">
                    Phone
                  </p>

                  <p className="font-bold">
                    {order.phone}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500 text-sm">
                    Email
                  </p>

                  <p className="font-bold break-all">
                    {order.email}
                  </p>

                </div>

                <div>

                  <p className="text-gray-500 text-sm">
                    Total
                  </p>

                  <p className="font-bold text-xl">
                    ₹{order.total_amount}
                  </p>

                </div>

              </div>

              <div className="flex flex-wrap items-center justify-between mt-6 gap-4">

                <div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      order.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : order.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {order.status}
                  </span>

                </div>

              </div>
<div className="mt-6 border-t pt-4">

  <h3 className="font-semibold mb-3">
    Ordered Items
  </h3>

  <div className="space-y-3">

    {(order.order_items || []).map((item) => (

      <div
        key={item.id}
        className="flex gap-3 items-center border rounded-xl p-3"
      >

        <img
          src={item.products?.image_url}
          className="w-14 h-14 rounded-lg object-cover"
        />

        <div className="flex-1">

          <p className="font-medium">
            {item.product_name ||
             item.products?.name}
          </p>

          <p className="text-sm text-gray-500">

            Size: {item.size}
            {" • "}
            Qty: {item.quantity}

          </p>

        </div>

      </div>
    ))}

  </div>

</div>

{order.payments && (

  <a
    href={order.payments}
    target="_blank"
    className="inline-block mt-4 bg-black text-white px-4 py-2 rounded-xl"
  >
    View Payment Proof
  </a>

)}
              <div className="mt-4 text-sm text-gray-500">

                Ordered on{" "}
                {new Date(order.created_at)
                  .toLocaleString()}

              </div>

            </div>
          ))}

        </div>
      </div>
    </div>
  )
}