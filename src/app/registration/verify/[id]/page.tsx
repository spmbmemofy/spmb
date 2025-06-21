
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, FileText, Info, UserCircle, XCircle, ThumbsUp, ThumbsDown, Save, TrendingUp, BookOpen } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableRow, TableFooter as ShadcnTableFooter, TableHead, TableHeader } from "@/components/ui/table";

import { useToast } from "@/hooks/use-toast";
import { generateAllMockApplicants } from "@/lib/mockData";
import type { Applicant, ApplicantStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const applicantDetailsMock = {
  profilePhoto: "https://placehold.co/128x160.png",
  nik: "6403011507050002",
  placeOfBirth: "Tanjung Redeb",
  dateOfBirth: "2008-07-15",
  gender: "Laki-laki",
  religion: "Islam",
  address: "Jl. Durian III No. 25, RT 10/RW 03, Kel. Tanjung Redeb, Kec. Tanjung Redeb, Kabupaten Berau, Kalimantan Timur 77311",
  contactNumber: "081254321098",
};

const DUMMY_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

const generalDocuments = [
    { id: 'kk', label: 'Kartu Keluarga (KK)', url: DUMMY_PDF_URL },
    { id: 'akta', label: 'Akta Kelahiran', url: DUMMY_PDF_URL },
    { id: 'skl', label: 'Surat Keterangan Lulus (SKL)', url: DUMMY_PDF_URL },
    { id: 'rapor_gabungan', label: 'Rapor Semester 1-5', url: DUMMY_PDF_URL },
];

const pathwaySpecificDocuments: Record<string, {id: string, label: string, url: string}[]> = {
  Afirmasi: [ { id: "kip_kks_pkh", label: "KIP / KKS / PKH", url: DUMMY_PDF_URL } ],
  Prestasi: [ { id: "sertifikat_prestasi", label: "Sertifikat Prestasi", url: DUMMY_PDF_URL }, { id: "sk_prestasi", label: "SK Prestasi Sekolah", url: DUMMY_PDF_URL } ],
  Mutasi: [ { id: "sk_penempatan", label: "SK Mutasi Orang Tua", url: DUMMY_PDF_URL } ],
  Domisili: [], 
};

const reportCardGradesData = [
  { subject: "Matematika", semester1: 86, semester2: 89, semester3: 91, semester4: 88, semester5: 93 },
  { subject: "Ilmu Pengetahuan Alam (IPA)", semester1: 89, semester2: 91, semester3: 87, semester4: 90, semester5: 92 },
  { subject: "Ilmu Pengetahuan Sosial (IPS)", semester1: 87, semester2: 85, semester3: 90, semester4: 86, semester5: 89 },
  { subject: "Bahasa Indonesia", semester1: 91, semester2: 88, semester3: 89, semester4: 93, semester5: 90 },
  { subject: "Bahasa Inggris", semester1: 83, semester2: 86, semester3: 88, semester4: 89, semester5: 91 },
  { subject: "Pendidikan Kewarganegaraan (PKN)", semester1: 88, semester2: 89, semester3: 87, semester4: 91, semester5: 90 },
];
const semesterKeys: (keyof Omit<typeof reportCardGradesData[0], 'subject'>)[] = ["semester1", "semester2", "semester3", "semester4", "semester5"];


const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Terverifikasi": return "default";
    case "Menunggu Verifikasi": return "secondary";
    case "Berkas tidak sesuai": return "destructive";
    default: return "secondary";
  }
};

type ActionType = "verify" | "reject";
type DocumentStatus = "valid" | "invalid" | null;
type DocumentItem = { id: string; label: string; url: string };

