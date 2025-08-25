'use client';
import { useAuth } from '@/lib/auth-store';
import type { Role } from '@/lib/roles';

export default function RoleGuard({ allow, children }: { allow: Role[]; children: React.ReactNode }) {
  const { role } = useAuth();
  if (!role || !allow.includes(role)) return null;
  return <>{children}</>;
}
