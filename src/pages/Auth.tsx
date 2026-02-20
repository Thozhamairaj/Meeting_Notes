import { SignIn } from "@clerk/clerk-react";
import { Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const clerkAppearance = {
  variables: {
    colorPrimary: "#06b6d4",
    colorBackground: "#0f172a",
    colorText: "#f1f5f9",
    colorInputBackground: "#1e293b",
    colorInputText: "#f1f5f9",
    borderRadius: "0.75rem",
    colorTextSecondary: "#94a3b8",
    fontFamily: "inherit",
  },
  elements: {
    card: "bg-slate-900 border border-white/10 shadow-2xl",
    headerTitle: "text-white font-bold",
    headerSubtitle: "text-slate-400",
    formButtonPrimary:
      "bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shadow-none",
    footerActionLink: "text-cyan-400 hover:text-cyan-300",
    formFieldLabel: "text-slate-300 text-sm",
    formFieldInput:
      "bg-slate-800 border-white/10 text-white placeholder:text-slate-500 focus:ring-cyan-400",
    dividerLine: "bg-white/10",
    dividerText: "text-slate-500",
    socialButtonsBlockButton:
      "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10",
    socialButtonsBlockButtonText: "text-slate-200 font-medium",
    identityPreviewText: "text-slate-200",
    identityPreviewEditButtonIcon: "text-cyan-400",
    otpCodeFieldInput: "bg-slate-800 border-white/10 text-white",
    footer: "hidden",
  },
};

export function AuthPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="absolute inset-0 grid-accent opacity-20 pointer-events-none" aria-hidden />

      {/* Logo */}
      <Link to="/" className="relative mb-8 flex items-center gap-2 text-xl font-bold">
        <Sparkles className="h-6 w-6 text-cyan-400" />
        <span>MeetMind <span className="text-cyan-400">AI</span></span>
      </Link>

      {/* Tab toggle */}
      <div className="relative mb-6 flex rounded-xl border border-white/10 bg-white/5 p-1">
        <div className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-lg bg-cyan-500 transition-all duration-300" />
        <span className="relative z-10 px-8 py-2 text-sm font-semibold text-slate-950">Sign in</span>
        <Link
          to="/signup"
          className="relative z-10 px-8 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
        >
          Create account
        </Link>
      </div>

      {/* Clerk SignIn */}
      <SignIn
        routing="hash"
        afterSignInUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </div>
  );
}
