
"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, ArrowLeft, Info, FileCheck2, FileQuestion, UserCircle, XSquare, School2, Star } from 'lucide-react';
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

// New type and function for verification status
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
  // We will rely on localStorage as the primary source of truth for selections and docs
  const uploadedDocsString = searchParams.get("docs");

  const [displaySelections, setDisplaySelections] = React.useState<DisplaySelection[]>([]);
  const [documentsToShow, setDocumentsToShow] = React.useState<DocumentItem[]>([]);
  const [uploadedDocIds, setUploadedDocIds] = React.useState<string[]>([]);
  
  const [storedPathway, setStoredPathway] = React.useState<string | undefined>();

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
      }).filter(item => item.school); // Filter out any selections where the school wasn't found

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
    
    // Use URL params first, then fallback to local storage for doc IDs
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

  // Define possible verification statuses to simulate different states
  const verificationStatuses: VerificationStatus[] = ["Belum verifikasi", "Terverifikasi", "Berkas tidak sesuai"];


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
            <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
                <Star className="mr-2 h-6 w-6" />
                Status & Peringkat Pilihan
            </h3>
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
                    
                    // Simulate verification status based on user's request
                    const verificationStatus = verificationStatuses[index % verificationStatuses.length];

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
                            <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Status Verifikasi</p>
                                    <Badge variant={getVerificationBadgeVariant(verificationStatus)} className="mt-1 font-semibold">
                                        {verificationStatus}
                                    </Badge>
                                </div>
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
