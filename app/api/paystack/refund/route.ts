import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();

    // 1. Talk to Paystack to process refund
    const response = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Ensure this is in your .env.local
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: reference, // The Paystack Reference we saved
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || "Refund failed");
    }

    return NextResponse.json({ success: true, message: "Refund processed" });

  } catch (error: any) {
    console.error("Refund Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}