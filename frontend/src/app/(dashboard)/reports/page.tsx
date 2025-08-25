'use client';
import Protected from '@/components/Protected';
import ReportTable from '@/components/ReportTable';
import CreateReportForm from '@/components/CreateReportForm';
import { useRef } from 'react';

/**
 * Simple “comunicación” con la tabla:
 * le pasamos un ref con un método `reload()` que la tabla expone.
 */
export default function ReportsPage() {
  const tableRef = useRef<{ reload: () => void } | null>(null);

  const handleCreated = () => {
    tableRef.current?.reload();
  };

  return (
    <Protected>
      <h1 className="text-xl font-semibold mb-3">Reportes</h1>
      <CreateReportForm onCreated={handleCreated} />
      <ReportTable ref={tableRef as any} />
    </Protected>
  );
}
