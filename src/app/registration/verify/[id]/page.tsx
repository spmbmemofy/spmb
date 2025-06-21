
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, FileText, Info, UserCircle, XCircle, ThumbsUp, ThumbsDown, Save } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";

import { useToast } from "@/hooks/use-toast";
import { generateAllMockApplicants } from "@/lib/mockData";
import type { Applicant, ApplicantStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

// Mock data for a detailed applicant view - in a real app, this would be fetched
const applicantDetailsMock = {
  profilePhoto: "https://placehold.co/128x160.png",
  nik: "6403011507050002",
  placeOfBirth: "Tanjung Redeb",
  dateOfBirth: "2008-07-15",
  gender: "Laki-laki",
  religion: "Islam",
  address: "Jl. Durian III No. 25, RT 10/RW 03, Kel. Tanjung Redeb, Kec. Tanjung Redeb, Kabupaten Berau, Kalimantan Timur 77311",
  contactNumber: "081254321098",
  documents: [
    { id: 'kk', label: 'Kartu Keluarga (KK)', url: 'https://placehold.co/800x1100.png', hint: 'document paper' },
    { id: 'akta', label: 'Akta Kelahiran', url: 'https://placehold.co/800x1100.png', hint: 'document birth' },
    { id: 'skl', label: 'Surat Keterangan Lulus (SKL)', url: 'https://placehold.co/800x1100.png', hint: 'document certificate' },
    { id: 'rapor_gabungan', label: 'Rapor Semester 1-5', url: 'https://placehold.co/800x1100.png', hint: 'document report' },
  ]
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
type DocumentStatus = "valid" | "invalid" | null;

export default function VerifyApplicantPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const applicantId = params.id as string;

  const [applicant, setApplicant] = React.useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [documentStatuses, setDocumentStatuses] = React.useState<Record<string, DocumentStatus>>({});
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedAction, setSelectedAction] = React.useState<ActionType | null>(null);

  React.useEffect(() => {
    if (applicantId) {
      const allApplicants = generateAllMockApplicants();
      const foundApplicant = allApplicants.find(app => app.id === applicantId);
      setApplicant(foundApplicant || null);

      const initialStatuses: Record<string, DocumentStatus> = {};
      applicantDetailsMock.documents.forEach(doc => {
        initialStatuses[doc.id] = null;
      });
      setDocumentStatuses(initialStatuses);
    }
    setIsLoading(false);
  }, [applicantId]);

  const handleDocumentStatusChange = (docId: string, status: 'valid' | 'invalid') => {
    setDocumentStatuses(prev => ({
      ...prev,
      [docId]: prev[docId] === status ? null : status,
    }));
  };
  
  const handleSaveClick = () => {
    const hasInvalid = Object.values(documentStatuses).some(s => s === 'invalid');
    const action: ActionType = hasInvalid ? 'reject' : 'verify';
    setSelectedAction(action);
    setIsAlertOpen(true);
  };

  const handleConfirmAction = () => {
    if (!applicant || !selectedAction) return;

    let toastMessage = "";
    if (selectedAction === 'verify') {
      toastMessage = `Pendaftar "${applicant.fullName}" telah berhasil diverifikasi.`;
    } else {
      toastMessage = `Pendaftaran "${applicant.fullName}" telah ditolak karena berkas tidak valid.`;
    }
    
    toast({
      title: "Aksi Berhasil",
      description: toastMessage,
    });
    
    setIsAlertOpen(false);
    router.push('/registration/selection');
  };
  
  const getActionDialogContent = () => {
    if (!selectedAction || !applicant) return { title: "", description: "", actionText: "" };
    switch (selectedAction) {
      case 'verify':
        return {
          title: "Konfirmasi Verifikasi",
          description: `Semua berkas pendaftar atas nama ${applicant.fullName} sudah valid. Apakah Anda yakin ingin memverifikasi pendaftaran ini?`,
          actionText: "Ya, Verifikasi"
        };
      case 'reject':
        return {
          title: "Konfirmasi Penolakan",
          description: `Terdapat berkas yang tidak valid untuk pendaftar ${applicant.fullName}. Apakah Anda yakin ingin menolak pendaftaran ini?`,
           actionText: "Ya, Tolak"
        };
    }
  }
  
  const { title, description, actionText } = getActionDialogContent();
  const allDocumentsReviewed = Object.values(documentStatuses).every(status => status !== null);

  if (isLoading) {
    return <div className="flex flex-1 items-center justify-center p-4">Memuat data pendaftar...</div>;
  }

  if (!applicant) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl">Pendaftar Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Data pendaftar dengan ID yang diberikan tidak dapat ditemukan.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="mx-auto">
              <Link href="/registration/selection">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Daftar Verifikasi
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto w-full">
        {/* Header */}
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Details */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg"><UserCircle className="mr-2"/>Biodata</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-center mb-4">
                    <Image src={applicantDetailsMock.profilePhoto} alt="Foto Profil" width={100} height={125} className="rounded-md border" data-ai-hint="profile picture" />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status Saat Ini</span>
                    <Badge variant={getStatusBadgeVariant(applicant.statusVerifikasi)}>{applicant.statusVerifikasi}</Badge>
                  </div>
                  <Separator/>
                  <div className="flex justify-between"><span className="text-muted-foreground">NIK</span><span className="font-medium">{applicantDetailsMock.nik}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">TTL</span><span className="font-medium">{applicantDetailsMock.placeOfBirth}, {applicantDetailsMock.dateOfBirth}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Jenis Kelamin</span><span className="font-medium">{applicantDetailsMock.gender}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground">Agama</span><span className="font-medium">{applicantDetailsMock.religion}</span></div>
                  <div>
                    <p className="text-muted-foreground">Alamat</p>
                    <p className="font-medium">{applicantDetailsMock.address}</p>
                  </div>
              </CardContent>
            </Card>
            <Card>
               <CardHeader>
                  <CardTitle className="flex items-center text-lg"><Info className="mr-2"/>Info Pendaftaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                   <div className="flex justify-between"><span className="text-muted-foreground">No. Registrasi</span><span className="font-medium">{applicant.noRegistrasi}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground">Asal Sekolah</span><span className="font-medium">{applicant.asalSekolahNama}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground">Sekolah Tujuan</span><span className="font-medium">{applicant.sekolahTujuanNama}</span></div>
                   <div className="flex justify-between"><span className="text-muted-foreground">Jalur</span><span className="font-medium">{applicant.jalur}</span></div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Document Viewer */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center text-lg"><FileText className="mr-2"/>Berkas Pendaftaran</CardTitle>
                <CardDescription>
                  Klik pada gambar untuk melihat versi lebih besar. Beri status pada setiap berkas di bawah.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {applicantDetailsMock.documents.map(doc => (
                     <div key={doc.id}>
                        <Card className="overflow-hidden group">
                           <a href={doc.url} target="_blank" rel="noopener noreferrer" className="block">
                            <div className="aspect-[3/4] bg-muted overflow-hidden">
                                <Image src={doc.url} alt={`Gambar pratinjau ${doc.label}`} width={400} height={550} className="w-full h-full object-cover group-hover:scale-105 transition-transform" data-ai-hint={doc.hint} />
                            </div>
                            <CardHeader className="p-3">
                                <p className="text-sm font-medium truncate">{doc.label}</p>
                            </CardHeader>
                           </a>
                           <CardFooter className="p-3 bg-muted/50 flex justify-end gap-2">
                                <Button 
                                    size="sm" 
                                    variant={documentStatuses[doc.id] === 'invalid' ? 'destructive' : 'outline'}
                                    onClick={() => handleDocumentStatusChange(doc.id, 'invalid')}
                                >
                                    <ThumbsDown className="mr-2 h-4 w-4" />
                                    Tidak Valid
                                </Button>
                                <Button 
                                    size="sm"
                                    variant={documentStatuses[doc.id] === 'valid' ? 'default' : 'outline'}
                                    className={cn(documentStatuses[doc.id] === 'valid' && "bg-green-600 hover:bg-green-700")}
                                    onClick={() => handleDocumentStatusChange(doc.id, 'valid')}
                                >
                                    <ThumbsUp className="mr-2 h-4 w-4" />
                                    Valid
                                </Button>
                           </CardFooter>
                        </Card>
                     </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Footer Action Button */}
        <div className="mt-6 border-t pt-6 flex justify-end">
            <Button size="lg" onClick={handleSaveClick} disabled={!allDocumentsReviewed}>
                <Save className="mr-2 h-5 w-5" />
                Simpan Status Verifikasi
            </Button>
        </div>

      </div>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsAlertOpen(false)}>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>{actionText}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
