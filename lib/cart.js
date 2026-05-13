export function getCart() {
  if (typeof window === "undefined") return []

  const cart = localStorage.getItem("cart")
  return cart ? JSON.parse(cart) : []
}

export function saveCart(cart) {
  localStorage.setItem("cart", JSON.stringify(cart))
}

export function addToCart(item) {
  const cart = getCart()

  const existing = cart.find(
    (i) =>
      i.product_id === item.product_id &&
      i.size === item.size
  )

  if (existing) {
    existing.quantity += item.quantity
  } else {
    cart.push(item)
  }

  saveCart(cart)
}

export function removeFromCart(index) {
  const cart = getCart()
  cart.splice(index, 1)
  saveCart(cart)
}

export function updateQuantity(index, quantity) {
  const cart = getCart()
  cart[index].quantity = quantity
  saveCart(cart)
}

export function clearCart() {
  localStorage.removeItem("cart")
}