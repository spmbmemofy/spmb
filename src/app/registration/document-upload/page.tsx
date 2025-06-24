
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UploadCloud, FileUp, Paperclip, CheckCircle2, AlertCircle, ArrowLeft, FileQuestion } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { getFromLocalStorage, saveToLocalStorage, type RegistrationProgress, type LoginCredentials } from "@/lib/localStorage";
import { getApplicants, updateApplicant, createOrUpdateApplicantFromRegistration } from "@/lib/applicantService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { ActivityEvent } from "@/lib/types";

const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";
const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";


interface DocumentItem {
  id: string;
  label: string;
  required: boolean;
}

interface DocumentUploadItemProps {
  id: string;
  label: string;
  required?: boolean;
  file: File | null;
  fileMetadata?: { name: string; size: number; type: string } | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
}

const DocumentUploadItem: React.FC<DocumentUploadItemProps> = ({ id, label, required = true, file, fileMetadata, onFileChange }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const displayFileName = file?.name || fileMetadata?.name;
  const displayFileSize = file?.size || fileMetadata?.size;
  const displayFileType = file?.type || fileMetadata?.type;
  const hasSelection = file || fileMetadata;

  return (
    <div className="space-y-2 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="text-md">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {hasSelection && <CheckCircle2 className="h-5 w-5 text-green-500" />}
      </div>
      <div className="flex items-center space-x-3">
        <Button
          variant="outline"
          onClick={() => inputRef.current?.click()}
          className="w-full sm:w-auto"
        >
          <FileUp className="mr-2 h-4 w-4" />
          Pilih File
        </Button>
        <Input
          id={id}
          type="file"
          ref={inputRef}
          onChange={(e) => onFileChange(e, id)}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
        />
        <span className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
          {displayFileName ? displayFileName : "Belum ada file dipilih"}
        </span>
      </div>
       {displayFileName && displayFileSize !== undefined && displayFileType && (
         <p className="text-xs text-muted-foreground">
           Ukuran: {(displayFileSize / 1024 / 1024).toFixed(2)} MB, Jenis: {displayFileType}
           {file ? "" : " (Dari sesi sebelumnya)"}
         </p>
       )}
    </div>
  );
};

const generalDocuments: DocumentItem[] = [
  { id: "kk", label: "Scan Kartu Keluarga (KK)", required: true },
  { id: "akta", label: "Scan Akta Kelahiran", required: true },
  { id: "skl", label: "Scan Surat Keterangan Lulus (SKL)", required: true },
  { id: "rapor_gabungan", label: "Scan Rapor (Semester 1-5, Gabungan PDF/Gambar)", required: true },
];

