import { LoginForm } from "@/components/auth/LoginForm";
import { Tx } from "@/components/i18n/Tx";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  let next: string | undefined;
  try {
    next = (await searchParams).next;
  } catch {
    next = undefined;
  }

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-1 py-8">
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-bold text-[var(--accent)]">
          <Tx k="appName" />
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          <Tx k="shop" />
        </p>
      </div>
      <div className="card-panel">
        <LoginForm next={next} />
      </div>
    </div>
  );
}
