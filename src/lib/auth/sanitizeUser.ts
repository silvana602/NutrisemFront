import type { User } from "@/types/user";

export function sanitizeUser(user: User): User {
  return {
    ...user,
    password: "",
  };
}
