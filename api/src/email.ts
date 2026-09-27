import nodemailer from 'nodemailer';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

const SENDER = process.env.GMAIL_SENDER_EMAIL ?? 'lucas.gutknecht.portfolio@gmail.com';
const SUBJECT = 'Hello from Lucas Gutknecht';
const BODY =
  "Hello,\n\nThanks for stopping by my portfolio! This email was sent by a TypeScript " +
  'Lambda function behind API Gateway and CloudFront.\n\n' +
  "If you'd like to connect, just reply to this email.\n\nBest regards,\nLucas";

let cachedPassword: string | undefined;

/**
 * Resolves the Gmail app password. Locally it comes from GMAIL_APP_PASSWORD;
 * in AWS it is read once per container from an SSM SecureString parameter.
 */
async function getPassword(): Promise<string | undefined> {
  if (process.env.GMAIL_APP_PASSWORD) return process.env.GMAIL_APP_PASSWORD;
  if (cachedPassword) return cachedPassword;

  const paramName = process.env.GMAIL_PASSWORD_PARAM;
  if (!paramName) return undefined;

  const ssm = new SSMClient({});
  const res = await ssm.send(new GetParameterCommand({ Name: paramName, WithDecryption: true }));
  cachedPassword = res.Parameter?.Value;
  return cachedPassword;
}

/** Sends the portfolio intro email. Returns true on success. */
export async function sendEmail(recipient: string): Promise<boolean> {
  try {
    const password = await getPassword();
    if (!password) {
      console.log(`[dry-run] No Gmail password configured; would have emailed ${recipient}`);
      return true;
    }

    const transport = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: { user: SENDER, pass: password },
    });
    await transport.sendMail({ from: SENDER, to: recipient, subject: SUBJECT, text: BODY });

    console.log(`Email sent from ${SENDER} to ${recipient}`);
    return true;
  } catch (err) {
    console.error('Error sending email via Gmail SMTP:', err);
    return false;
  }
}
