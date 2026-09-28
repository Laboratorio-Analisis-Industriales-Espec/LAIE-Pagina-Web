import type { APIRoute } from 'astro';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Las rutas /api/* son serverless functions, no páginas estáticas.
export const prerender = false;

// POST /api/contacto — recibe el formulario de contacto.
// Sin RESEND_API_KEY solo valida y registra en logs (modo demo).
// Con RESEND_API_KEY + CONTACT_EMAIL definidos, reenvía el mensaje por correo.
export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const nombre = (body.nombre ?? '').trim();
  const correo = (body.correo ?? '').trim();
  const mensaje = (body.mensaje ?? '').trim();

  if (!nombre || !correo || !mensaje) {
    return Response.json({ ok: false, error: 'Nombre, correo y mensaje son obligatorios.' }, { status: 400 });
  }
  if (!emailRe.test(correo)) {
    return Response.json({ ok: false, error: 'Correo inválido.' }, { status: 400 });
  }

  const apiKey = import.meta.env.RESEND_API_KEY;
  const to = import.meta.env.CONTACT_EMAIL;
  if (apiKey && to) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Laboratorio <onboarding@resend.dev>',
        to,
        subject: `Contacto web: ${nombre}`,
        text: `De: ${nombre} <${correo}>\n\n${mensaje}`,
      }),
    });
    if (!res.ok) {
      console.error('Resend error:', await res.text());
      return Response.json({ ok: false, error: 'No se pudo enviar el mensaje.' }, { status: 502 });
    }
  } else {
    console.log('[contacto]', { nombre, correo, mensaje });
  }

  return Response.json({ ok: true, message: `Gracias, ${nombre.split(' ')[0]}. Mensaje recibido.` });
};
