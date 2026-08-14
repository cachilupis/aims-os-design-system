import { useState, type FormEvent } from "react"
import { Mail, Lock, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react"
import { AppBackground } from "@/components/ui/app-background"
import { CardContainer } from "@/components/ui/card-container"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { SlideOut } from "@/components/ui/slide-out"

// ── Google "G" mark ──────────────────────────────────────────────────────────
// DS-GAP: Google's logo uses fixed multi-brand colors mandated by Google's own
// brand guidelines — never theme tokens. Same exception class as Button's
// hardcoded "main" gradient in button.tsx (see that file's header comment).
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.61z"/>{/* audit-ignore: Google brand mark, fixed official color per Google brand guidelines */}
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.85.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.96v2.33A8.997 8.997 0 0 0 9 18z"/>{/* audit-ignore: Google brand mark, fixed official color per Google brand guidelines */}
      <path fill="#FBBC05" d="M3.95 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.96a9 9 0 0 0 0 8.08l2.99-2.33z"/>{/* audit-ignore: Google brand mark, fixed official color per Google brand guidelines */}
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A8.997 8.997 0 0 0 .96 4.96l2.99 2.33C4.66 5.16 6.65 3.58 9 3.58z"/>{/* audit-ignore: Google brand mark, fixed official color per Google brand guidelines */}
    </svg>
  )
}

// ── Validation ────────────────────────────────────────────────────────────────

type FieldErrors = { email?: string; password?: string }

function validate(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {}
  if (!email.trim()) {
    errors.email = "Ingresa tu correo electrónico."
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Ingresa un correo válido."
  }
  if (!password) {
    errors.password = "Ingresa tu contraseña."
  } else if (password.length < 6) {
    errors.password = "Debe tener al menos 6 caracteres."
  }
  return errors
}

// ── Screen ────────────────────────────────────────────────────────────────────

type AuthStage = "form" | "loading" | "signed-in"
type AuthMethod = "credentials" | "google"

