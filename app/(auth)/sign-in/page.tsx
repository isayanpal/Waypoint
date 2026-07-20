import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <Card className="rounded-[11px] border border-wp-card-border bg-wp-card shadow-none">
      <CardHeader>
        <div className="relative mb-2 grid grid-cols-2 rounded-full bg-wp-well p-1 text-center text-[13px] font-semibold">
          <div className="absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full bg-wp-accent transition-transform" />
          <Link href="/sign-in" className="relative z-10 rounded-full py-1.5 text-white">
            Sign in
          </Link>
          <Link href="/sign-up" className="relative z-10 rounded-full py-1.5 text-wp-ink-secondary">
            Sign up
          </Link>
        </div>
        <CardTitle className="font-heading text-[22px] font-extrabold tracking-tight">Welcome back</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SignInForm />
        <p className="text-center text-xs text-wp-ink-secondary">
          New here?{" "}
          <Link href="/sign-up" className="font-semibold text-wp-accent">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
