"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default function CallbackPage() {

  const router = useRouter()

  useEffect(() => {

    async function checkUser() {

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const email = user.email || ""

      // ALLOWED DOMAIN
      if (!email.endsWith("@iimtrichy.ac.in")) {

        await supabase.auth.signOut()

        alert("Only IIM Trichy email IDs are allowed.")

        router.push("/login")

        return
      }

      router.push("/products")
    }

    checkUser()

  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      Verifying access...
    </div>
  )
}