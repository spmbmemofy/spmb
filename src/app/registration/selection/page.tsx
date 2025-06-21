
"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { ClipboardCheck, ArrowLeft, Info, FileCheck2, FileQuestion, UserCircle, XSquare, School2, Star, ShieldCheck, CheckCircle, UserCheck as UserCheckIcon, BarChart, FileUp } from 'lucide-react';
import { initialSchoolData, type School } from "@/app/registration/dashboard/page"; 
import { getFromLocalStorage, type RegistrationProgress, type SchoolSelection } from "@/lib/localStorage";

const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";

const biodataDetailsMock = {
  fullName: "Muhammad Rizky Pratama",
  nisn: "0056789123",
  nik: "6403011507050002",
  placeOfBirth: "Tanjung Redeb",
  dateOfBirth: "2008-07-15",
  gender: "Laki-laki",
  religion: "Islam",
  streetName: "Jl. Durian III No. 25",
  rtRw: "RT 10 RW 03",
  village: "Kel. Tanjung Redeb",
  subdistrict: "Kec. Tanjung Redeb",
  district: "Kabupaten Berau",
  province: "Kalimantan Timur 77311",
  previousSchool: "SMP Negeri 1 Tanjung Redeb",
  fatherName: "Abdullah Siregar",
  fatherDateOfBirth: "1975-03-20",
  fatherOccupation: "Wiraswasta",
  fatherIncome: "Rp 7.500.000 - Rp 15.000.000",
  motherName: "Siti Fatimah",
  motherDateOfBirth: "1980-08-10",
  motherOccupation: "Ibu Rumah Tangga",
  motherIncome: "-",
  guardianName: "-",
  contactNumber: "081254321098",
};

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

type VerificationStatus = "Belum verifikasi" | "Terverifikasi" | "Berkas tidak sesuai";

const getVerificationBadgeVariant = (status: VerificationStatus): "default" | "destructive" | "secondary" => {
    switch (status) {
        case "Terverifikasi":
            return "default";
        case "Berkas tidak sesuai":
            return "destructive";
        case "Belum verifikasi":
            return "secondary";
        default:
            return "secondary";
    }
};

