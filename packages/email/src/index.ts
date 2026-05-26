import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const result = await resend.emails.send({
      from: 'ChaiForms <noreply@chaiforms.dev>',
      to,
      subject,
      html,
    });
    return result;
  } catch (error) {
    console.error('Email send failed:', error);
    throw error;
  }
}

// Email templates
export function getWelcomeEmailHtml(name: string): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h1>Welcome to ChaiForms, ${name}!</h1>
        <p>Get started by creating your first form.</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Go to Dashboard</a>
      </body>
    </html>
  `;
}

export function getNewResponseEmailHtml(formTitle: string, responseCount: number): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h1>New Response: ${formTitle}</h1>
        <p>You have received a new response! Total responses: ${responseCount}</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View in Dashboard</a>
      </body>
    </html>
  `;
}
