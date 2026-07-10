import { Resend } from 'resend';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_ADDRESS = process.env.ADMIN_EMAIL_FROM || 'Todayly Admin <onboarding@resend.dev>';

// Sends the 2FA code to the admin's email. Throws in production if no email
// provider is configured — a silently-broken MFA flow is worse than a loud one.
export async function sendAdminVerificationEmail(to: string, code: string): Promise<void> {
  if (!RESEND_API_KEY) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV ONLY] Admin verification code for ${to}: ${code}`);
      return;
    }
    throw new Error('RESEND_API_KEY is not configured — cannot send admin verification email');
  }

  const resend = new Resend(RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: 'Your Todayly admin verification code',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#1e293b;">Admin sign-in verification</h2>
        <p style="color:#475569;">Use this code to finish signing in to the Todayly admin dashboard:</p>
        <p style="font-size:32px; font-weight:700; letter-spacing:8px; color:#7c3aed; margin: 24px 0;">${code}</p>
        <p style="color:#64748b; font-size:13px;">This code expires in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
}
