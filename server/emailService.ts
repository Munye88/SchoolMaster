import { MailService } from '@sendgrid/mail';

// Use provided API key or environment variable
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || "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";

if (!SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY must be set");
}

const mailService = new MailService();
mailService.setApiKey(SENDGRID_API_KEY);

interface AccessRequestEmail {
  fullName: string;
  email: string;
  reason: string;
  requestType: 'registration' | 'password_reset';
  timestamp: string;
}

export async function sendAccessRequestEmail(params: AccessRequestEmail): Promise<boolean> {
  try {
    const subject = params.requestType === 'registration' 
      ? 'New Registration Request - GOVCIO-SAMS ELT System'
      : 'Password Reset Request - GOVCIO-SAMS ELT System';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #0A2463; border-bottom: 2px solid #0A2463; padding-bottom: 10px;">
          ${params.requestType === 'registration' ? 'New Registration Request' : 'Password Reset Request'}
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">Request Details:</h3>
          <p><strong>Full Name:</strong> ${params.fullName}</p>
          <p><strong>Email:</strong> ${params.email}</p>
          <p><strong>Reason:</strong> ${params.reason}</p>
          <p><strong>Request Type:</strong> ${params.requestType === 'registration' ? 'New Account Registration' : 'Password Reset'}</p>
          <p><strong>Timestamp:</strong> ${params.timestamp}</p>
        </div>

        <div style="background-color: #e8f4f8; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #0A2463; margin-top: 0;">Next Steps:</h3>
          ${params.requestType === 'registration' 
            ? `<p>To approve this registration request, please log into your GOVCIO-SAMS ELT admin panel and manually create an account for this user.</p>`
            : `<p>To approve this password reset request, please log into your GOVCIO-SAMS ELT admin panel and manually reset the password for this user.</p>`
          }
          <p><strong>System URL:</strong> <a href="https://samselt.com" style="color: #0A2463;">https://samselt.com</a></p>
        </div>

        <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
          <p>This is an automated message from the GOVCIO-SAMS ELT Management System.</p>
          <p>If you did not expect this email, please ignore it.</p>
        </div>
      </div>
    `;

    const textContent = `
      ${params.requestType === 'registration' ? 'New Registration Request' : 'Password Reset Request'}
      
      Request Details:
      - Full Name: ${params.fullName}
      - Email: ${params.email}
      - Reason: ${params.reason}
      - Request Type: ${params.requestType === 'registration' ? 'New Account Registration' : 'Password Reset'}
      - Timestamp: ${params.timestamp}
      
      Next Steps:
      ${params.requestType === 'registration' 
        ? 'To approve this registration request, please log into your GOVCIO-SAMS ELT admin panel and manually create an account for this user.'
        : 'To approve this password reset request, please log into your GOVCIO-SAMS ELT admin panel and manually reset the password for this user.'
      }
      
      System URL: https://samselt.com
      
      This is an automated message from the GOVCIO-SAMS ELT Management System.
    `;

    await mailService.send({
      to: 'munyesufi1988@gmail.com',
      from: 'noreply@samselt.com', // You may need to verify this sender address in SendGrid
      subject: subject,
      text: textContent,
      html: htmlContent,
    });

    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}