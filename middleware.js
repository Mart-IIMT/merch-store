import { NextResponse } from "next/server"

export default function middleware(req) {

  const path = req.nextUrl.pathname

  // PUBLIC ROUTES

  const publicRoutes = [

    "/login",
    "/auth",

    "/_next",
    "/favicon.ico",

  ]

  const isPublic =
    publicRoutes.some(route =>
      path.startsWith(route)
    )

  // ALLOW PUBLIC ROUTES

  if (isPublic) {

    return NextResponse.next()
  }

  // PROTECTED ROUTES

  const protectedRoutes = [

    "/products",
    "/cart",
    "/checkout",
    "/orders",
    "/payment",
    "/admin",

  ]

  const isProtected =
    protectedRoutes.some(route =>
      path.startsWith(route)
    )

  if (!isProtected) {

    return NextResponse.next()
  }

  // CHECK TOKEN

  const token =
    req.cookies.get(
      "sb-access-token"
    )?.value

  // NOT LOGGED IN

  if (!token) {

    return NextResponse.redirect(
      new URL("/login", req.url)
    )
  }

  return NextResponse.next()
}

export const config = {

  matcher: [

    "/products/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/payment/:path*",
    "/admin/:path*",

  ],
}