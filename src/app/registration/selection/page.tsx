
"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ClipboardCheck, ArrowLeft, Info, FileCheck2, FileQuestion, CheckSquare, XSquare } from 'lucide-react';
import { initialSchoolData, type School } from "@/app/registration/dashboard/page"; 

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
    { id: "sertifikat_prestasi", label: "Scan Sertifikat Prestasi (jika ada)", required: false },
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
  const selectedSchoolId = searchParams.get("schoolId");
  const uploadedDocsString = searchParams.get("docs");

  const [school, setSchool] = React.useState<School | undefined>(undefined);
  const [documentsToShow, setDocumentsToShow] = React.useState<DocumentItem[]>([]);
  const [uploadedDocIds, setUploadedDocIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (selectedSchoolId) {
      const foundSchool = initialSchoolData.find(s => s.id === selectedSchoolId);
      setSchool(foundSchool);
    }

    if (selectedPathway) {
      const pathwayDocs = pathwaySpecificDocumentsMapConst[selectedPathway] || [];
      setDocumentsToShow([...generalDocumentsConst, ...pathwayDocs]);
    } else {
      setDocumentsToShow([...generalDocumentsConst]);
    }
    
    if (uploadedDocsString) {
      setUploadedDocIds(uploadedDocsString.split(','));
    }

  }, [selectedSchoolId, selectedPathway, uploadedDocsString]);

  if (!selectedPathway || !selectedSchoolId) {
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

  const mockVerificationStatus = "Menunggu Verifikasi oleh Panitia"; // Example status

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
            <h3 className="text-xl font-semibold mb-4 text-primary">Detail Pilihan Pendaftaran</h3>
            <div className="space-y-3 rounded-md border p-4">
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Sekolah Tujuan:</span>
                <span className="font-semibold">{school?.namaSekolah || "Tidak Diketahui"}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-muted-foreground">Jalur Pendaftaran:</span>
                <span className="font-semibold">{selectedPathway || "Tidak Diketahui"}</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary">Kelengkapan Berkas</h3>
            <div className="space-y-3 rounded-md border p-4">
              {documentsToShow.length > 0 ? (
                documentsToShow.map(doc => {
                  const isUploaded = uploadedDocIds.includes(doc.id);
                  const isRequiredAndMissing = doc.required && !isUploaded;
                  return (
                    <div key={doc.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <span className="flex items-center">
                        {isUploaded ? <FileCheck2 className="h-5 w-5 mr-2 text-green-600" /> : 
                         (doc.required ? <FileQuestion className="h-5 w-5 mr-2 text-destructive" /> : <FileQuestion className="h-5 w-5 mr-2 text-muted-foreground" />)
                        }
                        {doc.label} {!doc.required && <span className="text-xs text-muted-foreground ml-1">(Opsional)</span>}
                      </span>
                      <Badge variant={isUploaded ? "default" : (isRequiredAndMissing ? "destructive" : "secondary")}>
                        {isUploaded ? "Terunggah" : (doc.required ? "Belum Diunggah" : "Tidak Diunggah")}
                      </Badge>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center">Tidak ada informasi berkas untuk ditampilkan.</p>
              )}
            </div>
          </section>
          
          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary">Status Verifikasi</h3>
            <div className="rounded-md border p-6 text-center bg-secondary/30">
              <p className="text-lg font-medium text-foreground">{mockVerificationStatus}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Harap periksa halaman ini secara berkala untuk pembaruan status.
              </p>
            </div>
          </section>

        </CardContent>
        <CardFooter className="flex justify-center pt-6">
            <Button asChild variant="outline">
                <Link href="/registration/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Beranda
                </Link>
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
