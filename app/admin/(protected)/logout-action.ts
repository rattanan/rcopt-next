"use server";
import { redirect } from "next/navigation";
import { destroyAdminSession } from "@/lib/auth/session";
export async function adminLogout(): Promise<never> { await destroyAdminSession(); redirect("/admin/login"); }
