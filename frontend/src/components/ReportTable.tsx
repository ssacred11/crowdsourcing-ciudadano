'use client';

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { Report, ReportStatus } from '@/lib/types';
import { useAuth } from '@/lib/auth-store';
import { CAN } from '@/lib/roles';
import { Button } from '@/components/ui/button';
import { ReportsAPI } from '@/lib/api';

const NEXT: ReportStatus[] = [
  'recibido',
  'en_evaluacion',
  'asignado',
  'en_progreso',
  'resuelto',
];

export type ReportTableRef = { reload: () => void };

// Debounce simple
function useDebounced<T>(value: T, delay = 300) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const ReportTable = forwardRef<ReportTableRef>(function ReportTable(_props, ref) {
  const [reports, setReports] = useState<Report[]>([]);
  const { role, nombre } = useAuth();

  const [query, setQuery] = useState('');
  const q = useDebounced(query, 250);

  const [estado, setEstado] = useState<
    'todos' | 'en_evaluacion' | 'en_proceso' | 'resuelto'
  >('todos');

  // Modal de eliminar
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => ReportsAPI.list().then(setReports);
  useEffect(() => { load(); }, []);
  useImperativeHandle(ref, () => ({ reload: load }), [load]);

  const canEdit = (r: Report) => {
    if (r.tipo === 'academico') return role && CAN.EDIT_ACADEMIC_REPORT.includes(role);
    if (r.tipo === 'infraestructura') return role && CAN.EDIT_INFRA_REPORT.includes(role);
    // Si no viene tipo, permite a staff/admin
    return !!role && (CAN.EDIT_INFRA_REPORT.includes(role) || CAN.EDIT_ACADEMIC_REPORT.includes(role));
  };

  const normStatus = (r: Report) =>
    String((r.estado as string) ?? (r.status as string) ?? '').toLowerCase().trim();

  const normTitle = (r: Report) =>
    String((r.titulo as string) ?? (r.title as string) ?? '').toLowerCase();

  const filtered = useMemo(() => {
    return reports.filter((r) => {
      const s = normStatus(r);
      const t = normTitle(r);
      const matchText = !q || t.includes(q.toLowerCase());
      const matchEstado =
        estado === 'todos'
          ? true
          : estado === 'en_proceso'
          ? ['en_progreso', 'asignado'].includes(s)
          : s === estado;
      return matchText && matchEstado;
    });
  }, [reports, q, estado]);

  // ====== Acciones con UI optimista ======

  async function updateEstado(id: string, estado: ReportStatus) {
    // Optimista: aplico el cambio localmente para que el usuario lo vea de inmediato.
    setReports(prev => prev.map(it => it.id === id ? { ...it, status: estado, estado } : it));

    try {
      await ReportsAPI.update(id, { status: estado }); // backend devuelve 200 pero puede no persistir
    } catch (err) {
      // Si falló, deshago cambio volviendo a cargar
      console.error('PATCH status failed', err);
      load();
    }
  }

  async function responder(id: string, texto: string) {
    // Optimista: guardo respuesta en memoria
    setReports(prev =>
      prev.map(it => it.id === id ? { ...it, response_text: texto, response_author: nombre } : it)
    );

    try {
      await ReportsAPI.update(id, { response_text: texto, response_author: nombre });
    } catch (err) {
      console.error('PATCH response failed', err);
      load();
    }
  }

  async function borrar() {
    if (!toDelete) return;
    setDeleting(true);

    // Optimista: retiro el elemento de la lista
    const backup = reports;
    setReports(prev => prev.filter(x => x.id !== toDelete));

    try {
      await ReportsAPI.delete(toDelete); // funcionará cuando el backend tenga DELETE
    } catch (e) {
      console.warn('DELETE no disponible o falló. Restauro lista.', e);
      setReports(backup); // restaurar si falló
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  return (
    <>
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input
          className="border rounded-md px-3 py-2"
          placeholder="Buscar por título…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {(['todos', 'en_evaluacion', 'en_proceso', 'resuelto'] as const).map((opt) => (
          <Button
            key={opt}
            variant={estado === opt ? 'default' : 'outline'}
            onClick={() => setEstado(opt)}
          >
            {opt.replace('_', ' ')}
          </Button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Título</th>
              <th className="p-2">Estado</th>
              <th className="p-2">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">{(r.titulo as string) ?? (r.title as string)}</td>
                <td className="p-2">{normStatus(r) || '—'}</td>
                <td className="p-2 flex gap-2 flex-wrap">
                  {canEdit(r) &&
                    NEXT.map((s) => (
                      <Button
                        key={s}
                        variant="outline"
                        onClick={() => updateEstado(r.id, s)}
                      >
                        {s.replace('_', ' ')}
                      </Button>
                    ))}

                  {canEdit(r) && <RespondInline onSend={(txt) => responder(r.id, txt)} />}

                  {role === 'admin' && (
                    <Button variant="destructive" onClick={() => setToDelete(r.id)}>
                      Eliminar
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="p-4 text-muted-foreground" colSpan={3}>
                  Sin reportes
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación para eliminar */}
      {toDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 grid place-items-center bg-black/40 p-4 z-50"
        >
          <div className="bg-white rounded-xl shadow p-6 max-w-sm w-full">
            <h3 className="font-semibold mb-2">Eliminar reporte</h3>
            <p className="text-sm text-gray-600 mb-4">
              Esta acción no se puede deshacer. ¿Seguro que deseas eliminarlo?
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setToDelete(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={borrar} disabled={deleting}>
                {deleting ? 'Eliminando…' : 'Eliminar'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

export default ReportTable;

// --- Respuesta rápida inline ---
function RespondInline({ onSend }: { onSend: (t: string) => void }) {
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState('');
  return !open ? (
    <Button onClick={() => setOpen(true)}>Responder</Button>
  ) : (
    <div className="flex items-center gap-2">
      <input
        className="border rounded-md px-2 py-1"
        placeholder="Escribe una respuesta…"
        value={txt}
        onChange={(e) => setTxt(e.target.value)}
      />
      <Button
        onClick={() => {
          if (txt.trim()) {
            onSend(txt.trim());
            setTxt('');
            setOpen(false);
          }
        }}
      >
        Enviar
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          setOpen(false);
          setTxt('');
        }}
      >
        Cancelar
      </Button>
    </div>
  );
}
