"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Menu,
  X,
  Home,
  Users,
  Shield,
  Briefcase,
  TrendingUp,
} from "lucide-react";

const navigation = [
  { name: "Strona główna", href: "/", icon: Home },
  { name: "Mieszkańcy", href: "/mieszkancy", icon: Users },
  { name: "Audytorzy", href: "/audytorzy", icon: Shield },
  { name: "Wykonawcy", href: "/wykonawcy", icon: Briefcase },
  { name: "Inwestorzy", href: "/inwestorzy", icon: TrendingUp },
  { name: "Sponsorzy", href: "/sponsorzy", icon: Briefcase },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-200 sticky top-0 z-50">
      <div className="container-responsive">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-xl font-bold text-neutral-900 hover:text-primary-600 transition-colors"
            >
              Portal PI
            </Link>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary-600 text-white shadow-md"
                          : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-2xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Otwórz menu główne</span>
              {mobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white/95 backdrop-blur-md border-t border-neutral-200">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 rounded-2xl text-base font-medium transition-all duration-200
                    ${
                      isActive
                        ? "bg-primary-600 text-white shadow-md"
                        : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                    }
                  `}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
