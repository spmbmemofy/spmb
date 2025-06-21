
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Database } from 'lucide-react';

export default function AllDataPage() {
  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <Database size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Semua Data</CardTitle>
          <CardDescription className="text-md">
            Halaman ini akan menampilkan semua data terkait pendaftaran.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">Konten untuk pengelolaan semua data akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
