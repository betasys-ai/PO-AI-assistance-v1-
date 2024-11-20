import { Resend } from 'resend';

const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

// Initialize Resend with proper error handling
function initializeResend(): Resend | null {
  if (!RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY in environment variables');
    return null;
  }

  try {
    return new Resend(RESEND_API_KEY);
  } catch (error) {
    console.error('Failed to initialize Resend:', error);
    return null;
  }
}

const resend = initializeResend();

export async function sendVerificationEmail(email: string, code: string, name: string): Promise<boolean> {
  if (!resend) {
    throw new Error('Email service is not properly configured. Please check your environment variables.');
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Betasys.ai <noreply@betasys.ai>',
      to: [email],
      subject: 'Verify Your Betasys.ai Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6B21A8; margin: 0;">Welcome to Betasys.ai!</h1>
            <p style="color: #4B5563; font-size: 16px;">Your AI-Powered Purchase Order Assistant</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <p style="margin-top: 0;">Hi ${name},</p>
            
            <p>Thank you for choosing Betasys.ai! To complete your registration and ensure the security of your account, please use the verification code below:</p>
            
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #6B21A8;">${code}</span>
            </div>
            
            <p style="font-size: 14px; color: #6B7280;">This code will expire in 10 minutes for security purposes.</p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #E5E7EB;">
              <p style="font-size: 14px; color: #6B7280; margin: 0;">If you didn't create an account with Betasys.ai, you can safely ignore this email.</p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6B7280; font-size: 14px; margin: 0;">
              © ${new Date().getFullYear()} Betasys.ai. All rights reserved.
            </p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(error.message);
    }

    if (!data?.id) {
      throw new Error('Failed to send email: No confirmation received');
    }

    return true;
  } catch (error) {
    console.error('Email service error:', error);

    if (error instanceof Error) {
      // Handle specific error cases
      if (error.message.includes('rate limit')) {
        throw new Error('Too many email attempts. Please try again in a few minutes.');
      }
      if (error.message.includes('invalid') && error.message.includes('key')) {
        throw new Error('Email service configuration error. Please contact support.');
      }
      if (error.message.includes('recipient')) {
        throw new Error('Invalid email address. Please check and try again.');
      }
      throw new Error(`Failed to send verification email: ${error.message}`);
    }

    throw new Error('Unable to send verification email. Please try again later.');
  }
}