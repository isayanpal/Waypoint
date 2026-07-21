import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <Card className="rounded-[11px] border border-wp-card-border bg-wp-card shadow-none">
      <CardHeader>
        <div className="relative mb-2 grid grid-cols-2 rounded-full bg-wp-well p-1 text-center text-[13px] font-semibold">
          <div className="absolute inset-y-1 left-1 w-[calc(50%-4px)] translate-x-full rounded-full bg-wp-accent transition-transform" />
          <Link href="/sign-in" className="relative z-10 rounded-full py-1.5 text-wp-ink-secondary">
            Sign in
          </Link>
          <Link href="/sign-up" className="relative z-10 rounded-full py-1.5 text-white">
            Sign up
          </Link>
        </div>
        <CardTitle className="font-heading text-[24px] font-extrabold tracking-tight">Create account</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SignUpForm />
        <p className="text-center text-[13px] text-wp-ink-secondary">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-wp-accent">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
