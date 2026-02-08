import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { business_name, bank_code, account_number } = await request.json();

    // 1. Send data to Paystack to create a split account
    const response = await fetch('https://api.paystack.co/subaccount', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, // Uses your .env key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        business_name: business_name,
        settlement_bank: bank_code,
        account_number: account_number,
        percentage_charge: 15, // YOU keep 15%, Tutor gets 85%
        description: `TutorHub Payout for ${business_name}`
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || "Paystack failed to create subaccount");
    }

    // 2. Return the Code (e.g., ACCT_xxxx) to the Dashboard
    return NextResponse.json({ subaccount_code: data.data.subaccount_code });

  } catch (error: any) {
    console.error("Paystack Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}