
"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, ArrowLeft, Info, FileCheck2, FileQuestion, UserCircle, CheckSquare, XSquare, School2 } from 'lucide-react';
import { initialSchoolData, type School } from "@/app/registration/dashboard/page"; 
import { getFromLocalStorage, type RegistrationProgress } from "@/lib/localStorage";

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


export default function SelectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPathway = searchParams.get("pathway");
  const schoolIdsParam = searchParams.get("schoolIds");
  const uploadedDocsString = searchParams.get("docs");

  const [selectedSchools, setSelectedSchools] = React.useState<School[]>([]);
  const [documentsToShow, setDocumentsToShow] = React.useState<DocumentItem[]>([]);
  const [uploadedDocIds, setUploadedDocIds] = React.useState<string[]>([]);
  
  // State to hold pathway and school IDs from local storage for the re-upload button
  const [storedPathway, setStoredPathway] = React.useState<string | undefined>();

  React.useEffect(() => {
    let pathway = selectedPathway;
    let schoolIds = schoolIdsParam ? schoolIdsParam.split(',') : [];

    // Fallback to localStorage if params are missing (e.g., on page refresh)
    if (!pathway || schoolIds.length === 0) {
      const savedProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null);
      if (savedProgress) {
        pathway = pathway || savedProgress.pathway;
        schoolIds = schoolIds.length > 0 ? schoolIds : (savedProgress.schoolIds || []);
      }
    }
    setStoredPathway(pathway);

    if (schoolIds.length > 0) {
      const orderedSchools = schoolIds.map(id => 
        initialSchoolData.find(s => s.id === id)
      ).filter((s): s is School => s !== undefined);
      setSelectedSchools(orderedSchools);
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
    } else {
        const savedProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null);
        if (savedProgress?.documentMetadata) {
            setUploadedDocIds(Object.keys(savedProgress.documentMetadata).filter(k => savedProgress.documentMetadata![k] !== null));
        }
    }

  }, [schoolIdsParam, selectedPathway, uploadedDocsString]);
  
  const handleReupload = () => {
    if (storedPathway) {
      router.push(`/registration/document-upload?pathway=${storedPathway}`);
    } else {
      router.push('/registration/documents');
    }
  }


  if (!storedPathway || selectedSchools.length === 0) {
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

  const mockVerificationStatus = "Menunggu Verifikasi oleh Panitia"; 

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
              <BiodataDisplayItem label="Tempat, Tanggal Lahir" value={`${biodataDetailsMock.placeOfBirth}, ${biodataDetailsMock.dateOfBirth}`} />
              <BiodataDisplayItem label="Jenis Kelamin" value={biodataDetailsMock.gender} />
              <BiodataDisplayItem label="Agama" value={biodataDetailsMock.religion} />
              <BiodataDisplayItem label="Sekolah Asal" value={biodataDetailsMock.previousSchool} />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary">Detail Pilihan Pendaftaran</h3>
            <div className="space-y-4 rounded-md border p-4">
              <div className="flex justify-between items-center">
                <span className="font-medium text-muted-foreground">Jalur Pendaftaran:</span>
                <span className="font-semibold">{storedPathway || "Tidak Diketahui"}</span>
              </div>
              <div>
                <span className="font-medium text-muted-foreground">Prioritas Sekolah Pilihan:</span>
                <ul className="list-decimal list-inside mt-2 space-y-1">
                  {selectedSchools.map(school => (
                    <li key={school.id} className="text-sm font-semibold flex items-center">
                      <School2 className="h-4 w-4 mr-2 text-primary opacity-80" />
                      {school.namaSekolah}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
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
          
          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary">Status Verifikasi Pendaftaran</h3>
            <div className="rounded-md border p-6 text-center bg-secondary/30">
                <div className="flex items-center justify-center mb-2">
                    {mockVerificationStatus === "Menunggu Verifikasi oleh Panitia" && <Info className="h-6 w-6 mr-2 text-yellow-600" />}
                    {mockVerificationStatus.toLowerCase().includes("diterima") && <CheckSquare className="h-6 w-6 mr-2 text-green-600" />}
                    {mockVerificationStatus.toLowerCase().includes("ditolak") && <XSquare className="h-6 w-6 mr-2 text-destructive" />}
                    <p className="text-lg font-medium text-foreground">{mockVerificationStatus}</p>
                </div>
              <p className="text-sm text-muted-foreground mt-1">
                Harap periksa halaman ini secara berkala untuk pembaruan status dari panitia. Anda akan dihubungi jika ada informasi lebih lanjut.
              </p>
            </div>
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
