'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from 'components/ui/button'
import { logout } from '@/actions/auth'

function DashboardNav() {
  const pathname = usePathname()

  const links = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/properties', label: 'Properties' },
    { href: '/dashboard/tenants', label: 'Tenants' },
  ]

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4">
        <nav className="flex items-center space-x-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm font-medium ${
                pathname === link.href ? 'text-primary' : 'text-muted-foreground'
              } transition-colors hover:text-primary`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
export default DashboardNav;