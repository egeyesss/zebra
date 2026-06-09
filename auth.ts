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
  callbacks: {
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
