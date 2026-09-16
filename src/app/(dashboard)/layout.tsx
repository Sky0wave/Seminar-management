'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, PlusCircle, ListTodo, DoorOpen, LogOut, Bell, ShieldCheck } from 'lucide-react';
import { logout } from '@/app/login/actions';

const navItems = [
  { name: 'Timetable', href: '/', icon: Calendar },
  { name: 'Add Event', href: '/add', icon: PlusCircle },
  { name: 'Requests', href: '/requests', icon: ListTodo },
  { name: 'Rooms', href: '/rooms', icon: DoorOpen },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-gray-950 text-white font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-gray-800 flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/30">
            <Calendar className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">MedSchedule</h1>
            <p className="text-xs text-gray-400 font-medium">Seminar Rooms 1 &amp; 2</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-900/40 text-blue-400 border border-blue-900/50 shadow-sm'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 ${isActive ? 'text-blue-400' : 'text-gray-500'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Admin Badge & Logout */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <div className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-950/60 border border-gray-800/80 text-xs text-gray-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="truncate">Admin Authenticated</span>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center space-x-3 px-4 py-2.5 w-full text-sm font-medium text-gray-400 rounded-xl hover:bg-red-900/30 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-5 w-5 text-gray-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gray-950">
        {/* Top Header */}
        <header className="bg-gray-900/90 border-b border-gray-800 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-3 md:hidden">
            <Calendar className="h-6 w-6 text-blue-500" />
            <h1 className="text-lg font-bold text-white">MedSchedule</h1>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs text-gray-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Hospital Timetable System Online</span>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/"
              title="View Timetable & Approvals"
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700 text-xs font-medium text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <Bell className="h-4 w-4 text-amber-400" />
              <span>Approvals</span>
            </Link>

            <button onClick={() => logout()} className="md:hidden text-xs text-red-400 font-medium px-2 py-1">
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 relative">
          {children}
        </div>
      </main>
    </div>
  );
}