export default function SelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPathway = searchParams.get("pathway");
  const uploadedDocsString = searchParams.get("docs");

  const [displaySelections, setDisplaySelections] = React.useState<DisplaySelection[]>([]);
  const [documentsToShow, setDocumentsToShow] = React.useState<DocumentItem[]>([]);
  const [uploadedDocIds, setUploadedDocIds] = React.useState<string[]>([]);
  
  const [storedPathway, setStoredPathway] = React.useState<string | undefined>();
  
  const applicationVerificationStatus: VerificationStatus = "Terverifikasi";

  React.useEffect(() => {
    let pathway = selectedPathway;
    let schoolSelections: SchoolSelection[] = [];

    const savedProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null);
    if (savedProgress) {
        pathway = pathway || savedProgress.pathway;
        schoolSelections = savedProgress.schoolSelections || [];
    }
    
    setStoredPathway(pathway);

    if (schoolSelections.length > 0) {
      const populatedSelections: DisplaySelection[] = schoolSelections.map(selection => {
        const school = initialSchoolData.find(s => s.id === selection.schoolId);
        return { school: school!, major: selection.major };
      }).filter(item => item.school); 

      setDisplaySelections(populatedSelections);
    }

    let docsForPathway: DocumentItem[] = [];
    if (pathway) {
      const pathwayDocs = pathwaySpecificDocumentsMapConst[pathway] || [];
      docsForPathway = [...generalDocumentsConst, ...pathwayDocs];
    } else {
      docsForPathway = [...generalDocumentsConst];
    }
    setDocumentsToShow(docsForPathway);
    
    if (uploadedDocsString) {
      setUploadedDocIds(uploadedDocsString.split(','));
    } else if (savedProgress?.documentMetadata) {
        setUploadedDocIds(Object.keys(savedProgress.documentMetadata).filter(k => savedProgress.documentMetadata![k] !== null));
    }

  }, [selectedPathway, uploadedDocsString]);
  
  const handleReupload = () => {
    if (storedPathway) {
      router.push(`/registration/document-upload?pathway=${storedPathway}`);
    } else {
      router.push('/registration/documents');
    }
  }

  if (!storedPathway || displaySelections.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <div className="mx-auto bg-destructive text-destructive-foreground rounded-full p-3 w-fit mb-4">
                <Info size={40} />
            </div>
            <CardTitle className="text-xl sm:text-2xl">Informasi Tidak Lengkap</CardTitle>
            <CardDescription>
              Tidak dapat menampilkan status pendaftaran karena informasi jalur atau sekolah tidak ditemukan.
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
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <ClipboardCheck size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Status Pendaftaran Anda</CardTitle>
          <CardDescription className="text-md">
            Berikut adalah ringkasan pendaftaran dan status verifikasi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
              <UserCircle className="mr-2 h-6 w-6" />
              Detail Biodata Pendaftar
            </h3>
            <div className="space-y-1 rounded-md border p-4">
              <BiodataDisplayItem label="Nama Lengkap" value={biodataDetailsMock.fullName} />
              <BiodataDisplayItem label="NISN" value={biodataDetailsMock.nisn} />
              <BiodataDisplayItem label="NIK" value={biodataDetailsMock.nik} />
              <BiodataDisplayItem label="Sekolah Asal" value={biodataDetailsMock.previousSchool} />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-2 text-primary flex items-center">
                <Star className="mr-2 h-6 w-6" />
                Status & Peringkat Pilihan
            </h3>
             <p className="text-sm text-muted-foreground mb-4">
                Status verifikasi ditentukan oleh sekolah pilihan pertama Anda dan berlaku untuk semua pilihan di bawahnya.
            </p>
            <Dialog>
              <DialogTrigger asChild>
                 <Card className="mb-6 bg-muted/30 hover:bg-muted/40 cursor-pointer transition-colors">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                            <ShieldCheck className="mr-3 h-6 w-6 text-primary" />
                            Ringkasan Verifikasi Berkas
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4 text-sm">
                        <div>
                            <p className="font-medium text-muted-foreground mb-1">Status</p>
                            <Badge variant={getVerificationBadgeVariant(applicationVerificationStatus)} className="font-semibold text-base px-3 py-1">
                                {applicationVerificationStatus}
                            </Badge>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground mb-1">Diverifikasi oleh Sekolah</p>
                            <p className="font-semibold">{displaySelections[0]?.school.namaSekolah || '-'}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground mb-1">Nama Verifikator</p>
                            <p className="font-semibold">Ahmad Syahputra, S.Kom</p>
                        </div>
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
                  <ul className="space-y-6">
                    <li className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 flex-shrink-0 mt-1">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">Pendaftaran Selesai</p>
                            <p className="text-sm text-muted-foreground">Anda berhasil menyelesaikan semua langkah pendaftaran dan mengirimkan berkas.</p>
                            <p className="text-xs text-muted-foreground mt-1">15 Juli 2024, 10:30 WIB</p>
                        </div>
                    </li>
                     <li className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 dark:bg-red-900 flex-shrink-0 mt-1">
                            <XSquare className="h-5 w-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">Berkas Ditolak</p>
                            <p className="text-sm text-muted-foreground">Verifikator <span className="font-medium">Ahmad Syahputra, S.Kom</span> menolak berkas dengan alasan: "Foto Kartu Keluarga (KK) buram dan tidak terbaca."</p>
                            <p className="text-xs text-muted-foreground mt-1">15 Juli 2024, 14:00 WIB</p>
                        </div>
                    </li>
                     <li className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 flex-shrink-0 mt-1">
                            <FileUp className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">Perbaikan Berkas Selesai</p>
                            <p className="text-sm text-muted-foreground">Anda berhasil mengunggah ulang berkas Kartu Keluarga (KK) yang telah diperbaiki.</p>
                            <p className="text-xs text-muted-foreground mt-1">16 Juli 2024, 09:15 WIB</p>
                        </div>
                    </li>
                     <li className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0 mt-1">
                            <UserCheckIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">Berkas Diverifikasi Ulang</p>
                            <p className="text-sm text-muted-foreground">Verifikator <span className="font-medium">Ahmad Syahputra, S.Kom</span> telah memverifikasi ulang berkas perbaikan Anda.</p>
                            <p className="text-xs text-muted-foreground mt-1">16 Juli 2024, 11:00 WIB</p>
                        </div>
                    </li>
                     <li className="flex gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 flex-shrink-0 mt-1">
                            <BarChart className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <p className="font-semibold">Peringkat Diperbarui</p>
                            <p className="text-sm text-muted-foreground">Sistem telah memperbarui peringkat sementara Anda setelah verifikasi berhasil.</p>
                            <p className="text-xs text-muted-foreground mt-1">16 Juli 2024, 11:05 WIB</p>
                        </div>
                    </li>
                  </ul>
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
                    <span className="font-semibold text-lg text-primary">{storedPathway || "Tidak Diketahui"}</span>
                </div>
                {displaySelections.map(({ school, major }, index) => {
                    const pathwayKey = (storedPathway?.toLowerCase() || '') as keyof typeof school.jalurKuota;
                    const quota = school.jalurKuota ? (school.jalurKuota[pathwayKey] || 0) : 0;
                    const rank = quota > 0 ? Math.floor(Math.random() * (quota + 20)) + 1 : Math.floor(Math.random() * 20) + 1;
                    const isWithinQuota = rank <= quota && quota > 0;
                    const rankStatus = isWithinQuota ? "Memenuhi Peringkat" : "Di Luar Peringkat";
                    const rankStatusVariant = isWithinQuota ? "default" : "destructive";

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
                            <CardContent className="p-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Peringkat Sementara</p>
                                    <p className="font-semibold text-lg">{quota > 0 ? `${rank} / ${quota}` : '-'}</p>
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
            <h3 className="text-xl font-semibold mb-4 text-primary">Kelengkapan Berkas</h3>
            <div className="space-y-2 rounded-md border p-4">
              {documentsToShow.length > 0 ? (
                documentsToShow.map(doc => {
                  const isUploaded = uploadedDocIds.includes(doc.id);
                  
                  let icon;
                  let badgeVariant: "default" | "destructive" | "secondary" = "secondary";
                  let statusText = "";

                  if (isUploaded) {
                    icon = <FileCheck2 className="h-5 w-5 mr-2 text-green-600" />;
                    badgeVariant = "default";
                    statusText = "Terunggah";
                  } else if (doc.required) {
                    icon = <XSquare className="h-5 w-5 mr-2 text-destructive" />;
                    badgeVariant = "destructive";
                    statusText = "Belum Diunggah";
                  } else {
                    icon = <FileQuestion className="h-5 w-5 mr-2 text-muted-foreground" />;
                    badgeVariant = "secondary";
                    statusText = "Tidak Diunggah";
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
                Status "Terunggah" menunjukkan berkas telah dipilih pada sesi unggah terakhir. Verifikasi akhir dilakukan oleh panitia.
            </p>
          </section>

        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-center pt-6 gap-4">
            <Button asChild variant="outline">
                <Link href="/registration/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Beranda
                </Link>
            </Button>
             <Button onClick={handleReupload}>
                <FileCheck2 className="mr-2 h-4 w-4" />
                Ubah/Unggah Ulang Berkas
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
