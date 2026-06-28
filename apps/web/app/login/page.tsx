import type { Metadata } from "next";
import { LoginClient } from "@/components/login-client";
export const metadata: Metadata = { title: "Đăng nhập" };
export default function LoginPage() { return <LoginClient />; }
