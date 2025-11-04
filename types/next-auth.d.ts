import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      username: string
      role: string
      name?: string
      image?: string
    }
  }

  interface User {
    id: string
    email: string
    username: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    username: string
    role: string
  }
}