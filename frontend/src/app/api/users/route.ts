import { NextResponse } from 'next/server';
import { db } from '@/lib/mockdb';
import { z } from 'zod';

const UpdateSchema = z.object({
  id: z.string(),
  role: z.enum(['admin','profesor','encargado','alumno']),
});

export async function GET() {
  return NextResponse.json(db.getUsers());
}

export async function PATCH(req: Request) {
  const json = await req.json();
  const parsed = UpdateSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({error: parsed.error.flatten()}, { status: 400 });
  const updated = db.updateUser(parsed.data.id, { role: parsed.data.role });
  if (!updated) return NextResponse.json({error:'Not found'}, {status:404});
  return NextResponse.json(updated);
}
