import Link from "next/link";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <Card className="rounded-[11px] border-wp-card-border shadow-none">
      <CardHeader>
        <CardTitle className="font-heading text-[16px] font-bold">Create your account</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SignUpForm />
        <p className="text-center text-xs text-wp-ink-secondary">
          Already have an account?{" "}
          <Link href="/sign-in" className="font-semibold text-wp-accent">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
