
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Save, School } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { initialSchoolData } from "@/app/registration/dashboard/page"; 
import { getFromLocalStorage, saveToLocalStorage, type RegistrationProgress } from "@/lib/localStorage";

const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";
const pathwayOptions = ["Afirmasi", "Mutasi", "Prestasi", "Domisili"];
const studentSubdistrict = "Kec. Tanjung Redeb"; // Mock data, should come from student's biodata
const MAX_SCHOOL_SELECTION = 5;

export default function SchoolSelectionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedSchoolIds, setSelectedSchoolIds] = React.useState<string[]>([]);
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
      if (savedProgress.schoolIds) setSelectedSchoolIds(savedProgress.schoolIds);
      if (savedProgress.pathway) setSelectedPathway(savedProgress.pathway);
    }
    setIsLoading(false);
  }, [router, toast]);

  const handlePathwayChange = (pathway: string) => {
    setSelectedPathway(pathway);
    setSelectedSchoolIds([]); // Reset school selection when pathway changes
  };

  const handleSchoolSelectionChange = (schoolId: string) => {
    setSelectedSchoolIds(prevSelected => {
      const isSelected = prevSelected.includes(schoolId);
      if (isSelected) {
        return prevSelected.filter(id => id !== schoolId);
      } else {
        if (prevSelected.length >= MAX_SCHOOL_SELECTION) {
          toast({
            variant: "destructive",
            title: "Batas Maksimal Tercapai",
            description: `Anda hanya dapat memilih maksimal ${MAX_SCHOOL_SELECTION} sekolah.`,
          });
          return prevSelected;
        }
        return [...prevSelected, schoolId];
      }
    });
  };

  const availableSchools = React.useMemo(() => {
    if (!selectedPathway) return [];

    const restrictedPathways = ["Afirmasi", "Domisili", "Mutasi"];
    if (restrictedPathways.includes(selectedPathway)) {
      return initialSchoolData.filter(school => school.kecamatan === studentSubdistrict);
    }
    
    return initialSchoolData;
  }, [selectedPathway]);

  React.useEffect(() => {
    if (isLoading) return; 
    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
      ...currentProgress,
      schoolIds: selectedSchoolIds, 
      pathway: selectedPathway || undefined, 
    });
  }, [selectedSchoolIds, selectedPathway, isLoading]);


  const handleSubmit = () => {
    setIsSubmitting(true);
    if (!selectedPathway || selectedSchoolIds.length === 0) {
      toast({
        variant: "destructive",
        title: "Pilihan Tidak Lengkap",
        description: "Harap pilih jalur pendaftaran dan minimal satu sekolah tujuan.",
      });
      setIsSubmitting(false);
      return;
    }

    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
      ...currentProgress,
      schoolIds: selectedSchoolIds,
      pathway: selectedPathway,
    });
    
    setTimeout(() => {
      toast({
        title: "Pilihan Disimpan",
        description: `Pilihan jalur dan sekolah Anda telah disimpan. Melanjutkan ke halaman unggah berkas.`,
      });
      setIsSubmitting(false);
      router.push(`/registration/document-upload?pathway=${selectedPathway}`);
    }, 1000);
  };
  
  const isSubmitDisabled = isSubmitting || !selectedPathway || selectedSchoolIds.length < 1 || selectedSchoolIds.length > MAX_SCHOOL_SELECTION;

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
          <CardTitle className="text-2xl sm:text-3xl font-headline">Pilih Jalur & Sekolah Tujuan</CardTitle>
          <CardDescription className="text-md">
            Pilih jalur pendaftaran, lalu pilih 1 hingga 5 sekolah tujuan.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="pathway-select" className="font-semibold text-lg">Langkah 1: Pilih Jalur Pendaftaran</Label>
            <Select value={selectedPathway} onValueChange={handlePathwayChange}>
              <SelectTrigger id="pathway-select" className="w-full">
                <SelectValue placeholder="Pilih jalur pendaftaran Anda" />
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

          {selectedPathway && (
            <div className="space-y-4">
              <div>
                <Label className="font-semibold text-lg">Langkah 2: Pilih Sekolah Tujuan</Label>
                <p className="text-sm text-muted-foreground">
                    Terpilih: {selectedSchoolIds.length} dari {MAX_SCHOOL_SELECTION} sekolah.
                </p>
                 {["Afirmasi", "Domisili", "Mutasi"].includes(selectedPathway) && (
                  <p className="text-xs text-primary mt-1">
                    Untuk jalur {selectedPathway}, hanya sekolah di kecamatan Anda ({studentSubdistrict}) yang ditampilkan.
                  </p>
                )}
              </div>
              
              <Card>
                <CardContent className="p-0">
                  <ScrollArea className="h-72 w-full rounded-md border">
                    <div className="p-4">
                      {availableSchools.length > 0 ? (
                        availableSchools.map((school) => (
                          <div
                            key={school.id}
                            className="flex items-center space-x-3 mb-4 last:mb-0 p-2 rounded-md hover:bg-muted"
                          >
                            <Checkbox
                              id={school.id}
                              checked={selectedSchoolIds.includes(school.id)}
                              onCheckedChange={() => handleSchoolSelectionChange(school.id)}
                            />
                            <Label
                              htmlFor={school.id}
                              className="flex flex-col flex-grow cursor-pointer"
                            >
                              <span className="font-medium">{school.namaSekolah}</span>
                              <span className="text-xs text-muted-foreground">
                                Akreditasi: {school.akreditasi} | {school.kecamatan}
                              </span>
                            </Label>
                          </div>
                        ))
                      ) : (
                        <div className="flex items-center justify-center h-full text-muted-foreground">
                          <p>Tidak ada sekolah yang tersedia untuk jalur ini di kecamatan Anda.</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan dan Lanjutkan"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
