"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2, ChevronDownIcon } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button as ButtonUI } from "@/components/ui/button";

// ─── Schemas ──────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email("L'email n'est pas valide"),
  password: z.string().min(6, "Minimum 6 caractères"),
});

const registerCandidatSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    email: z.string().email("L'email n'est pas valide"),
    password: z.string().min(6, "Minimum 6 caractères"),
    confirmPassword: z.string().min(1, "Requis"),
    phone: z.string().optional(),
    dateNaissance: z.date().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

const registerRecruteurSchema = z
  .object({
    firstName: z.string().min(1, "Le prénom est requis"),
    lastName: z.string().min(1, "Le nom est requis"),
    email: z.string().email("L'email n'est pas valide"),
    password: z.string().min(6, "Minimum 6 caractères"),
    confirmPassword: z.string().min(1, "Requis"),
    companyName: z.string().min(1, "Le nom de l'entreprise est requis"),
    phone: z.string().optional(),
    typeUser: z.enum(["RECRUTEUR", "COLLABORATEUR", "CANDIDAT"]).optional(),
    dateNaissance: z.date().optional(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ─── Icons ────────────────────────────────────────────────────────────
const IconEmail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconEye = ({ off }: { off?: boolean }) =>
  off ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
const IconUser = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.1 6.1l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);
const IconBuilding = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);
const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
  </svg>
);

// ─── Password strength ────────────────────────────────────────────────
function getStrength(v: string): { score: number; label: string } {
  let score = 0;
  if (v.length >= 8) score++;
  if (v.length >= 12) score++;
  if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
  if (/[0-9]/.test(v) && /[^A-Za-z0-9]/.test(v)) score++;
  const labels = ["Faible", "Faible", "Moyenne", "Forte"];
  return { score, label: score === 0 ? "—" : labels[score - 1] };
}

