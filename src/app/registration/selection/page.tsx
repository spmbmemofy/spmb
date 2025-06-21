
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MoreHorizontal, CheckCircle, XCircle, RefreshCcw, UserCheck, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAllMockApplicants } from "@/lib/mockData";
import type { Applicant, ApplicantStatus } from "@/lib/types";
import { initialSchoolData } from "@/lib/schoolData";

const VERIFIER_SCHOOL_ID = "sman4berau";

const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Terverifikasi": return "default";
    case "Menunggu Verifikasi": return "secondary";
    case "Berkas tidak sesuai": return "destructive";
    default: return "secondary";
  }
};

type ActionType = "verify" | "reject" | "reset";

export default function VerificationPage() {
  const { toast } = useToast();
  const [applicants, setApplicants] = React.useState<Applicant[]>([]);
  const [schoolName, setSchoolName] = React.useState("");
  const [isAlertOpen, setIsAlertOpen] = React.useState(false);
  const [selectedApplicant, setSelectedApplicant] = React.useState<Applicant | null>(null);
  const [selectedAction, setSelectedAction] = React.useState<ActionType | null>(null);

  React.useEffect(() => {
    const allApplicants = generateAllMockApplicants();
    const verifierSchoolApplicants = allApplicants.filter(app => app.sekolahTujuanId === VERIFIER_SCHOOL_ID);
    setApplicants(verifierSchoolApplicants);

    const school = initialSchoolData.find(s => s.id === VERIFIER_SCHOOL_ID);
    setSchoolName(school?.namaSekolah || "Sekolah Tidak Ditemukan");
  }, []);

  const handleActionClick = (applicant: Applicant, action: ActionType) => {
    setSelectedApplicant(applicant);
    setSelectedAction(action);
    setIsAlertOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedApplicant || !selectedAction) return;

    let newStatus: ApplicantStatus;
    let toastMessage = "";

    switch (selectedAction) {
      case "verify":
        newStatus = "Terverifikasi";
        toastMessage = `Pendaftar "${selectedApplicant.fullName}" telah diverifikasi.`;
        break;
      case "reject":
        newStatus = "Berkas tidak sesuai";
        toastMessage = `Pendaftar "${selectedApplicant.fullName}" ditolak.`;
        break;
      case "reset":
        newStatus = "Menunggu Verifikasi";
        toastMessage = `Status "${selectedApplicant.fullName}" telah direset.`;
        break;
      default:
        return;
    }

    setApplicants(prev => prev.map(app =>
      app.id === selectedApplicant.id ? { ...app, statusVerifikasi: newStatus } : app
    ));

    toast({
      title: "Status Berhasil Diperbarui",
      description: toastMessage,
    });

    setIsAlertOpen(false);
    setSelectedApplicant(null);
    setSelectedAction(null);
  };

  const getActionDialogContent = () => {
    if (!selectedAction || !selectedApplicant) return { title: "", description: "", actionText: "" };
    switch (selectedAction) {
      case 'verify':
        return {
          title: "Konfirmasi Verifikasi",
          description: `Apakah Anda yakin ingin memverifikasi pendaftar atas nama ${selectedApplicant.fullName}? Tindakan ini tidak dapat diurungkan dengan mudah.`,
          actionText: "Ya, Verifikasi"
        };
      case 'reject':
        return {
          title: "Konfirmasi Penolakan",
          description: `Apakah Anda yakin ingin menolak pendaftar atas nama ${selectedApplicant.fullName}? Pastikan semua berkas telah diperiksa dengan teliti.`,
           actionText: "Ya, Tolak"
        };
      case 'reset':
        return {
          title: "Konfirmasi Reset Status",
          description: `Apakah Anda yakin ingin mengembalikan status pendaftar ${selectedApplicant.fullName} ke "Menunggu Verifikasi"?`,
           actionText: "Ya, Reset"
        };
    }
  }
  
  const { title, description, actionText } = getActionDialogContent();

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-5xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
              <UserCheck size={28} />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-headline">Verifikasi Pendaftar</CardTitle>
              <CardDescription className="text-md mt-1">
                Daftar siswa yang mendaftar di: <span className="font-semibold">{schoolName}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">No.</TableHead>
                  <TableHead>Nama Lengkap</TableHead>
                  <TableHead>NISN</TableHead>
                  <TableHead>Asal Sekolah</TableHead>
                  <TableHead>Jalur</TableHead>
                  <TableHead className="text-center">Status Verifikasi</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applicants.length > 0 ? (
                  applicants.map((applicant, index) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
                      <TableCell className="font-medium">{applicant.fullName}</TableCell>
                      <TableCell>{applicant.nisn}</TableCell>
                      <TableCell>{applicant.asalSekolahNama}</TableCell>
                      <TableCell>{applicant.jalur}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(applicant.statusVerifikasi)}>
                          {applicant.statusVerifikasi}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Buka menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleActionClick(applicant, 'verify')}>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                              Verifikasi
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActionClick(applicant, 'reject')}>
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />
                              Tolak Berkas
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActionClick(applicant, 'reset')}>
                              <RefreshCcw className="mr-2 h-4 w-4 text-blue-500" />
                              Reset Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Belum ada pendaftar untuk sekolah ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="text-orange-500" />
                {title}
            </AlertDialogTitle>
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
