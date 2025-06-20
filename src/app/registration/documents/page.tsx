
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { initialSchoolData } from "@/app/registration/dashboard/page"; 
import { getFromLocalStorage, saveToLocalStorage, type RegistrationProgress } from "@/lib/localStorage";

const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";
const pathwayOptions = ["Afirmasi", "Mutasi", "Prestasi", "Domisili"];

export default function DocumentsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedSchoolId, setSelectedSchoolId] = React.useState<string>("");
  const [selectedPathway, setSelectedPathway] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const savedProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null);
    if (!savedProgress?.hasProfilePhoto) {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Harap unggah foto profil Anda di halaman Data Pendaftar sebelum melanjutkan.",
      });
      router.replace('/registration/biodata');
      return; 
    }

    if (savedProgress) {
      if (savedProgress.schoolId) setSelectedSchoolId(savedProgress.schoolId);
      if (savedProgress.pathway) setSelectedPathway(savedProgress.pathway);
    }
    setIsLoading(false);
  }, [router, toast]);

  React.useEffect(() => {
    if (isLoading) return; // Don't save to localStorage while initial loading/checking
    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
      ...currentProgress,
      schoolId: selectedSchoolId || undefined, 
      pathway: selectedPathway || undefined, 
    });
  }, [selectedSchoolId, selectedPathway, isLoading]);


  const handleSubmit = () => {
    setIsSubmitting(true);
    if (!selectedSchoolId || !selectedPathway) {
      toast({
        variant: "destructive",
        title: "Pilihan Tidak Lengkap",
        description: "Harap pilih sekolah tujuan dan jalur pendaftaran.",
      });
      setIsSubmitting(false);
      return;
    }

    const schoolName = initialSchoolData.find(s => s.id === selectedSchoolId)?.namaSekolah || "Tidak Diketahui";

    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
      ...currentProgress,
      schoolId: selectedSchoolId,
      pathway: selectedPathway,
    });
    
    setTimeout(() => {
      toast({
        title: "Pilihan Disimpan",
        description: `Anda memilih ${schoolName} melalui jalur ${selectedPathway}. Melanjutkan ke halaman unggah berkas.`,
      });
      console.log("Pilihan Sekolah:", selectedSchoolId, "Jalur:", selectedPathway);
      setIsSubmitting(false);
      router.push(`/registration/document-upload?pathway=${selectedPathway}&schoolId=${selectedSchoolId}`);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p>Memeriksa sesi Anda...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <FileText size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Pilih Sekolah & Jalur Pendaftaran</CardTitle>
          <CardDescription className="text-md">
            Silakan pilih sekolah tujuan dan jalur pendaftaran Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="school-select">Pilih Sekolah Tujuan</Label>
            <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
              <SelectTrigger id="school-select" className="w-full">
                <SelectValue placeholder="Pilih sekolah tujuan Anda" />
              </SelectTrigger>
              <SelectContent>
                {initialSchoolData.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.namaSekolah} 
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pathway-select">Pilih Jalur Pendaftaran</Label>
            <Select value={selectedPathway} onValueChange={setSelectedPathway}>
              <SelectTrigger id="pathway-select" className="w-full">
                <SelectValue placeholder="Pilih jalur pendaftaran" />
              </SelectTrigger>
              <SelectContent>
                {pathwayOptions.map((pathway) => (
                  <SelectItem key={pathway} value={pathway}>
                    {pathway}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedSchoolId || !selectedPathway}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan dan Lanjutkan"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
