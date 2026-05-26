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

// Email template helpers
export function getWelcomeEmailHtml(name: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ChaiForms! 🎉</h1>
          </div>
          <div class="content">
            <p>Hi ${name},</p>
            <p>Welcome to ChaiForms, the easiest way to create beautiful forms and collect responses.</p>
            <p>Here's what you can do:</p>
            <ul>
              <li>Create unlimited forms</li>
              <li>Customize with themes and branding</li>
              <li>Track responses and analytics in real-time</li>
              <li>Export data and integrate with other tools</li>
            </ul>
            <p>Ready to get started?</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">Create Your First Form</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ChaiForms. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getRespondentEmailHtml({
  formTitle,
  message,
}: {
  formTitle: string;
  message: string;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .message { background: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You! ✓</h1>
          </div>
          <div class="content">
            <h2>${formTitle}</h2>
            <div class="message">
              <p>${message}</p>
            </div>
            <p>We appreciate you taking the time to respond.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ChaiForms. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getCreatorEmailHtml({
  formTitle,
  message,
  responseCount,
}: {
  formTitle: string;
  message: string;
  responseCount: number;
}): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
          .content { background: #f9fafb; padding: 30px; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
          .stat-box { background: white; padding: 20px; border-radius: 6px; display: inline-block; margin: 10px 5px; border: 1px solid #e5e7eb; }
          .stat-number { font-size: 24px; font-weight: bold; color: #f59e0b; }
          .stat-label { font-size: 12px; color: #6b7280; margin-top: 5px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Response Received 📊</h1>
          </div>
          <div class="content">
            <h2>${formTitle}</h2>
            <p>${message}</p>
            <div style="text-align: center;">
              <div class="stat-box">
                <div class="stat-number">${responseCount}</div>
                <div class="stat-label">Total Responses</div>
              </div>
            </div>
            <p>Log in to your dashboard to view detailed response information.</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="button">View in Dashboard</a>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ChaiForms. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
}
