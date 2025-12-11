import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const { username, password } = credentials || {};

      // 1. Logika User MPP
      if (username === process.env.MPP_USER && password === process.env.MPP_PASS) {
        return { id: "1", name: "Petugas MPP", role: "mpp" };
      }

      // 2. Logika User DLH
      if (username === process.env.DLH_USER && password === process.env.DLH_PASS) {
        return { id: "2", name: "Admin DLH", role: "dlh" };
      }

        // Jika salah
        return null;
      }
    })
  ],
  callbacks: {
    // Memasukkan 'role' ke dalam token JWT
    async jwt({ token, user }: any) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    // Memasukkan 'role' ke dalam session agar bisa dibaca di frontend
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Halaman login custom kita
  }
});

export { handler as GET, handler as POST };