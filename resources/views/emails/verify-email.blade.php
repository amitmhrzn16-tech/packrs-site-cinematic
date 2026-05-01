<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>Verify your email</title></head>
<body style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#0f172a; color:#e2e8f0; padding:32px;">
  <div style="max-width:520px; margin:0 auto; background:#111827; border-radius:14px; padding:28px;">
    <h1 style="font-size:18px; margin:0 0 12px;">Verify your email</h1>
    <p>Hi {{ $name }},</p>
    <p>Thanks for creating a Packrs admin portal account. Click the button below to verify your email address. The link is valid for 24 hours.</p>
    <p style="margin:24px 0;">
      <a href="{{ $verifyUrl }}" style="background:#14b8a6; color:#0f172a; text-decoration:none; padding:10px 18px; border-radius:8px; font-weight:600;">Verify email</a>
    </p>
    <p style="font-size:12px; color:#94a3b8;">If the button doesn't work, paste this link into your browser:<br>{{ $verifyUrl }}</p>
    <p style="font-size:12px; color:#94a3b8;">If you didn't create this account, you can ignore this email.</p>
  </div>
</body>
</html>
