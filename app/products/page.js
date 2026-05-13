import { supabase } from "@/lib/supabase"
import Navbar from "@/components/Navbar"

export default async function ProductsPage() {
  const { data: products } = await supabase
    .from("products")
    .select("*")

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-3xl font-semibold mb-6">Products</h1>

        <div className="grid md:grid-cols-3 gap-6">
          {products?.map((p) => (
            <a key={p.id} href={`/product/${p.id}`}>
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition">
                <img
                  src={p.image_url}
                  className="w-full h-60 object-cover"
                />

                <div className="p-4">
                  <h3 className="font-medium">{p.name}</h3>
                  <p className="text-gray-600 mt-1">₹{p.price}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}