import { NextResponse } from 'next/server';
import { db } from '@/lib/mockdb';
import { z } from 'zod';

const CreateSchema = z.object({
  titulo: z.string().min(3),
  descripcion: z.string().min(3),
  tipo: z.enum(['academico','infraestructura']),
  lugar: z.string().min(2),
  creadoPor: z.string().min(2),
});

export async function GET() {
  return NextResponse.json(db.getReports());
}

export async function POST(req: Request) {
  const json = await req.json();
  const parsed = CreateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({error: parsed.error.flatten()}, { status: 400 });

  const r = {
    id: `r-${Date.now()}`,
    ...parsed.data,
    fechaCreacion: new Date().toISOString(),
    estado: 'recibido' as const,
    resuelto: false,
    respuestas: [],
  };
  db.addReport(r);
  return NextResponse.json(r, { status: 201 });
}