export default function PMMichaelLoginScreen() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [stage, setStage] = useState<AuthStage>("form")
  const [method, setMethod] = useState<AuthMethod>("credentials")

  const [forgotOpen, setForgotOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState("")
  const [resetSent, setResetSent] = useState(false)

  function runSignIn(nextMethod: AuthMethod) {
    setMethod(nextMethod)
    setStage("loading")
    setTimeout(() => setStage("signed-in"), 1100)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors = validate(email, password)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) runSignIn("credentials")
  }

  function handleGoogle() {
    setErrors({})
    runSignIn("google")
  }

  function handleSignOut() {
    setStage("form")
    setEmail("")
    setPassword("")
    setErrors({})
  }

  function closeForgot() {
    setForgotOpen(false)
    setResetSent(false)
    setResetEmail("")
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-[24px]">
      <AppBackground />

      <CardContainer size="lg" className="w-full max-w-[420px]">
        {stage === "signed-in" ? (
          <div className="flex flex-col items-center text-center gap-[16px] py-[8px]">
            <span
              className="flex items-center justify-center w-[56px] h-[56px] rounded-full"
              style={{ background: "var(--color-surface-primary-subtle)", color: "var(--primary)" }}
            >
              <CheckCircle2 size={28} />
            </span>
            <div className="flex flex-col gap-[4px]">
              <h1 className="text-[18px] font-semibold leading-[1.4]" style={{ color: "var(--color-text-title)" }}>
                Bienvenido de vuelta
              </h1>
              <p className="text-[13px] leading-[1.5]" style={{ color: "var(--color-text-subtitle)" }}>
                {method === "google" ? "Sesión iniciada con Google." : `Sesión iniciada como ${email}.`}
              </p>
              <p className="text-[12px] leading-[1.5]" style={{ color: "var(--color-text-subtitle)" }}>
                Recordar sesión en este dispositivo: {rememberMe ? "activado" : "desactivado"}
              </p>
            </div>
            <Button variant="secondary" size="default" className="w-full" onClick={handleSignOut}>
              Cerrar sesión
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-[12px] mb-[24px]">
              <img src="/favicon.svg" alt="AIMS OS" className="w-[40px] h-[38px]" />
              <div className="flex flex-col items-center gap-[4px] text-center">
                <h1 className="text-[18px] font-semibold leading-[1.4]" style={{ color: "var(--color-text-title)" }}>
                  Inicia sesión en AIMS OS
                </h1>
                <p className="text-[13px] leading-[1.5]" style={{ color: "var(--color-text-subtitle)" }}>
                  Ingresa tus credenciales para continuar.
                </p>
              </div>
            </div>

            <Button
              variant="secondary"
              size="default"
              className="w-full"
              icon={stage === "loading" && method === "google" ? <Spinner size="s" /> : <GoogleIcon />}
              disabled={stage === "loading"}
              onClick={handleGoogle}
            >
              {stage === "loading" && method === "google" ? "Conectando…" : "Continuar con Google"}
            </Button>

            <div className="flex items-center gap-[12px] my-[20px]">
              <span className="flex-1 h-[0.5px]" style={{ background: "var(--field-border)" }} />
              <span className="text-[12px] font-medium" style={{ color: "var(--field-supporting)" }}>o</span>
              <span className="flex-1 h-[0.5px]" style={{ background: "var(--field-border)" }} />
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-[16px]">
              <Input
                type="email"
                placeholder="Correo electrónico"
                autoComplete="email"
                leftIcon={<Mail size={16} />}
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }) }}
                state={errors.email ? "error" : "default"}
                supportingText={errors.email}
                disabled={stage === "loading"}
              />

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                autoComplete="current-password"
                leftIcon={<Lock size={16} />}
                value={password}
                onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: undefined }) }}
                state={errors.password ? "error" : "default"}
                supportingText={errors.password}
                disabled={stage === "loading"}
                rightIcon={
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="flex items-center"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
              />

              <div className="flex items-center justify-between -mt-[4px]">
                <Checkbox
                  size="sm"
                  checked={rememberMe}
                  onChange={setRememberMe}
                  label="Recuérdame"
                />
                <button
                  type="button"
                  onClick={() => setForgotOpen(true)}
                  className="text-[13px] font-semibold transition-opacity hover:opacity-70"
                  style={{ color: "var(--primary)" }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="default"
                className="w-full"
                disabled={stage === "loading"}
                icon={stage === "loading" && method === "credentials" ? <Spinner size="s" style="bw" /> : undefined}
              >
                {stage === "loading" && method === "credentials" ? "Iniciando sesión…" : "Iniciar sesión"}
              </Button>
            </form>
          </>
        )}
      </CardContainer>

      <SlideOut
        open={forgotOpen}
        onClose={closeForgot}
        type="full-slot"
        size="s"
        title="Recuperar contraseña"
      >
        <div className="flex flex-col gap-[16px] p-[24px]">
          <button
            type="button"
            onClick={closeForgot}
            className="flex items-center gap-[6px] text-[13px] font-medium transition-opacity hover:opacity-70 self-start"
            style={{ color: "var(--color-text-subtitle)" }}
          >
            <ArrowLeft size={14} /> Volver a iniciar sesión
          </button>

          <div className="flex flex-col gap-[4px]">
            <h2 className="text-[16px] font-semibold leading-[1.4]" style={{ color: "var(--color-text-title)" }}>
              Recuperar contraseña
            </h2>
            <p className="text-[13px] leading-[1.5]" style={{ color: "var(--color-text-subtitle)" }}>
              Te enviaremos un enlace para restablecerla.
            </p>
          </div>

          {resetSent ? (
            <div
              className="flex items-start gap-[8px] p-[12px] rounded-[8px]"
              style={{ background: "var(--color-surface-primary-subtle)", border: "0.5px solid var(--field-border)" }}
            >
              <CheckCircle2 size={16} style={{ color: "var(--primary)" }} className="shrink-0 mt-[1px]" />
              <p className="text-[13px] leading-[1.5]" style={{ color: "var(--foreground)" }}>
                Enviamos un enlace a <strong>{resetEmail}</strong>. Revisa tu bandeja de entrada.
              </p>
            </div>
          ) : (
            <>
              <Input
                type="email"
                placeholder="Correo electrónico"
                leftIcon={<Mail size={16} />}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
              <Button
                variant="primary"
                size="default"
                className="w-full"
                disabled={!resetEmail.trim()}
                onClick={() => setResetSent(true)}
              >
                Enviar enlace
              </Button>
            </>
          )}
        </div>
      </SlideOut>
    </div>
  )
}
