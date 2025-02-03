
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "./db";
import { compare } from "bcryptjs";
import { LoginSchema } from "./schema";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const validated = LoginSchema.parse(credentials);
          
          const user = await prisma.user.findUnique({
            where: { email: validated.email }
          });

          if (!user || !user.password) return null;

          const isValid = await compare(validated.password, user.password);
          return isValid ? user : null;
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      }
    })
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.email) {
        const user = await prisma.user.findUnique({
          where: { email: token.email },
          include: { properties: true, tenants: true }
        });
        
        if (user) {
          session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            properties: user.properties,
            tenants: user.tenants
          };
        }
      }
      return session;
    }
  },
  pages: {
    signIn: "/login",
    error: "/login"
  },
  secret: process.env.NEXTAUTH_SECRET
};

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

export async function getCurrentUser() {
  try {
    const session = await auth();
    if (!session?.user?.email) return null;

    return await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        properties: true,
        tenants: true
      }
    });
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
}