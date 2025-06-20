
"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCircle, CheckCircle2, Edit3, Save, XCircle, Upload, Check } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as ShadcnTableFooter } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getFromLocalStorage, saveToLocalStorage, type RegistrationProgress } from "@/lib/localStorage";

const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";

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
    { value: "Wiraswasta", label: "Wiraswasta (Perdagangan, Jasa, dll)" },
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

const villageOptions = [
  { value: "Kel. Tanjung Redeb", label: "Kel. Tanjung Redeb" },
  { value: "Kel. Gayam", label: "Kel. Gayam" },
  { value: "Kel. Karang Ambun", label: "Kel. Karang Ambun" },
  { value: "Kel. Bugis", label: "Kel. Bugis" },
  { value: "Kel. Sungai Bedungun", label: "Kel. Sungai Bedungun" },
  { value: "Desa Labanan Makmur", label: "Desa Labanan Makmur" },
  { value: "Desa Sukan Tengah", label: "Desa Sukan Tengah" },
];

const subdistrictOptions = [
  { value: "Kec. Tanjung Redeb", label: "Kec. Tanjung Redeb" },
  { value: "Kec. Teluk Bayur", label: "Kec. Teluk Bayur" },
  { value: "Kec. Sambaliung", label: "Kec. Sambaliung" },
  { value: "Kec. Gunung Tabur", label: "Kec. Gunung Tabur" },
  { value: "Kec. Segah", label: "Kec. Segah" },
  { value: "Kec. Pulau Derawan", label: "Kec. Pulau Derawan" },
];

const districtOptions = [
  { value: "Kabupaten Berau", label: "Kabupaten Berau" },
  { value: "Kota Samarinda", label: "Kota Samarinda" },
  { value: "Kota Balikpapan", label: "Kota Balikpapan" },
  { value: "Kabupaten Kutai Kartanegara", label: "Kabupaten Kutai Kartanegara" },
];

const provinceOptions = [
  { value: "Kalimantan Timur 77311", label: "Kalimantan Timur 77311" },
  { value: "Kalimantan Timur 75111", label: "Kalimantan Timur 75111 (Samarinda)" },
  { value: "Kalimantan Utara 77111", label: "Kalimantan Utara 77111" },
  { value: "Jawa Timur 60234", label: "Jawa Timur 60234" },
  { value: "DKI Jakarta 10110", label: "DKI Jakarta 10110" },
];


const initialBiodataDetails = {
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
  province: "Kalimantan Timur 77311",
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
};

type BiodataKeys = keyof typeof initialBiodataDetails;
type SelectOption = { value: string; label: string };

