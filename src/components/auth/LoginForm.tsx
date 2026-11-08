"use client";

import { useState, useTransition } from "react";
import { loginAction } from "@/app/actions/auth";
import { FormField, Input, Button } from "@/components/ui/FormField";
import { Flash } from "@/components/vouchers/Flash";

export function LoginForm({ next }: { next?: string }) {
  const [pending, start] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const res = await loginAction({ email, password, next });
          if (res && !res.ok) setError(res.error);
        });
      }}
    >
      <h2 className="font-display text-lg font-semibold">Sign in</h2>
      <Flash error={error} />
      <FormField label="Email">
        <Input
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
        />
      </FormField>
      <FormField label="Password">
        <Input
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </FormField>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "…" : "Sign in"}
      </Button>
    </form>
  );
}
