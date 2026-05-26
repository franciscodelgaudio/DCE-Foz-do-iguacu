'use server'

import { signIn } from '@/auth'
import { signOut } from "@/auth"

export async function signInWithGoogle() {
    await signIn('google', { redirectTo: '/dashboard' })
}

export async function logout() {
    await signOut({ redirectTo: "/home" })
}