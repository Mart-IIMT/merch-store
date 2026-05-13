"use client"

import { supabase } from "@/lib/supabase"

export default function LoginPage() {

  async function signInWithGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: "https://merch-store-six.vercel.app/products"
      }
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-2xl shadow-xl w-[350px]">

        <h1 className="text-3xl font-bold mb-2 text-center">
          Welcome
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Continue with Google
        </p>

        <button
          onClick={signInWithGoogle}
          className="w-full bg-black text-white py-3 rounded-xl"
        >
          Sign in with Google
        </button>

      </div>
    </div>
  )
}