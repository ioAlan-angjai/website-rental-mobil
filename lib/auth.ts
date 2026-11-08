import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import { compare } from "bcryptjs";

const providers: any[] = [
  CredentialsProvider({
    name: "credentials",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      rememberMe: { label: "Remember Me", type: "checkbox" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) {
        throw new Error("Email dan password harus diisi");
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user || !user.password) {
        throw new Error("Email atau password salah");
      }

      const isPasswordValid = await compare(
        credentials.password,
        user.password
      );

      if (!isPasswordValid) {
        throw new Error("Email atau password salah");
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }
  })
];

// Add Google OAuth Provider if credentials exist or fallback
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    })
  );
} else {
  // Demo / fallback configuration for development
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "demo-google-client-id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "demo-google-client-secret",
      allowDangerousEmailAccountLinking: true,
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! }
          });

          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name || "",
                role: "USER",
                emailVerified: new Date(),
              }
            });
          }
          return true;
        } catch (error) {
          console.error("Google sign in error:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role || "USER";
      } else if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email }
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("JWT callback error:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role || "USER";
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 jam default
  },
  secret: process.env.NEXTAUTH_SECRET,
};

