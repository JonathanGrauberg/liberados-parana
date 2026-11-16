"use client";

import { Check, Eye, EyeOff, KeyRound } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { changePasswordAction } from "@/lib/actions";
import { Button, Card, Field, Input } from "./ui";

/** El local pone su propia contraseña del panel (nadie más la conoce). */
export function PasswordCard() {
  const [state, action, pending] = useActionState(changePasswordAction, null);
  const [show, setShow] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const ok = state && "ok" in state;

  useEffect(() => {
    if (ok) form.current?.reset();
  }, [state, ok]);

  const type = show ? "text" : "password";
  return (
    <Card>
      <form ref={form} action={action} className="space-y-4">
        <div>
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <KeyRound className="h-5 w-5" /> Contraseña del panel
          </h2>
          <p className="mt-1 text-sm text-text-mute">
            Elegí una contraseña propia del local. Al cambiarla, se cierra la sesión en las demás compus y celulares, y la contraseña anterior deja de funcionar.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Contraseña actual">
            <Input name="actual" type={type} required autoComplete="current-password" />
          </Field>
          <Field label="Nueva contraseña" hint="Mínimo 8 caracteres.">
            <Input name="nueva" type={type} required minLength={8} autoComplete="new-password" />
          </Field>
          <Field label="Repetí la nueva">
            <Input name="repetir" type={type} required minLength={8} autoComplete="new-password" />
          </Field>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={pending}>
            {pending ? "Guardando…" : "Cambiar contraseña"}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setShow((s) => !s)}>
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {show ? "Ocultar" : "Mostrar"}
          </Button>
          {state && "error" in state && <p className="text-sm font-medium text-red-600">{state.error}</p>}
          {ok && (
            <p className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
              <Check className="h-4 w-4" /> Listo, la contraseña nueva ya está activa. Anotala en un lugar seguro.
            </p>
          )}
        </div>
      </form>
    </Card>
  );
}
