'use client'
import { signIn } from "next-auth/react";
import { Button } from "components/ui/button";
import { Input } from "components/ui/input";
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema } from '@/lib/schema'
import { useState } from 'react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const { register, handleSubmit, formState } = useForm({
    resolver: zodResolver(LoginSchema)
  })

  const onSubmit = async (data: any) => {
    setError(null)
    try {
      const result = await signIn('credentials', {
        ...data,
        redirect: false
      })

      if (result?.error) {
        setError("Invalid email or password")
        return
      }

      router.refresh()
      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      setError("An unexpected error occurred")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-center">Property Manager</h1>
        {error && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            type="email"
            label="Email"
            placeholder='Email'
            error={formState.errors.email}
            {...register('email')}
          />
          <Input
            type="password"
            label="Password"
            placeholder='Password'
            error={formState.errors.password}
            {...register('password')}
          />
          <Button 
            type="submit" 
            className="w-full"
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? "Signing In..." : "Sign In"}
          </Button>
        </form>
        <div className="text-center text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}