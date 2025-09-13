import { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_COOKIE, verifyToken } from "@/lib/authTokens";

export const runtime = "nodejs";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = cookies().get(ACCESS_COOKIE)?.value;
  const verified = verifyToken(access);
  if (!verified.ok) {
    redirect("/auth");
  }
  return <>{children}</>;
}
