
"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserCircle, CheckCircle2, Edit3, Save, XCircle, Upload, Check } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as ShadcnTableFooter } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { getFromLocalStorage, saveToLocalStorage, type RegistrationProgress, type BiodataDetails, type LoginCredentials } from "@/lib/localStorage";
import { addressData, getDistricts, getSubdistricts, getVillages } from "@/lib/addressData";
import { getManagedApplicants } from "@/lib/managedApplicantService";
import { getSchoolById } from "@/lib/schoolService";


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


function ApplicantDashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [biodata, setBiodata] = React.useState<BiodataDetails | null>(null);
  
  const [editingPersonalField, setEditingPersonalField] = React.useState<BiodataKeys | null>(null);
  const [currentPersonalFieldValue, setCurrentPersonalFieldValue] = React.useState<string>("");

  const [isEditingParentInfo, setIsEditingParentInfo] = React.useState(false);
  const [editableParentInfo, setEditableParentInfo] = React.useState({
    fatherName: "", fatherDateOfBirth: "", fatherOccupation: "", fatherIncome: "",
    motherName: "", motherDateOfBirth: "", motherOccupation: "", motherIncome: "",
    guardianName: "",
  });

  const [isEditingAddress, setIsEditingAddress] = React.useState(false);
  const [editableAddress, setEditableAddress] = React.useState({
    streetName: "", rtRw: "", province: "", district: "", subdistrict: "", village: "",
  });

  const [profilePhoto, setProfilePhoto] = React.useState<string | null>(null);
  const [persistedPhotoUploaded, setPersistedPhotoUploaded] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const semesterKeys: (keyof BiodataDetails['semesterGrades'])[] = ["semester1", "semester2", "semester3", "semester4", "semester5"];
  const semesterLabels = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5"];
  
  const provinceOptions = Object.keys(addressData);
  const districtOptions = getDistricts(editableAddress.province as any);
  const subdistrictOptions = getSubdistricts(editableAddress.province as any, editableAddress.district as any);
  const villageOptions = getVillages(editableAddress.province as any, editableAddress.district as any, editableAddress.subdistrict);

  React.useEffect(() => {
    const savedProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, null);

    if (savedProgress?.biodata) {
      setBiodata(savedProgress.biodata);
      if (savedProgress.profilePhotoDataUri) setProfilePhoto(savedProgress.profilePhotoDataUri);
      if (savedProgress.hasProfilePhoto) setPersistedPhotoUploaded(true);
      setIsLoading(false);
      return;
    }

    const loggedInUser = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
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
    if (isLoading || !biodata) return;

    const currentProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
    saveToLocalStorage<RegistrationProgress>(LOCAL_STORAGE_REGISTRATION_KEY, {
        ...currentProgress,
        biodata,
    });
  }, [biodata, isLoading]);

  const overallTableValue = React.useMemo(() => {
    if (!biodata?.semesterGrades) return "0.00";
    return Object.values(biodata.semesterGrades).reduce((sum, avg) => sum + avg, 0).toFixed(2);
  }, [biodata?.semesterGrades]);


  const handleStartEditPersonalField = (fieldKey: BiodataKeys, currentValue: string) => {
    if (isEditingParentInfo || isEditingAddress) {
      toast({ variant: "destructive", title: "Selesaikan Edit Dahulu", description: "Harap simpan atau batalkan perubahan pada informasi lain sebelum menyunting field ini." });
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
    setBiodata(prev => (prev ? { ...prev, [fieldKey]: currentPersonalFieldValue } : null));
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
    if (isEditingParentInfo || editingPersonalField || isEditingAddress) {
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
    if (editingPersonalField || isEditingAddress || !biodata) {
      toast({ variant: "destructive", title: "Selesaikan Edit Dahulu", description: "Harap simpan atau batalkan perubahan lain sebelum menyunting info orang tua." });
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
  
  const handleEditAddress = () => {
    if (editingPersonalField || isEditingParentInfo || !biodata) {
      toast({ variant: "destructive", title: "Selesaikan Edit Dahulu", description: "Harap simpan atau batalkan perubahan lain sebelum menyunting alamat." });
      return;
    }
    setEditableAddress({
        streetName: biodata.streetName,
        rtRw: biodata.rtRw,
        province: biodata.province,
        district: biodata.district,
        subdistrict: biodata.subdistrict,
        village: biodata.village,
    });
    setIsEditingAddress(true);
  };

  const handleParentInputChange = (name: ParentInfoKeys, value: string) => {
    setEditableParentInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveParentInfo = () => {
    setBiodata(prev => (prev ? { ...prev, ...editableParentInfo } : null));
    setIsEditingParentInfo(false);
    toast({
      title: "Informasi Orang Tua Disimpan",
      description: "Perubahan pada informasi orang tua telah berhasil disimpan.",
    });
  };

  const handleCancelEditParentInfo = () => {
    setIsEditingParentInfo(false);
  };
  
  const handleAddressInputChange = (field: keyof typeof editableAddress, value: string) => {
    setEditableAddress(prev => {
        const newState = {...prev, [field]: value};
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
    })
  };
  
  const handleSaveAddress = () => {
    setBiodata(prev => (prev ? {...prev, ...editableAddress} : null));
    setIsEditingAddress(false);
    toast({ title: "Alamat Diperbarui", description: "Informasi alamat Anda telah berhasil disimpan." });
  };

  const handleCancelEditAddress = () => {
    setIsEditingAddress(false);
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

  const isAnyFieldBeingEdited = isEditingParentInfo || editingPersonalField !== null || isEditingAddress;
  
  if (isLoading || !biodata) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <p>Memuat data Anda...</p>
      </div>
    );
  }

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
            <div className="rounded-md border">
              <Table>
                <TableBody>
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
                      disableEditButton={isAnyFieldBeingEdited && editingPersonalField !== field.key}
                      inputType={field.type}
                      selectOptions={field.selectOptions}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>

          <section>
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">Alamat Lengkap</CardTitle>
                        {!isEditingAddress && (
                            <Button variant="outline" size="sm" onClick={handleEditAddress} disabled={isAnyFieldBeingEdited}>
                                <Edit3 className="mr-2 h-4 w-4" /> Edit Alamat
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {isEditingAddress ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <Label htmlFor="streetName">Nama Jalan & No. Rumah</Label>
                                    <Input id="streetName" value={editableAddress.streetName} onChange={(e) => handleAddressInputChange('streetName', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="rtRw">RT/RW</Label>
                                    <Input id="rtRw" value={editableAddress.rtRw} onChange={(e) => handleAddressInputChange('rtRw', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Provinsi</Label>
                                    <Select onValueChange={(v) => handleAddressInputChange('province', v)} value={editableAddress.province}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Provinsi" /></SelectTrigger>
                                        <SelectContent>{provinceOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Kabupaten/Kota</Label>
                                    <Select onValueChange={(v) => handleAddressInputChange('district', v)} value={editableAddress.district} disabled={!editableAddress.province}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Kabupaten/Kota" /></SelectTrigger>
                                        <SelectContent>{districtOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Kecamatan</Label>
                                    <Select onValueChange={(v) => handleAddressInputChange('subdistrict', v)} value={editableAddress.subdistrict} disabled={!editableAddress.district}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Kecamatan" /></SelectTrigger>
                                        <SelectContent>{subdistrictOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Kelurahan/Desa</Label>
                                    <Select onValueChange={(v) => handleAddressInputChange('village', v)} value={editableAddress.village} disabled={!editableAddress.subdistrict}>
                                        <SelectTrigger><SelectValue placeholder="Pilih Kelurahan/Desa" /></SelectTrigger>
                                        <SelectContent>{villageOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="ghost" onClick={handleCancelEditAddress}>Batal</Button>
                                <Button onClick={handleSaveAddress}><Save className="mr-2 h-4 w-4" /> Simpan Alamat</Button>
                            </div>
                        </div>
                    ) : (
                       <Table>
                          <TableBody>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground w-1/3">Alamat</TableCell>
                              <TableCell>{`${biodata.streetName || ''}, ${biodata.rtRw || ''}`.replace(/^,|,$/g, '').trim() || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground">Kelurahan/Desa</TableCell>
                              <TableCell>{biodata.village || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground">Kecamatan</TableCell>
                              <TableCell>{biodata.subdistrict || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground">Kabupaten/Kota</TableCell>
                              <TableCell>{biodata.district || '-'}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell className="font-medium text-muted-foreground">Provinsi</TableCell>
                              <TableCell>{biodata.province || '-'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">Informasi Orang Tua/Wali</h2>
              {!isEditingParentInfo && (
                <Button 
                  onClick={handleEditParentInfo} 
                  variant="outline" 
                  size="sm"
                  disabled={isAnyFieldBeingEdited}
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
              <div className="rounded-md border">
                <Table>
                  <TableBody>
                    <TableRow><TableCell className="font-medium text-muted-foreground w-1/3">Nama Ayah</TableCell><TableCell>{biodata.fatherName}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium text-muted-foreground">Tanggal Lahir Ayah</TableCell><TableCell>{biodata.fatherDateOfBirth}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium text-muted-foreground">Pekerjaan Ayah</TableCell><TableCell>{biodata.fatherOccupation}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium text-muted-foreground">Penghasilan Ayah</TableCell><TableCell>{biodata.fatherIncome}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium text-muted-foreground">Nama Ibu</TableCell><TableCell>{biodata.motherName}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium text-muted-foreground">Tanggal Lahir Ibu</TableCell><TableCell>{biodata.motherDateOfBirth}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium text-muted-foreground">Pekerjaan Ibu</TableCell><TableCell>{biodata.motherOccupation}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium text-muted-foreground">Penghasilan Ibu</TableCell><TableCell>{biodata.motherIncome}</TableCell></TableRow>
                    <TableRow><TableCell className="font-medium text-muted-foreground">Nama Wali</TableCell><TableCell>{biodata.guardianName}</TableCell></TableRow>
                  </TableBody>
                </Table>
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
