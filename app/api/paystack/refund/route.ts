import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();

    if (!process.env.PAYSTACK_SECRET_KEY) {
      throw new Error("Missing Paystack Secret Key in Server");
    }

    const response = await fetch('https://api.paystack.co/refund', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ transaction: reference }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || "Refund failed from Paystack");
    }

    return NextResponse.json({ success: true, message: "Refund processed" });

  } catch (error: any) {
    console.error("Refund Logic Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}