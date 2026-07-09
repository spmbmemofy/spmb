
"use client";

import * as React from "react";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCircle, CheckCircle2, Edit3, Save, XCircle, Upload, Check, AlertTriangle, ClipboardCheck } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as ShadcnTableFooter } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getFromLocalStorage, saveToLocalStorage, type RegistrationProgress, type BiodataDetails, type LoginCredentials } from "@/lib/localStorage";
import { addressData, getDistricts, getSubdistricts, getVillages } from "@/lib/addressData";
import { getManagedApplicants } from "@/lib/managedApplicantService";
import { getApplicants } from "@/lib/applicantService";
import { getSchoolById } from "@/lib/schoolService";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";

const indonesianProvinces = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", 
  "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung", "DKI Jakarta", 
  "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", 
  "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", 
  "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", 
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", 
  "Sulawesi Tenggara", "Maluku", "Maluku Utara", "Papua", "Papua Barat", 
  "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya"
];

const kaltimDistricts = [
  "Kabupaten Berau", "Kota Samarinda", "Kota Balikpapan", "Kota Bontang", 
  "Kabupaten Kutai Kartanegara", "Kabupaten Kutai Timur", "Kabupaten Kutai Barat", 
  "Kabupaten Paser", "Kabupaten Penajam Paser Utara", "Kabupaten Mahakam Ulu"
];
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";
const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";


const genderOptions = [
  { value: "Laki-laki", label: "Laki-laki" },
  { value: "Perempuan", label: "Perempuan" },
];

const religionOptions = [
  { value: "Islam", label: "Islam" },
  { value: "Kristen Protestan", label: "Kristen Protestan" },
  { value: "Katolik", label: "Katolik" },
  { value: "Hindu", label: "Hindu" },
  { value: "Buddha", label: "Buddha" },
  { value: "Konghucu", label: "Konghucu" },
  { value: "Lainnya", label: "Lainnya" },
];

const occupationOptions = [
    { value: "Tidak Bekerja", label: "Tidak Bekerja" },
    { value: "Ibu Rumah Tangga", label: "Ibu Rumah Tangga" },
    { value: "PNS/TNI/Polri", label: "PNS/TNI/Polri" },
    { value: "Pegawai Swasta", label: "Pegawai Swasta" },
    { value: "Wiraswasta (Perdagangan, Jasa, dll)", label: "Wiraswasta (Perdagangan, Jasa, dll)" },
    { value: "Petani/Nelayan/Peternak", label: "Petani/Nelayan/Peternak" },
    { value: "Buruh (Harian Lepas, Pabrik, Bangunan)", label: "Buruh (Harian Lepas, Pabrik, Bangunan)" },
    { value: "Profesional (Dokter, Guru, Pengacara)", label: "Profesional (Dokter, Guru, Pengacara)" },
    { value: "Pensiunan", label: "Pensiunan" },
    { value: "Lainnya", label: "Lainnya" },
];

const incomeOptions = [
    { value: "-", label: "-" },
    { value: "< Rp 1.000.000", label: "< Rp 1.000.000" },
    { value: "Rp 1.000.000 - Rp 2.500.000", label: "Rp 1.000.000 - Rp 2.500.000" },
    { value: "Rp 2.500.001 - Rp 5.000.000", label: "Rp 2.500.001 - Rp 5.000.000" },
    { value: "Rp 5.000.001 - Rp 7.500.000", label: "Rp 5.000.001 - Rp 7.500.000" },
    { value: "Rp 7.500.001 - Rp 15.000.000", label: "Rp 7.500.001 - Rp 15.000.000" },
    { value: "> Rp 15.000.000", label: "> Rp 15.000.000" },
];

