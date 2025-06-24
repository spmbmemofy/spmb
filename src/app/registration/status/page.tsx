"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ClipboardCheck, ArrowLeft, Info, FileCheck2, FileQuestion, UserCircle, XSquare, School2, Star, ShieldCheck, CheckCircle, UserCheck as UserCheckIcon, BarChart, FileUp, Printer, AlertCircle } from 'lucide-react';
import { getSchoolById, type School } from "@/lib/schoolService"; 
import { getFromLocalStorage, type RegistrationProgress, type BiodataDetails, type LoginCredentials } from "@/lib/localStorage";
import { getApplicants, type Applicant } from "@/lib/applicantService";
import { type ActivityEvent, type SchoolSelection, type ApplicantStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";
const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";


interface BiodataDisplayItemProps {
  label: string;
  value: string | number | undefined;
}

const BiodataDisplayItem: React.FC<BiodataDisplayItemProps> = ({ label, value }) => (
  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b last:border-b-0">
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-sm sm:text-right">{value || "-"}</p>
  </div>
);


interface DocumentItem {
  id: string;
  label: string;
  required: boolean;
}

const generalDocumentsConst: DocumentItem[] = [
  { id: "kk", label: "Scan Kartu Keluarga (KK)", required: true },
  { id: "akta", label: "Scan Akta Kelahiran", required: true },
  { id: "skl", label: "Scan Surat Keterangan Lulus (SKL)", required: true },
  { id: "rapor_gabungan", label: "Scan Rapor (Semester 1-5, Gabungan PDF/Gambar)", required: true },
];

const pathwaySpecificDocumentsMapConst: Record<string, DocumentItem[]> = {
  Afirmasi: [
    { id: "kip_kks_pkh", label: "Scan Kartu Indonesia Pintar (KIP) / Kartu Keluarga Sejahtera (KKS) / Program Keluarga Harapan (PKH)", required: true },
  ],
  Prestasi: [
    { id: "sertifikat_prestasi", label: "Scan Sertifikat Prestasi", required: false }, 
    { id: "sk_prestasi", label: "Scan Surat Keterangan Prestasi dari Sekolah Asal", required: true },
  ],
  Mutasi: [
    { id: "sk_penempatan", label: "Scan Surat Keputusan Penempatan/Mutasi Kerja Orang Tua/Wali", required: true },
  ],
  Domisili: [], 
};

interface DisplaySelection {
    school: School;
    major: string | null;
}

type VerificationStatus = ApplicantStatus;

const getVerificationBadgeVariant = (status: VerificationStatus): "default" | "destructive" | "secondary" => {
    switch (status) {
        case "Terverifikasi":
            return "default";
        case "Berkas tidak sesuai":
            return "destructive";
        case "Menunggu Verifikasi":
            return "secondary";
        default:
            return "secondary";
    }
};

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
          description: `Anda berhasil menyelesaikan pendaftaran. Berkas dikirimkan untuk verifikasi.`,
          actor: event.actor,
          timestamp,
        };
      case 'FILES_RESUBMITTED':
         return {
          icon: <FileUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          bgColor: "bg-blue-100 dark:bg-blue-900",
          title: "Perbaikan Berkas Terkirim",
          description: "Anda berhasil mengunggah ulang berkas yang diperlukan untuk ditinjau kembali.",
          actor: event.actor,
          timestamp,
        };
      case 'VERIFICATION_REJECTED':
         return {
          icon: <XSquare className="h-5 w-5 text-red-600 dark:text-red-400" />,
          bgColor: "bg-red-100 dark:bg-red-900",
          title: "Verifikasi Ditolak",
          description: `Verifikator menolak berkas dengan alasan: "${event.details || 'Tidak ada alasan spesifik.'}"`,
          actor: event.actor,
          timestamp,
        };
      case 'VERIFICATION_APPROVED':
        return {
          icon: <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />,
          bgColor: "bg-green-100 dark:bg-green-900",
          title: "Verifikasi Berhasil",
          description: "Selamat! Berkas Anda telah diverifikasi dan pendaftaran Anda diterima untuk tahap selanjutnya.",
          actor: event.actor,
          timestamp,
        };
      default:
        return null;
    }
  };

  return (
    <ul className="space-y-6">
      {[...applicant.activityHistory].reverse().map((event, index) => {
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

export default function StatusPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [applicant, setApplicant] = React.useState<Applicant | null>(null);
  const [allApplicants, setAllApplicants] = React.useState<Applicant[]>([]);
  const [biodata, setBiodata] = React.useState<BiodataDetails | null>(null);
  const [displaySelections, setDisplaySelections] = React.useState<DisplaySelection[]>([]);
  const [documentsToShow, setDocumentsToShow] = React.useState<DocumentItem[]>([]);

  React.useEffect(() => {
    const loginCreds = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    if (!loginCreds?.username) {
        router.replace('/');
        return;
    }

    const allApplicantsData = getApplicants();
    setAllApplicants(allApplicantsData);
    const currentApplicant = allApplicantsData.find(app => app.nisn === loginCreds.username);
    
    if (!currentApplicant) {
        setIsLoading(false);
        return;
    }
    
    setApplicant(currentApplicant);

    const savedProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null);

    if (savedProgress?.biodata) {
        setBiodata(savedProgress.biodata);
    }
    
    const schoolSelections = currentApplicant.schoolSelections || [];
    if (schoolSelections.length > 0) {
      const populatedSelections: DisplaySelection[] = schoolSelections.map(selection => {
        const school = getSchoolById(selection.schoolId);
        return { school: school!, major: selection.major };
      }).filter(item => item.school); 
      setDisplaySelections(populatedSelections);
    }

    const pathway = currentApplicant.jalur;
    let docsForPathway: DocumentItem[] = [];
    if (pathway) {
      const pathwayDocs = pathwaySpecificDocumentsMapConst[pathway] || [];
      docsForPathway = [...generalDocumentsConst, ...pathwayDocs];
    } else {
      docsForPathway = [...generalDocumentsConst];
    }
    setDocumentsToShow(docsForPathway);

    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
        <div className="flex flex-1 items-center justify-center p-4">
            <p>Memuat status pendaftaran...</p>
        </div>
    );
  }

  if (!applicant || displaySelections.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto bg-destructive text-destructive-foreground rounded-full p-3 w-fit mb-4">
                <Info size={40} />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Informasi Tidak Lengkap</CardTitle>
            <CardDescription>
              Tidak dapat menampilkan status pendaftaran karena data pendaftaran Anda belum lengkap atau belum dikirimkan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              Pastikan Anda telah melalui proses pemilihan sekolah & jalur, serta unggah berkas.
            </p>
            <Button onClick={() => router.push('/registration/dashboard')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <ClipboardCheck size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Status Verifikasi Anda</CardTitle>
          <CardDescription className="text-md">
            Berikut adalah ringkasan pendaftaran dan status verifikasi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold mb-2 text-primary flex items-center">
                <Star className="mr-2 h-6 w-6" />
                Status & Peringkat Pilihan
            </h3>
             <p className="text-sm text-muted-foreground mb-4">
                Status verifikasi ditentukan oleh sekolah pilihan pertama Anda dan berlaku untuk semua pilihan di bawahnya.
            </p>
            {applicant.statusVerifikasi === 'Berkas tidak sesuai' && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Verifikasi Gagal: Perbaikan Diperlukan</AlertTitle>
                <AlertDescription>
                  Pendaftaran Anda tidak dapat diproses lebih lanjut karena ada data atau berkas yang ditolak oleh verifikator. Alasan: <span className="italic">"{applicant.rejectionReason || 'Tidak ada alasan spesifik'}"</span>
                </AlertDescription>
                 <div className="mt-4">
                    <Button variant="outline" size="sm" asChild className="border-current text-current hover:bg-destructive/10">
                        <Link href="/registration/correction">
                            <FileUp className="mr-2 h-4 w-4" />
                            Perbaiki Data & Berkas
                        </Link>
                    </Button>
                </div>
              </Alert>
            )}

            <Dialog>
              <DialogTrigger asChild>
                 <Card className="mb-6 bg-muted/30 hover:bg-muted/40 cursor-pointer transition-colors">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <ShieldCheck className="mr-3 h-6 w-6 text-primary" />
                            Ringkasan Verifikasi Berkas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className={cn(
                        "grid gap-x-6 gap-y-4 text-sm",
                        applicant.statusVerifikasi !== 'Menunggu Verifikasi' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'
                    )}>
                        <div>
                            <p className="font-medium text-muted-foreground mb-1">Status</p>
                            <Badge variant={getVerificationBadgeVariant(applicant.statusVerifikasi)} className="font-semibold text-base px-3 py-1">
                                {applicant.statusVerifikasi}
                            </Badge>
                        </div>
                        {applicant.statusVerifikasi !== 'Menunggu Verifikasi' && (
                            <>
                                <div>
                                    <p className="font-medium text-muted-foreground mb-1">Diverifikasi oleh Sekolah</p>
                                    <p className="font-semibold">{displaySelections[0]?.school.namaSekolah || '-'}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground mb-1">Nama Verifikator</p>
                                    <p className="font-semibold">{applicant.verifiedBy || 'Petugas Verifikator'}</p>
                                </div>
                            </>
                        )}
                    </CardContent>
                    <CardFooter className="text-xs text-muted-foreground pt-4 pb-3 px-6">
                        <p>Klik di mana saja pada kartu ini untuk melihat detail riwayat aktivitas.</p>
                    </CardFooter>
                </Card>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Riwayat Aktivitas Pendaftaran</DialogTitle>
                  <DialogDescription>
                    Berikut adalah jejak waktu dari proses pendaftaran dan verifikasi Anda.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <ActivityHistoryTimeline applicant={applicant} />
                </div>
                <DialogFooter>
                  <Button asChild>
                    <DialogTrigger>Tutup</DialogTrigger>
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <div className="space-y-4">
                <div className="flex justify-between items-center rounded-md border p-4 bg-muted/30">
                    <span className="font-medium text-muted-foreground">Jalur Pendaftaran:</span>
                    <span className="font-semibold text-lg text-primary">{applicant.jalur || "Tidak Diketahui"}</span>
                </div>
                {displaySelections.map(({ school, major }, index) => {
                    let rankStatus: string;
                    let rankStatusVariant: "default" | "destructive" | "secondary";
                    let rankText: string;
                    let quotaInfo: string;

                    if (index > 0) { // Not the first choice
                        rankStatus = 'Pilihan Cadangan';
                        rankStatusVariant = 'secondary';
                        rankText = 'N/A';
                        quotaInfo = 'Peringkat hanya untuk pilihan pertama';
                    } else { // This is the first choice
                        switch (applicant.statusVerifikasi) {
                            case "Berkas tidak sesuai":
                                rankStatus = 'Pendaftaran Ditolak';
                                rankStatusVariant = 'destructive';
                                rankText = '-';
                                quotaInfo = "Verifikasi berkas gagal";
                                break;
                            case "Menunggu Verifikasi":
                                rankStatus = 'Menunggu Peringkat';
                                rankStatusVariant = 'secondary';
                                rankText = '-';
                                quotaInfo = "Menunggu verifikasi";
                                break;
                            case "Terverifikasi":
                            default:
                                const pathwayKey = (applicant.jalur.toLowerCase() || '') as keyof NonNullable<typeof school.jalurKuota>;
                                const quota = school.jalurKuota ? (school.jalurKuota[pathwayKey] || 0) : 0;
                                const rank = applicant.peringkat;
                                const isWithinQuota = rank && quota > 0 ? rank <= quota : false;
                                
                                if (!rank) {
                                    rankStatus = 'Peringkat Belum Tersedia';
                                    rankStatusVariant = 'secondary';
                                } else {
                                    rankStatus = isWithinQuota ? "Memenuhi Peringkat" : "Di Luar Peringkat";
                                    rankStatusVariant = isWithinQuota ? "default" : "destructive";
                                }

                                const competingApplicants = allApplicants.filter(
                                    (app) =>
                                      app.statusVerifikasi === 'Terverifikasi' &&
                                      app.jalur === applicant.jalur &&
                                      app.schoolSelections?.[0]?.schoolId === school.id
                                );
                                
                                rankText = quota > 0 && rank ? `${rank} dari ${competingApplicants.length}` : '-';
                                quotaInfo = `Kuota Jalur: ${quota}`;
                                break;
                        }
                    }

                    return (
                        <Card key={`${school.id}-${major || 'sma'}`} className="overflow-hidden">
                            <CardHeader className="flex flex-row items-start justify-between bg-muted/50 p-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Prioritas Pilihan #{index + 1}</p>
                                    <CardTitle className="text-lg flex items-center mt-1">
                                      <School2 className="h-5 w-5 mr-2 text-primary opacity-80" />
                                      {school.namaSekolah}
                                    </CardTitle>
                                    {major && <p className="text-sm text-muted-foreground mt-1">{major}</p>}
                                </div>
                                <Badge variant={rankStatusVariant}>{rankStatus}</Badge>
                            </CardHeader>
                            <CardContent className="p-4 grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Peringkat Sementara</p>
                                    <p className="font-semibold text-lg">{rankText}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Info Kuota</p>
                                    <p className="text-sm font-semibold">{quotaInfo}</p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
             <p className="text-xs text-muted-foreground mt-2">
                Peringkat bersifat sementara dan dapat berubah sewaktu-waktu hingga pengumuman akhir.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
              <UserCircle className="mr-2 h-6 w-6" />
              Detail Biodata Pendaftar
            </h3>
            <div className="space-y-1 rounded-md border p-4">
              <BiodataDisplayItem label="Nama Lengkap" value={biodata?.fullName || applicant.fullName} />
              <BiodataDisplayItem label="NISN" value={biodata?.nisn || applicant.nisn} />
              <BiodataDisplayItem label="NIK" value={biodata?.nik} />
              <BiodataDisplayItem label="Sekolah Asal" value={biodata?.previousSchool || applicant.asalSekolahNama} />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary">Kelengkapan Berkas</h3>
            <div className="space-y-2 rounded-md border p-4">
              {documentsToShow.length > 0 ? (
                documentsToShow.map(doc => {
                  const docStatus = applicant.documentStatuses?.[doc.id];
                  const overallStatus = applicant.statusVerifikasi;
                  
                  let icon;
                  let badgeVariant: "default" | "destructive" | "secondary" = "secondary";
                  let statusText = "";

                  if (overallStatus === "Menunggu Verifikasi") {
                      icon = <FileQuestion className="h-5 w-5 mr-2 text-muted-foreground" />;
                      statusText = "Menunggu";
                      badgeVariant = "secondary";
                  } else if (docStatus === 'invalid') {
                      icon = <AlertCircle className="h-5 w-5 mr-2 text-destructive" />;
                      statusText = "Ditolak";
                      badgeVariant = "destructive";
                  } else if (docStatus === 'valid' || overallStatus === 'Terverifikasi') {
                      icon = <FileCheck2 className="h-5 w-5 mr-2 text-green-600" />;
                      statusText = "Diterima";
                      badgeVariant = "default";
                  } else {
                      icon = <FileQuestion className="h-5 w-5 mr-2 text-muted-foreground" />;
                      badgeVariant = "secondary";
                      statusText = doc.required ? "Belum Diunggah" : "Tidak Wajib";
                  }

                  return (
                    <div key={doc.id} className="flex justify-between items-center py-2.5 border-b last:border-b-0">
                      <span className="flex items-center text-sm">
                        {icon}
                        {doc.label} {!doc.required && <span className="text-xs text-muted-foreground ml-1">(Opsional)</span>}
                      </span>
                      <Badge variant={badgeVariant} className="text-xs">
                        {statusText}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-4">Tidak ada informasi berkas untuk jalur ini.</p>
              )}
            </div>
             <p className="text-xs text-muted-foreground mt-2">
                Status "Diterima" menunjukkan berkas telah dianggap valid oleh verifikator.
            </p>
          </section>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center pt-6 gap-4">
            <Button asChild>
                <Link href="/registration/proof" target="_blank">
                    <Printer className="mr-2 h-4 w-4" />
                    Buka Halaman Cetak
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
    </>
  );
}
