
"use client";

import * as React from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UserCircle, CheckCircle2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Mock data dengan konteks Berau
const biodataDetails = {
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
  motherName: "Siti Fatimah",
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

const calculateAverage = (grades: typeof reportCardGradesData[0]) => {
  const allGrades = [grades.semester1, grades.semester2, grades.semester3, grades.semester4, grades.semester5];
  const validGrades = allGrades.filter(grade => typeof grade === 'number');
  if (validGrades.length === 0) return "N/A";
  return (validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length).toFixed(2);
};

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

export default function BiodataPage() {
  const { toast } = useToast();
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
    toast({
      title: "Biodata Terkonfirmasi",
      description: "Biodata dan nilai rapor Anda telah dikonfirmasi. Melanjutkan ke tahap berikutnya.",
    });
    // Here you would typically navigate to the next step, e.g.:
    // router.push('/registration/next-step');
    console.log("Biodata dikonfirmasi, siap untuk tahap berikutnya.");
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
            Harap tinjau biodata dan nilai rapor Anda di bawah ini. Informasi ini telah diisi sebelumnya oleh administrasi sekolah asal Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Informasi Pribadi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left">
              <BiodataItem label="Nama Lengkap" value={biodataDetails.fullName} />
              <BiodataItem label="NISN (Nomor Induk Siswa Nasional)" value={biodataDetails.nisn} />
              <BiodataItem label="NIK (Nomor Induk Kependudukan)" value={biodataDetails.nik} />
              <BiodataItem label="Tempat Lahir" value={biodataDetails.placeOfBirth} />
              <BiodataItem label="Tanggal Lahir" value={biodataDetails.dateOfBirth} />
              <BiodataItem label="Jenis Kelamin" value={biodataDetails.gender} />
              <BiodataItem label="Agama" value={biodataDetails.religion} />
              <BiodataItem label="Alamat Lengkap" value={biodataDetails.address} />
              <BiodataItem label="Sekolah Asal" value={biodataDetails.previousSchool} />
              <BiodataItem label="Nomor Kontak (Siswa/Orang Tua)" value={biodataDetails.contactNumber} />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Informasi Orang Tua/Wali</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left">
              <BiodataItem label="Nama Ayah" value={biodataDetails.fatherName} />
              <BiodataItem label="Nama Ibu" value={biodataDetails.motherName} />
              <BiodataItem label="Nama Wali (jika ada)" value={biodataDetails.guardianName} />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Nilai Rapor (SMP/MTs)</h2>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Mata Pelajaran</TableHead>
                    <TableHead className="text-center font-semibold">Sem 1</TableHead>
                    <TableHead className="text-center font-semibold">Sem 2</TableHead>
                    <TableHead className="text-center font-semibold">Sem 3</TableHead>
                    <TableHead className="text-center font-semibold">Sem 4</TableHead>
                    <TableHead className="text-center font-semibold">Sem 5</TableHead>
                    <TableHead className="text-right font-semibold">Rata-rata</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportCardGradesData.map((grade) => (
                    <TableRow key={grade.subject}>
                      <TableCell className="font-medium">{grade.subject}</TableCell>
                      <TableCell className="text-center">{grade.semester1 ?? '-'}</TableCell>
                      <TableCell className="text-center">{grade.semester2 ?? '-'}</TableCell>
                      <TableCell className="text-center">{grade.semester3 ?? '-'}</TableCell>
                      <TableCell className="text-center">{grade.semester4 ?? '-'}</TableCell>
                      <TableCell className="text-center">{grade.semester5 ?? '-'}</TableCell>
                      <TableCell className="text-right font-medium">{calculateAverage(grade)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Nilai dalam skala 0-100.</p>
          </section>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-end items-center pt-6 gap-4">
            <Button
              size="lg"
              onClick={handleConfirm}
              disabled={isConfirmed}
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
