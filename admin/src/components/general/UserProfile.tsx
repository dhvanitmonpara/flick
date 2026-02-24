import useProfileStore from '@/store/profileStore'
import { Link, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { LogOut } from 'lucide-react'
import { authClient } from '@/lib/auth-client'

function UserProfile() {
  const { profile, removeProfile } = useProfileStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authClient.signOut();
    removeProfile();
    navigate('/auth/signin');
  }

  return (
    <>
      {profile?.id
        ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="cursor-pointer">
                <Avatar>
                  <AvatarImage src={profile.image || ''} />
                  <AvatarFallback>{profile.name?.charAt(0) || 'A'}</AvatarFallback>
                </Avatar>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-800 text-zinc-100">
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-400 focus:bg-zinc-800">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
        : <Link className="bg-zinc-800 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-300 px-3 py-1 rounded-sm transition-colors" to="/auth/signin">Sign in</Link>
      }
    </>
  )
}

export default UserProfile