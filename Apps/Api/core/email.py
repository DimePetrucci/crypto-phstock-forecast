import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from core.config import settings
from core.logging import get_logger

logger = get_logger(__name__)


def _send_smtp(to: str, subject: str, html: str) -> None:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = to
    msg.attach(MIMEText(html, "html"))

    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        if settings.SMTP_TLS:
            server.starttls()
        if settings.SMTP_USER:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_FROM, [to], msg.as_string())


async def send_email(to: str, subject: str, html: str) -> None:
    if not settings.SMTP_HOST:
        # Extract href URL from the first <a href="..."> in the email for easy dev testing
        import re
        url_match = re.search(r'href="([^"]+)"', html)
        dev_url = url_match.group(1) if url_match else "(no link)"
        logger.info("email_dev_log", to=to, subject=subject, action_url=dev_url)
        return
    try:
        await asyncio.to_thread(_send_smtp, to, subject, html)
        logger.info("email_sent", to=to, subject=subject)
    except Exception as exc:
        logger.error("email_send_failed", to=to, subject=subject, error=str(exc))


async def send_verification_email(to: str, token: str) -> None:
    url = f"{settings.APP_URL}/verify-email?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>Verify your InvestIQ account</h2>
      <p>Click the link below to verify your email address. This link expires in 24 hours.</p>
      <a href="{url}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
        Verify Email
      </a>
      <p style="margin-top:16px;color:#666;font-size:13px">Or copy this link: {url}</p>
    </div>
    """
    await send_email(to, "Verify your InvestIQ account", html)


async def send_password_reset_email(to: str, token: str) -> None:
    url = f"{settings.APP_URL}/reset-password?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>Reset your InvestIQ password</h2>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="{url}" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:6px;text-decoration:none;font-weight:600">
        Reset Password
      </a>
      <p style="margin-top:16px;color:#666;font-size:13px">Or copy this link: {url}</p>
      <p style="color:#999;font-size:12px">If you did not request a password reset, ignore this email.</p>
    </div>
    """
    await send_email(to, "Reset your InvestIQ password", html)
