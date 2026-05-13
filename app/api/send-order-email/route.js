import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {

  try {

    const body = await req.json()

    const {
      customerName,
      customerEmail,
      orderId,
      totalAmount,
    } = body

    // EMAIL TO CUSTOMER

    await resend.emails.send({

      from: "Merch Store <onboarding@resend.dev>",

      to: customerEmail,

      subject: "Order Received Successfully",

      html: `
        <h2>Thank you for your order!</h2>

        <p>Hello ${customerName},</p>

        <p>
          Your payment submission has been received successfully.
        </p>

        <p>
          <strong>Order ID:</strong> ${orderId}
        </p>

        <p>
          <strong>Total:</strong> ₹${totalAmount}
        </p>

        <p>
          We will verify your payment and process your order shortly.
        </p>
      `,
    })

    // EMAIL TO ADMIN

    await resend.emails.send({

      from: "Merch Store <onboarding@resend.dev>",

      to: "mart@iimtrichy.ac.in",

      subject: "New Merch Order Received",

      html: `
        <h2>New Order Received</h2>

        <p>
          <strong>Customer:</strong> ${customerName}
        </p>

        <p>
          <strong>Email:</strong> ${customerEmail}
        </p>

        <p>
          <strong>Order ID:</strong> ${orderId}
        </p>

        <p>
          <strong>Total:</strong> ₹${totalAmount}
        </p>
      `,
    })

    return Response.json({
      success: true,
    })

  } catch (error) {

    console.log(error)

    return Response.json({
      success: false,
      error,
    })
  }
}