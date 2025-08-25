'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-store';
import { AuthAPI, setAuth } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { login: setAuthStore } = useAuth(); // guarda nombre/rol para la UI

  // Usuarios de prueba: alice (student), sofia (staff), admin (admin)
  const [username, setUsername] = useState('sofia');
  const [password, setPassword] = useState(''); // solo UI por ahora
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { access_token } = await AuthAPI.login({ username: username.trim() });
      setAuth(access_token); // ← Authorization global + guarda en localStorage

      // Mapeo simple username → rol de tu UI (para permisos visuales)
      const role = mapRole(username);
      setAuthStore({ nombre: username, role });

      router.push('/dashboard');
    } catch (err: any) {
      const status = err?.response?.status;
      const data   = err?.response?.data;
      console.error('LOGIN_ERR', status, data || err.message);
      alert(`Login falló (${status ?? 'sin código'}). ${typeof data === 'string' ? data : JSON.stringify(data)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto mt-16 bg-white rounded-2xl shadow p-6">
      <h1 className="text-xl font-semibold mb-6">Ingresar</h1>
      <form onSubmit={onSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <label className="text-sm">Usuario</label>
          <input
            className="border rounded-md p-2"
            placeholder="Tu usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div className="grid gap-2">
          <label className="text-sm">Contraseña</label>
          <input
            className="border rounded-md p-2"
            type="password"
            placeholder="Tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Ingresando…' : 'Entrar'}
        </Button>
        <p className="text-xs text-gray-500">
          Prueba con: <b>alice</b> (solo lectura), <b>sofia</b> (puede editar), <b>admin</b> (puede editar).
        </p>
      </form>
    </div>
  );
}

function mapRole(u: string): 'admin' | 'profesor' | 'encargado' | 'alumno' {
  const x = u.toLowerCase().trim();
  if (x === 'admin') return 'admin';
  if (x === 'sofia') return 'profesor';   // staff ≈ profesor/encargado en la UI
  return 'alumno';                        // alice
}
