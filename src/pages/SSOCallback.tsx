import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";

export function SSOCallbackPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
            <AuthenticateWithRedirectCallback />
        </div>
    );
}
