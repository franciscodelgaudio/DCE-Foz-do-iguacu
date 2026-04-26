import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET

const ALLOWED_EMAILS = new Set([
  "delgaudiofrancisco.junior@gmail.com",
  "foz.dce@gmail.com",
  "foz.dce@unioeste.br",
  "alcierisxp@gmail.com",
  "pietramartins86@gmail.com",
  "beatriz.divino01@gmail.com"
])

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, profile }) {
      const email = user.email?.toLowerCase()
      if (!email) return false

      const emailVerified = (profile as Record<string, unknown> | undefined)?.email_verified
      if (emailVerified === false) return false

      return ALLOWED_EMAILS.has(email)
    },
  },
})