const reportCardGradesData = [
  { subject: "Matematika", semester1: 86, semester2: 89, semester3: 91, semester4: 88, semester5: 93 },
  { subject: "Ilmu Pengetahuan Alam (IPA)", semester1: 89, semester2: 91, semester3: 87, semester4: 90, semester5: 92 },
  { subject: "Ilmu Pengetahuan Sosial (IPS)", semester1: 87, semester2: 85, semester3: 90, semester4: 86, semester5: 89 },
  { subject: "Bahasa Indonesia", semester1: 91, semester2: 88, semester3: 89, semester4: 93, semester5: 90 },
  { subject: "Bahasa Inggris", semester1: 83, semester2: 86, semester3: 88, semester4: 89, semester5: 91 },
  { subject: "Pendidikan Kewarganegaraan (PKN)", semester1: 88, semester2: 89, semester3: 87, semester4: 91, semester5: 90 },
];

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
  label,
  value,
  fieldKey,
  isEditing,
  currentInputValue,
  onEditClick,
  onSaveClick,
  onCancelClick,
  onInputChange,
  disableEditButton,
  inputType = "text",
  selectOptions,
}) => {
  if (isEditing && fieldKey && onSaveClick && onCancelClick && onInputChange) {
    return (
      <div className="space-y-1 py-2 border-b last:border-b-0">
        <Label htmlFor={fieldKey} className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md inline-block mb-1">{label}</Label>
        <div className="flex items-center space-x-2">
          {selectOptions && selectOptions.length > 0 ? (
            <Select
              value={currentInputValue}
              onValueChange={onInputChange}
            >
              <SelectTrigger id={fieldKey} className="text-sm flex-grow">
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
              className="text-sm flex-grow"
            />
          )}
          <Button onClick={() => onSaveClick(fieldKey)} size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" aria-label={`Simpan ${label}`}>
            <Check className="h-4 w-4 text-green-600" />
          </Button>
          <Button onClick={onCancelClick} size="icon" variant="ghost" className="h-7 w-7 flex-shrink-0" aria-label={`Batal edit ${label}`}>
            <XCircle className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-b-0">
      <div>
        <p className="text-sm font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md inline-block mb-1">{label}</p>
        <p className="text-sm">{value || "-"}</p>
      </div>
      {onEditClick && fieldKey && (
        <Button
          onClick={() => onEditClick(fieldKey, String(value || ""))}
          size="icon"
          variant="ghost"
          className="h-7 w-7"
          disabled={disableEditButton}
          aria-label={`Edit ${label}`}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
      )}
    </div>
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
    { key: "streetName", label: "Nama Jalan" },
    { key: "rtRw", label: "RT/RW" },
    { key: "village", label: "Kelurahan/Desa", selectOptions: villageOptions },
    { key: "subdistrict", label: "Kecamatan", selectOptions: subdistrictOptions },
    { key: "district", label: "Kabupaten/Kota", selectOptions: districtOptions },
    { key: "province", label: "Provinsi & Kode Pos", selectOptions: provinceOptions },
    { key: "previousSchool", label: "Sekolah Asal" },
    { key: "contactNumber", label: "Nomor Kontak (Siswa/Orang Tua)", type: "tel" },
];

export default function BiodataPage() {
  const { toast } = useToast();
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [biodata, setBiodata] = React.useState(initialBiodataDetails);
  
  const [editingPersonalField, setEditingPersonalField] = React.useState<BiodataKeys | null>(null);
  const [currentPersonalFieldValue, setCurrentPersonalFieldValue] = React.useState<string>("");

  const [isEditingParentInfo, setIsEditingParentInfo] = React.useState(false);
  const [editableParentInfo, setEditableParentInfo] = React.useState({
    fatherName: initialBiodataDetails.fatherName,
    fatherDateOfBirth: initialBiodataDetails.fatherDateOfBirth,
    fatherOccupation: initialBiodataDetails.fatherOccupation,
    fatherIncome: initialBiodataDetails.fatherIncome,
    motherName: initialBiodataDetails.motherName,
    motherDateOfBirth: initialBiodataDetails.motherDateOfBirth,
    motherOccupation: initialBiodataDetails.motherOccupation,
    motherIncome: initialBiodataDetails.motherIncome,
    guardianName: initialBiodataDetails.guardianName,
  });

  const [profilePhoto, setProfilePhoto] = React.useState<string | null>(null);
  const [persistedPhotoUploaded, setPersistedPhotoUploaded] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const semesterLabels = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5"];
  const semesterKeys: (keyof Pick<typeof reportCardGradesData[0], 'semester1' | 'semester2' | 'semester3' | 'semester4' | 'semester5'>)[] = ["semester1", "semester2", "semester3", "semester4", "semester5"];

  React.useEffect(() => {
    const savedProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    if (savedProgress?.hasProfilePhoto) {
      setPersistedPhotoUploaded(true);
    }
  }, []);

  const calculateSemesterAverage = (semesterKey: typeof semesterKeys[0]): string => {
    let sum = 0;
    let count = 0;
    reportCardGradesData.forEach(subject => {
      const grade = subject[semesterKey];
      if (typeof grade === 'number') {
        sum += grade;
        count++;
      }
    });
    if (count === 0) return "N/A";
    return (sum / count).toFixed(2);
  };

  const displayedSemesterAverages = React.useMemo(() => {
    return semesterLabels.map((label, index) => ({
      semester: label,
      average: calculateSemesterAverage(semesterKeys[index])
    }));
  }, []); 

  const overallTableValue = React.useMemo(() => {
    const averages = displayedSemesterAverages
      .map(s => parseFloat(s.average))
      .filter(avg => !isNaN(avg));
    
    if (averages.length === 0) return "N/A";
    return averages.reduce((sum, avg) => sum + avg, 0).toFixed(2);
  }, [displayedSemesterAverages]);

  const handleStartEditPersonalField = (fieldKey: BiodataKeys, currentValue: string) => {
    if (isEditingParentInfo) {
      toast({ variant: "destructive", title: "Selesaikan Edit Dahulu", description: "Harap simpan atau batalkan perubahan pada informasi orang tua sebelum menyunting field lain." });
      return;
    }
    if (editingPersonalField && editingPersonalField !== fieldKey) {
       toast({ variant: "destructive", title: "Selesaikan Edit Saat Ini", description: `Harap simpan atau batalkan perubahan pada field yang sedang disunting.` });
       return;
    }
    setEditingPersonalField(fieldKey);
    setCurrentPersonalFieldValue(currentValue);
  };

  const handleSavePersonalField = (fieldKey: BiodataKeys) => {
    setBiodata(prev => ({ ...prev, [fieldKey]: currentPersonalFieldValue }));
    setEditingPersonalField(null);
    setCurrentPersonalFieldValue("");
    const fieldLabel = personalInfoEditableFields.find(f => f.key === fieldKey)?.label || fieldKey;
    toast({ title: "Data Disimpan", description: `${fieldLabel} telah berhasil diperbarui.` });
  };

  const handleCancelEditPersonalField = () => {
    setEditingPersonalField(null);
    setCurrentPersonalFieldValue("");
  };


  const handleConfirm = () => {
    if (isEditingParentInfo || editingPersonalField) {
      toast({
        variant: "destructive",
        title: "Simpan Perubahan Dahulu",
        description: "Harap simpan atau batalkan semua perubahan yang sedang aktif sebelum melanjutkan.",
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
    setIsConfirmed(true);
    toast({
      title: "Biodata Terkonfirmasi",
      description: "Biodata dan nilai rapor Anda telah dikonfirmasi. Melanjutkan ke tahap berikutnya.",
    });
    console.log("Biodata dikonfirmasi, siap untuk tahap berikutnya.");
  };

  const handleEditParentInfo = () => {
    if (editingPersonalField) {
      toast({ variant: "destructive", title: "Selesaikan Edit Dahulu", description: "Harap simpan atau batalkan perubahan pada informasi pribadi sebelum menyunting info orang tua." });
      return;
    }
    setEditableParentInfo({
      fatherName: biodata.fatherName,
      fatherDateOfBirth: biodata.fatherDateOfBirth,
      fatherOccupation: biodata.fatherOccupation,
      fatherIncome: biodata.fatherIncome,
      motherName: biodata.motherName,
      motherDateOfBirth: biodata.motherDateOfBirth,
      motherOccupation: biodata.motherOccupation,
      motherIncome: biodata.motherIncome,
      guardianName: biodata.guardianName,
    });
    setIsEditingParentInfo(true);
  };

  const handleParentInputChange = (name: ParentInfoKeys, value: string) => {
    setEditableParentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveParentInfo = () => {
    setBiodata(prev => ({
      ...prev,
      ...editableParentInfo,
    }));
    setIsEditingParentInfo(false);
    toast({
      title: "Informasi Orang Tua Disimpan",
      description: "Perubahan pada informasi orang tua telah berhasil disimpan.",
    });
  };

  const handleCancelEditParentInfo = () => {
    setIsEditingParentInfo(false);
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
        event.target.value = ''; 
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Jenis File Tidak Sesuai",
          description: "Harap pilih file gambar (PNG, JPG, JPEG).",
        });
        event.target.value = ''; 
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
        saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
          ...currentProgress,
          hasProfilePhoto: true,
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

  const isAnyFieldBeingEdited = isEditingParentInfo || editingPersonalField !== null;

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
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
            >
              <Upload className="mr-2 h-4 w-4" />
              {profilePhoto || persistedPhotoUploaded ? "Ganti Foto" : "Unggah Foto Profil"}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">Maks. 2MB (PNG, JPG, JPEG)</p>
          </div>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Informasi Pribadi</h2>
            <div className="space-y-0"> 
              <BiodataItem label="NISN (Nomor Induk Siswa Nasional)" value={biodata.nisn} />
              <BiodataItem label="NIK (Nomor Induk Kependudukan)" value={biodata.nik} />

              {personalInfoEditableFields.map((field) => (
                <BiodataItem
                  key={field.key}
                  label={field.label}
                  value={biodata[field.key as keyof typeof biodata]}
                  fieldKey={field.key as BiodataKeys}
                  isEditing={editingPersonalField === field.key}
                  currentInputValue={editingPersonalField === field.key ? currentPersonalFieldValue : String(biodata[field.key as keyof typeof biodata] || "")}
                  onEditClick={handleStartEditPersonalField}
                  onSaveClick={handleSavePersonalField}
                  onCancelClick={handleCancelEditPersonalField}
                  onInputChange={setCurrentPersonalFieldValue}
                  disableEditButton={(editingPersonalField !== null && editingPersonalField !== field.key) || isEditingParentInfo}
                  inputType={field.type}
                  selectOptions={field.selectOptions}
                />
              ))}
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">Informasi Orang Tua/Wali</h2>
              {!isEditingParentInfo && (
                <Button 
                  onClick={handleEditParentInfo} 
                  variant="outline" 
                  size="sm"
                  disabled={editingPersonalField !== null}
                >
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Info Orang Tua
                </Button>
              )}
            </div>
            {isEditingParentInfo ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left border p-4 rounded-md">
                  <h3 className="md:col-span-2 text-lg font-medium text-muted-foreground">Data Ayah</h3>
                  <EditableBiodataField label="Nama Ayah" name="fatherName" value={editableParentInfo.fatherName} onChange={handleParentInputChange} />
                  <EditableBiodataField label="Tanggal Lahir Ayah" name="fatherDateOfBirth" type="date" value={editableParentInfo.fatherDateOfBirth} onChange={handleParentInputChange} />
                  <EditableBiodataField label="Pekerjaan Ayah" name="fatherOccupation" value={editableParentInfo.fatherOccupation} onChange={handleParentInputChange} selectOptions={occupationOptions} />
                  <EditableBiodataField label="Penghasilan Ayah per Bulan" name="fatherIncome" value={editableParentInfo.fatherIncome} onChange={handleParentInputChange} selectOptions={incomeOptions}/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left border p-4 rounded-md">
                  <h3 className="md:col-span-2 text-lg font-medium text-muted-foreground">Data Ibu</h3>
                  <EditableBiodataField label="Nama Ibu" name="motherName" value={editableParentInfo.motherName} onChange={handleParentInputChange} />
                  <EditableBiodataField label="Tanggal Lahir Ibu" name="motherDateOfBirth" type="date" value={editableParentInfo.motherDateOfBirth} onChange={handleParentInputChange} />
                  <EditableBiodataField label="Pekerjaan Ibu" name="motherOccupation" value={editableParentInfo.motherOccupation} onChange={handleParentInputChange} selectOptions={occupationOptions} />
                  <EditableBiodataField label="Penghasilan Ibu per Bulan" name="motherIncome" value={editableParentInfo.motherIncome} onChange={handleParentInputChange} selectOptions={incomeOptions} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left border p-4 rounded-md">
                    <h3 className="md:col-span-2 text-lg font-medium text-muted-foreground">Data Wali (jika ada)</h3>
                    <EditableBiodataField label="Nama Wali" name="guardianName" value={editableParentInfo.guardianName} onChange={handleParentInputChange} />
                 </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <Button onClick={handleCancelEditParentInfo} variant="outline">
                    <XCircle className="mr-2 h-4 w-4" /> Batal
                  </Button>
                  <Button onClick={handleSaveParentInfo}>
                    <Save className="mr-2 h-4 w-4" /> Simpan Perubahan Ortu
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left">
                <BiodataItem label="Nama Ayah" value={biodata.fatherName} />
                <BiodataItem label="Tanggal Lahir Ayah" value={biodata.fatherDateOfBirth} />
                <BiodataItem label="Pekerjaan Ayah" value={biodata.fatherOccupation} />
                <BiodataItem label="Penghasilan Ayah per Bulan" value={biodata.fatherIncome} />
                
                <BiodataItem label="Nama Ibu" value={biodata.motherName} />
                <BiodataItem label="Tanggal Lahir Ibu" value={biodata.motherDateOfBirth} />
                <BiodataItem label="Pekerjaan Ibu" value={biodata.motherOccupation} />
                <BiodataItem label="Penghasilan Ibu per Bulan" value={biodata.motherIncome} />

                <BiodataItem label="Nama Wali (jika ada)" value={biodata.guardianName} />
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Nilai Rapor (SMP/MTs)</h2>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold bg-muted">Semester</TableHead>
                    <TableHead className="text-right font-semibold bg-muted">Rata-rata Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedSemesterAverages.map((semesterData) => (
                    <TableRow key={semesterData.semester}>
                      <TableCell className="font-medium">{semesterData.semester}</TableCell>
                      <TableCell className="text-right font-medium">{semesterData.average}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <ShadcnTableFooter>
                  <TableRow>
                    <TableCell className="font-semibold text-right bg-muted">Jumlah Keseluruhan Nilai Rapor (dari Rata-rata Semester)</TableCell>
                    <TableCell className="text-right font-bold text-lg bg-muted">{overallTableValue}</TableCell>
                  </TableRow>
                </ShadcnTableFooter>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Nilai dalam skala 0-100.</p>
          </section>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end items-center pt-6 gap-4">
            <Button
              size="lg"
              onClick={handleConfirm}
              disabled={isConfirmed || isAnyFieldBeingEdited}
              className="w-full sm:w-auto"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {isConfirmed ? "Terkonfirmasi" : "Konfirmasi dan Lanjutkan"}
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
    

    

    

    

    

    

    



    



    