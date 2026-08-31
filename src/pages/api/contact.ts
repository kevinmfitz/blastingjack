import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const RECIPIENTS = [
  'info@blastingjack.com',
  'johns@blastingjack.com',
  'kevinf@blastingjack.com',
  'jacobs@blastingjack.com',
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
        New Project Enquiry - Blasting Jack
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

  const text = `New Project Enquiry - Blasting Jack\n\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}\n\nMessage:\n${message}`;

  // Runs alongside the Resend send below (not sequentially after it) so it
  // adds no latency in the common case. Brand is resolved on the CRM side by
  // WHICH API key this is — never trust a body field for that — so this
  // can't misroute a lead into Endurance Painting's data even by bug.
  // Failure is swallowed: a CRM outage must never break the live contact
  // form. See bd-crm/CLAUDE.md.
  const crmInboundUrl = import.meta.env.CRM_INBOUND_URL;
  const crmInboundApiKey = import.meta.env.CRM_INBOUND_API_KEY;
  const crmWebhookPromise =
    crmInboundUrl && crmInboundApiKey
      ? fetch(crmInboundUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': crmInboundApiKey },
          body: JSON.stringify({ name, email, phone, message }),
          signal: AbortSignal.timeout(3000),
        }).catch((err) => console.error('CRM webhook failed:', err))
      : Promise.resolve();

  try {
    const rawKey = import.meta.env.RESEND_API_KEY || '';
    const apiKey = rawKey.charCodeAt(0) === 0xFEFF ? rawKey.slice(1).trim() : rawKey.trim();
    const resend = new Resend(apiKey);

    const [{ error }] = await Promise.all([
      resend.emails.send({
        from: 'Blasting Jack <noreply@blastingjack.com>',
        to: RECIPIENTS,
        replyTo: email,
        subject: `New Enquiry from ${name} - Blasting Jack`,
        html,
        text,
      }),
      crmWebhookPromise,
    ]);

    if (error) {
      console.error('Resend error:', error);
      return new Response(JSON.stringify({ error: 'Failed to send message. Please try again.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    console.error('Resend exception:', err);
    return new Response(JSON.stringify({ error: 'Failed to send message. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
