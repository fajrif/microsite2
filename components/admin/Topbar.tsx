import { useSession, signOut } from 'next-auth/react'
import { useState } from 'react'
import {
    Settings,
    Menu,
    LogOut,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChangePasswordDialog } from '@/components/admin/ChangePasswordDialog'

export default function Topbar() {

    const { data: session } = useSession()
    const [changePasswordOpen, setChangePasswordOpen] = useState(false)

    const handleLogout = async () => {
        await signOut({ callbackUrl: '/admin/login' })
    }

    return (
        <>
            {/* Top navigation */}
            <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white border-b border-gray-200">
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open sidebar</span>
                </Button>

                <div className="flex flex-1 justify-between px-4">
                    <div className="flex flex-1">
                        <div className="flex w-full md:ml-0">
                            <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                                {/* Search can be added here */}
                            </div>
                        </div>
                    </div>
                    <div className="ml-4 flex items-center md:ml-6">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Admin" />
                                        <AvatarFallback>AD</AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56" align="end" forceMount>
                                <DropdownMenuLabel className="font-normal">
                                    <div className="flex flex-col space-y-1">
                                        <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                                        <p className="text-xs leading-none text-muted-foreground">{session?.user?.email}</p>
                                    </div>
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => setChangePasswordOpen(true)}
                                >
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Change Password</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    <span>Log out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {/* Change password dialog */}
            <ChangePasswordDialog
                open={changePasswordOpen}
                onOpenChange={setChangePasswordOpen}
                userId={session?.user?.id || ''}
                userData={{
                    email: session?.user?.email || '',
                    full_name: session?.user?.name || '',
                    phone: (session?.user as any)?.phone || '',
                }}
            />
        </>
    )
}
