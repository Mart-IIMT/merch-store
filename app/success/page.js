"use client"

import { Suspense } from "react"
import SuccessContent from "./SuccessContent"

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}