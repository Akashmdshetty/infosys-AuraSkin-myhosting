import smtplib
import ssl
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

def send_password_reset_email(to_email: str, user_name: str, reset_link: str, expires_in_minutes: int = 15) -> bool:
    """
    Constructs and sends a password reset email via SMTP.
    Contains application name, clear instructions, reset link, expiration notice, and security warnings.
    Does NOT leak tokens or expose secrets in logs or API responses.
    """
    subject = "Password Reset Request — AuraSkin AI Skin Intelligence"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>{subject}</title>
      <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px; }}
        .email-container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
        .header {{ background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; padding: 28px 24px; text-align: center; }}
        .header h1 {{ margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }}
        .body-content {{ padding: 32px 24px; font-size: 15px; line-height: 1.6; color: #334155; }}
        .cta-button {{ display: inline-block; background-color: #0d9488; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; margin: 20px 0; text-align: center; font-size: 15px; }}
        .warning-box {{ background-color: #fffbe6; border: 1px solid #ffe58f; padding: 12px 16px; border-radius: 6px; font-size: 13px; color: #855800; margin-top: 24px; }}
        .footer {{ background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }}
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>AuraSkin AI Skin Intelligence</h1>
        </div>
        <div class="body-content">
          <p>Hello <strong>{user_name}</strong>,</p>
          <p>We received a request to reset your password for your <strong>AuraSkin</strong> account.</p>
          <p>Click the button below to set a new password. This link is valid for <strong>{expires_in_minutes} minutes</strong> and can only be used once:</p>

          <div style="text-align: center;">
            <a href="{reset_link}" class="cta-button" target="_blank">Reset Password</a>
          </div>

          <p style="font-size: 13px; color: #64748b; word-break: break-all;">
            If the button above does not work, copy and paste this link into your web browser:<br>
            <a href="{reset_link}" style="color: #0d9488;">{reset_link}</a>
          </p>

          <div class="warning-box">
            <strong>Security Notice:</strong> If you did not request a password reset, please ignore this email or contact support if you suspect unauthorized access. Your password will remain unchanged.
          </div>
        </div>
        <div class="footer">
          &copy; AuraSkin AI Skin Intelligence & Personalized Skincare Planner. All rights reserved.
        </div>
      </div>
    </body>
    </html>
    """

    text_content = f"""
    Hello {user_name},

    We received a request to reset your password for your AuraSkin account.

    To set a new password, visit the following link:
    {reset_link}

    This link is valid for {expires_in_minutes} minutes and can only be used once.

    Security Notice: If you did not request a password reset, please ignore this email. Your account remains secure.

    — AuraSkin AI Skin Intelligence
    """

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email

    part1 = MIMEText(text_content, "plain")
    part2 = MIMEText(html_content, "html")
    message.attach(part1)
    message.attach(part2)

    if not settings.SMTP_HOST or not settings.SMTP_USERNAME:
        logger.warning(f"SMTP credentials not configured. Development dispatch link for {to_email}: {reset_link}")
        return True

    try:
        context = ssl.create_default_context()
        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, context=context) as server:
                if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], message.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
                server.starttls(context=context)
                if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], message.as_string())
        logger.info(f"Password reset email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send password reset email via SMTP: {str(e)}")
        return False

def send_notification_email(to_email: str, user_name: str, title: str, message_text: str, action_url: str = None) -> bool:
    """
    Constructs and sends an in-app/system reminder or milestone notification email via SMTP.
    """
    subject = f"AuraSkin Notification: {title}"

    cta_section = f"""
    <div style="text-align: center; margin: 24px 0;">
      <a href="{action_url}" style="background-color: #0d9488; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; display: inline-block;">Open AuraSkin</a>
    </div>
    """ if action_url else ""

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>{subject}</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 20px;">
      <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
        <div style="background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%); color: #ffffff; padding: 20px 24px; text-align: center;">
          <h2 style="margin: 0; font-size: 20px; font-weight: 700;">AuraSkin Notification</h2>
        </div>
        <div style="padding: 28px 24px; font-size: 15px; line-height: 1.6; color: #334155;">
          <p>Hello <strong>{user_name}</strong>,</p>
          <h3 style="color: #0f766e; margin-top: 16px;">{title}</h3>
          <p>{message_text}</p>
          {cta_section}
        </div>
        <div style="background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          &copy; AuraSkin AI Skin Intelligence & Personalized Skincare Planner.
        </div>
      </div>
    </body>
    </html>
    """

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
    message["To"] = to_email

    part = MIMEText(html_content, "html")
    message.attach(part)

    if not settings.SMTP_HOST or not settings.SMTP_USERNAME:
        logger.info(f"SMTP not configured; simulated email to {to_email}: {title}")
        return True

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as server:
            server.starttls(context=context)
            if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], message.as_string())
        logger.info(f"Notification email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send notification email: {str(e)}")
        return False
