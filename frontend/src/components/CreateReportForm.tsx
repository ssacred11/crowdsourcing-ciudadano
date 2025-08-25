'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ReportsAPI } from '@/lib/api';

type Props = {
  onCreated?: () => void;  // callback para recargar la tabla
};

export default function CreateReportForm({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDesc] = useState('');
  const [typeId, setTypeId] = useState<number>(1);
  const [areaId, setAreaId] = useState<number>(1);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const disabled = !title.trim() || !description.trim() || saving;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled) return;
    try {
      setSaving(true);
      await ReportsAPI.create({
        title: title.trim(),
        description: description.trim(),
        type_id: typeId,
        area_id: areaId,
      });
      setTitle(''); setDesc('');
      if (onCreated) onCreated();
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-4">
      {!open ? (
        <Button onClick={() => setOpen(true)}>+ Nuevo reporte</Button>
      ) : (
        <form onSubmit={submit} className="grid gap-3 p-4 border rounded-xl">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Título</label>
            <input
              className="border rounded-md px-3 py-2"
              placeholder="Ej: Luz quemada en aula 3"
              value={title}
              onChange={e=>setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-1">
            <label className="text-sm font-medium">Descripción</label>
            <textarea
              className="border rounded-md px-3 py-2 min-h-[90px]"
              placeholder="Cuéntanos el detalle…"
              value={description}
              onChange={e=>setDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Tipo (id)</label>
              <input
                type="number"
                min={1}
                className="border rounded-md px-3 py-2"
                value={typeId}
                onChange={e=>setTypeId(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Área (id)</label>
              <input
                type="number"
                min={1}
                className="border rounded-md px-3 py-2"
                value={areaId}
                onChange={e=>setAreaId(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={disabled}>
              {saving ? 'Guardando…' : 'Crear reporte'}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