export default function VerifyApplicantPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const applicantId = params.id as string;

  const [applicant, setApplicant] = React.useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [documentsToVerify, setDocumentsToVerify] = React.useState<DocumentItem[]>([]);
  const [documentStatuses, setDocumentStatuses] = React.useState<Record<string, DocumentStatus>>({});
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] = React.useState<ActionType | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");

  React.useEffect(() => {
    if (applicantId) {
      const allApplicants = generateAllMockApplicants();
      const foundApplicant = allApplicants.find(app => app.id === applicantId);
      setApplicant(foundApplicant || null);

      if (foundApplicant) {
        const specificDocs = pathwaySpecificDocuments[foundApplicant.jalur] || [];
        const allDocs = [...generalDocuments, ...specificDocs];
        setDocumentsToVerify(allDocs);

        const initialStatuses: Record<string, DocumentStatus> = {};
        allDocs.forEach(doc => { initialStatuses[doc.id] = null; });
        setDocumentStatuses(initialStatuses);
      }
    }
    setIsLoading(false);
  }, [applicantId]);

  const handleDocumentStatusChange = (docId: string, status: 'valid' | 'invalid') => {
    setDocumentStatuses(prev => ({ ...prev, [docId]: prev[docId] === status ? null : status }));
  };
  
  const handleSaveClick = () => {
    const hasInvalid = Object.values(documentStatuses).some(s => s === 'invalid');
    const action: ActionType = hasInvalid ? 'reject' : 'verify';
    setSelectedAction(action);
    setIsAlertOpen(true);
  };

  const handleConfirmAction = () => {
    if (!applicant || !selectedAction) return;
    if (selectedAction === 'reject' && !rejectionReason.trim()) {
      toast({ variant: "destructive", title: "Alasan Diperlukan", description: "Harap isi alasan penolakan sebelum melanjutkan." });
      return;
    }
    let toastMessage = selectedAction === 'verify'
      ? `Pendaftar "${applicant.fullName}" telah berhasil diverifikasi.`
      : `Pendaftaran "${applicant.fullName}" telah ditolak. Alasan: ${rejectionReason}`;
    
    toast({ title: "Aksi Berhasil", description: toastMessage });
    setIsAlertOpen(false);
    setRejectionReason("");
    router.push('/registration/selection');
  };
  
  const calculateAverage = (subject: typeof reportCardGradesData[0]): string => {
    const grades = semesterKeys.map(key => subject[key]).filter(g => typeof g === 'number');
    if (grades.length === 0) return "0.00";
    return (grades.reduce((sum, g) => sum + g, 0) / grades.length).toFixed(2);
  }

  const nilaiRapor = React.useMemo(() => {
    if (reportCardGradesData.length === 0) return 0;
    const allAverages = reportCardGradesData.map(subj => parseFloat(calculateAverage(subj)));
    return allAverages.reduce((sum, avg) => sum + avg, 0) / allAverages.length;
  }, []);

  const allDocumentsReviewed = documentsToVerify.length > 0 && documentsToVerify.every(doc => documentStatuses[doc.id] !== null);
  const nilaiPrestasi = applicant?.jalur === 'Prestasi' ? (applicant?.nilaiPrestasi || 0) : 0;
  const nilaiTambahan = applicant?.nilaiTambahanPilihan || 0;
  const nilaiTotal = nilaiRapor + nilaiPrestasi + nilaiTambahan;

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center p-4">Memuat data pendaftar...</div>;
  }

  if (!applicant) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader><CardTitle className="text-xl">Pendaftar Tidak Ditemukan</CardTitle></CardHeader>
          <CardContent><p>Data pendaftar dengan ID yang diberikan tidak dapat ditemukan.</p></CardContent>
          <CardFooter>
            <Button asChild className="mx-auto">
              <Link href="/registration/selection"><ArrowLeft className="mr-2 h-4 w-4" />Kembali ke Daftar Verifikasi</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" asChild>
                <Link href="/registration/selection"><ArrowLeft /></Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{applicant.fullName}</h1>
              <p className="text-muted-foreground">NISN: {applicant.nisn}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader><CardTitle className="flex items-center text-lg"><UserCircle className="mr-2"/>Biodata</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-center mb-4">
                    <Image src={applicantDetailsMock.profilePhoto} alt="Foto Profil" width={100} height={125} className="rounded-md border" data-ai-hint="profile picture" />
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status Saat Ini</span><Badge variant={getStatusBadgeVariant(applicant.statusVerifikasi)}>{applicant.statusVerifikasi}</Badge></div>
                  <Separator/>
                  <div className="flex justify-between"><span className="text-muted-foreground">NIK</span><span className="font-medium">{applicantDetailsMock.nik}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">TTL</span><span className="font-medium">{applicantDetailsMock.placeOfBirth}, {applicantDetailsMock.dateOfBirth}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Jenis Kelamin</span><span className="font-medium">{applicantDetailsMock.gender}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground">Agama</span><span className="font-medium">{applicantDetailsMock.religion}</span></div>
                  <div><p className="text-muted-foreground">Alamat</p><p className="font-medium">{applicantDetailsMock.address}</p></div>
              </CardContent>
            </Card>
            <Card>
               <CardHeader><CardTitle className="flex items-center text-lg"><Info className="mr-2"/>Info Pendaftaran</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                   <div className="flex justify-between"><span className="text-muted-foreground">No. Registrasi</span><span className="font-medium">{applicant.noRegistrasi}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground">Asal Sekolah</span><span className="font-medium">{applicant.asalSekolahNama}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground">Sekolah Tujuan</span><span className="font-medium">{applicant.sekolahTujuanNama}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground">Jalur</span><span className="font-medium">{applicant.jalur}</span></div>
              </CardContent>
            </Card>
             <Card>
               <CardHeader><CardTitle className="flex items-center text-lg"><BookOpen className="mr-2"/>Rincian Nilai Rapor</CardTitle></CardHeader>
               <CardContent>
                 <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mata Pelajaran</TableHead>
                      {semesterKeys.map((key, i) => <TableHead key={key} className="text-center">S{i+1}</TableHead>)}
                      <TableHead className="text-right">Rata-rata</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                  {reportCardGradesData.map(subject => (
                    <TableRow key={subject.subject}>
                      <TableCell className="font-medium text-xs py-2">{subject.subject}</TableCell>
                      {semesterKeys.map(key => <TableCell key={key} className="text-center text-xs py-2">{subject[key]}</TableCell>)}
                      <TableCell className="text-right font-medium text-xs py-2">{calculateAverage(subject)}</TableCell>
                    </TableRow>
                  ))}
                  </TableBody>
                 </Table>
               </CardContent>
            </Card>
            <Card>
               <CardHeader><CardTitle className="flex items-center text-lg"><TrendingUp className="mr-2"/>Kalkulasi Nilai Akhir</CardTitle></CardHeader>
              <CardContent>
                 <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Nilai Rata-rata Rapor</TableCell>
                            <TableCell className="text-right">{nilaiRapor.toFixed(2)}</TableCell>
                        </TableRow>
                        {applicant.jalur === 'Prestasi' && (
                            <TableRow>
                                <TableCell className="font-medium">Nilai Tambahan Prestasi</TableCell>
                                <TableCell className="text-right">{nilaiPrestasi.toFixed(2)}</TableCell>
                            </TableRow>
                        )}
                        <TableRow>
                            <TableCell className="font-medium">Nilai Tambahan (Pilihan Pertama)</TableCell>
                            <TableCell className="text-right">{nilaiTambahan.toFixed(2)}</TableCell>
                        </TableRow>
                    </TableBody>
                    <ShadcnTableFooter>
                        <TableRow className="bg-muted/50">
                            <TableCell className="font-bold">TOTAL NILAI AKHIR</TableCell>
                            <TableCell className="text-right font-bold text-lg">{nilaiTotal.toFixed(2)}</TableCell>
                        </TableRow>
                    </ShadcnTableFooter>
                 </Table>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-lg"><FileText className="mr-2"/>Berkas Pendaftaran</CardTitle>
                <CardDescription>Klik nama berkas untuk membuka di tab baru. Berikan status validasi untuk setiap berkas.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-2">
                    {documentsToVerify.map((doc) => (
                      <div key={doc.id} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                         <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-0 h-auto justify-start text-left font-medium text-primary hover:underline"
                          >
                            {doc.label}
                          </a>
                        <div className="flex-shrink-0 flex gap-2 w-full sm:w-auto">
                          <Button size="sm" variant={documentStatuses[doc.id] === 'invalid' ? 'destructive' : 'outline'} onClick={() => handleDocumentStatusChange(doc.id, 'invalid')} className="flex-1">
                            <ThumbsDown className="mr-2 h-4 w-4" />Tidak Valid
                          </Button>
                          <Button size="sm" variant={documentStatuses[doc.id] === 'valid' ? 'default' : 'outline'} className={cn(documentStatuses[doc.id] === 'valid' && "bg-green-600 hover:bg-green-700", "flex-1")} onClick={() => handleDocumentStatusChange(doc.id, 'valid')}>
                            <ThumbsUp className="mr-2 h-4 w-4" />Valid
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-6 flex justify-end">
            <Button size="lg" onClick={handleSaveClick} disabled={!allDocumentsReviewed}>
                <Save className="mr-2 h-5 w-5" />
                Simpan Status Verifikasi
            </Button>
        </div>
      </div>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
                {selectedAction === 'verify' && "Konfirmasi Verifikasi"}
                {selectedAction === 'reject' && "Konfirmasi Penolakan"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedAction === 'verify' && `Semua berkas pendaftar atas nama ${applicant.fullName} sudah valid. Apakah Anda yakin ingin memverifikasi pendaftaran ini?`}
              {selectedAction === 'reject' && `Terdapat berkas yang tidak valid untuk pendaftar ${applicant.fullName}. Harap berikan keterangan penolakan untuk pendaftar.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
           {selectedAction === 'reject' && (
            <div className="grid gap-2 py-2">
              <Label htmlFor="rejection-reason">Keterangan Penolakan</Label>
              <Textarea 
                id="rejection-reason"
                placeholder="Contoh: Foto Kartu Keluarga buram dan tidak terbaca. Harap unggah ulang."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setIsAlertOpen(false); setRejectionReason(""); }}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
                {selectedAction === 'verify' ? "Ya, Verifikasi" : "Simpan & Tolak Pendaftaran"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
