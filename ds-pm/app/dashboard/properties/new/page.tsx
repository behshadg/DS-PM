'use client'
import { PropertyForm } from 'components/property-form'
import { useRouter } from 'next/navigation'

export default function NewPropertyPage() {
  const router = useRouter()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Add New Property</h1>
        <button 
          onClick={() => router.back()}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Cancel
        </button>
      </div>
      <PropertyForm 
        onSuccess={() => {
          router.refresh()
          router.push('/dashboard/properties')
        }}
      />
    </div>
  )
}