// ─── InputWrap ────────────────────────────────────────────────────────
function InputWrap({ icon, error, children }: { icon?: React.ReactNode; error?: string; children: React.ReactNode }) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? "#C2410C" : focused ? "#7C5CFC" : "rgba(17,24,39,0.14)";
  const shadow = error
    ? "0 0 0 3px rgba(194,65,12,0.09)"
    : focused
      ? "0 0 0 3px rgba(124,92,252,0.10)"
      : "none";

  return (
    <div>
      <div
        style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#fff",
          border: `1.5px solid ${borderColor}`,
          borderRadius: 8,
          padding: "0 11px",
          transition: "border-color 120ms, box-shadow 120ms",
          boxShadow: shadow,
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {icon && <span style={{ color: "#8A93A1", flexShrink: 0, display: "flex" }}>{icon}</span>}
        {children}
      </div>
      {error && (
        <span style={{ fontSize: 11.5, color: "#C2410C", marginTop: 4, display: "block" }}>{error}</span>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1, border: "none", outline: "none", background: "transparent",
  padding: "10px 0", fontSize: 14, color: "#0B0E14",
  fontFamily: '"Inter Tight", system-ui, sans-serif',
};

// ─── Props ────────────────────────────────────────────────────────────
interface AuthFormProps {
  type: "login" | "register";
  userType: "candidat" | "recruteur";
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export default function AuthForm({ type, userType, onSubmit, isLoading = false }: AuthFormProps) {
  const schema =
    type === "login"
      ? loginSchema
      : userType === "recruteur"
        ? registerRecruteurSchema
        : registerCandidatSchema;

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<any>({
    resolver: zodResolver(schema),
  });

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [dateValue, setDateValue] = useState<Date | undefined>(undefined);

  const pwValue: string = watch("password") ?? "";
  const strength = getStrength(pwValue);

  const segColor = (i: number) => {
    if (i >= strength.score) return "rgba(17,24,39,0.10)";
    return strength.score <= 2 ? "#C2410C" : strength.score === 3 ? "#B7791F" : "#059669";
  };

  const isLogin = type === "login";
  const isRecruteur = userType === "recruteur";

  return (
    <main style={{ display: "flex", flexDirection: "column", padding: "24px 32px 32px", background: "#FAFAFA", fontFamily: '"Inter Tight", system-ui, sans-serif' }}>
      {/* top bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#6B7280", fontSize: 13 }}>
          {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
        </span>
        <Link
          href={`/auth/${userType}/${isLogin ? "register" : "login"}`}
          style={{
            color: "#7C5CFC", fontWeight: 500, padding: "5px 12px",
            border: "1px solid rgba(124,92,252,0.25)",
            background: "rgba(124,92,252,0.07)",
            borderRadius: 7, fontSize: 13, textDecoration: "none",
          }}
        >
          {isLogin ? "Créer un compte" : "Se connecter"}
        </Link>
      </div>

      {/* centered form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 0" }}>
        <div style={{ width: "100%", maxWidth: 380, animation: "auth-fade-up 220ms ease" }}>

          {/* heading */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-0.022em", margin: "0 0 7px", color: "#0B0E14" }}>
              {isLogin ? "Bon retour 👋" : "Créer un compte"}
            </h2>
            <p style={{ fontSize: 14, color: "#6B7280", margin: 0, lineHeight: 1.55 }}>
              {isLogin
                ? `Connectez-vous à votre espace ${isRecruteur ? "recruteur" : "candidat"}.`
                : `Créez votre compte ${isRecruteur ? "recruteur" : "candidat"} gratuitement.`}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* register-only fields */}
            {!isLogin && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "#0B0E14", marginBottom: 5 }}>Prénom</label>
                    <InputWrap icon={<IconUser />} error={errors.firstName?.message as string}>
                      <input style={inputStyle} type="text" placeholder="Aïcha" autoComplete="given-name" {...register("firstName")} />
                    </InputWrap>
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "#0B0E14", marginBottom: 5 }}>Nom</label>
                    <InputWrap error={errors.lastName?.message as string}>
                      <input style={inputStyle} type="text" placeholder="Koné" autoComplete="family-name" {...register("lastName")} />
                    </InputWrap>
                  </div>
                </div>

                {isRecruteur && (
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "#0B0E14", marginBottom: 5 }}>Entreprise</label>
                    <InputWrap icon={<IconBuilding />} error={errors.companyName?.message as string}>
                      <input style={inputStyle} type="text" placeholder="Nom de l'entreprise" {...register("companyName")} />
                    </InputWrap>
                  </div>
                )}

                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "#0B0E14", marginBottom: 5 }}>Téléphone <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optionnel)</span></label>
                  <InputWrap icon={<IconPhone />} error={errors.phone?.message as string}>
                    <input style={inputStyle} type="tel" placeholder="+225 07 00 00 00 00" autoComplete="tel" {...register("phone")} />
                  </InputWrap>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "#0B0E14", marginBottom: 5 }}>
                    {isRecruteur ? "Date de création de l'entreprise" : "Date de naissance"}
                    <span style={{ color: "#9CA3AF", fontWeight: 400, marginLeft: 4 }}>(optionnel)</span>
                  </label>
                  <Popover open={dateOpen} onOpenChange={setDateOpen}>
                    <PopoverTrigger asChild>
                      <ButtonUI
                        type="button"
                        variant="outline"
                        style={{
                          width: "100%", justifyContent: "space-between", fontWeight: 400,
                          background: "#fff", border: "1.5px solid rgba(17,24,39,0.14)",
                          borderRadius: 8, padding: "0 11px", height: 42,
                          fontSize: 14, color: dateValue ? "#0B0E14" : "#9CA3AF",
                          fontFamily: '"Inter Tight", system-ui, sans-serif',
                        }}
                      >
                        {dateValue ? dateValue.toLocaleDateString("fr-FR") : "Sélectionner une date"}
                        <ChevronDownIcon style={{ width: 14, height: 14, color: "#9CA3AF" }} />
                      </ButtonUI>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto overflow-hidden" align="start">
                      <Calendar
                        mode="single"
                        selected={dateValue}
                        fromYear={1900}
                        toYear={2025}
                        captionLayout="dropdown"
                        {...register("dateNaissance", { valueAsDate: true })}
                        onSelect={(date: Date | undefined) => {
                          if (date) {
                            setDateValue(date);
                            setValue("dateNaissance", date);
                            setDateOpen(false);
                          }
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            )}

            {/* email */}
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "#0B0E14", marginBottom: 5 }}>Email professionnel</label>
              <InputWrap icon={<IconEmail />} error={errors.email?.message as string}>
                <input style={inputStyle} type="email" placeholder="vous@exemple.ci" autoComplete="email" {...register("email")} />
              </InputWrap>
            </div>

            {/* password */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
                <label style={{ fontSize: 12.5, fontWeight: 500, color: "#0B0E14" }}>Mot de passe</label>
                {isLogin && (
                  <Link
                    href={`/auth/${userType}/forgot-password`}
                    style={{ fontSize: 12, color: "#7C5CFC", textDecoration: "none", fontWeight: 500 }}
                  >
                    Mot de passe oublié ?
                  </Link>
                )}
              </div>
              <InputWrap icon={<IconLock />} error={errors.password?.message as string}>
                <input
                  style={inputStyle}
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••••"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  {...register("password")}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A93A1", padding: 4, display: "flex" }}>
                  <IconEye off={showPw} />
                </button>
              </InputWrap>

              {/* strength meter — register only */}
              {!isLogin && pwValue && (
                <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 6 }}>
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} style={{ height: 3, flex: 1, background: segColor(i), borderRadius: 2, transition: "background 200ms" }} />
                  ))}
                  <span style={{ fontSize: 11, color: "#9CA3AF", marginLeft: 8, whiteSpace: "nowrap" }}>
                    Force {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* confirm password — register only */}
            {!isLogin && (
              <div>
                <label style={{ display: "block", fontSize: 12.5, fontWeight: 500, color: "#0B0E14", marginBottom: 5 }}>Confirmer le mot de passe</label>
                <InputWrap icon={<IconLock />} error={errors.confirmPassword?.message as string}>
                  <input
                    style={inputStyle}
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••••"
                    autoComplete="new-password"
                    {...register("confirmPassword")}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ background: "none", border: "none", cursor: "pointer", color: "#8A93A1", padding: 4, display: "flex" }}>
                    <IconEye off={showConfirm} />
                  </button>
                </InputWrap>
              </div>
            )}

            {/* remember me — login only */}
            {isLogin && (
              <div style={{ display: "flex", gap: 9, alignItems: "center", fontSize: 13, color: "#5B6472" }}>
                <input type="checkbox" id="remember" defaultChecked style={{ accentColor: "#7C5CFC", cursor: "pointer", width: 14, height: 14 }} />
                <label htmlFor="remember" style={{ cursor: "pointer" }}>Rester connecté</label>
              </div>
            )}

            {/* submit */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%", padding: "11px 0", border: "none",
                background: isLoading ? "#9B8BDC" : "#7C5CFC",
                color: "#fff", fontSize: 14, fontWeight: 500,
                fontFamily: '"Inter Tight", system-ui, sans-serif',
                borderRadius: 8, cursor: isLoading ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                transition: "background 140ms",
                marginTop: 4,
              }}
            >
              {isLoading ? (
                <><Loader2 size={14} strokeWidth={2} style={{ animation: "spin 1s linear infinite" }} />{isLogin ? "Connexion…" : "Création…"}</>
              ) : (
                <>{isLogin ? "Se connecter" : "Créer mon compte"} <IconArrow /></>
              )}
            </button>
          </form>

          {/* trust badges */}
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: "1px solid rgba(17,24,39,0.08)", display: "flex", flexDirection: "column", gap: 7 }}>
            {(isLogin
              ? ["Connexion sécurisée · SSL/TLS", "Données hébergées en Afrique · conformité RGPD CEDEAO"]
              : ["Gratuit pour les candidats", "Données hébergées en Afrique · conformité RGPD CEDEAO"]
            ).map((txt) => (
              <div key={txt} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#9CA3AF" }}>
                <span style={{ color: "#10B981", display: "flex" }}><IconCheck /></span>
                {txt}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* footer */}
      <footer style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "#9CA3AF", paddingTop: 16, borderTop: "1px solid rgba(17,24,39,0.06)" }}>
        <span>© 2026 Ylsix · Abidjan</span>
        <div style={{ display: "flex", gap: 14 }}>
          {["Aide", "Confidentialité", "Conditions"].map((l) => (
            <a key={l} href="#" onClick={(e) => e.preventDefault()} style={{ color: "#9CA3AF", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </main>
  );
}
