
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { FileUp, Save, UserCircle, FileText, AlertCircle, ArrowLeft } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { getApplicants, updateApplicant, type Applicant } from "@/lib/applicantService";
import type { ActivityEvent } from "@/lib/types";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const biodataFormSchema = z.object({
  fullName: z.string().min(3, "Nama lengkap diperlukan."),
  nik: z.string().length(16, "NIK harus 16 digit."),
  placeOfBirth: z.string().min(1, "Tempat lahir diperlukan."),
  dateOfBirth: z.string().min(1, "Tanggal lahir diperlukan."),
  gender: z.string().min(1, "Jenis kelamin diperlukan."),
  religion: z.string().min(1, "Agama diperlukan."),
  streetName: z.string().min(1, "Alamat diperlukan."),
  rtRw: z.string().optional(),
  village: z.string().min(1, "Kelurahan/Desa diperlukan."),
  subdistrict: z.string().min(1, "Kecamatan diperlukan."),
  district: z.string().min(1, "Kabupaten/Kota diperlukan."),
  province: z.string().min(1, "Provinsi diperlukan."),
  contactNumber: z.string().optional(),
  fatherName: z.string().optional(),
  motherName: z.string().optional(),
});

type BiodataFormValues = z.infer<typeof biodataFormSchema>;

interface DocumentItem {
  id: string;
  label: string;
  required: boolean;
}

const generalDocuments: DocumentItem[] = [
  { id: "kk", label: "Scan Kartu Keluarga (KK)", required: true },
  { id: "akta", label: "Scan Akta Kelahiran", required: true },
  { id: "skl", label: "Scan Surat Keterangan Lulus (SKL)", required: true },
  { id: "rapor_gabungan", label: "Scan Rapor (Semester 1-5, Gabungan PDF/Gambar)", required: true },
];

const pathwaySpecificDocumentsMap: Record<string, DocumentItem[]> = {
  Afirmasi: [ { id: "kip_kks_pkh", label: "Scan KIP/KKS/PKH", required: true } ],
  Prestasi: [ { id: "sertifikat_prestasi", label: "Scan Sertifikat Prestasi (jika ada)", required: false }, { id: "sk_prestasi", label: "Scan SK Prestasi Sekolah", required: true } ],
  Mutasi: [ { id: "sk_penempatan", label: "Scan SK Mutasi Orang Tua", required: true } ],
  Domisili: [], 
};

interface DocumentUploadItemProps {
  id: string;
  label: string;
  file: File | null;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>, id: string) => void;
}

const DocumentUploadItem: React.FC<DocumentUploadItemProps> = ({ id, label, file, onFileChange }) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <div className="space-y-2 border rounded-md p-3">
      <Label htmlFor={id} className="text-md font-medium text-destructive">{label}</Label>
      <div className="flex items-center space-x-3">
        <Button type="button" variant="outline" onClick={() => inputRef.current?.click()}>
          <FileUp className="mr-2 h-4 w-4" /> Pilih File Baru
        </Button>
        <Input id={id} type="file" ref={inputRef} onChange={(e) => onFileChange(e, id)} className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
        <span className="text-sm text-muted-foreground truncate">{file?.name || "Belum ada file dipilih"}</span>
      </div>
    </div>
  );
};

