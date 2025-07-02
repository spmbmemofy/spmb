
"use client";

import * as React from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FileText, Save, School, ArrowUp, ArrowDown, AlertTriangle, ClipboardCheck, Info, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getSchools, getSchoolById } from "@/lib/schoolService"; 
import { getFromLocalStorage, saveToLocalStorage, type RegistrationProgress, type LoginCredentials } from "@/lib/localStorage";
import { getApplicants } from "@/lib/applicantService";
import type { SchoolSelection, Jalur, Tahap } from "@/lib/types";
import { getJalur } from "@/lib/pathwayService";
import { getStages } from "@/lib/stageService";
import type { School as SchoolType } from "@/lib/schoolService";


const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";
const MAX_SCHOOL_SELECTION = 5;

export default function SchoolSelectionPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [allSchools, setAllSchools] = React.useState<ReturnType<typeof getSchools>>([]);
  const [selectedSelections, setSelectedSelections] = React.useState<SchoolSelection[]>([]);
  const [selectedPathway, setSelectedPathway] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLocked, setIsLocked] = React.useState(false);
  
  const [allPathways, setAllPathways] = React.useState<Jalur[]>([]);
  const [allStages, setAllStages] = React.useState<Tahap[]>([]);

  const activePathways = React.useMemo(() => {
    const now = new Date();
    const activeStageIds = allStages
      .filter(stage => {
          try {
              const startDate = new Date(stage.startDate);
              const endDate = new Date(stage.endDate);
              return now >= startDate && now <= endDate;
          } catch (e) { return false; }
      })
      .map(stage => stage.id);
      
    return allPathways.filter(pathway => activeStageIds.includes(pathway.tahapId));
  }, [allPathways, allStages]);

  React.useEffect(() => {
    const schools = getSchools();
    setAllSchools(schools);
    setAllPathways(getJalur());
    setAllStages(getStages());

    const savedProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null);
    const loggedInUser = getFromLocalStorage<LoginCredentials | null>("loginCredentials", null);
    const applicantData = loggedInUser?.username ? getApplicants().find(a => a.nisn === loggedInUser.username) : null;
    
    if (!savedProgress?.hasProfilePhoto) {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Harap unggah foto profil Anda di halaman Data Pendaftar sebelum melanjutkan.",
      });
      router.replace('/registration/dashboard');
      return; 
    }

    if (savedProgress) {
      if (savedProgress.schoolSelections) setSelectedSelections(savedProgress.schoolSelections);
      if (savedProgress.pathway) setSelectedPathway(savedProgress.pathway);
      if (savedProgress.registrationCompleted || (applicantData && applicantData.statusVerifikasi)) {
        setIsLocked(true);
      }
    }
    setIsLoading(false);
  }, [router, toast]);

  const handlePathwayChange = (pathway: string) => {
    setSelectedPathway(pathway);
    setSelectedSelections([]); // Reset school selection when pathway changes
  };

  const handleSchoolSelectionChange = (schoolId: string, major: string | null) => {
    if (selectedPathway === 'Domisili' && selectedSelections.length === 0) {
        const school = getSchoolById(schoolId);
        if (school && school.jenjang !== 'SMA') {
            toast({
                variant: 'destructive',
                title: 'Pilihan Tidak Sesuai',
                description: 'Untuk jalur Domisili, pilihan pertama Anda harus sekolah jenjang SMA.',
            });
            return; 
        }
    }

    setSelectedSelections(prevSelected => {
      const selection = { schoolId, major };
      const isSelected = prevSelected.some(s => s.schoolId === schoolId && s.major === major);

      if (isSelected) {
        return prevSelected.filter(s => !(s.schoolId === schoolId && s.major === major));
      } else {
        if (prevSelected.length >= MAX_SCHOOL_SELECTION) {
          toast({
            variant: "destructive",
            title: "Batas Maksimal Tercapai",
            description: `Anda hanya dapat memilih maksimal ${MAX_SCHOOL_SELECTION} sekolah/jurusan.`,
          });
          return prevSelected;
        }
        return [...prevSelected, selection];
      }
    });
  };
  
  const selectedPathwayObject = React.useMemo(() => {
    return allPathways.find(p => p.name === selectedPathway);
  }, [selectedPathway, allPathways]);

  const selectedStageObject = React.useMemo(() => {
    if (!selectedPathwayObject) return null;
    return allStages.find(s => s.id === selectedPathwayObject.tahapId);
  }, [selectedPathwayObject, allStages]);

  const availableSchools = React.useMemo(() => {
    if (!selectedPathwayObject) return [];
    
    const applicantBiodata = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null)?.biodata;
    const studentSubdistrict = applicantBiodata?.subdistrict;

    let schoolsToDisplay = allSchools.filter(s => s.jenjang === 'SMA' || s.jenjang === 'SMK');
    
    // Filter by allowed jenjang for the pathway
    schoolsToDisplay = schoolsToDisplay.filter(school => 
      selectedPathwayObject.allowedJenjang.includes(school.jenjang)
    );

    // Filter schools that offer the selected pathway (have quota for it)
    const pathwayKey = selectedPathwayObject.name.toLowerCase() as keyof NonNullable<SchoolType['jalurKuota']>;
    schoolsToDisplay = schoolsToDisplay.filter(school => {
        if (school.jenjang === 'SMA') {
            return school.jalurKuota && (school.jalurKuota[pathwayKey] ?? 0) > 0;
        }
        if (school.jenjang === 'SMK') {
            return school.majors && school.majors.some(major => (major.quota[pathwayKey] ?? 0) > 0);
        }
        return false;
    });

    // Filter by pathway/district for specific pathways
    const subdistrictRestrictedPathways = ["Afirmasi", "Mutasi"];
    if (subdistrictRestrictedPathways.includes(selectedPathwayObject.name) && studentSubdistrict) {
        schoolsToDisplay = schoolsToDisplay.filter(school => school.kecamatan === studentSubdistrict);
    }

    // Special filter for Domisili pathway for SMA
    if (selectedPathwayObject.name === 'Domisili') {
        const studentVillage = applicantBiodata?.village;
        schoolsToDisplay = schoolsToDisplay.filter(school => {
            if (school.jenjang !== 'SMA') {
                return true; // Keep non-SMA schools as this rule doesn't apply to them
            }
            // For SMA schools:
            if (school.allowedVillages && school.allowedVillages.length > 0) {
                // If specific villages are set, student must be in one of them
                return studentVillage ? school.allowedVillages.includes(studentVillage) : false;
            } else {
                // If no specific villages are set, fall back to default subdistrict matching
                return studentSubdistrict ? school.kecamatan === studentSubdistrict : false;
            }
        });
    }
    
    // Filter by school-specific restrictions (gender, religion)
    if (applicantBiodata) {
        schoolsToDisplay = schoolsToDisplay.filter(school => {
            const genderOk = !school.allowedGenders || school.allowedGenders.length === 0 || school.allowedGenders.includes(applicantBiodata.gender as 'Laki-laki' | 'Perempuan');
            const religionOk = !school.allowedReligions || school.allowedReligions.length === 0 || school.allowedReligions.includes(applicantBiodata.religion);
            return genderOk && religionOk;
        });
    }

    return schoolsToDisplay;
  }, [selectedPathwayObject, allSchools]);

  React.useEffect(() => {
    if (isLoading || isLocked) return; 
    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
      ...currentProgress,
      schoolSelections: selectedSelections, 
      pathway: selectedPathway || undefined, 
    });
  }, [selectedSelections, selectedPathway, isLoading, isLocked]);

  const handleMoveSelectionUp = (index: number) => {
    if (index === 0) return;
    setSelectedSelections(prev => {
        const newSelection = [...prev];
        [newSelection[index - 1], newSelection[index]] = [newSelection[index], newSelection[index - 1]];
        return newSelection;
    });
  };

  const handleMoveSelectionDown = (index: number) => {
    if (index >= selectedSelections.length - 1) return;
    setSelectedSelections(prev => {
        const newSelection = [...prev];
        [newSelection[index], newSelection[index + 1]] = [newSelection[index + 1], newSelection[index]];
        return newSelection;
    });
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    if (!selectedPathway || selectedSelections.length === 0) {
      toast({
        variant: "destructive",
        title: "Pilihan Tidak Lengkap",
        description: "Harap pilih jalur pendaftaran dan minimal satu sekolah/jurusan tujuan.",
      });
      setIsSubmitting(false);
      return;
    }

    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
      ...currentProgress,
      schoolSelections: selectedSelections,
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
  
  const isSubmitDisabled = isSubmitting || !selectedPathway || selectedSelections.length < 1 || selectedSelections.length > MAX_SCHOOL_SELECTION || isLocked;

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p>Memeriksa sesi Anda...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <FileText size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Pilih Jalur & Sekolah Tujuan</CardTitle>
          <CardDescription className="text-md">
            {isLocked
              ? "Anda telah menyelesaikan tahap ini. Pilihan Anda telah disimpan."
              : "Pilih jalur, lalu pilih 1-5 sekolah/jurusan tujuan dan atur prioritasnya."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLocked && (
            <Alert variant="default" className="mb-6 bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-300 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Pilihan Telah Disimpan Permanen</AlertTitle>
                <AlertDescription>
                    Anda telah menyelesaikan tahap ini. Pilihan jalur dan sekolah tidak dapat diubah lagi. Anda dapat melihat status pendaftaran Anda.
                </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <Label htmlFor="pathway-select" className="font-semibold text-lg">Langkah 1: Pilih Jalur Pendaftaran</Label>
            <Select value={selectedPathway} onValueChange={handlePathwayChange} disabled={isLocked}>
              <SelectTrigger id="pathway-select" className="w-full">
                <SelectValue placeholder="Pilih jalur pendaftaran Anda" />
              </SelectTrigger>
              <SelectContent>
                {activePathways.length > 0 ? (
                  activePathways.map((pathway) => (
                    <SelectItem key={pathway.id} value={pathway.name}>
                      {pathway.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    <Clock className="mx-auto h-6 w-6 mb-2" />
                    Tidak ada jalur pendaftaran yang sedang dibuka saat ini.
                  </div>
                )}
              </SelectContent>
            </Select>
            {selectedStageObject && (
                <Alert variant="default" className="mt-2 text-primary-foreground bg-primary/90 border-primary [&>svg]:text-primary-foreground">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Informasi Jalur Pendaftaran</AlertTitle>
                    <AlertDescription>
                        Jalur {selectedPathwayObject?.name} dibuka pada <strong>{selectedStageObject.name}</strong>. Hanya sekolah yang membuka pendaftaran pada tahap ini yang akan ditampilkan.
                    </AlertDescription>
                </Alert>
            )}
          </div>

          {selectedPathway && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-4">
                    <div>
                        <Label className="font-semibold text-lg">Langkah 2: Pilih Sekolah/Jurusan</Label>
                        <p className="text-sm text-muted-foreground">
                            Terpilih: {selectedSelections.length} dari {MAX_SCHOOL_SELECTION} pilihan.
                        </p>
                        {["Afirmasi", "Mutasi"].includes(selectedPathway) && (
                        <p className="text-xs text-primary mt-1">
                            Untuk jalur {selectedPathway}, hanya sekolah di kecamatan Anda yang akan ditampilkan.
                        </p>
                        )}
                         {selectedPathway === 'Domisili' && (
                          <p className="text-xs text-primary mt-1">
                              Jalur Domisili memprioritaskan kelurahan yang diatur oleh sekolah. Jika tidak ada, prioritas berdasarkan kecamatan.
                          </p>
                        )}
                    </div>
                    <Card>
                      <CardContent className="p-0">
                        <ScrollArea className="h-96 w-full rounded-md border">
                          <Accordion type="multiple" className="w-full p-2">
                            {availableSchools.length > 0 ? (
                              availableSchools.map((school) => (
                                <AccordionItem value={school.id} key={school.id} className="border-b">
                                  {school.jenjang === "SMA" ? (
                                    <div className="flex items-center text-sm p-2 rounded-md justify-between py-4 font-medium">
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">{school.namaSekolah}</p>
                                            <p className="text-xs text-muted-foreground">{school.jenjang} - Akreditasi: {school.akreditasi}</p>
                                        </div>
                                        <div className="pl-4">
                                            <Checkbox
                                                id={`${school.id}-sma`}
                                                checked={selectedSelections.some(s => s.schoolId === school.id)}
                                                onCheckedChange={() => handleSchoolSelectionChange(school.id, null)}
                                                aria-label={`Pilih ${school.namaSekolah}`}
                                                disabled={isLocked}
                                            />
                                        </div>
                                    </div>
                                  ) : (
                                    <>
                                      <AccordionTrigger className="text-sm hover:no-underline p-2 rounded-md hover:bg-muted" disabled={isLocked}>
                                        <div className="flex-1 text-left">
                                          <p className="font-medium">{school.namaSekolah}</p>
                                          <p className="text-xs text-muted-foreground">{school.jenjang} - Akreditasi: {school.akreditasi}</p>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="pl-4 pr-2 pt-2 pb-2 space-y-3">
                                          <p className="text-xs font-semibold text-muted-foreground">Pilih Jurusan:</p>
                                          {(school.majors || []).map(major => (
                                            <div key={major.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                                              <Checkbox
                                                id={`${school.id}-${major.id}`}
                                                checked={selectedSelections.some(s => s.schoolId === school.id && s.major === major.name)}
                                                onCheckedChange={() => handleSchoolSelectionChange(school.id, major.name)}
                                                disabled={isLocked}
                                              />
                                              <Label htmlFor={`${school.id}-${major.id}`} className="flex-grow cursor-pointer font-normal text-sm">
                                                {major.name}
                                              </Label>
                                            </div>
                                          ))}
                                        </div>
                                      </AccordionContent>
                                    </>
                                  )}
                                </AccordionItem>
                              ))
                            ) : (
                              <div className="flex items-center justify-center h-full text-muted-foreground p-4 text-center">
                                <p>Tidak ada sekolah yang tersedia untuk jalur dan tahap ini, atau tidak ada yang sesuai dengan kriteria pendaftaran Anda (misal: jenis kelamin/agama/domisili).</p>
                              </div>
                            )}
                          </Accordion>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label className="font-semibold text-lg">Langkah 3: Atur Prioritas Pilihan</Label>
                         <p className="text-sm text-muted-foreground">
                            Urutan pertama adalah prioritas tertinggi.
                        </p>
                    </div>
                    <Card>
                        <CardContent className="p-2">
                           <ScrollArea className="h-96 w-full">
                                <div className="p-2 space-y-2">
                                {selectedSelections.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-muted-foreground text-center py-20">
                                        <p>Pilih sekolah atau jurusan dari daftar di sebelah kiri untuk mengatur prioritas.</p>
                                    </div>
                                ) : (
                                    selectedSelections.map((selection, index) => {
                                        const school = allSchools.find(s => s.id === selection.schoolId);
                                        return (
                                            <div key={`${selection.schoolId}-${selection.major}`} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                                                <div className="flex items-center gap-3 flex-1 overflow-hidden">
                                                    <span className="font-bold text-lg text-primary">{index + 1}</span>
                                                    <div className="flex flex-col">
                                                      <span className="text-sm font-medium truncate">{school?.namaSekolah}</span>
                                                      {selection.major && <span className="text-xs text-muted-foreground truncate">{selection.major}</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={() => handleMoveSelectionUp(index)} disabled={isLocked || index === 0}>
                                                        <ArrowUp className="h-4 w-4" />
                                                        <span className="sr-only">Naikkan prioritas</span>
                                                    </Button>
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" onClick={() => handleMoveSelectionDown(index)} disabled={isLocked || index === selectedSelections.length - 1}>
                                                        <ArrowDown className="h-4 w-4" />
                                                         <span className="sr-only">Turunkan prioritas</span>
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                                </div>
                           </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          {isLocked ? (
            <Button asChild>
              <Link href="/registration/status">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Lihat Status Pendaftaran
              </Link>
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Menyimpan..." : "Simpan dan Lanjutkan"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