const initialBiodataDetails: BiodataDetails = {
  fullName: "Muhammad Rizky Pratama",
  nisn: "0056789123",
  nik: "6403011507050002",
  placeOfBirth: "Tanjung Redeb",
  dateOfBirth: "2008-07-15",
  gender: "Laki-laki",
  religion: "Islam",
  streetName: "Jl. Durian III No. 25",
  rtRw: "RT 10 RW 03",
  village: "Kel. Tanjung Redeb",
  subdistrict: "Kec. Tanjung Redeb",
  district: "Kabupaten Berau",
  province: "Kalimantan Timur",
  previousSchool: "SMP Negeri 1 Tanjung Redeb",
  fatherName: "Abdullah Siregar",
  fatherDateOfBirth: "1975-03-20",
  fatherOccupation: "Wiraswasta (Perdagangan Hasil Bumi)",
  fatherIncome: "Rp 7.500.000 - Rp 15.000.000",
  motherName: "Siti Fatimah",
  motherDateOfBirth: "1980-08-10",
  motherOccupation: "Ibu Rumah Tangga",
  motherIncome: "-",
  guardianName: "-",
  contactNumber: "081254321098",
  semesterGrades: {
    semester1: 86.50,
    semester2: 89.20,
    semester3: 91.00,
    semester4: 88.75,
    semester5: 93.10
  },
};

type BiodataKeys = keyof typeof initialBiodataDetails;
type SelectOption = { value: string; label: string };

interface BiodataItemProps {
  label: string;
  value: string | number | undefined;
  fieldKey?: BiodataKeys;
  isEditing?: boolean;
  currentInputValue?: string;
  onEditClick?: (fieldKey: BiodataKeys, currentValue: string) => void;
  onSaveClick?: (fieldKey: BiodataKeys) => void;
  onCancelClick?: () => void;
  onInputChange?: (newValue: string) => void;
  disableEditButton?: boolean;
  inputType?: string;
  selectOptions?: SelectOption[];
}

