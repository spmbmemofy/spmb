
"use client";

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Megaphone } from 'lucide-react';
import { getStages, type Tahap } from '@/lib/stageService';
import { getApplicants, type Applicant } from '@/lib/applicantService';
import { getJalur, type Jalur } from '@/lib/pathwayService';
import { getSchoolById } from '@/lib/schoolService';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AnnouncementPage() {
  const [publishedAnnouncements, setPublishedAnnouncements] = React.useState<Tahap[]>([]);
  const [allApplicants, setAllApplicants] = React.useState<Applicant[]>([]);
  const [allPathways, setAllPathways] = React.useState<Jalur[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const stages = getStages();
    const published = stages.filter(stage => stage.isAnnouncementPublished);
    setPublishedAnnouncements(published);
    setAllApplicants(getApplicants());
    setAllPathways(getJalur());
    setIsLoading(false);
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <Megaphone size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Pengumuman Hasil Seleksi</CardTitle>
          <CardDescription className="text-md">
            Informasi hasil akhir kelulusan pendaftar SPMB 2026.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-left space-y-8">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Memuat pengumuman...</p>
          ) : publishedAnnouncements.length > 0 ? (
            publishedAnnouncements.map((stage, index) => {
                const stagePathways = allPathways.filter(p => p.tahapId === stage.id).map(p => p.name);
                const relevantApplicants = allApplicants.filter(app => 
                    stagePathways.includes(app.jalur) && app.diterimaDiSekolahId
                ).sort((a, b) => {
                    const schoolA = getSchoolById(a.diterimaDiSekolahId!)?.namaSekolah || '';
                    const schoolB = getSchoolById(b.diterimaDiSekolahId!)?.namaSekolah || '';
                    if (schoolA < schoolB) return -1;
                    if (schoolA > schoolB) return 1;
                    return (a.peringkat || Infinity) - (b.peringkat || Infinity);
                });

                return (
                    <div key={stage.id}>
                        {index > 0 && <Separator className="my-8" />}
                        <h2 className="text-xl font-bold mb-4 text-primary">Hasil Seleksi: {stage.name}</h2>
                        {relevantApplicants.length > 0 ? (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>No.</TableHead>
                                            <TableHead>Nama Pendaftar</TableHead>
                                            <TableHead>NISN</TableHead>
                                            <TableHead>Diterima di Sekolah</TableHead>
                                            <TableHead>Jalur</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {relevantApplicants.map((app, appIndex) => (
                                            <TableRow key={app.id}>
                                                <TableCell>{appIndex + 1}</TableCell>
                                                <TableCell>{app.fullName}</TableCell>
                                                <TableCell>{app.nisn}</TableCell>
                                                <TableCell>{getSchoolById(app.diterimaDiSekolahId!)?.namaSekolah}</TableCell>
                                                <TableCell>{app.jalur}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">
                                Tidak ada pendaftar yang lulus seleksi pada tahap ini.
                            </p>
                        )}
                    </div>
                );
            })
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
