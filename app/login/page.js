"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {

  const router = useRouter()

  useEffect(() => {

    async function checkUser() {

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session?.user) {

        const email = session.user.email

        // DOMAIN RESTRICTION

        if (
          !email.endsWith("@iimtrichy.ac.in")
        ) {

          alert(
            "Only IIM Trichy email IDs are allowed"
          )

          await supabase.auth.signOut()

          return
        }

        router.push("/products")
      }
    }

    checkUser()

  }, [router])

  async function loginWithGoogle() {

    await supabase.auth.signInWithOAuth({

      provider: "google",

    })
  }

  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="bg-white p-10 rounded-2xl shadow max-w-md w-full text-center">

        <h1 className="text-4xl font-bold mb-4">

          IIM Trichy Merch Store

        </h1>

        <p className="text-gray-500 mb-8">

          Sign in using your
          {" "}
          @iimtrichy.ac.in
          {" "}
          email ID

        </p>

        <button
          onClick={loginWithGoogle}
          className="w-full bg-black text-white py-4 rounded-2xl text-lg font-semibold"
        >

          Continue with Google

        </button>

      </div>

    </div>
  )
}