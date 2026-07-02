export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { email, name, products, total, transactionId } = req.body;

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
          <p>Tu pago fue aprobado. Aquí están tus archivos de descarga:</p>
          ${(products||[]).map(p => `
            <div style="background:#F1EFE8;padding:12px 16px;border-radius:4px;margin:10px 0;">
              <strong>${p.name}</strong><br>
              <a href="${p.link}" style="color:#2C2C2A;">Descargar archivo →</a>
            </div>
          `).join('')}
          <p style="margin-top:24px;color:#888780;font-size:13px;">
            ID de transacción: ${transactionId}<br>
            Total pagado: $${total}<br><br>
            Si tienes algún problema escríbenos a ${process.env.RESEND_FROM}
          </p>
        </div>
      `,
    }),
  });

  return res.status(200).json({ ok: true });
}
