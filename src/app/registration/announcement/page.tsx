
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import { getStages, type Tahap } from '@/lib/stageService';
import { Separator } from '@/components/ui/separator';

export default function AnnouncementPage() {
  const [publishedAnnouncements, setPublishedAnnouncements] = React.useState<Tahap[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const stages = getStages();
    const published = stages.filter(stage => stage.isAnnouncementPublished);
    setPublishedAnnouncements(published);
    setIsLoading(false);
  }, []);

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
        <CardContent className="text-left space-y-6">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Memuat pengumuman...</p>
          ) : publishedAnnouncements.length > 0 ? (
            publishedAnnouncements.map((stage, index) => (
              <div key={stage.id}>
                {index > 0 && <Separator className="my-8" />}
                 <h2 className="text-xl font-bold mb-4 text-primary">Pengumuman: {stage.name}</h2>
                <div
                  dangerouslySetInnerHTML={{ __html: stage.announcementContent || '<p>Konten tidak tersedia.</p>' }}
                />
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-10">
              Belum ada pengumuman yang dipublikasikan saat ini.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
