import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const resend = new Resend(import.meta.env.RESEND_API_KEY);

const RECIPIENTS = [
  'info@blastingjack.com',
  'kevinf@blastingjack.com',
  'jacobs@blastingjack.com',
  'kfitzgeraldblastingjackend@gmail.com',
];

export const POST: APIRoute = async ({ request }) => {
  let body: { name?: string; email?: string; phone?: string; message?: string };

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { name, email, phone, message } = body;

  if (!name || !email || !message) {
    return new Response(
      JSON.stringify({ error: 'Name, email, and message are required.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; color: #333;">
      <h2 style="color: #6B2813; border-bottom: 2px solid #6B2813; padding-bottom: 8px;">
        New Project Enquiry — Blasting Jack
      </h2>
      <table style="width:100%; border-collapse: collapse; margin-top: 16px;">
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; background: #f5f5f5; width: 130px;">Name</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; background: #f5f5f5;">Email</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${email}</td>
        </tr>
        ${phone ? `
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; background: #f5f5f5;">Phone</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${phone}</td>
        </tr>` : ''}
        <tr>
          <td style="padding: 8px 12px; font-weight: 600; background: #f5f5f5; vertical-align: top;">Message</td>
          <td style="padding: 8px 12px;">${message.replace(/\n/g, '<br/>')}</td>
        </tr>
      </table>
      <p style="margin-top: 24px; font-size: 12px; color: #999;">
        Submitted via blastingjack.com contact form
      </p>
    </div>
  `;

  const text = `New Project Enquiry — Blasting Jack\n\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}\n\nMessage:\n${message}`;

  const { data, error } = await resend.emails.send({
    from: 'Blasting Jack Website <no-reply@blastingjack.com>',
    to: RECIPIENTS,
    replyTo: email,
    subject: `New Enquiry from ${name} — Blasting Jack`,
    html,
    text,
  });

  if (error) {
    console.error('Resend error:', error);
    return new Response(JSON.stringify({ error: 'Failed to send message. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true, id: data?.id }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
