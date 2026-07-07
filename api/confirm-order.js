export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { id, clientTransactionId } = req.body;

  try {
    // Confirma el pago con Payphone
    const confirmRes = await fetch(
      'https://pay.payphonetodoesposible.com/api/button/V2/Confirm',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYPHONE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: id,
          clientTransactionId: clientTransactionId,
        }),
      }
    );

    const rawText = await confirmRes.text();
    console.log('CONFIRM RESPONSE:', rawText.substring(0, 500));

    let confirmData;
    try {
      confirmData = JSON.parse(rawText);
    } catch(e) {
      return res.status(500).json({ ok: false, error: 'Respuesta inválida de Payphone', raw: rawText.substring(0, 200) });
    }

    // statusCode 3 = pago aprobado
    if (confirmData.statusCode !== 3) {
      return res.status(200).json({ ok: false, status: confirmData.statusCode });
    }

    // Envía el correo con Resend
    const { email, name, products, total } = req.body;

    if (email && products) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM,
          to: email,
          subject: '¡Tu compra en Dani Art está lista! 🎉',
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#2C2C2A;">
              <h2 style="font-weight:300;">¡Gracias por tu compra, ${name}!</h2>
              <p>Tu pago fue aprobado. Aquí están tus archivos:</p>
              ${(products||[]).map(p => `
                <div style="background:#F1EFE8;padding:12px 16px;border-radius:4px;margin:10px 0;">
                  <strong>${p.name}</strong><br>
                  <a href="${p.link}" style="color:#2C2C2A;">Descargar archivo →</a>
                </div>
              `).join('')}
              <p style="margin-top:24px;color:#888780;font-size:13px;">
                Total pagado: $${total}<br>
                ID de transacción: ${id}<br><br>
                ¿Problemas? Escríbenos a ${process.env.RESEND_FROM}
              </p>
            </div>
          `,
        }),
      });
    }

    return res.status(200).json({ ok: true, authorizationCode: confirmData.authorizationCode });

  } catch(error) {
    return res.status(500).json({ ok: false, error: error.message });
  }
}
