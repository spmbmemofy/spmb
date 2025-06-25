
"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCircle, School, Star, TrendingUp, BookOpen, CheckCircle, Clock, XCircle, Building } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { getApplicantById, getApplicants } from "@/lib/applicantService";
import { getSchoolById } from "@/lib/schoolService";
import type { Applicant, ApplicantStatus, Jalur } from "@/lib/types";

const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Terverifikasi": return "default";
    case "Menunggu Verifikasi": return "secondary";
    case "Berkas tidak sesuai": return "destructive";
    default: return "secondary";
  }
};

const getStatusIcon = (status: ApplicantStatus) => {
    switch (status) {
        case "Terverifikasi": return <CheckCircle className="h-5 w-5 text-green-600" />;
        case "Menunggu Verifikasi": return <Clock className="h-5 w-5 text-yellow-500" />;
        case "Berkas tidak sesuai": return <XCircle className="h-5 w-5 text-red-600" />;
        default: return <Clock className="h-5 w-5 text-yellow-500" />;
    }
};


const calculateScoreForSchool = (
  applicant: Applicant,
  schoolId: string,
): number => {
    const totalNilaiRapor = Object.values(applicant.semesterGrades).reduce((a, b) => a + b, 0);
    const nilaiPrestasi = applicant.jalur === 'Prestasi' ? (applicant.nilaiPrestasi || 0) : 0;
    const isFirstChoice = applicant.schoolSelections && applicant.schoolSelections[0]?.schoolId === schoolId;
    const nilaiTambahan = isFirstChoice ? 25 : 0;
    return totalNilaiRapor + nilaiPrestasi + nilaiTambahan;
}


export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const applicantId = params.id as string;

  const [applicant, setApplicant] = React.useState<Applicant | null>(null);
  const [allApplicants, setAllApplicants] = React.useState<Applicant[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const foundApplicant = getApplicantById(applicantId);
    setApplicant(foundApplicant || null);
    setAllApplicants(getApplicants());
    setIsLoading(false);
  }, [applicantId]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p>Memuat data pendaftar...</p>
      </div>
    );
  }

  if (!applicant) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Pendaftar Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Maaf, data untuk pendaftar ini tidak dapat ditemukan.</p>
          </CardContent>
          <CardFooter>
            <Button className="mx-auto" onClick={() => router.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center space-x-3">
              <UserCircle className="h-8 w-8 text-primary" />
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-headline">{applicant.fullName}</CardTitle>
            </div>
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
            </Button>
          </div>
          <CardDescription>Detail pendaftaran dan status peringkat calon siswa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold mb-3 text-primary">Informasi Pendaftar</h3>
            <div className="space-y-2 rounded-md border p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <div><span className="font-medium text-muted-foreground">NISN:</span> {applicant.nisn}</div>
                    <div><span className="font-medium text-muted-foreground">Asal Sekolah:</span> {applicant.asalSekolahNama}</div>
                    <div>
                        <span className="font-medium text-muted-foreground">Status:</span>
                        <Badge variant={getStatusBadgeVariant(applicant.statusVerifikasi)} className="ml-2">
                            {getStatusIcon(applicant.statusVerifikasi)}
                            <span className="ml-1.5">{applicant.statusVerifikasi}</span>
                        </Badge>
                    </div>
                    <div><span className="font-medium text-muted-foreground">Jalur:</span> {applicant.jalur}</div>
                </div>
                {applicant.statusVerifikasi === 'Berkas tidak sesuai' && (
                    <>
                        <Separator className="my-3"/>
                        <Alert variant="destructive" className="mt-4">
                            <AlertTitle>Alasan Penolakan</AlertTitle>
                            <AlertDescription>{applicant.rejectionReason || "Tidak ada alasan spesifik yang diberikan."}</AlertDescription>
                        </Alert>
                    </>
                )}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 text-primary">Pilihan Sekolah & Peringkat</h3>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-[10%]">Prioritas</TableHead>
                    <TableHead>Nama Sekolah</TableHead>
                    <TableHead>Jurusan</TableHead>
                    <TableHead className="text-right">Nilai Akhir</TableHead>
                    <TableHead className="text-right">Peringkat Sementara</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                    {applicant.schoolSelections && applicant.schoolSelections.length > 0 ? (
                        applicant.schoolSelections.map((selection, index) => {
                            const school = getSchoolById(selection.schoolId);
                            const score = calculateScoreForSchool(applicant, selection.schoolId);
                            
                            const isPlacedHere = applicant.diterimaDiSekolahId === selection.schoolId;
                            const isPlacedElsewhere = applicant.diterimaDiSekolahId && applicant.diterimaDiSekolahId !== selection.schoolId;
                            const isUnplaced = !applicant.diterimaDiSekolahId;
                            
                            let rankDisplay: React.ReactNode;
                            let rankClass = "";

                            if (applicant.statusVerifikasi !== 'Terverifikasi') {
                                rankDisplay = applicant.statusVerifikasi;
                                rankClass = "text-muted-foreground";
                            } else if (isPlacedHere) {
                                const schoolQuotaObject = school?.jalurKuota;
                                const pathwayQuota = schoolQuotaObject ? schoolQuotaObject[applicant.jalur.toLowerCase() as keyof typeof schoolQuotaObject] : 0;
                                
                                const competingApplicants = allApplicants.filter(
                                    (app) => app.diterimaDiSekolahId === selection.schoolId && app.jalur === applicant.jalur
                                );
                                
                                rankDisplay = `${applicant.peringkat} / ${competingApplicants.length}`;
                                
                                if (pathwayQuota && applicant.peringkat && applicant.peringkat <= pathwayQuota) {
                                    rankClass = "text-green-600 font-bold";
                                } else {
                                    rankClass = "text-red-600";
                                }
                            } else if (isPlacedElsewhere) {
                                rankDisplay = "Diterima di Pilihan Lain";
                                rankClass = "text-muted-foreground";
                            } else {
                                rankDisplay = "Di Luar Kuota";
                                rankClass = "text-red-600";
                            }

                            return (
                                <TableRow key={selection.schoolId + (selection.major || '')}>
                                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Building className="h-4 w-4 text-muted-foreground" />
                                            <span className="font-medium">{school?.namaSekolah || "Sekolah Tidak Ditemukan"}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{selection.major || "-"}</TableCell>
                                    <TableCell className="text-right font-mono">{score.toFixed(2)}</TableCell>
                                    <TableCell className={`text-right ${rankClass}`}>
                                        {rankDisplay}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    ) : (
                         <TableRow>
                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                Pendaftar ini belum memiliki pilihan sekolah.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
              </Table>
            </div>
             <p className="text-xs text-muted-foreground mt-2">
                Peringkat hanya ditampilkan untuk pendaftar yang sudah terverifikasi. Nilai Akhir adalah hasil kalkulasi dari nilai rapor dan bobot lainnya.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
