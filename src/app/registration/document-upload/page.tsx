
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UploadCloud, FileUp, Paperclip, CheckCircle2, ArrowLeft, ClipboardCheck, AlertTriangle, HelpCircle, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { getFromLocalStorage, saveToLocalStorage, type RegistrationProgress, type LoginCredentials } from "@/lib/localStorage";
import { createOrUpdateApplicantFromRegistration, getApplicants } from "@/lib/applicantService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getSchoolById } from "@/lib/schoolService";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";


const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";
const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";
const DUMMY_PDF_URL = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';


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
  onShowGuide: (id: string) => void;
  onViewFile: (file: File | null, metadata: { name: string; size: number; type: string } | null) => void;
  disabled?: boolean;
}

const DocumentUploadItem: React.FC<DocumentUploadItemProps> = ({ id, label, required = true, file, fileMetadata, onFileChange, onShowGuide, onViewFile, disabled = false }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const displayFileName = file?.name || fileMetadata?.name;
  const hasSelection = file || fileMetadata;

  return (
    <div className="space-y-2 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-start">
        <Label htmlFor={id} className="text-md font-medium leading-snug">
          {label} {required && <span className="text-destructive">*</span>}
           {displayFileName && (
             <p className="text-xs text-muted-foreground font-normal mt-1">
               {displayFileName}
             </p>
           )}
        </Label>
        {hasSelection && <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <FileUp className="mr-2 h-4 w-4" />
          {hasSelection ? 'Ganti File' : 'Pilih File'}
        </Button>
        <Input
          id={id}
          type="file"
          ref={inputRef}
          onChange={(e) => onFileChange(e, id)}
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png"
          disabled={disabled}
        />
        
        <Button type="button" variant="ghost" size="sm" onClick={() => onShowGuide(id)}>
            <HelpCircle className="mr-2 h-4 w-4" />
            Panduan
        </Button>
        
        <Button type="button" variant="ghost" size="sm" onClick={() => onViewFile(file, fileMetadata)} disabled={!hasSelection}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat
        </Button>
      </div>
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
    { id: "sertifikat_prestasi", label: "Scan Sertifikat Prestasi", required: true },
    { id: "sk_prestasi", label: "Scan Surat Keterangan Prestasi dari Sekolah Asal", required: true },
  ],
  Mutasi: [
    { id: "sk_penempatan", label: "Scan Surat Keputusan Penempatan/Mutasi Kerja Orang Tua/Wali", required: true },
  ],
  Domisili: [], 
};

const StepProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { label: "Isi Biodata", step: 1 },
    { label: "Pilih Sekolah", step: 2 },
    { label: "Unggah Berkas", step: 3 }
  ];
  return (
    <div className="w-full max-w-3xl mb-8 px-4">
      <div className="flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-muted -translate-y-1/2 z-0" />
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />
        {steps.map((s) => {
          const isActive = s.step <= currentStep;
          const isCurrent = s.step === currentStep;
          return (
            <div key={s.step} className="flex flex-col items-center z-10">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  isCurrent 
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20" 
                    : isActive 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {s.step}
              </div>
              <span className={`text-xs mt-2 font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default function DocumentUploadPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPathwayParam = searchParams.get("pathway") || "";

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLocked, setIsLocked] = React.useState(false);
  
  const [documentsToUpload, setDocumentsToUpload] = React.useState<DocumentItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, File | null>>({});
  const [fileMetadataStore, setFileMetadataStore] = React.useState<RegistrationProgress['documentMetadata']>({});
  const [missingFiles, setMissingFiles] = React.useState<DocumentItem[]>([]);
  
  const [isGuideOpen, setIsGuideOpen] = React.useState(false);
  const [guideContent, setGuideContent] = React.useState({ title: '', imageUrl: '' });
  const [isDeclarationChecked, setIsDeclarationChecked] = React.useState(false);
  
  React.useEffect(() => {
    const savedProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null);
    const loggedInUser = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    const applicantData = loggedInUser?.username ? getApplicants().find(a => a.nisn === loggedInUser.username) : null;

    if (!savedProgress?.biodata) {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Harap lengkapi biodata Anda di halaman dasbor sebelum melanjutkan.",
      });
      router.replace('/registration/dashboard');
      return; 
    }
    
    if (savedProgress?.registrationCompleted || (applicantData && applicantData.statusVerifikasi)) {
        setIsLocked(true);
    }
    
    if (!selectedPathwayParam) {
        toast({ variant: "destructive", title: "Informasi Tidak Lengkap", description: "Jalur pendaftaran belum dipilih. Mengalihkan..." });
        router.replace('/registration/documents');
        return;
    }
    
    let allDocs = [...generalDocuments];
    
    if (selectedPathwayParam === 'Prestasi' && savedProgress?.achievements && savedProgress.achievements.length > 0) {
      savedProgress.achievements.forEach((ach) => {
        let certLabel = `Scan Sertifikat: ${ach.name}`;
        let supportLabel = `Scan SK/Dokumen Pendukung: ${ach.name}`;
        
        if (ach.subcategory === 'rapor') {
          certLabel = `Scan Surat Keterangan Juara Kelas (Peringkat 1-3): ${ach.name}`;
          supportLabel = `Scan Rapor Pendukung: ${ach.name}`;
        } else if (ach.subcategory === 'tka') {
          certLabel = `Scan Sertifikat TKA: ${ach.name}`;
          supportLabel = `Scan SK Peringkat TKA dari Kepala Sekolah: ${ach.name}`;
        } else if (ach.subcategory === 'osis') {
          certLabel = `Scan SK Penetapan Ketua OSIS: ${ach.name}`;
          supportLabel = `Scan Sertifikat/Piagam OSIS (jika ada): ${ach.name}`;
        } else if (ach.subcategory === 'pratama') {
          certLabel = `Scan SK Ketua Pratama: ${ach.name}`;
          supportLabel = `Scan Piagam/Sertifikat Kepramukaan: ${ach.name}`;
        }

        allDocs.push({
          id: `sertifikat_${ach.id}`,
          label: certLabel,
          required: true
        });
        
        const isSupportRequired = !['osis', 'pratama'].includes(ach.subcategory);
        allDocs.push({
          id: `dokumen_pendukung_${ach.id}`,
          label: supportLabel,
          required: isSupportRequired
        });
      });
    } else {
      const currentPathwayDocs = pathwaySpecificDocumentsMap[selectedPathwayParam] || [];
      allDocs.push(...currentPathwayDocs);
    }

    const firstChoice = savedProgress?.schoolSelections?.[0];
    if (firstChoice) {
        const school = getSchoolById(firstChoice.schoolId);
        if (school && school.jenjang === 'SMK' && firstChoice.major) {
            const major = school.majors?.find(m => m.name === firstChoice.major);
            if (major && major.berkasPendukung && major.berkasPendukung !== 'Tidak ada') {
                allDocs.push({
                    id: 'berkas_pendukung_jurusan',
                    label: major.berkasPendukung,
                    required: true,
                });
            }
        }
    }
    
    setDocumentsToUpload(allDocs);
    
    if (savedProgress?.documentMetadata) {
      setFileMetadataStore(savedProgress.documentMetadata);
    }
    setIsLoading(false);

  }, [router, toast, selectedPathwayParam]);

  React.useEffect(() => {
    // This effect runs after the documents to upload are determined.
    // It calculates which required documents are still missing.
    const requiredDocs = documentsToUpload.filter(doc => doc.required);
    const missing = requiredDocs.filter(doc => !uploadedFiles[doc.id] && !fileMetadataStore[doc.id]);
    setMissingFiles(missing);
  }, [documentsToUpload, uploadedFiles, fileMetadataStore]);


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

  const handleShowGuide = (documentId: string) => {
    const doc = documentsToUpload.find(d => d.id === documentId);
    setGuideContent({
      title: `Panduan untuk ${doc?.label || 'Berkas'}`,
      imageUrl: `https://placehold.co/800x600.png`,
    });
    setIsGuideOpen(true);
  };
  
  const handleViewFile = (file: File | null, metadata: { name: string; size: number; type: string } | null) => {
    if (file) {
      const url = URL.createObjectURL(file);
      window.open(url, '_blank');
    } else if (metadata) {
      window.open(DUMMY_PDF_URL, '_blank');
      toast({ title: "Membuka Berkas", description: "Menampilkan pratinjau berkas dari sesi sebelumnya." });
    } else {
      toast({ variant: "destructive", title: "Gagal", description: "Tidak ada berkas untuk ditampilkan." });
    }
  };


  const allRequiredFilesUploaded = () => {
    if (documentsToUpload.length === 0) return false;
    
    return documentsToUpload
      .filter(doc => doc.required)
      .every(doc => uploadedFiles[doc.id] || fileMetadataStore[doc.id]);
  };

  const handleSubmit = () => {
    if (!allRequiredFilesUploaded()) {
      toast({
        variant: "destructive",
        title: "Berkas Belum Lengkap",
        description: "Harap unggah semua berkas yang wajib diisi untuk melanjutkan.",
      });
      return;
    }
    
    if (!isDeclarationChecked) {
      toast({
        variant: "destructive",
        title: "Pernyataan Diperlukan",
        description: "Harap centang pernyataan kebenaran data sebelum mengirim.",
      });
      return;
    }

    setIsSubmitting(true);
    const loggedInUser = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    if (!loggedInUser?.username) {
        setIsSubmitting(false);
        return;
    }

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
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p>Memuat halaman unggah berkas...</p>
      </div>
    );
  }

  return (
    <>
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <StepProgress currentStep={3} />
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <UploadCloud size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">
            Unggah Berkas Pendaftaran
          </CardTitle>
          <CardDescription className="text-md">
            Harap unggah dokumen yang diperlukan. Format file yang diterima: PDF, JPG, PNG. Ukuran maks: 2MB.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
         {isLocked && (
            <Alert variant="default" className="bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-300 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Tahap Ini Terkunci</AlertTitle>
                <AlertDescription>
                    Anda telah menyelesaikan pendaftaran. Unggah berkas tidak dapat diubah lagi.
                </AlertDescription>
            </Alert>
          )}

          {!isLocked && missingFiles.length > 0 && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Berkas Wajib Belum Lengkap</AlertTitle>
              <AlertDescription>
                Anda harus mengunggah semua berkas yang ditandai wajib (*) untuk dapat melanjutkan. Berkas yang belum diunggah:
                <ul className="list-disc pl-5 mt-2 font-medium">
                  {missingFiles.map(file => (
                    <li key={file.id}>{file.label}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <section>
             <h3 className="text-xl font-semibold mb-4 text-primary">
                Daftar Berkas
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
                onShowGuide={handleShowGuide}
                onViewFile={handleViewFile}
                disabled={isLocked}
              />
            ))}
          </section>

          {!isLocked && (
            <div className="flex items-start space-x-3 mt-6 pt-6 border-t">
              <Checkbox
                id="declaration"
                checked={isDeclarationChecked}
                onCheckedChange={(checked) => setIsDeclarationChecked(Boolean(checked))}
                disabled={isLocked}
                aria-label="Pernyataan Kebenaran Data"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="declaration"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Pernyataan Kebenaran Data
                </label>
                <p className="text-sm text-muted-foreground">
                  Saya menyatakan bahwa semua data dan dokumen yang saya unggah adalah benar dan dapat dipertanggungjawabkan.
                </p>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
          <Button variant="outline" asChild>
            <Link href="/registration/documents">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Pemilihan Sekolah
            </Link>
          </Button>
          {isLocked ? (
              <Button asChild>
                <Link href="/registration/status">
                  <ClipboardCheck className="mr-2 h-4 w-4" />
                  Lihat Status Pendaftaran
                </Link>
              </Button>
            ) : (
             <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !allRequiredFilesUploaded() || !isDeclarationChecked}
             >
                <Paperclip className="mr-2 h-4 w-4" />
                {isSubmitting ? "Mengirim Pendaftaran..." : "Kirim & Selesaikan Pendaftaran"}
             </Button>
            )}
        </CardFooter>
      </Card>
    </div>
    
    <Dialog open={isGuideOpen} onOpenChange={setIsGuideOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{guideContent.title}</DialogTitle>
          <DialogDescription>
            Pastikan berkas Anda terlihat jelas, tidak buram, dan tidak terpotong seperti contoh di bawah.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Image 
            src={guideContent.imageUrl} 
            alt="Contoh panduan berkas" 
            width={800} 
            height={600} 
            className="rounded-md border bg-muted"
            data-ai-hint="document scan example" 
          />
        </div>
        <DialogFooter>
          <Button onClick={() => setIsGuideOpen(false)}>Tutup</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
