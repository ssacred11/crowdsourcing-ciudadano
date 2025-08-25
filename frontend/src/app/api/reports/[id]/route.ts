import { NextResponse } from 'next/server';
import { db } from '@/lib/mockdb';
import { z } from 'zod';

const UpdateSchema = z.object({
  estado: z.enum(['recibido','en_evaluacion','asignado','en_progreso','resuelto']).optional(),
  resuelto: z.boolean().optional(),
  respuesta: z.object({
    autor: z.string(),
    texto: z.string().optional(),
    fotoUrl: z.string().url().optional(),
  }).optional(),
});

export async function GET(_: Request, { params }: { params: { id: string }}) {
  const r = db.getReport(params.id);
  if (!r) return NextResponse.json({error: 'Not found'}, {status:404});
  return NextResponse.json(r);
}

export async function PATCH(req: Request, { params }: { params: { id: string }}) {
  const json = await req.json();
  const parsed = UpdateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({error: parsed.error.flatten()}, { status: 400 });

  if (parsed.data.respuesta) {
    const updated = db.addRespuesta(params.id, { ...parsed.data.respuesta, fecha: new Date().toISOString() });
    if (!updated) return NextResponse.json({error:'Not found'}, {status:404});
    return NextResponse.json(updated);
  }

  const updated = db.updateReport(params.id, parsed.data);
  if (!updated) return NextResponse.json({error:'Not found'}, {status:404});
  return NextResponse.json(updated);
}
