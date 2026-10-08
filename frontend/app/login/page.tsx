export const instant = false;

import LoginForm from "@/app/_components/LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const rawNext = Array.isArray(sp.next) ? sp.next[0] : (sp.next ?? "/");
  // Evita open-redirect: solo acepta rutas absolutas locales.
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  return <LoginForm next={next} />;
}