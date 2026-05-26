import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { dbConnect } from "@/lib/mongoose"
import { User } from "@/models/user"

const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET

const DEFAULT_ADMIN_EMAIL = "foz.dce@gmail.com"

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

            await dbConnect()

            if (email === DEFAULT_ADMIN_EMAIL) {
                await User.findOneAndUpdate(
                    { email },
                    {
                        $set: {
                            role: "admin",
                            status: "ativo",
                            lastLoginAt: new Date(),
                            name: user.name ?? undefined,
                            avatarUrl: user.image ?? undefined,
                        },
                    },
                    { upsert: true, new: true }
                )
                return true
            }

            const dbUser = await User.findOne({ email, status: { $in: ["convidado", "ativo"] } })
            if (!dbUser) return false

            await User.updateOne(
                { email },
                {
                    $set: {
                        status: "ativo",
                        lastLoginAt: new Date(),
                        name: user.name ?? undefined,
                        avatarUrl: user.image ?? undefined,
                    },
                }
            )

            return true
        },

        async jwt({ token, user }) {
            if (user?.email) {
                await dbConnect()
                const dbUser = await User.findOne({ email: user.email.toLowerCase() }).lean() as any
                token.role = dbUser?.role ?? (user.email.toLowerCase() === DEFAULT_ADMIN_EMAIL ? "admin" : "membro")
                token.permissions = dbUser?.permissions ?? null
            }
            return token
        },

        async session({ session, token }) {
            if (token.role) {
                (session.user as any).role = token.role
                ;(session.user as any).permissions = token.permissions
            }
            return session
        },
    },
})
