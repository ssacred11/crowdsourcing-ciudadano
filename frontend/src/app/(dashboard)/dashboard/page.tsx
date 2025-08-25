'use client';
import { useEffect, useMemo, useState } from 'react';
import { Report } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { PieChart, Pie, Tooltip, ResponsiveContainer } from 'recharts';
import Protected from '@/components/Protected';
import { ReportsAPI } from '@/lib/api'; // ← nuevo import

export default function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);

  // Antes: fetch('/api/reports')...
  useEffect(() => {
    ReportsAPI.list().then(setReports).catch((err) => {
      console.error('Error cargando reportes:', err);
      setReports([]); // fallback
    });
  }, []);

  const totals = useMemo(() => {
    const byEstado: Record<string, number> = {};
    const byTipo: Record<string, number> = {};
    reports.forEach((r) => {
      byEstado[r.estado] = (byEstado[r.estado] || 0) + 1;
      byTipo[r.tipo] = (byTipo[r.tipo] || 0) + 1;
    });
    return { byEstado, byTipo };
  }, [reports]);

  const pieData = Object.entries(totals.byTipo).map(([name, value]) => ({ name, value }));

  return (
    <Protected>
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Totales por tipo</h2>
          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie dataKey="value" data={pieData} label />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-4">
          <h2 className="font-semibold mb-3">Totales por estado</h2>
          <ul className="space-y-1">
            {Object.entries(totals.byEstado).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span>{k}</span>
                <span className="font-semibold">{v}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </Protected>
  );
}
