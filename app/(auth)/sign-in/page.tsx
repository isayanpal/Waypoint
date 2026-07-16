import Link from "next/link";
import { SignInForm } from "@/components/auth/sign-in-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <Card className="rounded-[11px] border-wp-card-border shadow-none">
      <CardHeader>
        <CardTitle className="font-heading text-[18.5px] font-bold">Sign in</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SignInForm />
        <p className="text-center text-xs text-wp-ink-secondary">
          Don&apos;t have an account?{" "}
          <Link href="/sign-up" className="font-semibold text-wp-accent">
            Sign up
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
