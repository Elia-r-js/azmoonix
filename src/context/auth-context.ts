import { createContext } from "react";
import type { RegisterInput, User } from "../lib/types";

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<User>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