const pathwaySpecificDocumentsMap: Record<string, DocumentItem[]> = {
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

export default function DocumentUploadPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPathwayParam = searchParams.get("pathway") || "";

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [documentsToUpload, setDocumentsToUpload] = React.useState<DocumentItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, File | null>>({});
  const [fileMetadataStore, setFileMetadataStore] = React.useState<RegistrationProgress['documentMetadata']>({});
  
  const [isCorrectionMode, setIsCorrectionMode] = React.useState(false);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [isBiodataInvalid, setIsBiodataInvalid] = React.useState(false);
  const [isGradesInvalid, setIsGradesInvalid] = React.useState(false);
  
  React.useEffect(() => {
    const savedProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null);
    if (!savedProgress?.hasProfilePhoto) {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Harap unggah foto profil Anda di halaman Data Pendaftar sebelum melanjutkan.",
      });
      router.replace('/registration/dashboard');
      return; 
    }
    
    const loggedInUser = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    if (!loggedInUser?.username) {
        toast({ variant: "destructive", title: "Sesi tidak valid", description: "Silakan login kembali."});
        router.replace('/');
        return;
    }

    const allApplicants = getApplicants();
    const applicantData = allApplicants.find(app => app.nisn === loggedInUser.username);
    
    let currentSelectedPathway = selectedPathwayParam || savedProgress?.pathway || applicantData?.jalur || "";

    if (!currentSelectedPathway) {
        toast({ variant: "destructive", title: "Informasi Tidak Lengkap", description: "Jalur pendaftaran belum dipilih. Mengalihkan..." });
        router.replace('/registration/documents');
        return;
    }
    
    if (selectedPathwayParam !== currentSelectedPathway) {
        router.replace(`/registration/document-upload?pathway=${currentSelectedPathway}`);
        return;
    }

    if (applicantData?.statusVerifikasi === 'Berkas tidak sesuai') {
        setIsCorrectionMode(true);
        setRejectionReason(applicantData.rejectionReason || "Tidak ada alasan spesifik yang diberikan.");

        const invalidDocIds = Object.entries(applicantData.documentStatuses || {})
            .filter(([, status]) => status === 'invalid')
            .map(([id]) => id);
        
        const allPossibleDocs = [...generalDocuments, ...(pathwaySpecificDocumentsMap[currentSelectedPathway] || [])];
        const invalidDocs = allPossibleDocs.filter(doc => invalidDocIds.includes(doc.id));
        setDocumentsToUpload(invalidDocs);
        
        setIsBiodataInvalid(invalidDocIds.includes('biodata'));
        setIsGradesInvalid(invalidDocIds.includes('nilai_rapor'));
    } else {
        const currentPathwayDocs = pathwaySpecificDocumentsMap[currentSelectedPathway] || [];
        const allDocs = [...generalDocuments, ...currentPathwayDocs];
        setDocumentsToUpload(allDocs);
    }
    
    if (savedProgress?.documentMetadata) {
      setFileMetadataStore(savedProgress.documentMetadata);
    }
    setIsLoading(false);

  }, [router, toast, selectedPathwayParam]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
    const file = event.target.files?.[0];
    const newUploadedFiles = { ...uploadedFiles };
    const newFileMetadata = { ...fileMetadataStore };

    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Ukuran File Terlalu Besar",
          description: `File ${file.name} melebihi batas maksimal 2MB.`,
        });
        event.target.value = ''; 
        newUploadedFiles[documentId] = null;
        newFileMetadata[documentId] = null;
      } else {
        newUploadedFiles[documentId] = file;
        newFileMetadata[documentId] = { name: file.name, size: file.size, type: file.type };
      }
    } else {
      newUploadedFiles[documentId] = null;
      newFileMetadata[documentId] = null;
    }
    setUploadedFiles(newUploadedFiles);
    setFileMetadataStore(newFileMetadata);

    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
      ...currentProgress,
      documentMetadata: newFileMetadata,
    });
  };

  const allRequiredFilesUploaded = () => {
    if (documentsToUpload.length === 0 && !isCorrectionMode) return false;
    if (isCorrectionMode && Object.keys(uploadedFiles).length === 0) return false;
    
    return documentsToUpload
      .filter(doc => doc.required)
      .every(doc => uploadedFiles[doc.id] || fileMetadataStore[doc.id]);
  };

  const handleSubmit = () => {
    if (!allRequiredFilesUploaded()) {
      toast({
        variant: "destructive",
        title: isCorrectionMode ? "Berkas Perbaikan Belum Lengkap" : "Berkas Belum Lengkap",
        description: "Harap unggah semua berkas yang wajib diisi untuk melanjutkan.",
      });
      return;
    }

    setIsSubmitting(true);
    const loggedInUser = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    if (!loggedInUser?.username) {
        setIsSubmitting(false);
        return;
    }

    if (isCorrectionMode) {
        const allApplicants = getApplicants();
        const applicantData = allApplicants.find(app => app.nisn === loggedInUser.username);
        if (applicantData) {
            const newStatuses = { ...applicantData.documentStatuses };
            Object.keys(uploadedFiles).forEach(docId => {
                if (uploadedFiles[docId]) {
                    newStatuses[docId] = null; // Mark as pending re-verification
                }
            });

            applicantData.statusVerifikasi = "Menunggu Verifikasi";
            applicantData.rejectionReason = undefined;
            applicantData.documentStatuses = newStatuses;

            const historyEvent: ActivityEvent = {
                type: 'FILES_RESUBMITTED',
                timestamp: new Date().toISOString(),
                actor: applicantData.fullName
            };
            applicantData.activityHistory = [...(applicantData.activityHistory || []), historyEvent];
            
            updateApplicant(applicantData);

            setTimeout(() => {
                toast({ title: "Perbaikan Berkas Terkirim", description: "Berkas Anda akan segera ditinjau kembali oleh verifikator." });
                setIsSubmitting(false);
                router.push('/registration/status');
            }, 1500);
        } else {
            setIsSubmitting(false);
        }
    } else {
        const progress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
        if (!progress || !progress.biodata || !progress.pathway || !progress.schoolSelections) {
             toast({ variant: "destructive", title: "Data Pendaftaran Tidak Lengkap", description: "Harap kembali dan lengkapi data Anda." });
             setIsSubmitting(false);
             return;
        }

        setTimeout(() => {
          try {
            createOrUpdateApplicantFromRegistration(progress, loggedInUser);
            toast({ title: "Pendaftaran Berhasil Dikirim", description: "Berkas dan data Anda akan segera diverifikasi oleh panitia." });
            saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, { ...progress, registrationCompleted: true });
            setIsSubmitting(false);
            router.push(`/registration/status`);
          } catch (error: any) {
             toast({ variant: "destructive", title: "Gagal Mengirim Pendaftaran", description: error.message });
             setIsSubmitting(false);
          }
        }, 1500);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p>Memeriksa sesi Anda...</p>
      </div>
    );
  }

  if (isCorrectionMode && (isBiodataInvalid || isGradesInvalid)) {
    return (
        <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-2xl shadow-2xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-destructive">
                        <AlertCircle className="h-8 w-8" />
                        Tindakan Diperlukan
                    </CardTitle>
                    <CardDescription>
                        Satu atau lebih bagian penting dari pendaftaran Anda ditandai tidak valid oleh verifikator. Harap perbaiki data tersebut sebelum melanjutkan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isBiodataInvalid && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Perbaikan Biodata</AlertTitle>
                            <AlertDescription>
                                Data diri Anda tidak sesuai. Klik tombol di bawah untuk membuka halaman biodata dan memperbaikinya.
                                <Button asChild variant="secondary" className="mt-3 w-full sm:w-auto">
                                    <Link href="/registration/dashboard">Buka Halaman Biodata</Link>
                                </Button>
                            </AlertDescription>
                        </Alert>
                    )}
                    {isGradesInvalid && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Perbaikan Nilai Rapor</AlertTitle>
                            <AlertDescription>
                                Nilai rapor Anda ditandai tidak sesuai. Karena nilai rapor tidak dapat diubah oleh siswa, silakan hubungi operator sekolah asal Anda untuk melakukan perbaikan data.
                            </AlertDescription>
                        </Alert>
                    )}
                     <Alert>
                        <FileQuestion className="h-4 w-4" />
                        <AlertTitle>Perbaikan Berkas Lainnya</AlertTitle>
                        <AlertDescription>
                           Setelah memperbaiki data di atas, Anda dapat mengunggah ulang berkas lain yang ditolak pada halaman ini. Halaman akan tersedia setelah data Anda valid.
                        </AlertDescription>
                    </Alert>
                </CardContent>
                <CardFooter>
                     <Button variant="outline" asChild>
                        <Link href="/registration/status">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Kembali ke Halaman Status
                        </Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <UploadCloud size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">
            {isCorrectionMode ? "Perbaikan Berkas Pendaftaran" : "Unggah Berkas Pendaftaran"}
          </CardTitle>
          <CardDescription className="text-md">
            {isCorrectionMode 
                ? "Harap unggah ulang berkas yang ditandai tidak valid oleh verifikator."
                : "Harap unggah dokumen yang diperlukan. Format file yang diterima: PDF, JPG, PNG. Ukuran maks: 2MB."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {isCorrectionMode && (
            <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Perbaikan Berkas Diperlukan</AlertTitle>
                <AlertDescription>
                    Verifikator menemukan masalah dengan berkas Anda. Alasan: 
                    <span className="font-semibold italic block mt-1">"{rejectionReason}"</span>
                    <br />
                    Harap unggah ulang berkas yang valid untuk dokumen yang tercantum di bawah ini.
                </AlertDescription>
            </Alert>
          )}

          <section>
             <h3 className="text-xl font-semibold mb-4 text-primary">
                {isCorrectionMode ? "Berkas yang Perlu Diperbaiki" : "Daftar Berkas"}
             </h3>
            {documentsToUpload.map(doc => (
              <DocumentUploadItem
                key={doc.id}
                id={doc.id}
                label={doc.label}
                required={doc.required}
                file={uploadedFiles[doc.id] || null}
                fileMetadata={fileMetadataStore?.[doc.id]}
                onFileChange={handleFileChange}
              />
            ))}
            {isCorrectionMode && documentsToUpload.length === 0 && !isBiodataInvalid && !isGradesInvalid && (
                <p className="text-center text-muted-foreground py-4">Tidak ada berkas yang ditandai untuk diperbaiki. Hubungi panitia jika Anda merasa ini adalah sebuah kesalahan.</p>
            )}
          </section>
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !allRequiredFilesUploaded()}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            {isSubmitting 
                ? (isCorrectionMode ? "Mengirim Ulang..." : "Mengunggah...") 
                : (isCorrectionMode ? "Kirim Ulang Berkas Perbaikan" : "Unggah & Selesaikan Pendaftaran")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
