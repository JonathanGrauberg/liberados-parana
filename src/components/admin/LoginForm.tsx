"use client";

import { Eye, EyeOff } from "lucide-react";
import { useActionState, useState } from "react";
import { loginAction } from "@/lib/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  const [show, setShow] = useState(false);
  return (
    <form action={action} className="mt-8 space-y-4">
      <label className="block">
        <span className="eyebrow mb-3 block">Contraseña</span>
        <span className="relative block">
          <input
            name="password"
            type={show ? "text" : "password"}
            autoFocus
            required
            autoComplete="current-password"
            className="h-12 w-full border border-line bg-transparent px-4 pr-12 text-[16px] text-fg outline-none transition focus:border-line-strong"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-0 top-0 grid h-12 w-12 place-items-center text-muted hover:text-fg"
            aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </span>
      </label>
      {state?.error && <p className="border-l border-pink pl-3 text-sm text-pink">{state.error}</p>}
      <button disabled={pending} className="btn-solid w-full disabled:opacity-60">
        {pending ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
