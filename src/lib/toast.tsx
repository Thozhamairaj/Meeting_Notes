import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface Toast {
    id: number;
    message: string;
    type?: "success" | "info" | "warning" | "error";
}

interface ToastContextValue {
    toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const toast = useCallback((message: string, type: Toast["type"] = "success") => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3200);
    }, []);

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2" aria-live="polite">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        style={{ animation: "fadeUp 0.3s ease" }}
                        className={[
                            "flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-2xl backdrop-blur-xl",
                            t.type === "error"
                                ? "border-red-500/30 bg-red-500/15 text-red-200"
                                : t.type === "warning"
                                    ? "border-amber-400/30 bg-amber-400/15 text-amber-200"
                                    : "border-cyan-400/20 bg-slate-900/90 text-white",
                        ].join(" ")}
                    >
                        <span className={t.type === "error" ? "text-red-400" : t.type === "warning" ? "text-amber-300" : "text-cyan-300"}>
                            {t.type === "error" ? "✗" : "✓"}
                        </span>
                        {t.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used inside ToastProvider");
    return ctx.toast;
}
