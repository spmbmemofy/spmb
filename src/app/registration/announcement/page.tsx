
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';

export default function AnnouncementPage() {
  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <Megaphone size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Pengumuman</CardTitle>
          <CardDescription className="text-md">
            Informasi dan pengumuman penting terkait SPMB 2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground">Konten pengumuman akan ditampilkan di sini.</p>
        </CardContent>
      </Card>
    </div>
  );
}
