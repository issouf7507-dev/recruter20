"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { IconMailCheck, IconLoader, IconRefresh, IconArrowLeft } from "@tabler/icons-react";

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "candidat";

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const loginUrl = type === "recruteur" ? "/auth/recruteur/login" : "/auth/candidat/login";

  useEffect(() => {
    if (!email) {
      router.push(loginUrl);
      return;
    }
    sendCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const sendCode = async () => {
    if (isSending || countdown > 0) return;
    setIsSending(true);
    try {
      const res = await fetch("/api/auth/send-verification-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Erreur lors de l'envoi du code");
      } else {
        toast.success("Code envoyé ! Vérifiez votre boîte email.");
        setCountdown(60);
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSending(false);
    }
  };

  const handleInput = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newCode = [...code];
    for (let i = 0; i < pasted.length; i++) newCode[i] = pasted[i];
    setCode(newCode);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      toast.error("Entrez les 6 chiffres du code");
      return;
    }
    setIsVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-email-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Code invalide");
        setCode(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.success("Email vérifié ! Vous pouvez vous connecter.");
        setTimeout(() => router.push(loginUrl), 1500);
      }
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsVerifying(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(?=@)/, (_, a, b) => a + "*".repeat(b.length))
    : "";

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0f0f0f 0%, #1a0a2e 100%)",
        fontFamily: '"Inter Tight", system-ui, sans-serif',
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          borderRadius: "20px",
          padding: "48px 40px",
          maxWidth: "420px",
          width: "100%",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.6)",
        }}
      >
        {/* Icon */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2d1f4e 0%, #1e1b4b 100%)",
              border: "2px solid #8b5cf6",
              marginBottom: "20px",
            }}
          >
            <IconMailCheck size={36} color="#a78bfa" />
          </div>
          <h1
            style={{
              color: "#e5e7eb",
              fontSize: "22px",
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            Vérifiez votre email
          </h1>
          <p style={{ color: "#9ca3af", fontSize: "14px", margin: 0, lineHeight: 1.6 }}>
            Un code à 6 chiffres a été envoyé à
            <br />
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>{maskedEmail}</span>
          </p>
        </div>

        {/* Code inputs */}
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "center",
            marginBottom: "28px",
          }}
          onPaste={handlePaste}
        >
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInput(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              style={{
                width: "48px",
                height: "56px",
                textAlign: "center",
                fontSize: "22px",
                fontWeight: 700,
                fontFamily: "monospace",
                background: digit ? "linear-gradient(135deg, #2d1f4e, #1e1b4b)" : "#252525",
                border: `2px solid ${digit ? "#8b5cf6" : "#3a3a3a"}`,
                borderRadius: "10px",
                color: "#e5e7eb",
                outline: "none",
                transition: "border-color 0.2s, background 0.2s",
                cursor: "text",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "#8b5cf6")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = digit ? "#8b5cf6" : "#3a3a3a")
              }
            />
          ))}
        </div>

        {/* Verify button */}
        <button
          onClick={handleVerify}
          disabled={isVerifying || code.join("").length !== 6}
          style={{
            width: "100%",
            padding: "14px",
            background:
              code.join("").length === 6
                ? "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                : "#2a2a2a",
            color: code.join("").length === 6 ? "white" : "#6b7280",
            border: "none",
            borderRadius: "10px",
            fontSize: "15px",
            fontWeight: 600,
            cursor: code.join("").length === 6 ? "pointer" : "default",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "opacity 0.2s",
            marginBottom: "16px",
          }}
        >
          {isVerifying && <IconLoader size={18} style={{ animation: "spin 1s linear infinite" }} />}
          {isVerifying ? "Vérification..." : "Vérifier mon email"}
        </button>

        {/* Resend */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p style={{ color: "#6b7280", fontSize: "13px", margin: "0 0 8px" }}>
            Vous n&apos;avez pas reçu le code ?
          </p>
          <button
            onClick={sendCode}
            disabled={isSending || countdown > 0}
            style={{
              background: "none",
              border: "none",
              color: countdown > 0 ? "#6b7280" : "#a78bfa",
              fontSize: "13px",
              fontWeight: 600,
              cursor: countdown > 0 ? "default" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: 0,
            }}
          >
            {isSending ? (
              <IconLoader size={14} style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <IconRefresh size={14} />
            )}
            {countdown > 0
              ? `Renvoyer dans ${countdown}s`
              : "Renvoyer le code"}
          </button>
        </div>

        {/* Back to login */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={() => router.push(loginUrl)}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              fontSize: "13px",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: 0,
            }}
          >
            <IconArrowLeft size={14} />
            Retour à la connexion
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailContent />
    </Suspense>
  );
}
