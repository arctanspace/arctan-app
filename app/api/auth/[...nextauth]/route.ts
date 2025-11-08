import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleId = process.env.GOOGLE_CLIENT_ID || "";
const googleSecret = process.env.GOOGLE_CLIENT_SECRET || "";

export const authOptions: NextAuthOptions = {
  providers:
    googleId && googleSecret
      ? [
          GoogleProvider({
            clientId: googleId,
            clientSecret: googleSecret,
            authorization: {
              params: {
                scope:
                  "openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.send",
                prompt: "consent",
                access_type: "offline",
              },
            },
          }),
        ]
      : [],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.access_token = account.access_token;
        token.refresh_token = account.refresh_token;

        const expiresInRaw = account.expires_in;
        const expiresInSeconds =
          typeof expiresInRaw === "number"
            ? expiresInRaw
            : typeof expiresInRaw === "string"
            ? Number.parseInt(expiresInRaw, 10)
            : null;

        const expiresInMs =
          typeof expiresInSeconds === "number" && Number.isFinite(expiresInSeconds)
            ? expiresInSeconds * 1000
            : 0;

        token.expires_at = Date.now() + expiresInMs;
      }
      if (profile?.email) token.user_email = profile.email as string;
      return token;
    },
    async session({ session, token }) {
      (session as any).user_email = token.user_email as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "local-dev-secret",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
