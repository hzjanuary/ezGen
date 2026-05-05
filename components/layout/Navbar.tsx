// ============================================================
// ezGen — Navbar Component
// Navigation bar với glassmorphism, responsive menu
// ============================================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  LayoutDashboard,
  Images,
  Menu,
  X,
} from 'lucide-react';

const navLinks = [
  { href: '/', label: 'Trang chủ', icon: Sparkles },
  { href: '/dashboard', label: 'Không gian sáng tạo', icon: LayoutDashboard },
  { href: '/gallery', label: 'Gallery', icon: Images },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav
      className="glass-strong fixed top-0 left-0 right-0 z-50"
      id="main-navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group"
            id="nav-logo"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center transition-transform group-hover:scale-110">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold gradient-text">
              ezGen
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  id={`nav-${link.href.replace('/', '') || 'home'}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-[var(--primary)]/15 text-[var(--primary)] border border-[var(--primary)]/20'
                      : 'text-[var(--muted-fg)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* CTA Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/dashboard" className="btn-primary text-sm">
              Bắt đầu sáng tạo ✨
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-[var(--muted-fg)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            id="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass animate-fade-in border-t border-[var(--border-color)]">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                      : 'text-[var(--muted-fg)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <div className="pt-2">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-primary text-sm w-full block text-center"
              >
                Bắt đầu sáng tạo ✨
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
