import type React from "react"
import { useState } from "react"
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  Briefcase,
  X,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Sidebar() {

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Admins', href: '/admin/admins', icon: Users },
    { name: 'Ad Products', href: '/admin/ad-products', icon: FolderOpen },
    { name: 'Features', href: '/admin/features', icon: Briefcase },
  ]

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl">
            <div className="flex h-full flex-col">
              <div className="flex h-16 items-center justify-between border-b bg-white px-4">
                <Image
                  src="/images/logo-black.png"
                  alt="Spotify Advertising"
                  width={140}
                  height={40}
                  className="h-8 w-auto"
                  unoptimized
                />
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-6 w-6" />
                </Button>
              </div>
              <nav className="flex-1 space-y-1 bg-white px-2 py-4">
                {navigation.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        isActive
                          ? "bg-blue-50 border-r-2 border-blue-600 text-blue-700"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                        "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                      )}
                    >
                      <item.icon
                        className={cn(
                          isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                          "mr-3 h-5 w-5 flex-shrink-0"
                        )}
                      />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 items-center justify-center border-b bg-white px-4">
            <Image
              src="/images/logo-black.png"
              alt="Spotify Advertising"
              width={140}
              height={40}
              className="h-8 w-auto"
              unoptimized
            />
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      isActive
                        ? "bg-blue-50 border-r-2 border-blue-600 text-blue-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                    )}
                  >
                    <item.icon
                      className={cn(
                        isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 h-5 w-5 flex-shrink-0"
                      )}
                    />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </>
  )
}
