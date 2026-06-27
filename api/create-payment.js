export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { amount, email, name, products, clientTransactionId } = req.body;
  const response = await fetch(
    'https://pay.payphonetodoesposible.com/api/button/Prepare',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYPHONE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: amount * 100,
        amountWithoutTax: amount * 100,
        amountWithTax: 0,
        tax: 0,
        currency: 'USD',
        clientTransactionId: clientTransactionId,
        storeId: process.env.PAYPHONE_STORE_ID,
        responseUrl: `${process.env.SITE_URL}/confirmacion`,
        cancellationUrl: `${process.env.SITE_URL}`,
        reference: JSON.stringify({ email, name, products }),
      }),
    }
  );
  const data = await response.json();
  if (!response.ok) return res.status(500).json({ error: 'Error Payphone', detail: data });
  return res.status(200).json({ payphoneUrl: data.payWithPayPhone });
}
