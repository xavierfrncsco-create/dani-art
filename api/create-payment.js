export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
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
          amount: Math.round(amount * 100),
          amountWithoutTax: Math.round(amount * 100),
          tax: 0,
          service: 0,
          tip: 0,
          currency: 'USD',
          storeId: process.env.PAYPHONE_STORE_ID,
          clientTransactionId: clientTransactionId,
          reference: 'Compra en Dani Art',
          responseUrl: `${process.env.SITE_URL}/confirmacion`,
          cancellationUrl: `${process.env.SITE_URL}`,
          email: email,
          optionalParameter: JSON.stringify({ email, name, products }),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.log('ERROR PAYPHONE:', JSON.stringify(data));
      return res.status(500).json({ error: 'Error Payphone', detail: data });
    }

    return res.status(200).json({ payphoneUrl: data.payWithCard || data.payWithPayPhone });

  } catch (error) {
    return res.status(500).json({ error: 'Error interno', detail: error.message });
  }
}
