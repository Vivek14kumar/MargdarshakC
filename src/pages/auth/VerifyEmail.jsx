import { sendEmailVerification } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { useEffect, useState } from "react";
import { Mail, RefreshCw } from "lucide-react";

const COOLDOWN_TIME = 30; // seconds

export default function VerifyEmail() {
  const user = auth.currentUser;
  const [sending, setSending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [sent, setSent] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (cooldown === 0) return;

    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [cooldown]);

  const resend = async () => {
    if (!user || cooldown > 0) return;

    try {
      setSending(true);

      await sendEmailVerification(user, {
        url: "https://yourdomain.com/login",
      });

      setSent(true);
      setCooldown(COOLDOWN_TIME); // start cooldown
    } catch (err) {
      console.error("Resend failed:", err);
    } finally {
      setSending(false);
    }
  };

  useEffect(() => {
  const interval = setInterval(async () => {
    await auth.currentUser?.reload();
    if (auth.currentUser?.emailVerified) {
      window.location.href = "/login";
    }
  }, 8000);

  return () => clearInterval(interval);
}, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">

        <div className="mx-auto mb-4 h-16 w-16 flex items-center justify-center rounded-full bg-red-100">
          <Mail className="text-red-600 w-8 h-8" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">
          Verify your email
        </h1>

        <p className="text-gray-600 mt-3 text-sm">
          A verification link has been sent to your email address.
        </p>

        {/* Tips */}
        <div className="mt-6 text-left bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
          <p className="font-semibold mb-2">Didn’t receive the email?</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check <b>Spam</b> or <b>Promotions</b></li>
            <li>Search for <b>no-reply@firebaseapp.com</b></li>
            <li>Wait 1–2 minutes</li>
          </ul>
        </div>

        {/* Resend Button */}
        <button
          onClick={resend}
          disabled={sending || cooldown > 0}
          className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl
          bg-gradient-to-r from-red-500 to-red-700 text-white py-3 font-semibold
          shadow-lg hover:brightness-110 transition disabled:opacity-60"
        >
          <RefreshCw
            className={`w-4 h-4 ${sending ? "animate-spin" : ""}`}
          />

          {cooldown > 0
            ? `Resend in ${cooldown}s`
            : sending
            ? "Sending..."
            : "Resend Verification Email"}
        </button>

        {sent && cooldown > 0 && (
          <p className="text-green-600 text-sm mt-3">
            ✅ Verification email sent
          </p>
        )}
      </div>
    </div>
  );
}
