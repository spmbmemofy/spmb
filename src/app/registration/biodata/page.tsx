
"use client";

import * as React from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle, CheckCircle2, Edit3, Save, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as ShadcnTableFooter } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Initial mock data dengan konteks Berau
const initialBiodataDetails = {
  fullName: "Muhammad Rizky Pratama",
  nisn: "0056789123",
  nik: "6403011507050002",
  placeOfBirth: "Tanjung Redeb",
  dateOfBirth: "2008-07-15",
  gender: "Laki-laki",
  religion: "Islam",
  address: "Jl. Durian III No. 25, RT 10 RW 03, Kel. Tanjung Redeb, Kec. Tanjung Redeb, Kabupaten Berau, Kalimantan Timur 77311",
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
}

const BiodataItem: React.FC<BiodataItemProps> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-md sm:text-lg">{value || "-"}</p>
  </div>
);

interface EditableBiodataFieldProps {
  label: string;
  name: string;
  value: string | number | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
}

const EditableBiodataField: React.FC<EditableBiodataFieldProps> = ({ label, name, value, onChange, type = "text", placeholder }) => (
  <div className="space-y-1">
    <Label htmlFor={name} className="text-sm font-medium">{label}</Label>
    <Input
      id={name}
      name={name}
      type={type}
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder || `Masukkan ${label.toLowerCase()}`}
      className="text-md sm:text-lg"
    />
  </div>
);

type ParentInfoKeys = 'fatherName' | 'fatherDateOfBirth' | 'fatherOccupation' | 'fatherIncome' |
                      'motherName' | 'motherDateOfBirth' | 'motherOccupation' | 'motherIncome' |
                      'guardianName';

export default function BiodataPage() {
  const { toast } = useToast();
  const [isConfirmed, setIsConfirmed] = React.useState(false);
  const [biodata, setBiodata] = React.useState(initialBiodataDetails);
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

  const semesterLabels = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5"];
  const semesterKeys: (keyof typeof reportCardGradesData[0])[] = ["semester1", "semester2", "semester3", "semester4", "semester5"];

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


  const handleConfirm = () => {
    if (isEditingParentInfo) {
      toast({
        variant: "destructive",
        title: "Simpan Perubahan Dahulu",
        description: "Harap simpan atau batalkan perubahan pada informasi orang tua sebelum melanjutkan.",
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

  const handleParentInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
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


  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <UserCircle size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Biodata & Nilai Rapor Pendaftar</CardTitle>
          <CardDescription className="text-md">
            Harap tinjau biodata dan nilai rapor Anda di bawah ini. Informasi pribadi dan nilai telah diisi oleh administrasi sekolah. Anda dapat mengubah informasi orang tua/wali.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Informasi Pribadi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left">
              <BiodataItem label="Nama Lengkap" value={biodata.fullName} />
              <BiodataItem label="NISN (Nomor Induk Siswa Nasional)" value={biodata.nisn} />
              <BiodataItem label="NIK (Nomor Induk Kependudukan)" value={biodata.nik} />
              <BiodataItem label="Tempat Lahir" value={biodata.placeOfBirth} />
              <BiodataItem label="Tanggal Lahir" value={biodata.dateOfBirth} />
              <BiodataItem label="Jenis Kelamin" value={biodata.gender} />
              <BiodataItem label="Agama" value={biodata.religion} />
              <BiodataItem label="Alamat Lengkap" value={biodata.address} />
              <BiodataItem label="Sekolah Asal" value={biodata.previousSchool} />
              <BiodataItem label="Nomor Kontak (Siswa/Orang Tua)" value={biodata.contactNumber} />
            </div>
          </section>

          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">Informasi Orang Tua/Wali</h2>
              {!isEditingParentInfo && (
                <Button onClick={handleEditParentInfo} variant="outline" size="sm">
                  <Edit3 className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
            </div>
            {isEditingParentInfo ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left border p-4 rounded-md">
                  <h3 className="md:col-span-2 text-lg font-medium text-muted-foreground">Data Ayah</h3>
                  <EditableBiodataField label="Nama Ayah" name="fatherName" value={editableParentInfo.fatherName} onChange={handleParentInputChange} />
                  <EditableBiodataField label="Tanggal Lahir Ayah" name="fatherDateOfBirth" type="date" value={editableParentInfo.fatherDateOfBirth} onChange={handleParentInputChange} />
                  <EditableBiodataField label="Pekerjaan Ayah" name="fatherOccupation" value={editableParentInfo.fatherOccupation} onChange={handleParentInputChange} />
                  <EditableBiodataField label="Penghasilan Ayah per Bulan" name="fatherIncome" value={editableParentInfo.fatherIncome} onChange={handleParentInputChange} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left border p-4 rounded-md">
                  <h3 className="md:col-span-2 text-lg font-medium text-muted-foreground">Data Ibu</h3>
                  <EditableBiodataField label="Nama Ibu" name="motherName" value={editableParentInfo.motherName} onChange={handleParentInputChange} />
                  <EditableBiodataField label="Tanggal Lahir Ibu" name="motherDateOfBirth" type="date" value={editableParentInfo.motherDateOfBirth} onChange={handleParentInputChange} />
                  <EditableBiodataField label="Pekerjaan Ibu" name="motherOccupation" value={editableParentInfo.motherOccupation} onChange={handleParentInputChange} />
                  <EditableBiodataField label="Penghasilan Ibu per Bulan" name="motherIncome" value={editableParentInfo.motherIncome} onChange={handleParentInputChange} />
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
                    <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
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
                    <TableCell className="font-semibold text-right">Jumlah Keseluruhan Nilai Rapor (dari Rata-rata Semester)</TableCell>
                    <TableCell className="text-right font-bold text-lg">{overallTableValue}</TableCell>
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
              disabled={isConfirmed || isEditingParentInfo}
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
    

    

    

    