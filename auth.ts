import NextAuth, { type DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";

// Expose user.id (Google's stable `sub`) on the session object so API routes
// can use it as the primary key in the streaks table.
declare module "next-auth" {
  interface Session {
    user: { id: string } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  trustHost: true,
  callbacks: {
    // Persist the provider account ID into the JWT on first sign-in so it
    // survives subsequent requests where `account` is no longer passed.
    jwt({ token, account }) {
      if (account?.providerAccountId) {
        token.userId = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      if (token.userId) session.user.id = token.userId as string;
      return session;
    },
  },
});
