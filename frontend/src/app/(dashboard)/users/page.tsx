'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { ReportsAPI } from '@/lib/api';
import {
  PieChart, Pie, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';

type R = any;

// Paleta y mapeo de estado → color
const STATUS_COLORS: Record<string, string> = {
  recibido:      '#60a5fa', // azul
  en_evaluacion: '#f59e0b', // ámbar
  asignado:      '#a78bfa', // violeta
  en_progreso:   '#22c55e', // verde
  resuelto:      '#10b981', // teal
  otros:         '#9ca3af', // gris
};

function normStatus(r: R) {
  const s = String(r.status ?? r.estado ?? '').toLowerCase().trim();
  if (!s) return 'otros';
  return s as keyof typeof STATUS_COLORS;
}

export default function DashboardPage() {
  const [items, setItems] = useState<R[]>([]);

  useEffect(() => {
    ReportsAPI.list().then(setItems).catch(console.error);
  }, []);

  // Conteos por estado
  const byStatus = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const it of items) {
      const s = normStatus(it);
      acc[s] = (acc[s] ?? 0) + 1;
    }
    return acc;
  }, [items]);

  const pieData = useMemo(
    () =>
      Object.entries(byStatus).map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name] ?? STATUS_COLORS.otros,
      })),
    [byStatus]
  );

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <Card className="p-4">
        <h2 className="font-semibold mb-3">Totales por estado</h2>
        <div style={{ width: '100%', height: 280 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie dataKey="value" data={pieData} label>
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="font-semibold mb-3">Resumen</h2>
        <ul className="space-y-1">
          {Object.entries(byStatus).map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded"
                  style={{ background: STATUS_COLORS[k] ?? STATUS_COLORS.otros }}
                />
                {k.replace('_', ' ')}
              </span>
              <span className="font-semibold">{v}</span>
            </li>
          ))}
          {items.length === 0 && <li className="text-muted-foreground">Sin datos</li>}
        </ul>
      </Card>
    </div>
  );
}
