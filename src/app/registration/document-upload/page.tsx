
"use client";

import * as React from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UploadCloud, FileUp, Paperclip, CheckCircle2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";

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
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
}

const DocumentUploadItem: React.FC<DocumentUploadItemProps> = ({ id, label, required = true, file, onFileChange }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2 border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="text-md">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        {file && <CheckCircle2 className="h-5 w-5 text-green-500" />}
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
          {file ? file.name : "Belum ada file dipilih"}
        </span>
      </div>
       {file && (
         <p className="text-xs text-muted-foreground">
           Ukuran: {(file.size / 1024 / 1024).toFixed(2)} MB, Jenis: {file.type}
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
    { id: "sertifikat_prestasi", label: "Scan Sertifikat Prestasi (jika ada)", required: false }, // Made optional as an example, adjust if needed
    { id: "sk_prestasi", label: "Scan Surat Keterangan Prestasi dari Sekolah Asal", required: true },
  ],
  Mutasi: [
    { id: "sk_penempatan", label: "Scan Surat Keputusan Penempatan/Mutasi Kerja Orang Tua/Wali", required: true },
  ],
  Domisili: [], // No specific documents for Domisili
};

export default function DocumentUploadPage() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedPathway = searchParams.get("pathway") || "";

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const [documentsToUpload, setDocumentsToUpload] = React.useState<DocumentItem[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, File | null>>({});

  React.useEffect(() => {
    const currentPathwayDocs = pathwaySpecificDocumentsMap[selectedPathway] || [];
    const allDocs = [...generalDocuments, ...currentPathwayDocs];
    setDocumentsToUpload(allDocs);
    setUploadedFiles(allDocs.reduce((acc, doc) => ({ ...acc, [doc.id]: null }), {}));
  }, [selectedPathway]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Ukuran File Terlalu Besar",
          description: `File ${file.name} melebihi batas maksimal 2MB.`,
        });
        event.target.value = ''; 
        return;
      }
      setUploadedFiles(prev => ({ ...prev, [documentId]: file }));
    } else {
      setUploadedFiles(prev => ({ ...prev, [documentId]: null }));
    }
  };

  const allRequiredFilesUploaded = () => {
    if (documentsToUpload.length === 0) return false; // Handle case where documents are not yet loaded
    return documentsToUpload
      .filter(doc => doc.required)
      .every(doc => uploadedFiles[doc.id] !== null);
  };

  const handleSubmit = () => {
    if (!allRequiredFilesUploaded()) {
      toast({
        variant: "destructive",
        title: "Berkas Belum Lengkap",
        description: "Harap unggah semua berkas yang wajib diisi (ditandai dengan *).",
      });
      return;
    }

    setIsSubmitting(true);
    console.log("Mengunggah berkas:", uploadedFiles);
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Berkas Berhasil Diunggah",
        description: "Semua berkas Anda telah berhasil diunggah. Melanjutkan ke tahap seleksi.",
      });
      setIsSubmitting(false);
      router.push('/registration/selection'); // Navigate to the next step, e.g., selection page
    }, 2000);
  };
  
  const currentPathwaySpecificDocs = pathwaySpecificDocumentsMap[selectedPathway] || [];

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <UploadCloud size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Unggah Berkas Pendaftaran</CardTitle>
          <CardDescription className="text-md">
            Harap unggah dokumen yang diperlukan. Format file yang diterima: PDF, JPG, JPEG, PNG. Ukuran maks: 2MB per file.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary">Berkas Umum</h3>
            {generalDocuments.map(doc => (
              <DocumentUploadItem
                key={doc.id}
                id={doc.id}
                label={doc.label}
                required={doc.required}
                file={uploadedFiles[doc.id] || null}
                onFileChange={handleFileChange}
              />
            ))}
          </section>

          {selectedPathway && currentPathwaySpecificDocs.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold mb-4 text-primary">Berkas Khusus Jalur: {selectedPathway}</h3>
              {currentPathwaySpecificDocs.map(doc => (
                <DocumentUploadItem
                  key={doc.id}
                  id={doc.id}
                  label={doc.label}
                  required={doc.required}
                  file={uploadedFiles[doc.id] || null}
                  onFileChange={handleFileChange}
                />
              ))}
            </section>
          )}
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !allRequiredFilesUploaded()}
          >
            <Paperclip className="mr-2 h-4 w-4" />
            {isSubmitting ? "Mengunggah..." : "Unggah & Selesaikan Pendaftaran"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
