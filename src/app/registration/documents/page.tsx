
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';

export default function DocumentsPage() {
  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <FileText size={40} />
          </div>
          <CardTitle className="text-3xl font-headline">Unggah Dokumen Pendaftaran</CardTitle>
          <CardDescription className="text-md">
            Silakan unggah dokumen yang diperlukan untuk melanjutkan proses pendaftaran.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              Fitur unggah dokumen akan tersedia di sini.
            </p>
            {/* Placeholder for document upload form or components */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
