export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const { amount, email, name, products, clientTransactionId } = req.body;

    const payphoneBody = {
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
    };

    console.log('TOKEN EXISTE:', !!process.env.PAYPHONE_TOKEN);
    console.log('STORE ID:', process.env.PAYPHONE_STORE_ID);
    console.log('SITE URL:', process.env.SITE_URL);
    console.log('BODY ENVIADO:', JSON.stringify(payphoneBody));

    const response = await fetch(
      'https://pay.payphonetodoesposible.com/api/button/Prepare',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYPHONE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payphoneBody),
      }
    );

    const rawText = await response.text();
    console.log('RESPUESTA CRUDA PAYPHONE:', rawText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(rawText);
    } catch (e) {
      return res.status(500).json({ error: 'Payphone no devolvió JSON', raw: rawText.substring(0, 300) });
    }

    if (!response.ok) {
      return res.status(500).json({ error: 'Error Payphone', detail: data });
    }

    return res.status(200).json({ payphoneUrl: data.payWithCard || data.payWithPayPhone });

  } catch (error) {
    return res.status(500).json({ error: 'Error interno', detail: error.message });
  }
}
