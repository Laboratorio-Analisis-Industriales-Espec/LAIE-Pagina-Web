import type { APIRoute } from 'astro';

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Las rutas /api/* son serverless functions, no páginas estáticas.
export const prerender = false;

// POST /api/reserva — recibe solicitudes de reserva de espacio/equipo.
// Mismo esquema que /api/contacto: valida, loguea y (opcionalmente) reenvía por Resend.
export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: 'JSON inválido.' }, { status: 400 });
  }

  const nombre = (body.nombre ?? '').trim();
  const correo = (body.correo ?? '').trim();
  const recurso = (body.recurso ?? '').trim();
  const fecha = (body.fecha ?? '').trim();
  const motivo = (body.motivo ?? '').trim();

  if (!nombre || !correo || !recurso || !fecha || !motivo) {
    return Response.json({ ok: false, error: 'Todos los campos son obligatorios.' }, { status: 400 });
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
        subject: `Reserva: ${recurso} — ${nombre}`,
        text: `De: ${nombre} <${correo}>\nRecurso: ${recurso}\nFecha: ${fecha}\nMotivo: ${motivo}`,
      }),
    });
    if (!res.ok) {
      console.error('Resend error:', await res.text());
      return Response.json({ ok: false, error: 'No se pudo enviar la solicitud.' }, { status: 502 });
    }
  } else {
    console.log('[reserva]', { nombre, correo, recurso, fecha, motivo });
  }

  return Response.json({
    ok: true,
    message: `Gracias, ${nombre.split(' ')[0]}. Solicitud de ${recurso} recibida.`,
  });
};
