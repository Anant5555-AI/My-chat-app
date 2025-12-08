"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import QRCode from "react-qr-code";

export default function MobileLoginPage() {
  const router = useRouter();
  const [qrToken, setQrToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      router.replace("/");
      return;
    }

    const generateToken = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Generate Keys if missing
        const { EncryptionService } = await import("@/lib/encryption");
        let keys = localStorage.getItem("encryptionKeys");
        if (keys) {
          keys = JSON.parse(keys);
        } else {
          keys = EncryptionService.generateKeyPair();
          localStorage.setItem("encryptionKeys", JSON.stringify(keys));
        }

        // 2. Request QR Token with Public Key
        const res = await fetch("/api/qr/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify({ webPublicKey: keys.publicKey })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.message || "Failed to create QR token");
        }
        setQrToken(data.qrToken);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateToken();
  }, [router]);

  return (
    <div className="w-full max-w-md bg-slate-900/70 border border-slate-800 rounded-2xl p-8 shadow-xl">
      <h1 className="text-xl font-semibold mb-2 text-center">
        Login on Mobile
      </h1>
      <p className="text-xs text-slate-400 mb-6 text-center">
        Scan this QR code with the mobile app to log in without typing your password.
      </p>
      <div className="flex flex-col items-center gap-4">
        <div className="bg-white p-4 rounded-xl">
          {qrToken ? (
            <QRCode value={qrToken} size={180} />
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center text-slate-500 text-xs">
              {loading ? "Generating QR..." : "No QR available"}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        <button
          onClick={() => router.push("/chat")}
          className="text-xs text-blue-400 hover:text-blue-300"
        >
          Go to chat →
        </button>
      </div>
    </div>
  );
}


