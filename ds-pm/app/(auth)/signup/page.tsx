import Link from 'next/link'
import { Input } from 'components/ui/input'
import { Button } from 'components/ui/button'
import prisma from '@/lib/db'
import { hash } from 'bcryptjs'
import { redirect } from 'next/navigation'

export default function SignupPage() {
  async function register(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const hashed = await hash(password, 12)
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
      },
    })

    if (user) redirect('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center">Create Account</h1>
        <form action={register} className="space-y-6">
          <Input name="name" label="Full Name" required placeholder='Name'/>
          <Input name="email" type="email" label="Email" required placeholder='Email' />
          <Input name="password" type="password" label="Password"placeholder='Password' required />
          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>
        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}