const { BrevoClient } = require("@getbrevo/brevo");

let brevoClient = null;

function getBrevoClient() {
  if (!brevoClient) {
    const apiKey = process.env.BREVO_API_KEY;

    if (!apiKey) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    brevoClient = new BrevoClient({
      apiKey,
    });
  }

  return brevoClient;
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendOTPEmail({
  email,
  name,
  otp,
  purpose = "email_verification",
}) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "JobWay";
  const expiryMinutes =
    process.env.OTP_EXPIRY_MINUTES || "10";

  if (!senderEmail) {
    throw new Error(
      "BREVO_SENDER_EMAIL is not configured",
    );
  }

  const client = getBrevoClient();

  const safeName = escapeHtml(name || "there");

  const isPasswordReset =
    purpose === "password_reset";

  const subject = isPasswordReset
    ? "Your JobWay Password Reset Code"
    : "Your JobWay Email Verification Code";

  const title = isPasswordReset
    ? "Reset your password"
    : "Verify your email";

  const description = isPasswordReset
    ? "Use the verification code below to reset your JobWay account password."
    : "Use the verification code below to complete your JobWay account registration.";

  const footerMessage = isPasswordReset
    ? "If you did not request a password reset, you can safely ignore this email."
    : "If you did not create a JobWay account, you can safely ignore this email.";

  await client.transactionalEmails.sendTransacEmail({
    sender: {
      email: senderEmail,
      name: senderName,
    },

    to: [
      {
        email,
        name: safeName,
      },
    ],

    subject,

    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>${escapeHtml(subject)}</title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f5f7fa;
            font-family:Arial,Helvetica,sans-serif;
          "
        >
          <div
            style="
              max-width:600px;
              margin:40px auto;
              background:#ffffff;
              border-radius:12px;
              overflow:hidden;
              border:1px solid #e5e7eb;
            "
          >
            <div
              style="
                padding:28px 32px;
                background:#f97316;
              "
            >
              <h1
                style="
                  margin:0;
                  color:#ffffff;
                  font-size:28px;
                "
              >
                JobWay
              </h1>
            </div>

            <div style="padding:32px;">
              <h2
                style="
                  margin:0 0 16px;
                  color:#111827;
                "
              >
                ${title}
              </h2>

              <p
                style="
                  margin:0 0 12px;
                  color:#374151;
                  font-size:15px;
                "
              >
                Hello ${safeName},
              </p>

              <p
                style="
                  margin:0 0 24px;
                  color:#4b5563;
                  font-size:15px;
                  line-height:1.6;
                "
              >
                ${description}
              </p>

              <div
                style="
                  margin:24px 0;
                  text-align:center;
                "
              >
                <span
                  style="
                    display:inline-block;
                    padding:16px 28px;
                    background:#f3f4f6;
                    border-radius:10px;
                    color:#111827;
                    font-size:32px;
                    font-weight:700;
                    letter-spacing:8px;
                  "
                >
                  ${escapeHtml(otp)}
                </span>
              </div>

              <p
                style="
                  margin:24px 0 0;
                  color:#6b7280;
                  font-size:13px;
                  line-height:1.6;
                "
              >
                This code expires in
                ${escapeHtml(expiryMinutes)} minutes.
              </p>

              <p
                style="
                  margin:16px 0 0;
                  color:#6b7280;
                  font-size:13px;
                  line-height:1.6;
                "
              >
                ${footerMessage}
              </p>
            </div>

            <div
              style="
                padding:20px 32px;
                background:#f9fafb;
                border-top:1px solid #e5e7eb;
              "
            >
              <p
                style="
                  margin:0;
                  color:#9ca3af;
                  font-size:12px;
                  text-align:center;
                "
              >
                &copy; ${new Date().getFullYear()} JobWay.
                All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

async function sendVerificationOTP({
  email,
  name,
  otp,
}) {
  return sendOTPEmail({
    email,
    name,
    otp,
    purpose: "email_verification",
  });
}

async function sendPasswordResetOTP({
  email,
  name,
  otp,
}) {
  return sendOTPEmail({
    email,
    name,
    otp,
    purpose: "password_reset",
  });
}

async function sendFacultyInvitation({
  email,
  name,
  invitationUrl,
  expiresAt,
}) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "JobWay";

  if (!senderEmail) {
    throw new Error(
      "BREVO_SENDER_EMAIL is not configured",
    );
  }

  if (!invitationUrl) {
    throw new Error("Faculty invitation URL is required");
  }

  const client = getBrevoClient();

  const safeName = escapeHtml(name || "there");
  const safeInvitationUrl = escapeHtml(invitationUrl);

  const expiryText = expiresAt
    ? new Date(expiresAt).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      })
    : "72 hours";

  const subject = "You're Invited to Join JobWay as an Educator";

  await client.transactionalEmails.sendTransacEmail({
    sender: {
      email: senderEmail,
      name: senderName,
    },

    to: [
      {
        email,
        name: safeName,
      },
    ],

    subject,

    htmlContent: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>${escapeHtml(subject)}</title>
        </head>

        <body
          style="
            margin:0;
            padding:0;
            background:#f5f7fa;
            font-family:Arial,Helvetica,sans-serif;
          "
        >
          <div
            style="
              max-width:600px;
              margin:40px auto;
              background:#ffffff;
              border-radius:14px;
              overflow:hidden;
              border:1px solid #e5e7eb;
            "
          >
            <div
              style="
                padding:30px 32px;
                background:#E13032;
              "
            >
              <h1
                style="
                  margin:0;
                  color:#ffffff;
                  font-size:28px;
                  font-weight:700;
                "
              >
                JobWay
              </h1>

              <p
                style="
                  margin:8px 0 0;
                  color:#ffffff;
                  font-size:14px;
                "
              >
                Educator Portal
              </p>
            </div>

            <div style="padding:34px 32px;">
              <h2
                style="
                  margin:0 0 18px;
                  color:#111827;
                  font-size:24px;
                "
              >
                You're invited to join JobWay
              </h2>

              <p
                style="
                  margin:0 0 14px;
                  color:#374151;
                  font-size:15px;
                "
              >
                Hello ${safeName},
              </p>

              <p
                style="
                  margin:0 0 18px;
                  color:#4b5563;
                  font-size:15px;
                  line-height:1.7;
                "
              >
                You have been invited by the JobWay administration
                team to join the platform as an educator.
              </p>

              <p
                style="
                  margin:0 0 26px;
                  color:#4b5563;
                  font-size:15px;
                  line-height:1.7;
                "
              >
                Through the Educator Portal, you will be able to
                manage assigned batches, mock tests, tasks and
                lesson plans.
              </p>

              <div
                style="
                  text-align:center;
                  margin:30px 0;
                "
              >
                <a
                  href="${safeInvitationUrl}"
                  style="
                    display:inline-block;
                    padding:14px 28px;
                    background:#E13032;
                    color:#ffffff;
                    text-decoration:none;
                    border-radius:8px;
                    font-size:15px;
                    font-weight:700;
                  "
                >
                  Accept Invitation
                </a>
              </div>

              <p
                style="
                  margin:0 0 12px;
                  color:#6b7280;
                  font-size:13px;
                  line-height:1.6;
                "
              >
                This invitation expires on
                <strong>${escapeHtml(expiryText)}</strong>.
              </p>

              <p
                style="
                  margin:14px 0 0;
                  color:#9ca3af;
                  font-size:12px;
                  line-height:1.6;
                "
              >
                If you were not expecting this invitation,
                you can safely ignore this email.
              </p>

              <div
                style="
                  margin-top:28px;
                  padding:14px;
                  background:#f9fafb;
                  border-radius:8px;
                  word-break:break-all;
                "
              >
                <p
                  style="
                    margin:0 0 6px;
                    color:#6b7280;
                    font-size:12px;
                  "
                >
                  If the button does not work, use this link:
                </p>

                <a
                  href="${safeInvitationUrl}"
                  style="
                    color:#E13032;
                    font-size:12px;
                    text-decoration:none;
                  "
                >
                  ${safeInvitationUrl}
                </a>
              </div>
            </div>

            <div
              style="
                padding:20px 32px;
                background:#f9fafb;
                border-top:1px solid #e5e7eb;
              "
            >
              <p
                style="
                  margin:0;
                  color:#9ca3af;
                  font-size:12px;
                  text-align:center;
                "
              >
                &copy; ${new Date().getFullYear()} JobWay.
                All rights reserved.
              </p>
            </div>
          </div>
        </body>
      </html>
    `,
  });
}

module.exports = {
  sendVerificationOTP,
  sendPasswordResetOTP,
  sendFacultyInvitation,
};
