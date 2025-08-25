import './globals.css';
import { Navbar } from '@/components/Navbar';

export const metadata = { title: 'Colegio - Reportes', description: 'Panel de incidencias' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-neutral-50 text-neutral-900">
        <Navbar />
        <main className="max-w-6xl mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}
