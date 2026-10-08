export type Role = "supervisor" | "mantenimiento";

/** Sesión/identidad de usuario (lo que viaja en el JWT). */
export interface SessionUser {
  id: number;
  username: string;
  role: Role;
  full_name: string;
}