const BiodataItem: React.FC<BiodataItemProps> = ({
  label, value, fieldKey, isEditing, currentInputValue, onEditClick, onSaveClick, onCancelClick, onInputChange, disableEditButton, inputType = "text", selectOptions,
}) => {
  if (isEditing && fieldKey && onSaveClick && onCancelClick && onInputChange) {
    return (
      <TableRow>
        <TableCell colSpan={3} className="py-2 px-3">
          <div className="space-y-2">
            <Label htmlFor={fieldKey} className="text-sm font-medium">{label}</Label>
            <div className="flex items-center space-x-2">
              {selectOptions && selectOptions.length > 0 ? (
                <Select
                  value={currentInputValue}
                  onValueChange={onInputChange}
                >
                  <SelectTrigger id={fieldKey} className="text-sm flex-grow h-9">
                    <SelectValue placeholder={`Pilih ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={fieldKey}
                  type={inputType}
                  value={currentInputValue}
                  onChange={(e) => onInputChange(e.target.value)}
                  className="text-sm flex-grow h-9"
                />
              )}
              <Button onClick={() => onSaveClick(fieldKey)} size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" aria-label={`Simpan ${label}`}>
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button onClick={onCancelClick} size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0" aria-label={`Batal edit ${label}`}>
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow>
      <TableCell className="font-medium text-muted-foreground w-[40%]">{label}</TableCell>
      <TableCell>{value || "-"}</TableCell>
      <TableCell className="text-right">
        {onEditClick && fieldKey && (
          <Button
            onClick={() => onEditClick(fieldKey, String(value || ""))}
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            disabled={disableEditButton}
            aria-label={`Edit ${label}`}
          >
            <Edit3 className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
};


interface EditableBiodataFieldProps {
  label: string;
  name: ParentInfoKeys;
  value: string | number | undefined;
  onChange: (name: ParentInfoKeys, value: string) => void;
  type?: string;
  placeholder?: string;
  selectOptions?: SelectOption[];
}

const EditableBiodataField: React.FC<EditableBiodataFieldProps> = ({ label, name, value, onChange, type = "text", placeholder, selectOptions }) => {
  if (selectOptions && selectOptions.length > 0) {
    return (
      <div className="space-y-1">
        <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
        <Select
          value={String(value || "")}
          onValueChange={(newValue) => onChange(name, newValue)}
        >
          <SelectTrigger id={name} className="text-sm">
            <SelectValue placeholder={`Pilih ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {selectOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        value={value || ""}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder || `Masukkan ${label.toLowerCase()}`}
        className="text-sm"
      />
    </div>
  );
};

type ParentInfoKeys = 'fatherName' | 'fatherDateOfBirth' | 'fatherOccupation' | 'fatherIncome' |
                      'motherName' | 'motherDateOfBirth' | 'motherOccupation' | 'motherIncome' |
                      'guardianName';

const personalInfoEditableFields: Array<{ key: BiodataKeys; label: string; type?: string; selectOptions?: SelectOption[] }> = [
    { key: "fullName", label: "Nama Lengkap" },
    { key: "placeOfBirth", label: "Tempat Lahir" },
    { key: "dateOfBirth", label: "Tanggal Lahir", type: "date" },
    { key: "gender", label: "Jenis Kelamin", selectOptions: genderOptions },
    { key: "religion", label: "Agama", selectOptions: religionOptions },
    { key: "previousSchool", label: "Sekolah Asal" },
    { key: "contactNumber", label: "Nomor Kontak (Siswa/Orang Tua)", type: "tel" },
];


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


function ApplicantDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [biodata, setBiodata] = React.useState<BiodataDetails | null>(null);
  const [isLocked, setIsLocked] = React.useState(false);
  
  const [profilePhoto, setProfilePhoto] = React.useState<string | null>(null);
  const [persistedPhotoUploaded, setPersistedPhotoUploaded] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const semesterKeys: (keyof BiodataDetails['semesterGrades'])[] = ["semester1", "semester2", "semester3", "semester4", "semester5"];
  const semesterLabels = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5"];
  
  const isBerau = biodata?.province === "Kalimantan Timur" && biodata?.district === "Kabupaten Berau";
  const districtOptions = biodata?.province === "Kalimantan Timur" ? kaltimDistricts : [];
  const subdistrictOptions = isBerau ? getSubdistricts(biodata?.province as any, biodata?.district as any) : [];
  const villageOptions = isBerau ? getVillages(biodata?.province as any, biodata?.district as any, biodata?.subdistrict) : [];

  React.useEffect(() => {
    const savedProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null);
    const loggedInUser = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    const applicantData = loggedInUser?.username ? getApplicants().find(a => a.nisn === loggedInUser.username) : null;
    
    if (savedProgress?.registrationCompleted || (applicantData && applicantData.statusVerifikasi)) {
        setIsLocked(true);
    }

    if (savedProgress?.biodata) {
      setBiodata(savedProgress.biodata);
      if (savedProgress.profilePhotoDataUri) setProfilePhoto(savedProgress.profilePhotoDataUri);
      if (savedProgress.hasProfilePhoto) setPersistedPhotoUploaded(true);
      setIsLoading(false);
      return;
    }

    if (loggedInUser?.username) {
      const managedApplicants = getManagedApplicants();
      const studentData = managedApplicants.find(app => app.nisn === loggedInUser.username);

      if (studentData) {
        const school = getSchoolById(studentData.asalSekolahId);
        const initialData: BiodataDetails = {
          fullName: studentData.fullName,
          nisn: studentData.nisn,
          nik: studentData.nik || '',
          placeOfBirth: studentData.placeOfBirth || '',
          dateOfBirth: studentData.dateOfBirth || '',
          gender: studentData.gender,
          religion: studentData.religion || '',
          streetName: studentData.streetName || '',
          rtRw: studentData.rtRw || '',
          village: studentData.village || '',
          subdistrict: studentData.subdistrict || '',
          district: studentData.district || 'Kabupaten Berau',
          province: studentData.province || 'Kalimantan Timur',
          previousSchool: school?.namaSekolah || 'Sekolah tidak terdaftar',
          fatherName: studentData.fatherName || '',
          fatherDateOfBirth: '',
          fatherOccupation: studentData.fatherOccupation || '',
          fatherIncome: studentData.fatherIncome || '',
          motherName: studentData.motherName || '',
          motherDateOfBirth: '',
          motherOccupation: studentData.motherOccupation || '',
          motherIncome: studentData.motherIncome || '',
          guardianName: studentData.guardianName || '',
          contactNumber: studentData.contactNumber || '',
          semesterGrades: studentData.semesterGrades,
        };
        setBiodata(initialData);
        saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, { ...savedProgress, biodata: initialData });
      } else {
        setBiodata(initialBiodataDetails);
        saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, { ...savedProgress, biodata: initialBiodataDetails });
      }
    } else {
      setBiodata(initialBiodataDetails);
      saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, { ...savedProgress, biodata: initialBiodataDetails });
    }

    setIsLoading(false);
  }, []);
  
  React.useEffect(() => {
    if (isLoading || !biodata || isLocked) return;

    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
        ...currentProgress,
        biodata,
    });
  }, [biodata, isLoading, isLocked]);

  const overallTableValue = React.useMemo(() => {
    if (!biodata?.semesterGrades) return "0.00";
    return Object.values(biodata.semesterGrades).reduce((sum, avg) => sum + avg, 0).toFixed(2);
  }, [biodata?.semesterGrades]);


  const [isReportDialogOpen, setIsReportDialogOpen] = React.useState(false);
  const [reportMessage, setReportMessage] = React.useState("");

  const handleInputChange = (field: keyof BiodataDetails, value: string) => {
    setBiodata(prev => {
      if (!prev) return null;
      const newState = { ...prev, [field]: value };
      if (field === 'province') {
        newState.district = '';
        newState.subdistrict = '';
        newState.village = '';
      } else if (field === 'district') {
        newState.subdistrict = '';
        newState.village = '';
      } else if (field === 'subdistrict') {
        newState.village = '';
      }
      return newState;
    });
  };

  const handleConfirm = () => {
    if (!biodata) return;

    if (!biodata.fullName?.trim() || !biodata.placeOfBirth?.trim() || !biodata.dateOfBirth || !biodata.motherName?.trim() ||
        !biodata.province || !biodata.district?.trim() || !biodata.subdistrict?.trim() || !biodata.village?.trim() ||
        !biodata.streetName?.trim() || !biodata.rtRw?.trim() || !biodata.contactNumber?.trim()) {
      toast({
        variant: "destructive",
        title: "Biodata Belum Lengkap",
        description: "Harap lengkapi semua data pribadi (termasuk NIK, Agama, No. Kontak, dan Alamat Lengkap) sebelum melanjutkan.",
      });
      return;
    }

    if (!biodata.nik?.trim() || biodata.nik.length !== 16) {
      toast({
        variant: "destructive",
        title: "NIK Tidak Valid",
        description: "NIK harus 16 digit.",
      });
      return;
    }

    const progress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    if (!progress?.hasProfilePhoto) {
         toast({
            variant: "destructive",
            title: "Foto Profil Diperlukan",
            description: "Harap unggah foto profil Anda sebelum mengkonfirmasi biodata.",
        });
        return;
    }

    toast({
      title: "Biodata Terkonfirmasi",
      description: "Biodata Anda telah dikonfirmasi. Melanjutkan ke pemilihan sekolah.",
    });
    router.push('/registration/documents');
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});

    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "Ukuran File Terlalu Besar",
          description: `File ${file.name} melebihi batas maksimal 2MB.`,
        });
        if (event.target) event.target.value = '';
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          variant: "destructive",
          title: "Jenis File Tidak Sesuai",
          description: "Harap pilih file gambar dengan format JPG, JPEG, atau PNG.",
        });
        if (event.target) event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setProfilePhoto(dataUri);
        saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
          ...currentProgress,
          hasProfilePhoto: true,
          profilePhotoDataUri: dataUri,
        });
        setPersistedPhotoUploaded(true); 
      };
      reader.readAsDataURL(file);
      toast({
        title: "Foto Terpilih",
        description: `${file.name} siap ditampilkan.`,
      });
    }
  };

  
  if (isLoading || !biodata) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p>Memuat data Anda...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <StepProgress currentStep={1} />
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <UserCircle size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Data Pendaftar</CardTitle>
          <CardDescription className="text-md">
            Harap tinjau biodata dan nilai rapor Anda. Anda dapat menyunting informasi pribadi dan orang tua/wali, serta mengunggah foto profil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {isLocked && (
             <Alert variant="default" className="bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-700/50 dark:text-yellow-300 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Biodata Terkunci</AlertTitle>
                <AlertDescription>
                    Anda telah menyelesaikan pendaftaran dan data Anda sedang dalam proses verifikasi. Biodata tidak dapat diubah lagi.
                </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col items-center mb-8 pt-4 border-t">
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 mb-4">
              <Image
                src={profilePhoto || "https://placehold.co/150x150.png"}
                alt="Foto Profil"
                layout="fill"
                className="rounded-full object-cover border-2 border-primary shadow-md"
                data-ai-hint="profile picture user"
              />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoChange}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
              id="photo-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Unggah atau ganti foto profil"
              disabled={isLocked}
            >
              <Upload className="mr-2 h-4 w-4" />
              {profilePhoto || persistedPhotoUploaded ? "Ganti Foto" : "Unggah Foto Profil"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Maks. 2MB (PNG, JPG, JPEG)</p>
          </div>

          <section>
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-lg">Informasi Pribadi</CardTitle>
                    <CardDescription className="text-xs">Data pribadi dasar Anda.</CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsReportDialogOpen(true)}
                    className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/20"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4 text-amber-500" /> Lapor ke Sekolah Asal
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300">
                  <AlertTriangle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-sm font-semibold">Data Sinkronisasi Sekolah Asal</AlertTitle>
                  <AlertDescription className="text-xs">
                    Kolom berlatar abu-abu diimpor oleh sekolah asal (SMP). Jika ada kesalahan data tersebut, silakan klik tombol <strong>Lapor ke Sekolah Asal</strong> di atas untuk perbaikan.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1 mb-1">Nama Lengkap <span className="text-red-500 font-bold">*</span></Label>
                    <Input value={biodata.fullName} disabled className="bg-muted text-muted-foreground font-semibold" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1 mb-1">NISN <span className="text-red-500 font-bold">*</span></Label>
                    <Input value={biodata.nisn} disabled className="bg-muted text-muted-foreground font-mono" />
                  </div>
                  <div>
                    <Label htmlFor="nik" className="flex items-center gap-1 mb-1 font-semibold">NIK (16 Digit) <span className="text-red-500 font-bold">*</span></Label>
                    <Input 
                      id="nik" 
                      value={biodata.nik || ""} 
                      onChange={(e) => handleInputChange('nik', e.target.value)} 
                      maxLength={16}
                      disabled={isLocked}
                      placeholder="Masukkan NIK Anda"
                      className="border-primary/40 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1 mb-1">Jenis Kelamin <span className="text-red-500 font-bold">*</span></Label>
                    <Input value={biodata.gender} disabled className="bg-muted text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1 mb-1">Tempat Lahir <span className="text-red-500 font-bold">*</span></Label>
                    <Input value={biodata.placeOfBirth} disabled className="bg-muted text-muted-foreground" />
                  </div>
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1 mb-1">Tanggal Lahir <span className="text-red-500 font-bold">*</span></Label>
                    <Input 
                      value={biodata.dateOfBirth ? new Date(biodata.dateOfBirth).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}) : ""} 
                      disabled 
                      className="bg-muted text-muted-foreground" 
                    />
                  </div>
                  <div>
                    <Label htmlFor="religion" className="flex items-center gap-1 mb-1 font-semibold">Agama <span className="text-red-500 font-bold">*</span></Label>
                    <Select 
                      onValueChange={(v) => handleInputChange('religion', v)} 
                      value={biodata.religion}
                      disabled={isLocked}
                    >
                      <SelectTrigger id="religion" className="border-primary/40 focus:ring-primary"><SelectValue placeholder="Pilih Agama" /></SelectTrigger>
                      <SelectContent>
                        {religionOptions.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1 mb-1">Nama Ibu Kandung <span className="text-red-500 font-bold">*</span></Label>
                    <Input value={biodata.motherName} disabled className="bg-muted text-muted-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="contactNumber" className="flex items-center gap-1 mb-1 font-semibold">Nomor Kontak / WhatsApp <span className="text-red-500 font-bold">*</span></Label>
                    <Input 
                      id="contactNumber" 
                      type="tel" 
                      value={biodata.contactNumber || ""} 
                      onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                      disabled={isLocked}
                      placeholder="Contoh: 0812XXXXXXXX"
                      className="border-primary/40 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <Label className="text-muted-foreground flex items-center gap-1 mb-1">Sekolah Asal</Label>
                    <Input value={biodata.previousSchool} disabled className="bg-muted text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Alamat Lengkap</CardTitle>
                <CardDescription className="text-xs">Isi alamat domisili pendaftar saat ini.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  <div>
                    <Label className="flex items-center gap-1 mb-1 font-semibold">Provinsi <span className="text-red-500 font-bold">*</span></Label>
                    <Select 
                      onValueChange={(v) => handleInputChange('province', v)} 
                      value={biodata.province}
                      disabled={isLocked}
                    >
                      <SelectTrigger className="border-primary/40 focus:ring-primary"><SelectValue placeholder="Pilih Provinsi" /></SelectTrigger>
                      <SelectContent>
                        {indonesianProvinces.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="flex items-center gap-1 mb-1 font-semibold">Kabupaten/Kota <span className="text-red-500 font-bold">*</span></Label>
                    {biodata.province === "Kalimantan Timur" ? (
                      <Select 
                        onValueChange={(v) => handleInputChange('district', v)} 
                        value={biodata.district}
                        disabled={isLocked}
                      >
                        <SelectTrigger className="border-primary/40 focus:ring-primary"><SelectValue placeholder="Pilih Kabupaten/Kota" /></SelectTrigger>
                        <SelectContent>
                          {districtOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        value={biodata.district} 
                        onChange={(e) => handleInputChange('district', e.target.value)} 
                        placeholder="Tulis Kabupaten/Kota..." 
                        disabled={isLocked || !biodata.province} 
                        className="border-primary/40 focus-visible:ring-primary"
                      />
                    )}
                  </div>
                  <div>
                    <Label className="flex items-center gap-1 mb-1 font-semibold">Kecamatan <span className="text-red-500 font-bold">*</span></Label>
                    {isBerau ? (
                      <Select 
                        onValueChange={(v) => handleInputChange('subdistrict', v)} 
                        value={biodata.subdistrict}
                        disabled={isLocked}
                      >
                        <SelectTrigger className="border-primary/40 focus:ring-primary"><SelectValue placeholder="Pilih Kecamatan" /></SelectTrigger>
                        <SelectContent>
                          {subdistrictOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        value={biodata.subdistrict} 
                        onChange={(e) => handleInputChange('subdistrict', e.target.value)} 
                        placeholder="Tulis Kecamatan..." 
                        disabled={isLocked || !biodata.district} 
                        className="border-primary/40 focus-visible:ring-primary"
                      />
                    )}
                  </div>
                  <div>
                    <Label className="flex items-center gap-1 mb-1 font-semibold">Kelurahan/Desa <span className="text-red-500 font-bold">*</span></Label>
                    {isBerau ? (
                      <Select 
                        onValueChange={(v) => handleInputChange('village', v)} 
                        value={biodata.village}
                        disabled={isLocked}
                      >
                        <SelectTrigger className="border-primary/40 focus:ring-primary"><SelectValue placeholder="Pilih Kelurahan/Desa" /></SelectTrigger>
                        <SelectContent>
                          {villageOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input 
                        value={biodata.village} 
                        onChange={(e) => handleInputChange('village', e.target.value)} 
                        placeholder="Tulis Kelurahan/Desa..." 
                        disabled={isLocked || !biodata.subdistrict} 
                        className="border-primary/40 focus-visible:ring-primary"
                      />
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="streetName" className="flex items-center gap-1 mb-1 font-semibold">Nama Jalan & No. Rumah <span className="text-red-500 font-bold">*</span></Label>
                    <Input 
                      id="streetName" 
                      value={biodata.streetName} 
                      onChange={(e) => handleInputChange('streetName', e.target.value)}
                      disabled={isLocked}
                      placeholder="Nama jalan, nomor rumah, gang, RT/RW, dll."
                      className="border-primary/40 focus-visible:ring-primary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="rtRw" className="flex items-center gap-1 mb-1 font-semibold">RT/RW <span className="text-red-500 font-bold">*</span></Label>
                    <Input 
                      id="rtRw" 
                      value={biodata.rtRw} 
                      onChange={(e) => handleInputChange('rtRw', e.target.value)}
                      disabled={isLocked}
                      placeholder="Contoh: RT 10 / RW 03"
                      className="border-primary/40 focus-visible:ring-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Nilai Rapor (SMP/MTs)</h2>
            <div className="overflow-x-auto rounded-md border text-left">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold bg-muted">Semester</TableHead>
                    <TableHead className="text-right font-semibold bg-muted">Rata-rata Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semesterKeys.map((key, index) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{semesterLabels[index]}</TableCell>
                      <TableCell className="text-right font-medium">{biodata.semesterGrades[key as keyof typeof biodata.semesterGrades].toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <ShadcnTableFooter>
                  <TableRow>
                    <TableCell className="font-semibold text-right bg-muted">Jumlah Keseluruhan Nilai Rapor</TableCell>
                    <TableCell className="text-right font-bold text-lg bg-muted text-primary">{overallTableValue}</TableCell>
                  </TableRow>
                </ShadcnTableFooter>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-left">Nilai dalam skala 0-100. Diimpor oleh sekolah asal.</p>
          </section>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end items-center pt-6 gap-4 border-t">
            {isLocked ? (
                 <Button size="lg" asChild className="w-full sm:w-auto">
                    <Link href="/registration/status">
                        <ClipboardCheck className="mr-2 h-5 w-5" />
                        Lihat Status Pendaftaran
                    </Link>
                </Button>
            ) : (
                <Button
                  size="lg"
                  onClick={handleConfirm}
                  className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Konfirmasi dan Lanjutkan
                </Button>
            )}
        </CardFooter>
      </Card>

      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-left">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Lapor Perbaikan Data ke Sekolah Asal
            </DialogTitle>
            <DialogDescription className="text-xs text-left">
              Ajukan perbaikan data sinkronisasi sekolah asal Anda. Operator sekolah asal Anda akan menerima laporan ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2 text-left">
            <div>
              <Label className="text-xs text-muted-foreground">Sekolah Asal</Label>
              <Input value={biodata.previousSchool} disabled className="bg-muted text-xs mt-1" />
            </div>
            <div>
              <Label htmlFor="reportMessage" className="text-xs font-semibold">Detail Perbaikan yang Diajukan</Label>
              <textarea
                id="reportMessage"
                rows={4}
                value={reportMessage}
                onChange={(e) => setReportMessage(e.target.value)}
                placeholder="Contoh: Nama Ibu Kandung tertulis Siti Fatimah, yang benar Siti Aminah. Nilai IPA Semester 3 tertulis 80, yang benar 90."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 mt-1"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsReportDialogOpen(false)}>Batal</Button>
            <Button 
              size="sm" 
              onClick={() => {
                if (!reportMessage.trim()) {
                  toast({ variant: "destructive", title: "Pesan Kosong", description: "Harap tulis detail perbaikan terlebih dahulu." });
                  return;
                }
                toast({
                  title: "Laporan Terkirim",
                  description: `Laporan Anda berhasil dikirim ke operator ${biodata.previousSchool}.`,
                });
                setReportMessage("");
                setIsReportDialogOpen(false);
              }}
            >
              Kirim Laporan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DashboardPage() {
    const router = useRouter();
    const [userRole, setUserRole] = React.useState<LoginCredentials['role'] | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        const savedCredentials = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
        if (savedCredentials?.role) {
            setUserRole(savedCredentials.role);
        } else {
            router.replace('/');
        }
        setIsLoading(false);
    }, [router]);

    React.useEffect(() => {
        if (!isLoading && userRole) {
            if (userRole !== 'applicant') {
                router.replace('/registration/home');
            }
        }
    }, [isLoading, userRole, router]);

    if (isLoading || !userRole || userRole !== 'applicant') {
        return (
            <div className="flex flex-1 items-center justify-center p-4">
                <p>Mengarahkan...</p>
            </div>
        );
    }
    
    return <ApplicantDashboard />;
}
