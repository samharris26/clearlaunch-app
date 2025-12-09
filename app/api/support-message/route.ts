import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";

interface SupportMessageRequest {
  name?: string;
  email: string;
  message: string;
  pageUrl?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: SupportMessageRequest = await req.json();

    // Validation
    if (!body.email || typeof body.email !== "string" || !body.email.trim()) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 }
      );
    }

    if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email.trim())) {
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "support@clearlaunch.co.uk";
    const supportEmail = "support@clearlaunch.co.uk";
    const timestamp = new Date().toISOString();
    const formattedDate = new Date().toLocaleString("en-GB", {
      timeZone: "Europe/London",
      dateStyle: "medium",
      timeStyle: "short",
    });

    // Send email via Resend
    await resend.emails.send({
      from: fromEmail,
      replyTo: body.email.trim(),
      to: supportEmail,
      subject: `New in-app support message from ${body.email.trim()}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px 8px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">ClearLaunch</h1>
            </div>
            
            <div style="background: #ffffff; padding: 40px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
              <h2 style="color: #1e293b; margin-top: 0; font-size: 24px;">New Support Message</h2>
              
              <p style="color: #64748b; font-size: 16px;">
                A user has submitted a support message through the in-app help widget.
              </p>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                  Name:
                </p>
                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 16px;">
                  ${body.name?.trim() || "Not provided"}
                </p>
              </div>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                  Email:
                </p>
                <p style="margin: 8px 0 0 0; color: #0ea5e9; font-size: 18px;">
                  <a href="mailto:${body.email.trim()}" style="color: #0ea5e9; text-decoration: none;">${body.email.trim()}</a>
                </p>
              </div>
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                  Message:
                </p>
                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 16px; white-space: pre-wrap;">
                  ${body.message.trim().replace(/\n/g, "<br>")}
                </p>
              </div>
              
              ${body.pageUrl ? `
              <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                  Page URL:
                </p>
                <p style="margin: 8px 0 0 0; color: #0ea5e9; font-size: 14px; word-break: break-all;">
                  <a href="${body.pageUrl}" style="color: #0ea5e9; text-decoration: none;">${body.pageUrl}</a>
                </p>
              </div>
              ` : ""}
              
              <div style="background: #f1f5f9; padding: 20px; border-radius: 6px; margin: 20px 0;">
                <p style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 600;">
                  Timestamp:
                </p>
                <p style="margin: 8px 0 0 0; color: #64748b; font-size: 16px;">
                  ${formattedDate} (${timestamp})
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `New Support Message

A user has submitted a support message through the in-app help widget.

Name: ${body.name?.trim() || "Not provided"}
Email: ${body.email.trim()}
Message: ${body.message.trim()}
${body.pageUrl ? `Page URL: ${body.pageUrl}` : ""}
Timestamp: ${formattedDate} (${timestamp})`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Support message route error:", err);
    return NextResponse.json(
      { error: "Failed to send support message." },
      { status: 500 }
    );
  }
}

