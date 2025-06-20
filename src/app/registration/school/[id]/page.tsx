
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, School as SchoolIcon, Users, Filter as FilterIcon, Search as SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { School, SchoolStatus } from "@/app/registration/dashboard/page"; // Import types

// Mock data for schools - in a real app, this would come from an API
const allSchoolsData: School[] = [
  { id: "sma1", namaSekolah: "SMA Negeri 1 Kota Impian", akreditasi: "A", kuota: 250, jumlahPendaftar: 180, statusPendaftaran: "Buka", alamat: "Jl. Pendidikan No. 1, Kota Impian", telepon: "021-1234567" },
  { id: "sma2", namaSekolah: "SMA Swasta Harapan Bangsa", akreditasi: "A", kuota: 150, jumlahPendaftar: 145, statusPendaftaran: "Segera Penuh", alamat: "Jl. Harapan No. 2, Kota Impian", telepon: "021-2345678" },
  { id: "smk1", namaSekolah: "SMK Negeri 2 Teknologi Maju", akreditasi: "B", kuota: 300, jumlahPendaftar: 220, statusPendaftaran: "Buka", alamat: "Jl. Teknologi No. 3, Kota Impian", telepon: "021-3456789" },
  { id: "sma3", namaSekolah: "SMA Negeri 3 Cendekia", akreditasi: "A", kuota: 200, jumlahPendaftar: 200, statusPendaftaran: "Tutup", alamat: "Jl. Cendekia No. 4, Kota Impian", telepon: "021-4567890" },
  { id: "smk2", namaSekolah: "SMK Swasta Karya Guna", akreditasi: "B", kuota: 180, jumlahPendaftar: 105, statusPendaftaran: "Buka", alamat: "Jl. Karya No. 5, Kota Impian", telepon: "021-5678901" },
];

type ApplicantStatus = "Lolos Seleksi" | "Menunggu Verifikasi" | "Tidak Lolos" | "Cadangan";
interface Applicant {
  id: string;
  no: number;
  fullName: string;
  nisn: string;
  jalur: "Afirmasi" | "Mutasi" | "Prestasi" | "Domisili" | "Umum";
  asalSekolah: string;
  status: ApplicantStatus;
}

// Mock applicants for each school
const schoolApplicantsData: Record<string, Applicant[]> = {
  "sma1": [
    { id: 'app1-1', no: 1, fullName: 'Citra Dewi Lestari', nisn: '0012345678', jalur: 'Prestasi', asalSekolah: 'SMP Negeri 1 Kota Impian', status: 'Lolos Seleksi' },
    { id: 'app1-2', no: 2, fullName: 'Budi Hartono Wijaya', nisn: '0023456789', jalur: 'Domisili', asalSekolah: 'SMP Swasta Mutiara', status: 'Menunggu Verifikasi' },
    { id: 'app1-3', no: 3, fullName: 'Ahmad Al Ghazali', nisn: '0034567890', jalur: 'Afirmasi', asalSekolah: 'SMP Negeri 2 Kota Impian', status: 'Lolos Seleksi' },
  ],
  "sma2": [
    { id: 'app2-1', no: 1, fullName: 'Siti Aminah Putri', nisn: '0045678901', jalur: 'Prestasi', asalSekolah: 'MTs Al-Ikhlas', status: 'Tidak Lolos' },
    { id: 'app2-2', no: 2, fullName: 'Eko Prasetyo Nugroho', nisn: '0056789012', jalur: 'Domisili', asalSekolah: 'SMP Negeri 1 Kota Impian', status: 'Cadangan' },
  ],
  "smk1": [
    { id: 'app3-1', no: 1, fullName: 'Rizky Maulana Akbar', nisn: '0067890123', jalur: 'Umum', asalSekolah: 'SMP Harapan Kita', status: 'Lolos Seleksi' },
  ],
   "sma3": [], // No applicants for closed school
   "smk2": [
    { id: 'app5-1', no: 1, fullName: 'Putu Ayu Saraswati', nisn: '0078901234', jalur: 'Prestasi', asalSekolah: 'SMP Bintang Timur', status: 'Menunggu Verifikasi' },
   ],
};