export default function CorrectionPage() {
  const { toast } = useToast();
  const router = useRouter();
  
  const [applicant, setApplicant] = React.useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [rejectedItems, setRejectedItems] = React.useState<{ biodata: boolean; documents: DocumentItem[] }>({ biodata: false, documents: [] });
  const [uploadedFiles, setUploadedFiles] = React.useState<Record<string, File | null>>({});

  const form = useForm<BiodataFormValues>({
    resolver: zodResolver(biodataFormSchema),
  });

  React.useEffect(() => {
    const loginCreds = getFromLocalStorage<LoginCredentials | null>("loginCredentials", null);
    if (!loginCreds?.username) {
      router.replace('/');
      return;
    }

    const currentApplicant = getApplicants().find(app => app.nisn === loginCreds.username);
    if (!currentApplicant || currentApplicant.statusVerifikasi !== 'Berkas tidak sesuai') {
      toast({ variant: 'destructive', title: "Akses tidak diizinkan", description: "Halaman ini hanya untuk pendaftar yang perlu melakukan perbaikan." });
      router.replace('/registration/status');
      return;
    }
    
    setApplicant(currentApplicant);
    
    // Always populate the form with the latest applicant data.
    // This ensures the form is valid according to its schema even when biodata fields are hidden,
    // which prevents the submit button from being incorrectly disabled.
    form.reset({
        fullName: currentApplicant.fullName,
        nik: currentApplicant.nik || '',
        placeOfBirth: currentApplicant.placeOfBirth || '',
        dateOfBirth: currentApplicant.dateOfBirth || '',
        gender: currentApplicant.gender || 'Laki-laki',
        religion: currentApplicant.religion || '',
        streetName: currentApplicant.streetName || '',
        rtRw: currentApplicant.rtRw || '',
        village: currentApplicant.village || '',
        subdistrict: currentApplicant.subdistrict || '',
        district: currentApplicant.district || '',
        province: currentApplicant.province || '',
        contactNumber: currentApplicant.contactNumber || '',
        fatherName: currentApplicant.fatherName || '',
        motherName: currentApplicant.motherName || '',
    });

    const docStatuses = currentApplicant.documentStatuses || {};
    const biodataIsInvalid = docStatuses['biodata'] === 'invalid';

    const allPossibleDocs = [...generalDocuments, ...(pathwaySpecificDocumentsMap[currentApplicant.jalur] || [])];
    const invalidDocs = allPossibleDocs.filter(doc => docStatuses[doc.id] === 'invalid');

    setRejectedItems({
      biodata: biodataIsInvalid,
      documents: invalidDocs,
    });

    setIsLoading(false);
  }, [router, toast, form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, documentId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ variant: "destructive", title: "Ukuran File Terlalu Besar", description: `File melebihi batas 2MB.` });
        event.target.value = '';
        return;
      }
      setUploadedFiles(prev => ({ ...prev, [documentId]: file }));
    }
  };

  const handleSubmit = async (biodataValues: BiodataFormValues) => {
    if (!applicant) return;
    
    setIsSubmitting(true);
    const updatedApplicantData = { ...applicant };

    // 1. Update biodata if it was rejected
    if (rejectedItems.biodata) {
      Object.assign(updatedApplicantData, biodataValues);
    }

    // 2. Reset document statuses for fixed items
    const newDocStatuses = { ...(updatedApplicantData.documentStatuses || {}) };
    if (rejectedItems.biodata) {
        newDocStatuses['biodata'] = null; // Reset to pending
    }
    rejectedItems.documents.forEach(doc => {
        if(uploadedFiles[doc.id]) {
            newDocStatuses[doc.id] = null; // Reset to pending
        }
    });
    updatedApplicantData.documentStatuses = newDocStatuses;
    
    // 3. Update overall status and history
    updatedApplicantData.statusVerifikasi = "Menunggu Verifikasi";
    
    const newEvent: ActivityEvent = {
        type: 'FILES_RESUBMITTED',
        timestamp: new Date().toISOString(),
        actor: applicant.fullName
    };
    updatedApplicantData.activityHistory = [...(updatedApplicantData.activityHistory || []), newEvent];
    
    updateApplicant(updatedApplicantData);
    
    // This is a mock: in a real app, you'd handle file uploads to a server here.
    // For now, we just acknowledge they are "uploaded" by their presence in the state.

    await new Promise(res => setTimeout(res, 1500));
    
    toast({ title: "Perbaikan Terkirim", description: "Data dan berkas Anda akan segera diverifikasi ulang oleh panitia." });
    router.push('/registration/status');
    setIsSubmitting(false);
  };

  if (isLoading || !applicant) {
    return <div className="flex flex-1 items-center justify-center p-4">Memuat halaman perbaikan...</div>;
  }

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl sm:text-2xl text-destructive">
            <AlertCircle className="h-8 w-8" />
            Tindakan Diperlukan
          </CardTitle>
          <CardDescription>
            Pendaftaran Anda ditolak karena beberapa data atau berkas tidak sesuai. Harap perbaiki item di bawah ini dan ajukan verifikasi ulang. Alasan: <span className="italic">"{applicant.rejectionReason || 'Tidak ada alasan spesifik'}"</span>
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <CardContent className="space-y-8">
              {rejectedItems.biodata && (
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
                    <UserCircle className="mr-2" /> Perbaiki Biodata
                  </h3>
                  <div className="space-y-4 rounded-md border p-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="nik" render={({ field }) => ( <FormItem><FormLabel>NIK</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="placeOfBirth" render={({ field }) => ( <FormItem><FormLabel>Tempat Lahir</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => ( <FormItem><FormLabel>Tanggal Lahir</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Jenis Kelamin</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                         <FormField control={form.control} name="religion" render={({ field }) => ( <FormItem><FormLabel>Agama</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                            {["Islam", "Kristen Protestan", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                         </SelectContent></Select><FormMessage /></FormItem> )} />
                     </div>
                     <FormField control={form.control} name="streetName" render={({ field }) => ( <FormItem><FormLabel>Nama Jalan & No. Rumah</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem> )} />
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="rtRw" render={({ field }) => ( <FormItem><FormLabel>RT/RW</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="village" render={({ field }) => ( <FormItem><FormLabel>Kelurahan/Desa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="subdistrict" render={({ field }) => ( <FormItem><FormLabel>Kecamatan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="district" render={({ field }) => ( <FormItem><FormLabel>Kabupaten/Kota</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="province" render={({ field }) => ( <FormItem><FormLabel>Provinsi</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="contactNumber" render={({ field }) => ( <FormItem><FormLabel>No. Kontak</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="fatherName" render={({ field }) => ( <FormItem><FormLabel>Nama Ayah</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="motherName" render={({ field }) => ( <FormItem><FormLabel>Nama Ibu</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                     </div>
                  </div>
                </section>
              )}
              {rejectedItems.documents.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
                    <FileText className="mr-2" /> Unggah Ulang Berkas
                  </h3>
                  <div className="space-y-4">
                    {rejectedItems.documents.map(doc => (
                      <DocumentUploadItem
                        key={doc.id}
                        id={doc.id}
                        label={doc.label}
                        file={uploadedFiles[doc.id] || null}
                        onFileChange={handleFileChange}
                      />
                    ))}
                  </div>
                </section>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
                <Button variant="outline" type="button" onClick={() => router.push('/registration/status')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Halaman Status
                </Button>
                <Button size="lg" type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-5 w-5" />
                    {isSubmitting ? "Mengirim..." : "Ajukan Verifikasi Ulang"}
                </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
