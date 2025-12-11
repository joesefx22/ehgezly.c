// lib/email.ts
import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html)
      })
    } catch (error) {
      console.error('Email sending failed:', error)
      throw new Error('Failed to send email')
    }
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Email templates
  getVerificationEmail(name: string, verificationLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #4F46E5; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            color: #666; 
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Verify Your Email</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><small>${verificationLink}</small></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>This email was sent by Auth System. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Auth System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }

  getPasswordResetEmail(name: string, resetLink: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your Password</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #DC2626; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background: #f9f9f9; }
          .button { 
            display: inline-block; 
            padding: 12px 24px; 
            background: #DC2626; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px;
            margin: 20px 0;
          }
          .warning { 
            background: #FEF3C7; 
            border-left: 4px solid #D97706; 
            padding: 15px; 
            margin: 20px 0;
          }
          .footer { 
            margin-top: 30px; 
            padding-top: 20px; 
            border-top: 1px solid #ddd; 
            color: #666; 
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Reset Your Password</h1>
          </div>
          <div class="content">
            <p>Hello ${name},</p>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p><small>${resetLink}</small></p>
            <div class="warning">
              <strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
            </div>
          </div>
          <div class="footer">
            <p>This email was sent by Auth System. Please do not reply to this email.</p>
            <p>&copy; ${new Date().getFullYear()} Auth System. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

export const emailService = new EmailService()
