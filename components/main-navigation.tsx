'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  Gauge,
  AlertCircle,
  MessageSquare,
  BarChart3,
  History,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';

interface MainNavigationProps {
  hasActiveAlerts?: number;
  userName?: string;
}

export function MainNavigation({ hasActiveAlerts = 0, userName = 'User' }: MainNavigationProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path || pathname?.startsWith(path + '/');

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/vehicle/connect', label: 'Connect Vehicle', icon: Gauge },
    { href: '/vehicle/dashboard', label: 'Vehicle', icon: BarChart3 },
    { href: '/vehicle/diagnostics', label: 'Diagnostics', icon: AlertCircle, badge: hasActiveAlerts > 0 ? hasActiveAlerts : null },
    { href: '/vehicle/history', label: 'History', icon: History },
    { href: '/chatbot', label: 'AI Assistant', icon: MessageSquare },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <Gauge className="w-6 h-6 text-purple-600" />
            <span>AutoCares</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={active ? 'default' : 'ghost'}
                    size="sm"
                    className={`gap-2 relative ${active ? 'bg-purple-600 text-white' : ''}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden lg:inline">{item.label}</span>
                    {item.badge && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Alert Indicator */}
            {hasActiveAlerts > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 rounded-full">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-red-700">{hasActiveAlerts} Alert</span>
              </div>
            )}

            {/* Desktop User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden md:inline text-xs">{userName}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-semibold">Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/vehicle/connect')}>
                  <Gauge className="w-4 h-4 mr-2" />
                  <span>Vehicle Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs font-semibold">Help</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/chatbot')}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span>Get Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/auth/login')} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Navigation</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                      <Icon className="w-4 h-4 mr-2" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge className="ml-auto h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                          {item.badge}
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default MainNavigation;
