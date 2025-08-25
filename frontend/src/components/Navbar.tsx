'use client';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-store';
import { ROLE_LABEL } from '@/lib/roles';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { isAuth, role, nombre, logout } = useAuth();
  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-3">
        <Link href="/" className="font-bold">Colegio • Incidencias</Link>
        <nav className="flex items-center gap-3">
          {isAuth && (
            <>
              <Link href="/dashboard">Dashboard</Link>
              <Link href="/reports">Reportes</Link>
              {role === 'admin' && <Link href="/users">Usuarios</Link>}
              <span className="text-sm opacity-70">{nombre} — {role && ROLE_LABEL[role]}</span>
              <Button variant="outline" onClick={logout}>Salir</Button>
            </>
          )}
          {!isAuth && <Link href="/login">Ingresar</Link>}
        </nav>
      </div>
    </header>
  );
}
