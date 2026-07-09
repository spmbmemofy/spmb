
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
import { FileText, Save, School, ArrowUp, ArrowDown, AlertTriangle, ClipboardCheck, Info, Clock, ArrowLeft, Trash2, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getSchools, getSchoolById } from "@/lib/schoolService"; 
import { getFromLocalStorage, saveToLocalStorage, type RegistrationProgress, type LoginCredentials } from "@/lib/localStorage";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { getApplicants } from "@/lib/applicantService";
import type { SchoolSelection, Jalur, Tahap } from "@/lib/types";
import { getJalur } from "@/lib/pathwayService";
import { getStages } from "@/lib/stageService";
import type { School as SchoolType } from "@/lib/schoolService";
import { Badge } from "@/components/ui/badge";
import { getAchievementSettings } from "@/lib/achievementSettingsService";


const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";
const MAX_SCHOOL_SELECTION = 5;

const StepProgress = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { label: "Isi Biodata", step: 1 },
    { label: "Pilih Sekolah", step: 2 },
    { label: "Unggah Berkas", step: 3 }
  ];
  return (
    <div className="w-full max-w-4xl mb-8 px-4">
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


const normalizeRT = (rtStr: string | undefined): string | null => {
  if (!rtStr) return null;
  const match = rtStr.replace(/rt/i, '').match(/\d+/);
  return match ? parseInt(match[0], 10).toString() : null;
};

const isDomicileAllowed = (
  student: { subdistrict?: string; village?: string; rtRw?: string } | undefined,
  school: SchoolType
): boolean => {
  if (!student) return false;
  if (school.jenis === 'Swasta') return true;
  
  if (school.jenjang === 'SMK' && school.jenis === 'Negeri') {
    if (!school.allowedVillages || school.allowedVillages.length === 0) return true;
  }

  const studentSubdistrict = student.subdistrict;
  const studentVillage = student.village;
  const studentRt = normalizeRT(student.rtRw);

  // 1. RT-Level & Village-level Check via priorityDomiciles
  if (school.priorityDomiciles && school.priorityDomiciles.length > 0) {
    const matchingRule = school.priorityDomiciles.find(p => p.village === studentVillage);
    if (matchingRule) {
      if (matchingRule.rts && matchingRule.rts.length > 0) {
        if (!studentRt) return false;
        const normalizedSchoolRts = matchingRule.rts.map(rt => normalizeRT(rt)).filter(Boolean);
        return normalizedSchoolRts.includes(studentRt);
      }
      return true;
    }
  }

  // 2. Village-Level Check (allowedVillages)
  if (school.allowedVillages && school.allowedVillages.length > 0) {
    return studentVillage ? school.allowedVillages.includes(studentVillage) : false;
  }

  // 3. Kecamatan-Level Check
  return studentSubdistrict ? school.kecamatan === studentSubdistrict : false;
};

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

  // Achievements state
  const [achievements, setAchievements] = React.useState<any[]>([]);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = React.useState(false);
  const [newAchievement, setNewAchievement] = React.useState({
    type: 'rapor' as 'rapor' | 'tka' | 'osis' | 'lomba' | 'tahfidz' | 'non_islam' | 'pramuka_beregu' | 'pramuka_garuda' | 'buku',
    // fields for Juara Kelas
    raporSemester: 'vii_ganjil_genap', // vii_ganjil_genap, viii_ganjil_genap, ix_ganjil
    raporRank: '1', // 1, 2, 3
    // fields for TKA
    tkaRank: '1', // 1, 2, 3
    // fields for Lomba
    lombaCategory: 'akademik' as 'akademik' | 'non-akademik',
    lombaOrganizerType: 'official', // official, other
    lombaLevel: 'Kabupaten/Kota', // Kabupaten/Kota, Provinsi, Nasional, Internasional
    lombaRank: '1', // 1, 2, 3
    // fields for Tahfidz
    tahfidzJuz: '1', // 1 to 8
    // fields for Non-Islam
    nonIslamLevel: 'Kabupaten/Kota',
    nonIslamRank: '1',
    // fields for Pramuka Beregu
    pramukaLevel: 'Kwarcab', // Kwarcab, Kwarda, Kwarnas
    pramukaRank: '1', // 1, 2, 3
    // fields for Pramuka Garuda/SKU
    pramukaGarudaType: 'rakit', // rakit, terap, garuda
    // general name
    name: ''
  });

  const calculateAchievementScore = (ach: typeof newAchievement): number => {
    const settings = getAchievementSettings();
    const config = settings[ach.type as keyof typeof settings] || { active: true, scores: {} };
    if (!config.active) return 0;
    
    switch (ach.type) {
      case 'rapor': {
        const key = `${ach.raporSemester.split('_')[0]}_juara_${ach.raporRank}`;
        return config.scores[key] || 0;
      }
      case 'tka': {
        const key = `peringkat_${ach.tkaRank}`;
        return config.scores[key] || 0;
      }
      case 'osis': {
        return config.scores.ketua || 0;
      }
      case 'lomba': {
        const configKey = ach.lombaOrganizerType === 'official' ? 'lomba_official' : 'lomba_other';
        const lombaConfig = settings[configKey] || { active: true, scores: {} };
        if (!lombaConfig.active) return 0;
        
        const key = `${ach.lombaLevel.toLowerCase().replace('kabupaten/kota', 'kabupaten')}_juara_${ach.lombaRank}`;
        return lombaConfig.scores[key] || 0;
      }
      case 'tahfidz': {
        const key = `juz_${ach.tahfidzJuz}`;
        return config.scores[key] || 0;
      }
      case 'non_islam': {
        const key = `${ach.nonIslamLevel.toLowerCase().replace('kabupaten/kota', 'kabupaten')}_juara_${ach.nonIslamRank}`;
        return config.scores[key] || 0;
      }
      case 'pramuka_beregu': {
        const key = `${ach.pramukaLevel.toLowerCase()}_juara_${ach.pramukaRank}`;
        return config.scores[key] || 0;
      }
      case 'pramuka_garuda': {
        return config.scores[ach.pramukaGarudaType] || 0;
      }
      case 'buku': {
        return config.scores.isbn || 0;
      }
      default:
        return 0;
    }
  };

  const achievementTypes = [
    { value: 'rapor', label: 'Juara Kelas (Nilai Rapor)' },
    { value: 'tka', label: 'Peringkat Nilai TKA' },
    { value: 'osis', label: 'Ketua Organisasi Sekolah (OSIS, BESIS, MPK, PMR, dll.)' },
    { value: 'lomba', label: 'Lomba Akademik / Non-Akademik' },
    { value: 'tahfidz', label: 'Penghafal Al-Qur\'an (Hafidz/Hafidzoh)' },
    { value: 'non_islam', label: 'Keagamaan Non-Islam (Membaca Al-Kitab, Lektor, Dharma Gita, dll.)' },
    { value: 'pramuka_beregu', label: 'Lomba Pramuka (Beregu)' },
    { value: 'pramuka_garuda', label: 'Syarat Kecakapan Umum (SKU) / Pramuka Garuda (Perorangan)' },
    { value: 'buku', label: 'Karya Menulis Buku (Ber-ISBN)' }
  ];

  const achievementSettingsData = React.useMemo(() => {
    if (typeof window === 'undefined') return null;
    return getAchievementSettings();
  }, [isAchievementModalOpen]);

  const activeAchievementTypes = React.useMemo(() => {
    if (!achievementSettingsData) return achievementTypes;
    return achievementTypes.filter(type => {
      if (type.value === 'lomba') {
        return achievementSettingsData.lomba_official?.active || achievementSettingsData.lomba_other?.active;
      }
      const key = type.value as keyof typeof achievementSettingsData;
      return achievementSettingsData[key]?.active;
    });
  }, [achievementSettingsData]);

  const achievementLevels = [
    "Kabupaten/Kota",
    "Provinsi",
    "Nasional",
    "Internasional",
    "Sekolah/Lainnya"
  ];

  const officialOrganizers = [
    "Kementerian Pendidikan & Kebudayaan",
    "Kementerian Agama",
    "Kementerian Pemuda & Olahraga",
    "Komite Olahraga Nasional Indonesia (KONI)",
    "Kwartir Gerakan Kepramukaan",
    "Lainnya"
  ];

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
    
    if (!savedProgress?.biodata) {
      setTimeout(() => {
        toast({
          variant: "destructive",
          title: "Akses Ditolak",
          description: "Harap lengkapi biodata Anda di halaman dasbor sebelum melanjutkan.",
        });
        router.replace('/registration/dashboard');
      }, 0);
      return; 
    }

    if (savedProgress) {
      if (savedProgress.schoolSelections) setSelectedSelections(savedProgress.schoolSelections);
      if (savedProgress.pathway) setSelectedPathway(savedProgress.pathway);
      if (savedProgress.achievements) setAchievements(savedProgress.achievements);
      if (savedProgress.registrationCompleted || (applicantData && applicantData.statusVerifikasi)) {
        setIsLocked(true);
      }
    }
    setIsLoading(false);
  }, [router, toast]);

  const selectedPathwayObject = React.useMemo(() => {
    return allPathways.find(p => p.name === selectedPathway);
  }, [selectedPathway, allPathways]);

  const availableSchools = React.useMemo(() => {
    if (!selectedPathwayObject) return [];
    
    const applicantBiodata = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null)?.biodata;
    const studentSubdistrict = applicantBiodata?.subdistrict;
    const studentVillage = applicantBiodata?.village;

    let schoolsToDisplay = allSchools.filter(s => s.jenjang === 'SMA' || s.jenjang === 'SMK');
    
    // Pathway-specific filtering logic
    if (selectedPathway === 'Prestasi') {
        schoolsToDisplay = schoolsToDisplay.filter(school => 
            selectedPathwayObject.allowedJenjang.includes(school.jenjang)
        );

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
    } else if (["Afirmasi", "Mutasi"].includes(selectedPathway)) {
        // Filter by allowed jenjang for the pathway
        schoolsToDisplay = schoolsToDisplay.filter(school => 
            selectedPathwayObject.allowedJenjang.includes(school.jenjang)
        );
        
        // Filter by quota for the pathway
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

        // Filter by domicile for Afirmasi & Mutasi
        schoolsToDisplay = schoolsToDisplay.filter(school => {
            if (school.allowedVillages && school.allowedVillages.length > 0) {
                return studentVillage ? school.allowedVillages.includes(studentVillage) : false;
            }
            return studentSubdistrict ? school.kecamatan === studentSubdistrict : false;
        });
    } else if (selectedPathway === 'Domisili') {
      schoolsToDisplay = schoolsToDisplay.filter(school => isDomicileAllowed(applicantBiodata, school));
    } else if (selectedPathway === 'Reguler SMK') {
      schoolsToDisplay = schoolsToDisplay.filter(school => {
        if (school.jenjang === 'SMK') return true;
        if (school.jenjang === 'SMA' && school.jenis === 'Negeri') {
          if (school.allowedVillages && school.allowedVillages.length > 0) {
            return studentVillage ? school.allowedVillages.includes(studentVillage) : false;
          }
          return studentSubdistrict ? school.kecamatan === studentSubdistrict : false;
        }
        if (school.jenjang === 'SMA' && school.jenis === 'Swasta') return true;
        return false;
      });
    } else {
        // For any other pathway, or if no pathway is selected, clear the list.
        schoolsToDisplay = [];
    }
    
    // Generic filters applied after pathway-specific logic
    if (applicantBiodata) {
        schoolsToDisplay = schoolsToDisplay.filter(school => {
            const genderOk = !school.allowedGenders || school.allowedGenders.length === 0 || school.allowedGenders.includes(applicantBiodata.gender as 'Laki-laki' | 'Perempuan');
            const religionOk = !school.allowedReligions || school.allowedReligions.length === 0 || school.allowedReligions.includes(applicantBiodata.religion);
            return genderOk && religionOk;
        });
    }

    return schoolsToDisplay;
  }, [selectedPathwayObject, allSchools, selectedPathway]);

  const handlePathwayChange = (pathway: string) => {
    setSelectedSelections([]); // Clear selections when pathway changes
    setSelectedPathway(pathway);
  };
  
  const handleSchoolSelectionChange = (schoolId: string, major: string | null) => {
    const school = getSchoolById(schoolId);
    if (!school) return;

    // First choice validation for Domisili and Reguler SMK
    if (selectedSelections.length === 0) {
      if (selectedPathway === 'Domisili') {
        const applicantBiodata = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null)?.biodata;
        const studentVillage = applicantBiodata?.village;
        const studentSubdistrict = applicantBiodata?.subdistrict;
        const isAllowedByDomicile = isDomicileAllowed(applicantBiodata, school);

        if (school.jenjang !== 'SMA' || school.jenis !== 'Negeri' || !isAllowedByDomicile) {
          toast({
            variant: "destructive",
            title: "Pilihan Pertama Tidak Valid",
            description: "Untuk jalur Domisili, pilihan pertama Anda harus SMA Negeri yang sesuai dengan wilayah domisili Anda.",
          });
          return;
        }
      } else if (selectedPathway === 'Reguler SMK') {
        if (school.jenjang !== 'SMK') {
          toast({
            variant: "destructive",
            title: "Pilihan Pertama Tidak Valid",
            description: "Untuk jalur Reguler SMK, pilihan pertama Anda harus sekolah jenjang SMK.",
          });
          return;
        }
      }
    }

    setSelectedSelections(prevSelected => {
      const selection = { schoolId, major };
      const isSelected = prevSelected.some(s => s.schoolId === schoolId && s.major === major);

      if (isSelected) {
        return prevSelected.filter(s => !(s.schoolId === schoolId && s.major === major));
      }

      if (prevSelected.length >= MAX_SCHOOL_SELECTION) {
        toast({
          variant: "destructive",
          title: "Batas Maksimal Tercapai",
          description: `Anda hanya dapat memilih maksimal ${MAX_SCHOOL_SELECTION} sekolah/jurusan.`,
        });
        return prevSelected;
      }
      
      return [...prevSelected, selection];
    });
  };

  React.useEffect(() => {
    if (isLoading || isLocked) return; 
    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
      ...currentProgress,
      schoolSelections: selectedSelections, 
      pathway: selectedPathway || undefined, 
    });
  }, [selectedSelections, selectedPathway, isLoading, isLocked]);
  
  const selectedStageObject = React.useMemo(() => {
    if (!selectedPathwayObject) return null;
    return allStages.find(s => s.id === selectedPathwayObject.tahapId);
  }, [selectedPathwayObject, allStages]);

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
  
  const handleRemoveSelection = (index: number) => {
    setSelectedSelections(prev => prev.filter((_, i) => i !== index));
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

    if (selectedPathway === 'Prestasi' && achievements.length === 0) {
      toast({
        variant: "destructive",
        title: "Prestasi Belum Diisi",
        description: "Harap tambahkan minimal satu prestasi Anda terlebih dahulu.",
      });
      setIsSubmitting(false);
      return;
    }

    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
      ...currentProgress,
      schoolSelections: selectedSelections,
      pathway: selectedPathway,
      achievements: selectedPathway === 'Prestasi' ? achievements : undefined,
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
      <StepProgress currentStep={2} />
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

          {/* Achievement management section */}
          {selectedPathway === 'Prestasi' && (
            <div className="space-y-4 pt-4 border-t text-left">
              <div className="flex justify-between items-center">
                <div>
                  <Label className="font-semibold text-lg">Langkah 1B: Tambah Prestasi Anda</Label>
                  <p className="text-xs text-muted-foreground">
                    Masukkan minimal satu prestasi yang sesuai untuk jalur ini. Anda bisa menambahkan lebih dari 1 prestasi.
                  </p>
                </div>
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={() => {
                    const firstActive = activeAchievementTypes[0]?.value || 'rapor';
                    setNewAchievement(prev => ({ ...prev, type: firstActive as any }));
                    setIsAchievementModalOpen(true);
                  }}
                  disabled={isLocked}
                >
                  <Plus className="mr-2 h-4 w-4" /> Tambah Prestasi
                </Button>
              </div>

              {achievements.length === 0 ? (
                <Alert className="bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <AlertTitle>Belum Ada Prestasi</AlertTitle>
                  <AlertDescription>
                    Anda harus memasukkan minimal satu prestasi untuk mendaftar melalui jalur ini. Silakan klik tombol <strong>Tambah Prestasi</strong> di atas.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-muted text-muted-foreground font-medium border-b text-xs uppercase">
                        <th className="p-3 text-left">Jenis Prestasi</th>
                        <th className="p-3 text-left">Nama / Keterangan</th>
                        <th className="p-3 text-left">Tingkat & Penyelenggara</th>
                        <th className="p-3 text-center">Bobot Nilai</th>
                        {!isLocked && <th className="p-3 text-center w-[80px]">Aksi</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {achievements.map((item, idx) => {
                        const typeObj = achievementTypes.find(t => t.value === item.subcategory || t.value === item.type);
                        
                        return (
                          <tr key={item.id || idx} className="border-b last:border-0 hover:bg-muted/50">
                            <td className="p-3 text-sm font-medium">{typeObj?.label || item.type || 'Lainnya'}</td>
                            <td className="p-3 text-sm">{item.name}</td>
                            <td className="p-3 text-xs text-muted-foreground col-span-1">
                              {item.level && <span>Tingkat {item.level}</span>}
                              {item.organizer && <span> ({item.organizer})</span>}
                            </td>
                            <td className="p-3 text-center">
                              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold whitespace-nowrap">
                                +{item.score} Poin
                              </Badge>
                            </td>
                            {!isLocked && (
                              <td className="p-3 text-center">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => {
                                    setAchievements(prev => prev.filter(a => a.id !== item.id));
                                  }}
                                  className="text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {selectedPathway && (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
                <div className="space-y-4">
                    <div>
                        <Label className="font-semibold text-lg">Langkah 2: Pilih Sekolah/Jurusan</Label>
                        <p className="text-sm text-muted-foreground">
                            Terpilih: {selectedSelections.length} dari {MAX_SCHOOL_SELECTION} pilihan.
                        </p>
                    </div>
                    <Card>
                      <CardContent className="p-0">
                        <ScrollArea className="h-96 w-full rounded-md border">
                          <Accordion type="multiple" className="w-full p-2">
                            {availableSchools.length > 0 ? (
                              availableSchools.map((school) => {
                                const selectionIndexSma = selectedSelections.findIndex(s => s.schoolId === school.id && s.major === null);
                                const isSelectedSma = selectionIndexSma !== -1;

                                return (
                                <AccordionItem value={school.id} key={school.id} className="border-b">
                                  {school.jenjang === "SMA" ? (
                                    <div className="flex items-center text-sm p-2 rounded-md justify-between py-4 font-medium">
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">{school.namaSekolah}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{school.jenis} - Akreditasi: {school.akreditasi}</p>
                                        </div>
                                        <div className="pl-4">
                                            <Checkbox
                                                id={`${school.id}-sma`}
                                                checked={isSelectedSma}
                                                onCheckedChange={() => handleSchoolSelectionChange(school.id, null)}
                                                aria-label={`Pilih ${school.namaSekolah}`}
                                                disabled={isLocked}
                                            >
                                              {isSelectedSma && <span className="text-sm font-bold leading-none">{selectionIndexSma + 1}</span>}
                                            </Checkbox>
                                        </div>
                                    </div>
                                  ) : (
                                    <>
                                      <AccordionTrigger className="text-sm hover:no-underline p-2 rounded-md hover:bg-muted" disabled={isLocked}>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">{school.namaSekolah}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{school.jenis} - Akreditasi: {school.akreditasi}</p>
                                        </div>
                                      </AccordionTrigger>
                                      <AccordionContent>
                                        <div className="pl-4 pr-2 pt-2 pb-2 space-y-3">
                                          <p className="text-xs font-semibold text-muted-foreground">Pilih Jurusan:</p>
                                          {(school.majors || []).map(major => {
                                            const selectionIndexMajor = selectedSelections.findIndex(s => s.schoolId === school.id && s.major === major.name);
                                            const isSelectedMajor = selectionIndexMajor !== -1;
                                            return (
                                            <div key={major.id} className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted/50">
                                              <Checkbox
                                                id={`${school.id}-${major.id}`}
                                                checked={isSelectedMajor}
                                                onCheckedChange={() => handleSchoolSelectionChange(school.id, major.name)}
                                                disabled={isLocked}
                                              >
                                                {isSelectedMajor && <span className="text-sm font-bold leading-none">{selectionIndexMajor + 1}</span>}
                                              </Checkbox>
                                              <Label htmlFor={`${school.id}-${major.id}`} className="flex-grow cursor-pointer font-normal text-sm">
                                                {major.name}
                                              </Label>
                                            </div>
                                          )})}
                                        </div>
                                      </AccordionContent>
                                    </>
                                  )}
                                </AccordionItem>
                                )})
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
                                                    <Button size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0 text-destructive" onClick={() => handleRemoveSelection(index)} disabled={isLocked}>
                                                        <Trash2 className="h-4 w-4" />
                                                         <span className="sr-only">Hapus pilihan</span>
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
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
          <Button variant="outline" asChild>
            <Link href="/registration/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dasbor
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
            <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Menyimpan..." : "Simpan dan Lanjutkan"}
            </Button>
          )}
        </CardFooter>
      </Card>

      <Dialog open={isAchievementModalOpen} onOpenChange={setIsAchievementModalOpen}>
        <DialogContent className="max-w-lg text-left max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Tambah Prestasi Baru
            </DialogTitle>
            <DialogDescription className="text-xs">
              Pilih jenis prestasi Anda dari opsi sederhana di bawah. Bobot nilai akan dihitung secara otomatis.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="text-xs font-semibold">Jenis Prestasi</Label>
              <Select 
                value={newAchievement.type}
                onValueChange={(val: any) => {
                  setNewAchievement(prev => ({
                    ...prev,
                    type: val
                  }));
                }}
              >
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {activeAchievementTypes.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* CONDITIONAL RENDER: JUARA KELAS */}
            {newAchievement.type === 'rapor' && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-md border">
                <div>
                  <Label className="text-xs font-semibold">Tingkat Kelas & Semester</Label>
                  <Select 
                    value={newAchievement.raporSemester}
                    onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, raporSemester: val }))}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vii_ganjil_genap">Kelas VII Ganjil/Genap</SelectItem>
                      <SelectItem value="viii_ganjil_genap">Kelas VIII Ganjil/Genap</SelectItem>
                      <SelectItem value="ix_ganjil">Kelas IX Ganjil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Peringkat (Ranking)</Label>
                  <Select 
                    value={newAchievement.raporRank}
                    onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, raporRank: val }))}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Juara 1</SelectItem>
                      <SelectItem value="2">Juara 2</SelectItem>
                      <SelectItem value="3">Juara 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* CONDITIONAL RENDER: TKA */}
            {newAchievement.type === 'tka' && (
              <div className="p-3 bg-muted/40 rounded-md border">
                <Label className="text-xs font-semibold">Peringkat Nilai TKA di Sekolah</Label>
                <Select 
                  value={newAchievement.tkaRank}
                  onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, tkaRank: val }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Peringkat 1 Sekolah</SelectItem>
                    <SelectItem value="2">Peringkat 2 Sekolah</SelectItem>
                    <SelectItem value="3">Peringkat 3 Sekolah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* CONDITIONAL RENDER: KETUA ORGANISASI */}
            {newAchievement.type === 'osis' && (
              <div className="p-3 bg-muted/40 rounded-md border text-xs text-muted-foreground">
                ℹ️ Memiliki pengalaman sebagai Ketua OSIS, Ketua BESIS, Ketua MPK, Ketua PMR, atau organisasi siswa intra sekolah resmi lainnya. Bobot nilai tetap sebesar <strong>55</strong>.
              </div>
            )}

            {/* CONDITIONAL RENDER: LOMBA */}
            {newAchievement.type === 'lomba' && (
              <div className="space-y-3 p-3 bg-muted/40 rounded-md border">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Bidang Lomba</Label>
                    <Select 
                      value={newAchievement.lombaCategory}
                      onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, lombaCategory: val }))}
                    >
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="akademik">Akademik (Sains/Teknologi/Riset)</SelectItem>
                        <SelectItem value="non-akademik">Non-Akademik (Seni/Olahraga/Bahasa)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Penyelenggara</Label>
                    <Select 
                      value={newAchievement.lombaOrganizerType}
                      onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, lombaOrganizerType: val }))}
                    >
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="official">Resmi (Kemendikbud/Kemenag/KONI/Pramuka)</SelectItem>
                        <SelectItem value="other">Swasta / Organisasi Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold">Tingkat Lomba</Label>
                    <Select 
                      value={newAchievement.lombaLevel}
                      onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, lombaLevel: val }))}
                    >
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Internasional">Tingkat Internasional</SelectItem>
                        <SelectItem value="Nasional">Tingkat Nasional</SelectItem>
                        <SelectItem value="Provinsi">Tingkat Provinsi</SelectItem>
                        <SelectItem value="Kabupaten/Kota">Tingkat Kabupaten/Kota</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Juara Ke</Label>
                    <Select 
                      value={newAchievement.lombaRank}
                      onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, lombaRank: val }))}
                    >
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Juara 1 / Medali Emas</SelectItem>
                        <SelectItem value="2">Juara 2 / Medali Perak</SelectItem>
                        <SelectItem value="3">Juara 3 / Medali Perunggu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* CONDITIONAL RENDER: TAHFIDZ */}
            {newAchievement.type === 'tahfidz' && (
              <div className="p-3 bg-muted/40 rounded-md border">
                <Label className="text-xs font-semibold">Jumlah Juz yang Dihafal</Label>
                <Select 
                  value={newAchievement.tahfidzJuz}
                  onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, tahfidzJuz: val }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Juz (Nilai: 35)</SelectItem>
                    <SelectItem value="2">2 Juz (Nilai: 45)</SelectItem>
                    <SelectItem value="3">3 Juz (Nilai: 55)</SelectItem>
                    <SelectItem value="4">4 Juz (Nilai: 65)</SelectItem>
                    <SelectItem value="5">5 Juz (Nilai: 75)</SelectItem>
                    <SelectItem value="6">6 Juz (Nilai: 85)</SelectItem>
                    <SelectItem value="7">7 Juz (Nilai: 95)</SelectItem>
                    <SelectItem value="8">8 Juz ke atas (Nilai: 100)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* CONDITIONAL RENDER: NON-ISLAM */}
            {newAchievement.type === 'non_islam' && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-md border">
                <div>
                  <Label className="text-xs font-semibold">Tingkat Prestasi</Label>
                  <Select 
                    value={newAchievement.nonIslamLevel}
                    onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, nonIslamLevel: val }))}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kabupaten/Kota">Kabupaten/Kota</SelectItem>
                      <SelectItem value="Provinsi">Provinsi</SelectItem>
                      <SelectItem value="Nasional">Nasional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Juara Ke</Label>
                  <Select 
                    value={newAchievement.nonIslamRank}
                    onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, nonIslamRank: val }))}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Juara 1</SelectItem>
                      <SelectItem value="2">Juara 2</SelectItem>
                      <SelectItem value="3">Juara 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* CONDITIONAL RENDER: PRAMUKA BEREGU */}
            {newAchievement.type === 'pramuka_beregu' && (
              <div className="grid grid-cols-2 gap-4 p-3 bg-muted/40 rounded-md border">
                <div>
                  <Label className="text-xs font-semibold">Tingkat Lomba Pramuka</Label>
                  <Select 
                    value={newAchievement.pramukaLevel}
                    onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, pramukaLevel: val }))}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kwarcab">Kwarcab / Lomba Tingkat III</SelectItem>
                      <SelectItem value="Kwarda">Kwarda / Lomba Tingkat IV</SelectItem>
                      <SelectItem value="Kwarnas">Kwarnas / Lomba Tingkat V</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Juara Ke</Label>
                  <Select 
                    value={newAchievement.pramukaRank}
                    onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, pramukaRank: val }))}
                  >
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Juara 1</SelectItem>
                      <SelectItem value="2">Juara 2</SelectItem>
                      <SelectItem value="3">Juara 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* CONDITIONAL RENDER: PRAMUKA GARUDA / SKU */}
            {newAchievement.type === 'pramuka_garuda' && (
              <div className="p-3 bg-muted/40 rounded-md border">
                <Label className="text-xs font-semibold">Tingkat Pencapaian SKU / Garuda</Label>
                <Select 
                  value={newAchievement.pramukaGarudaType}
                  onValueChange={(val: any) => setNewAchievement(prev => ({ ...prev, pramukaGarudaType: val }))}
                >
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rakit">Pramuka Penggalang Rakit (Nilai: 20)</SelectItem>
                    <SelectItem value="terap">Pramuka Penggalang Terap (Nilai: 30)</SelectItem>
                    <SelectItem value="garuda">Pramuka Penggalang Garuda (Nilai: 40)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* CONDITIONAL RENDER: KARYA BUKU */}
            {newAchievement.type === 'buku' && (
              <div className="p-3 bg-muted/40 rounded-md border text-xs text-muted-foreground">
                ℹ️ Penambahan nilai untuk karya menulis buku ber-ISBN maksimal 3 tahun terakhir. Bobot nilai tetap sebesar <strong>50</strong>.
              </div>
            )}

            <div>
              <Label htmlFor="ach-name" className="text-xs font-semibold">Nama / Deskripsi Singkat Prestasi</Label>
              <Input 
                id="ach-name"
                value={newAchievement.name}
                onChange={(e) => setNewAchievement(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Contoh: Juara 1 Olimpiade Fisika Kabupaten / Penghafal Al-Qur'an 3 Juz"
                className="mt-1"
              />
            </div>

            {/* Live Score Preview */}
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 rounded-md text-emerald-800 dark:text-emerald-300 flex justify-between items-center text-sm font-semibold">
              <span>Estimasi Nilai Tambahan:</span>
              <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm px-2 py-0.5">
                +{calculateAchievementScore(newAchievement)} Poin
              </Badge>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 border-t pt-3">
            <Button variant="outline" size="sm" onClick={() => setIsAchievementModalOpen(false)}>Batal</Button>
            <Button 
              size="sm" 
              onClick={() => {
                if (!newAchievement.name.trim()) {
                  toast({ variant: "destructive", title: "Validasi Gagal", description: "Nama/deskripsi prestasi tidak boleh kosong." });
                  return;
                }
                const computedScore = calculateAchievementScore(newAchievement);
                
                let mappedCategory: 'akademik' | 'non-akademik' = 'non-akademik';
                if (['rapor', 'tka'].includes(newAchievement.type)) {
                  mappedCategory = 'akademik';
                } else if (newAchievement.type === 'lomba') {
                  mappedCategory = newAchievement.lombaCategory;
                }
                
                let mappedSubcategory = newAchievement.type as string;
                if (newAchievement.type === 'lomba') {
                  mappedSubcategory = newAchievement.lombaCategory === 'akademik' ? 'lomba_akademik' : 'seni_olahraga';
                } else if (['osis', 'pramuka_beregu', 'pramuka_garuda'].includes(newAchievement.type)) {
                  mappedSubcategory = newAchievement.type === 'osis' ? 'osis' : (newAchievement.type === 'pramuka_garuda' ? 'pratama' : 'seni_olahraga');
                } else if (newAchievement.type === 'tahfidz' || newAchievement.type === 'non_islam') {
                  mappedSubcategory = 'keagamaan';
                } else if (newAchievement.type === 'buku') {
                  mappedSubcategory = 'lomba_akademik';
                }

                // Determine level description
                let levelText = '-';
                if (newAchievement.type === 'rapor') levelText = newAchievement.raporSemester.replace(/_/g, ' ');
                else if (newAchievement.type === 'tka') levelText = `Peringkat ${newAchievement.tkaRank}`;
                else if (newAchievement.type === 'lomba') levelText = newAchievement.lombaLevel;
                else if (newAchievement.type === 'non_islam') levelText = newAchievement.nonIslamLevel;
                else if (newAchievement.type === 'tahfidz') levelText = `${newAchievement.tahfidzJuz} Juz`;
                else if (newAchievement.type === 'pramuka_beregu') levelText = newAchievement.pramukaLevel;
                else if (newAchievement.type === 'pramuka_garuda') levelText = `Penggalang ${newAchievement.pramukaGarudaType}`;

                // Determine organizer text
                let organizerText = '-';
                if (newAchievement.type === 'lomba') {
                  organizerText = newAchievement.lombaOrganizerType === 'official' ? 'Penyelenggara Resmi' : 'Penyelenggara Lainnya';
                } else if (newAchievement.type === 'pramuka_beregu') {
                  organizerText = 'Kwartir Pramuka';
                } else if (newAchievement.type === 'osis') {
                  organizerText = 'Sekolah Asal';
                }

                const newObj = {
                  id: Math.random().toString(36).substring(2, 9),
                  type: newAchievement.type,
                  category: mappedCategory,
                  subcategory: mappedSubcategory,
                  name: newAchievement.name,
                  level: levelText,
                  organizer: organizerText,
                  score: computedScore
                };

                setAchievements(prev => [...prev, newObj]);
                setNewAchievement(prev => ({
                  ...prev,
                  name: ''
                }));
                setIsAchievementModalOpen(false);
                toast({
                  title: "Prestasi Ditambahkan",
                  description: "Prestasi berhasil ditambahkan ke daftar pendaftaran Anda.",
                });
              }}
            >
              Simpan Prestasi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
