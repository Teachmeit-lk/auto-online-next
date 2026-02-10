export async function sendEmail(
  to: string,
  subject: string,
  html: string
) {
  const appKey = (process.env.EMAIL_APP_KEY || "").trim();
  const secretKey = (process.env.EMAIL_SECRET_KEY || "").trim();

  if (!appKey) throw new Error("EMAIL_APP_KEY is missing/empty");
  if (!secretKey) throw new Error("EMAIL_SECRET_KEY is missing/empty");

  if (!to || !subject || !html) {
    throw new Error("Missing required parameters: to, subject, or html");
  }

  const res = await fetch(
    "https://api-postbridge.teachmeit.lk/api/public/emails/1/send",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-app-key": appKey,
        "x-secret-key": secretKey,
      },
      body: JSON.stringify({
        to,
        subject,
        html,
      }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    console.error("Email API error:", data);
    throw new Error(data?.error?.message || "Email send failed");
  }

  return data;
}
