import { useState } from "react";
import { authService } from "@/api/AuthService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight, Loader2, UserRound, KeyRound } from "lucide-react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [passcode, setPasscode] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [step, setStep] = useState<"email" | "passcode">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { enterAsGuest, login } = useAuth();
  const navigate = useNavigate();

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const result = await authService.emailValidation(email.trim());
    setLoading(false);

    if (!result.ok) {
      setError(result.error || "Ogiltig e-postadress.");
      return;
    }

    // In dev mode the backend may return the passcode directly
    if (typeof result.data === "number" && result.data > 0) {
      setPasscode(String(result.data));
    }

    setStep("passcode");
  };

  const handleValidatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPasscode = passcode.trim();
    if (!trimmedPasscode || isNaN(Number(trimmedPasscode))) {
      setError("Vänligen ange en giltig lösenkod.");
      return;
    }
    setLoading(true);
    setError("");

    const result = await authService.passcodeValidation(
      email,
      Number(trimmedPasscode),
      rememberMe,
    );
    setLoading(false);

    if (!result.ok) {
      setError(result.error || "Felaktig lösenkod.");
      return;
    }

    await login();
    navigate("/");
  };

  const handleGuest = () => {
    enterAsGuest();
    navigate("/");
  };

  return (
    <div className='login'>
      <div className='login__card'>
        <div className='login__logo'>
          <div className='login__logo-icon'>CUL</div>
          <h1 className='login__title'>CUL Programmering</h1>
        </div>
        <p className='login__subtitle'>
          {step === "email"
            ? "Logga in med din e-postadress."
            : `Ange lösenkoden som skickades till ${email}`}
        </p>

        {step === "email" ? (
          <form onSubmit={handleSendEmail} className='login__form'>
            <div className='login__field'>
              <Mail className='login__field-icon' />
              <input
                type='email'
                placeholder='din@email.se'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className='login__input'
                required
                autoFocus
                autoComplete="on"
              />
            </div>
            <label className='login__remember'>
              <input
                type='checkbox'
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Kom ihåg mig
            </label>
            <button
              type='submit'
              className='login__btn login__btn--primary'
              disabled={loading}
            >
              {loading ? (
                <Loader2 className='login__spinner' />
              ) : (
                <>
                  Skicka lösenkod <ArrowRight className='login__btn-icon' />
                </>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleValidatePasscode} className='login__form'>
            <div className='login__field'>
              <KeyRound className='login__field-icon' />
              <input
                type='text'
                inputMode='numeric'
                placeholder='Ange lösenkod'
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className='login__input'
                required
                autoFocus
              />
            </div>
            <button
              type='submit'
              className='login__btn login__btn--primary'
              disabled={loading}
            >
              {loading ? (
                <Loader2 className='login__spinner' />
              ) : (
                <>
                  Logga in <ArrowRight className='login__btn-icon' />
                </>
              )}
            </button>
            <button
              type='button'
              className='login__btn login__btn--ghost'
              onClick={() => {
                setStep("email");
                setPasscode("");
                setError("");
              }}
            >
              Ändra e-post
            </button>
          </form>
        )}

        {error && <p className='login__error'>{error}</p>}

        <div className='login__divider'>
          <span>eller</span>
        </div>

        <button
          className='login__btn login__btn--outline'
          onClick={handleGuest}
        >
          <UserRound className='login__btn-icon' />
          Fortsätt som gäst
        </button>
      </div>
    </div>
  );
}
