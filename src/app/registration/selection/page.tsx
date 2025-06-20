
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';

export default function SelectionPage() {
  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <ClipboardCheck size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Proses Seleksi</CardTitle>
          <CardDescription className="text-md">
            Informasi dan status mengenai proses seleksi pendaftaran.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              Fitur dan informasi terkait proses seleksi akan tersedia di sini.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
