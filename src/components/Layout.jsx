import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { Button } from './ui/button'
import { Moon, Sun, LogOut, Plus, LayoutDashboard } from 'lucide-react'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/signin')
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
              <Link to="/dashboard" className="text-lg sm:text-xl font-bold truncate">
                Task Manager
              </Link>
              <div className="hidden sm:flex items-center gap-2 sm:gap-4">
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <LayoutDashboard className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/task/new">
                  <Button variant="ghost" size="sm" className="hidden md:inline-flex">
                    <Plus className="h-4 w-4 mr-2" />
                    New Task
                  </Button>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Plus className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="hidden sm:inline text-xs sm:text-sm text-muted-foreground truncate max-w-[120px] sm:max-w-none">
                {user?.name} ({user?.role})
              </span>
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9 sm:h-10 sm:w-10">
                {theme === 'light' ? <Moon className="h-4 w-4 sm:h-5 sm:w-5" /> : <Sun className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden sm:inline-flex">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="sm:hidden">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {children}
      </main>
    </div>
  )
}

