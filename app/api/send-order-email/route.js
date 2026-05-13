import { Resend } from "resend"

const resend = new Resend(
  process.env.RESEND_API_KEY
)

export async function POST(req) {

  try {

    const body = await req.json()

    const {
      customerName,
      customerEmail,
      orderId,
      totalAmount,
    } = body

    const response =
      await resend.emails.send({

        from: "onboarding@resend.dev",

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

    console.log(response)

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