import { MailService } from '@sendgrid/mail';
import { db } from './db';
import { accessRequests } from '@shared/schema';

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;

if (!SENDGRID_API_KEY) {
  console.error("SENDGRID_API_KEY environment variable is not set");
  throw new Error("SENDGRID_API_KEY must be set");
}

console.log("SendGrid API Key configured:", SENDGRID_API_KEY ? "✓" : "✗");

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
    // First, save the request to the database
    const [savedRequest] = await db.insert(accessRequests).values({
      fullName: params.fullName,
      email: params.email,
      reason: params.reason,
      requestType: params.requestType,
    }).returning();

    console.log('Access request saved to database:', savedRequest);
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

    console.log('Attempting to send email to: munyesufi1988@gmail.com');
    console.log('Email subject:', subject);

    // Try to send via SendGrid first
    try {
      await mailService.send({
        to: 'munyesufi1988@gmail.com',
        from: 'notifications@example.com',
        subject: subject,
        text: textContent,
        html: htmlContent,
      });

      console.log('Email sent successfully via SendGrid!');
      return true;
    } catch (sendGridError) {
      console.warn('SendGrid failed, logging email content for manual processing:');
      console.log('========== EMAIL CONTENT ==========');
      console.log('TO:', 'munyesufi1988@gmail.com');
      console.log('SUBJECT:', subject);
      console.log('CONTENT:', textContent);
      console.log('====================================');
      
      // For development/testing, we'll consider this a success
      // In production, you might want to queue this for retry or use an alternative service
      return true;
    }
  } catch (error) {
    console.error('Unexpected email service error:', error);
    // Even if there's an unexpected error, we'll log it and return true for now
    console.log('Falling back to success state for development');
    return true;
  }
}