const jalurOptions = ["Semua", "Afirmasi", "Mutasi", "Prestasi", "Domisili", "Umum"];
const asalSekolahOptions = ["Semua", "SMP Negeri 1 Kota Impian", "SMP Swasta Mutiara", "SMP Negeri 2 Kota Impian", "MTs Al-Ikhlas", "SMP Harapan Kita", "SMP Bintang Timur"];

const getApplicantStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "Lolos Seleksi":
      return "default"; // Greenish (primary)
    case "Menunggu Verifikasi":
      return "secondary"; // Bluish/Grayish
    case "Tidak Lolos":
      return "destructive"; // Reddish
    case "Cadangan":
      return "outline"; // Neutral
    default:
      return "default";
  }
};


export default function SchoolDetailPage() {
  const params = useParams();
  const schoolId = params.id as string;

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedJalur, setSelectedJalur] = React.useState("Semua");
  const [selectedAsalSekolah, setSelectedAsalSekolah] = React.useState("Semua");

  const school = allSchoolsData.find(s => s.id === schoolId);
  const applicants = schoolApplicantsData[schoolId] || [];

  const filteredApplicants = React.useMemo(() => {
    return applicants.filter(applicant => {
      const searchTermMatch = 
        applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.nisn.includes(searchTerm);
      const jalurMatch = selectedJalur === "Semua" || applicant.jalur === selectedJalur;
      const asalSekolahMatch = selectedAsalSekolah === "Semua" || applicant.asalSekolah === selectedAsalSekolah;
      return searchTermMatch && jalurMatch && asalSekolahMatch;
    });
  }, [applicants, searchTerm, selectedJalur, selectedAsalSekolah]);

  if (!school) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle>Sekolah Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Maaf, data untuk sekolah ini tidak dapat ditemukan.</p>
          </CardContent>
          <CardFooter>
            <Button asChild className="mx-auto">
              <Link href="/registration/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Beranda
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8 space-y-6">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <SchoolIcon className="h-8 w-8 text-primary" />
              <CardTitle className="text-2xl sm:text-3xl font-headline">{school.namaSekolah}</CardTitle>
            </div>
            <Button variant="outline" asChild size="sm">
              <Link href="/registration/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
          </div>
          <CardDescription>Detail informasi sekolah dan daftar pendaftar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3 text-primary">Informasi Sekolah</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><span className="font-medium text-muted-foreground">Akreditasi:</span> {school.akreditasi}</div>
              <div><span className="font-medium text-muted-foreground">Kuota Total:</span> {school.kuota}</div>
              <div><span className="font-medium text-muted-foreground">Jumlah Pendaftar:</span> {school.jumlahPendaftar}</div>
              <div><span className="font-medium text-muted-foreground">Status Pendaftaran:</span> <Badge variant={school.statusPendaftaran === "Buka" ? "default" : school.statusPendaftaran === "Segera Penuh" ? "secondary" : "destructive"}>{school.statusPendaftaran}</Badge></div>
              <div className="md:col-span-2"><span className="font-medium text-muted-foreground">Alamat:</span> {school.alamat}</div>
              <div className="md:col-span-2"><span className="font-medium text-muted-foreground">Telepon:</span> {school.telepon}</div>
            </div>
          </section>

          <section className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Filter Pendaftar</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                 <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari Nama/NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedJalur} onValueChange={setSelectedJalur}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jalur" />
                </SelectTrigger>
                <SelectContent>
                  {jalurOptions.map(jalur => (
                    <SelectItem key={jalur} value={jalur}>{jalur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAsalSekolah} onValueChange={setSelectedAsalSekolah}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Asal Sekolah" />
                </SelectTrigger>
                <SelectContent>
                  {asalSekolahOptions.map(asal => (
                    <SelectItem key={asal} value={asal}>{asal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section>
             <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Daftar Pendaftar ({filteredApplicants.length})</h3>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center">No.</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Jalur</TableHead>
                    <TableHead>Asal Sekolah</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.length > 0 ? (
                    filteredApplicants.map((applicant, index) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="font-medium">{applicant.fullName}</TableCell>
                        <TableCell>{applicant.nisn}</TableCell>
                        <TableCell>{applicant.jalur}</TableCell>
                        <TableCell>{applicant.asalSekolah}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getApplicantStatusBadgeVariant(applicant.status)}>
                            {applicant.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        Tidak ada data pendaftar yang sesuai dengan filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}


    