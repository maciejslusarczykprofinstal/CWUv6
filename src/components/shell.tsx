"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Home,
  Users,
  Shield,
  Briefcase,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  Search,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const navigation = [
  { name: "Strona główna", href: "/", icon: Home },
  { name: "Mieszkańcy", href: "/mieszkancy", icon: Users },
  { name: "Audytorzy", href: "/audytorzy", icon: Shield },
  { name: "Wykonawcy", href: "/wykonawcy", icon: Briefcase },
  { name: "Inwestorzy", href: "/inwestorzy", icon: TrendingUp },
  { name: "Komponenty", href: "/komponenty", icon: Settings },
];

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-border bg-background px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-2xl bg-primary flex items-center justify-center">
                <Home className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">PROF INSTAL</span>
            </Link>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          className={`
                            group flex gap-x-3 rounded-2xl p-2 text-sm font-semibold leading-6 transition-colors
                            ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "text-foreground hover:text-foreground hover:bg-muted"
                            }
                          `}
                        >
                          <Icon
                            className="h-6 w-6 shrink-0"
                            aria-hidden="true"
                          />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <Button variant="ghost" className="w-full justify-start">
                  <LogOut className="h-4 w-4 mr-2" />
                  Wyloguj
                </Button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="relative z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/80"
            onClick={() => setSidebarOpen(false)}
          />

          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  className="-m-2.5 p-2.5"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>

              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background px-6 pb-4">
                <div className="flex h-16 shrink-0 items-center">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-2xl bg-primary flex items-center justify-center">
                      <Home className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold">PROF INSTAL</span>
                  </Link>
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;

                          return (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={`
                                  group flex gap-x-3 rounded-2xl p-2 text-sm font-semibold leading-6 transition-colors
                                  ${
                                    isActive
                                      ? "bg-primary text-primary-foreground"
                                      : "text-foreground hover:text-foreground hover:bg-muted"
                                  }
                                `}
                                onClick={() => setSidebarOpen(false)}
                              >
                                <Icon
                                  className="h-6 w-6 shrink-0"
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-foreground lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="h-6 w-px bg-border lg:hidden" aria-hidden="true" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <form className="relative flex flex-1" action="#" method="GET">
              <label htmlFor="search-field" className="sr-only">
                Szukaj
              </label>
              <Search
                className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-muted-foreground ml-3"
                aria-hidden="true"
              />
              <Input
                id="search-field"
                className="block h-full w-full border-0 py-0 pl-10 pr-0 text-foreground placeholder:text-muted-foreground focus:ring-0 sm:text-sm"
                placeholder="Szukaj..."
                type="search"
                name="search"
              />
            </form>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-6 w-6" aria-hidden="true" />
                <Badge
                  variant="destructive"
                  className="absolute -mt-5 ml-2 px-1 min-w-[1.25rem] h-5"
                >
                  3
                </Badge>
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="-m-1.5 flex items-center p-1.5"
                  id="user-menu-button"
                  aria-expanded="false"
                  aria-haspopup="true"
                >
                  <span className="sr-only">Otwórz menu użytkownika</span>
                  <div className="h-8 w-8 rounded-2xl bg-muted flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span
                      className="ml-4 text-sm font-semibold leading-6 text-foreground"
                      aria-hidden="true"
                    >
                      Jan Kowalski
                    </span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
