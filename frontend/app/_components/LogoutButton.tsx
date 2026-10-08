"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
      type="button"
    >
      Cerrar sesión
    </button>
  );
}