
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, FileText, Info, UserCircle, XCircle, ThumbsUp, ThumbsDown, Save, TrendingUp, BookOpen, AlertCircle, School, ScrollText, FileUp, Users } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableRow, TableFooter as ShadcnTableFooter, TableHead, TableHeader } from "@/components/ui/table";

import { useToast } from "@/hooks/use-toast";
import { getApplicantById, updateApplicant } from "@/lib/applicantService";
import type { Applicant, ApplicantStatus, DocumentStatus, ActivityEvent } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getSchoolById, getSchoolByNPSN } from "@/lib/schoolService";
import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { getUsers } from "@/lib/userService";


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

const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Terverifikasi": return "default";
    case "Menunggu Verifikasi": return "secondary";
    case "Berkas tidak sesuai": return "destructive";
    default: return "secondary";
  }
};

type ActionType = "verify" | "reject";
type DocumentItem = { id: string; label: string; url: string };

const ActivityHistoryTimeline: React.FC<{ applicant: Applicant | null }> = ({ applicant }) => {
  if (!applicant || !applicant.activityHistory || applicant.activityHistory.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Riwayat aktivitas belum tersedia.
      </p>
    );
  }

  const eventUIMap = (event: ActivityEvent) => {
    const timestamp = new Date(event.timestamp).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' }) + ' WIB';
    
    switch(event.type) {
      case 'REGISTRATION_COMPLETED':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />,
          bgColor: "bg-green-100 dark:bg-green-900",
          title: "Pendaftaran Selesai",
          description: `Pendaftar berhasil menyelesaikan pendaftaran. Berkas dikirimkan untuk verifikasi.`,
          actor: event.actor,
          timestamp,
        };
      case 'FILES_RESUBMITTED':
         return {
          icon: <FileUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          bgColor: "bg-blue-100 dark:bg-blue-900",
          title: "Perbaikan Berkas Terkirim",
          description: "Pendaftar berhasil mengunggah ulang berkas yang diperlukan untuk ditinjau kembali.",
          actor: event.actor,
          timestamp,
        };
      case 'VERIFICATION_REJECTED':
         return {
          icon: <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />,
          bgColor: "bg-red-100 dark:bg-red-900",
          title: "Verifikasi Ditolak",
          description: `Verifikator menolak berkas dengan alasan: "${event.details || 'Tidak ada alasan spesifik.'}"`,
          actor: event.actor,
          timestamp,
        };
      case 'VERIFICATION_APPROVED':
        return {
          icon: <ThumbsUp className="h-5 w-5 text-green-600 dark:text-green-400" />,
          bgColor: "bg-green-100 dark:bg-green-900",
          title: "Verifikasi Berhasil",
          description: "Selamat! Berkas telah diverifikasi dan pendaftaran diterima untuk tahap selanjutnya.",
          actor: event.actor,
          timestamp,
        };
      default:
        return null;
    }
  };

  return (
    <ul className="space-y-6">
      {[...(applicant.activityHistory || [])].reverse().map((event, index) => {
        const eventUI = eventUIMap(event);
        if (!eventUI) return null;
        return (
          <li key={index} className="flex gap-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full ${eventUI.bgColor} flex-shrink-0 mt-1`}>
              {eventUI.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{eventUI.title}</p>
              <p className="text-sm text-muted-foreground">{eventUI.description}</p>
              <p className="text-xs text-muted-foreground mt-1">Oleh: {eventUI.actor} &bull; {eventUI.timestamp}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

export default function VerifyApplicantPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const applicantId = params.id as string;

  const [applicant, setApplicant] = React.useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isVerifierAuthorized, setIsVerifierAuthorized] = React.useState(false);
  
  const [documentsToVerify, setDocumentsToVerify] = React.useState<DocumentItem[]>([]);
  const [documentStatuses, setDocumentStatuses] = React.useState<Record<string, DocumentStatus>>({});
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [isHistoryAlertOpen, setIsHistoryAlertOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] = React.useState<ActionType | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [editableNilaiPrestasi, setEditableNilaiPrestasi] = React.useState(0);
  const [verifierSchoolId, setVerifierSchoolId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const creds = getFromLocalStorage<LoginCredentials | null>('loginCredentials', null);
    const user = creds ? getUsers().find(u => u.username === creds.username) : null;
    const school = user?.npsn ? getSchoolByNPSN(user.npsn) : null;

    if (school) {
        setVerifierSchoolId(school.id);
    }

    if (applicantId) {
      const foundApplicant = getApplicantById(applicantId);
      setApplicant(foundApplicant || null);

      if (foundApplicant && school) {
        const isAuthorized = foundApplicant.schoolSelections?.[0]?.schoolId === school.id;
        setIsVerifierAuthorized(isAuthorized);

        const specificDocs = pathwaySpecificDocuments[foundApplicant.jalur] || [];
        const allDocs = [...generalDocuments, ...specificDocs];
        setDocumentsToVerify(allDocs);

        const initialStatuses: Record<string, DocumentStatus> = {};
        const allPossibleDocKeys = ['biodata', 'nilai_rapor', ...allDocs.map(d => d.id)];
        
        allPossibleDocKeys.forEach(key => {
            initialStatuses[key] = foundApplicant.documentStatuses?.[key] || null;
        });

        setDocumentStatuses(initialStatuses);
        setEditableNilaiPrestasi(foundApplicant.nilaiPrestasi || 0);
      }
    }
    setIsLoading(false);
  }, [applicantId]);

  const toggleInvalidStatus = (docId: string) => {
    setDocumentStatuses(prev => {
        const newStatuses = {...prev};
        if (newStatuses[docId] === 'invalid') {
            newStatuses[docId] = null;
        } else {
            newStatuses[docId] = 'invalid';
        }
        return newStatuses;
    });
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

    const newStatus: ApplicantStatus = selectedAction === 'verify' ? "Terverifikasi" : "Berkas tidak sesuai";
    const creds = getFromLocalStorage<LoginCredentials | null>('loginCredentials', null);
    const user = creds ? getUsers().find(u => u.username === creds.username) : null;
    const verifierName = user ? user.fullName : 'Sistem';

    const finalDocumentStatuses: Record<string, DocumentStatus> = {};
    const allPossibleDocKeys = ['biodata', 'nilai_rapor', ...documentsToVerify.map(d => d.id)];

    if (selectedAction === 'verify') {
        allPossibleDocKeys.forEach(key => {
            finalDocumentStatuses[key] = 'valid';
        });
    } else { // 'reject'
        allPossibleDocKeys.forEach(key => {
            finalDocumentStatuses[key] = documentStatuses[key] === 'invalid' ? 'invalid' : 'valid';
        });
    }
    
    const newEvent: ActivityEvent = selectedAction === 'verify'
        ? { type: 'VERIFICATION_APPROVED', timestamp: new Date().toISOString(), actor: verifierName }
        : { type: 'VERIFICATION_REJECTED', timestamp: new Date().toISOString(), actor: verifierName, details: rejectionReason };

    const updatedApplicant: Applicant = {
        ...applicant,
        statusVerifikasi: newStatus,
        nilaiPrestasi: applicant.jalur === 'Prestasi' ? editableNilaiPrestasi : applicant.nilaiPrestasi,
        documentStatuses: finalDocumentStatuses,
        rejectionReason: selectedAction === 'reject' ? rejectionReason : undefined,
        verifiedBy: verifierName,
        verificationTimestamp: new Date().toISOString(),
        activityHistory: [...(applicant.activityHistory || []), newEvent]
    };

    updateApplicant(updatedApplicant);

    let toastMessage = selectedAction === 'verify'
      ? `Pendaftar "${applicant.fullName}" telah berhasil diverifikasi.`
      : `Pendaftaran "${applicant.fullName}" telah ditolak. Alasan: ${rejectionReason}`;
    
    toast({ title: "Aksi Berhasil", description: toastMessage });
    setIsAlertOpen(false);
    setRejectionReason("");
    router.push('/registration/selection');
  };
  
  const totalNilaiRapor = applicant ? Object.values(applicant.semesterGrades).reduce((sum, grade) => sum + grade, 0) : 0;
  const nilaiTambahan = (applicant && verifierSchoolId && applicant.schoolSelections?.[0]?.schoolId === verifierSchoolId) ? 25 : 0;
  const nilaiPrestasi = applicant?.jalur === 'Prestasi' ? editableNilaiPrestasi : 0;
  const nilaiTotal = totalNilaiRapor + nilaiPrestasi + nilaiTambahan;

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
  
  const fullAddress = applicant 
    ? [
        applicant.streetName, 
        applicant.rtRw, 
        applicant.village, 
        applicant.subdistrict, 
        applicant.district, 
        applicant.province
      ].filter(Boolean).join(', ')
    : "Alamat tidak tersedia";

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
        
        {!isVerifierAuthorized && (
          <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Akses Ditolak</AlertTitle>
              <AlertDescription>
                  Verifikasi hanya dapat dilakukan oleh sekolah yang menjadi pilihan pertama pendaftar.
              </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg"><UserCircle className="mr-2"/>Biodata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-center mb-4">
                    <Image src={applicant?.profilePhotoDataUri || "https://placehold.co/128x160.png"} alt="Foto Profil" width={100} height={125} className="rounded-md border" data-ai-hint="profile picture" />
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Status Saat Ini</span><Badge variant={getStatusBadgeVariant(applicant.statusVerifikasi)}>{applicant.statusVerifikasi}</Badge></div>
                  <Separator/>
                  <div className="flex justify-between"><span className="text-muted-foreground">NIK</span><span className="font-medium">{applicant?.nik || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">TTL</span><span className="font-medium">{applicant?.placeOfBirth || '-'}, {applicant?.dateOfBirth || '-'}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Jenis Kelamin</span><span className="font-medium">{applicant?.gender || '-'}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground">Agama</span><span className="font-medium">{applicant?.religion || '-'}</span></div>
                  <div><p className="text-muted-foreground">Alamat</p><p className="font-medium">{fullAddress}</p></div>
              </CardContent>
            </Card>
            <Card>
               <CardHeader><CardTitle className="flex items-center text-lg"><Info className="mr-2"/>Info Pendaftaran</CardTitle></CardHeader>
              <CardContent className="space-y-3 text-sm">
                   <div className="flex justify-between"><span className="text-muted-foreground">No. Registrasi</span><span className="font-medium">{applicant.noRegistrasi}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground">Asal Sekolah</span><span className="font-medium">{applicant.asalSekolahNama}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground">No. Telepon</span><span className="font-medium">{applicant?.contactNumber || '-'}</span></div>
              </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle className="flex items-center text-lg"><Users className="mr-2"/>Informasi Orang Tua/Wali</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-sm">
                    <h4 className="font-semibold text-muted-foreground">Data Ayah</h4>
                    <div className="pl-2 space-y-2">
                        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Nama</span><span className="font-medium text-right truncate">{applicant?.fatherName || '-'}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Tgl Lahir</span><span className="font-medium text-right truncate">{applicant?.fatherDateOfBirth || '-'}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Pekerjaan</span><span className="font-medium text-right truncate">{applicant?.fatherOccupation || '-'}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Penghasilan</span><span className="font-medium text-right truncate">{applicant?.fatherIncome || '-'}</span></div>
                    </div>
                    <Separator />
                    <h4 className="font-semibold text-muted-foreground">Data Ibu</h4>
                    <div className="pl-2 space-y-2">
                        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Nama</span><span className="font-medium text-right truncate">{applicant?.motherName || '-'}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Tgl Lahir</span><span className="font-medium text-right truncate">{applicant?.motherDateOfBirth || '-'}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Pekerjaan</span><span className="font-medium text-right truncate">{applicant?.motherOccupation || '-'}</span></div>
                        <div className="flex justify-between gap-4"><span className="text-muted-foreground">Penghasilan</span><span className="font-medium text-right truncate">{applicant?.motherIncome || '-'}</span></div>
                    </div>
                    {applicant?.guardianName && applicant?.guardianName !== '-' && (
                        <>
                            <Separator />
                            <h4 className="font-semibold text-muted-foreground">Data Wali</h4>
                            <div className="pl-2 space-y-2">
                                <div className="flex justify-between gap-4"><span className="text-muted-foreground">Nama Wali</span><span className="font-medium text-right truncate">{applicant.guardianName}</span></div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center text-lg"><School className="mr-2"/>Pilihan Sekolah Tujuan</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(applicant.schoolSelections || []).map((selection, index) => {
                    const school = getSchoolById(selection.schoolId);
                    return (
                      <li key={`${selection.schoolId}-${index}`} className="flex items-start gap-3 rounded-md border p-3 bg-muted/20">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm flex-shrink-0 mt-0.5">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{school?.namaSekolah || 'Sekolah tidak ditemukan'}</p>
                          {selection.major && (
                            <p className="text-xs text-muted-foreground">{selection.major}</p>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
            <Card>
               <CardHeader><CardTitle className="flex items-center text-lg"><TrendingUp className="mr-2"/>Kalkulasi Nilai Akhir</CardTitle></CardHeader>
              <CardContent>
                 <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Total Nilai Rapor</TableCell>
                            <TableCell className="text-right">{totalNilaiRapor.toFixed(2)}</TableCell>
                        </TableRow>
                         {applicant.jalur === 'Prestasi' && (
                          <TableRow>
                            <TableCell className="font-medium">
                                Nilai Tambahan Prestasi
                                <p className="text-xs text-muted-foreground">Dapat diedit oleh verifikator</p>
                            </TableCell>
                            <TableCell className="text-right w-[120px]">
                                <Input
                                    type="number"
                                    value={editableNilaiPrestasi}
                                    onChange={(e) => setEditableNilaiPrestasi(Number(e.target.value))}
                                    disabled={!isVerifierAuthorized}
                                    className="text-right"
                                />
                            </TableCell>
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
                <CardTitle className="flex items-center text-lg"><FileText className="mr-2"/>Verifikasi Berkas & Data</CardTitle>
                <CardDescription>Tandai item jika tidak valid. Item yang tidak ditandai akan otomatis diterima jika pendaftaran ditolak.</CardDescription>
              </CardHeader>
              <CardContent>
                 <div className="space-y-2">
                    {/* Biodata Item */}
                    <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium flex items-center">
                            <UserCircle className="mr-2 h-4 w-4 text-muted-foreground"/>
                            Kesesuaian Biodata
                        </span>
                        {documentStatuses['biodata'] === 'valid' ? (
                            <Badge variant="default" className="w-fit"><ThumbsUp className="mr-1.5 h-3 w-3"/>Diterima</Badge>
                        ) : (
                            <Button
                                size="sm"
                                variant={documentStatuses['biodata'] === 'invalid' ? 'destructive' : 'outline'}
                                onClick={() => toggleInvalidStatus('biodata')}
                                disabled={!isVerifierAuthorized}
                                className="h-8 w-auto px-2"
                            >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                {documentStatuses['biodata'] === 'invalid' ? 'Batalkan Tolak' : 'Tolak'}
                            </Button>
                        )}
                    </div>

                    {/* Nilai Rapor Item */}
                    <div className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="font-medium flex items-center">
                            <BookOpen className="mr-2 h-4 w-4 text-muted-foreground"/>
                            Kesesuaian Nilai Rapor
                        </span>
                        {documentStatuses['nilai_rapor'] === 'valid' ? (
                            <Badge variant="default" className="w-fit"><ThumbsUp className="mr-1.5 h-3 w-3"/>Diterima</Badge>
                        ) : (
                            <Button
                                size="sm"
                                variant={documentStatuses['nilai_rapor'] === 'invalid' ? 'destructive' : 'outline'}
                                onClick={() => toggleInvalidStatus('nilai_rapor')}
                                disabled={!isVerifierAuthorized}
                                className="h-8 w-auto px-2"
                            >
                                <XCircle className="mr-1.5 h-4 w-4" />
                                {documentStatuses['nilai_rapor'] === 'invalid' ? 'Batalkan Tolak' : 'Tolak'}
                            </Button>
                        )}
                    </div>

                    <Separator className="my-4"/>

                    {documentsToVerify.map((doc) => (
                      <div key={doc.id} className="flex flex-col gap-3 rounded-md border p-3 sm:flex-row sm:items-center sm:justify-between">
                         <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline flex-grow truncate"
                          >
                            {doc.label}
                          </a>
                        <div className="flex-shrink-0 flex gap-2">
                           {documentStatuses[doc.id] === 'valid' ? (
                                <Badge variant="default" className="w-fit"><ThumbsUp className="mr-1.5 h-3 w-3"/>Diterima</Badge>
                            ) : (
                                <Button 
                                  size="sm" 
                                  variant={documentStatuses[doc.id] === 'invalid' ? 'destructive' : 'outline'} 
                                  onClick={() => toggleInvalidStatus(doc.id)} 
                                  disabled={!isVerifierAuthorized}
                                  className="h-8 w-auto px-2"
                                >
                                  <XCircle className="mr-1.5 h-4 w-4" />
                                  {documentStatuses[doc.id] === 'invalid' ? 'Batalkan Tolak' : 'Tolak'}
                                </Button>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div className="mt-6 border-t pt-6 flex justify-end gap-4">
            <Button size="lg" variant="outline" onClick={() => setIsHistoryAlertOpen(true)} disabled={!isVerifierAuthorized}>
                <ScrollText className="mr-2 h-5 w-5" />
                Lihat Riwayat
            </Button>
            <Button size="lg" onClick={handleSaveClick} disabled={!isVerifierAuthorized}>
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

      <AlertDialog open={isHistoryAlertOpen} onOpenChange={setIsHistoryAlertOpen}>
        <AlertDialogContent className="sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Riwayat Aktivitas Pendaftar</AlertDialogTitle>
            <AlertDialogDescription>
              Jejak waktu dari proses pendaftaran dan verifikasi untuk {applicant.fullName}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4 max-h-[60vh] overflow-y-auto px-1">
             <ActivityHistoryTimeline applicant={applicant} />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsHistoryAlertOpen(false)}>Tutup</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
