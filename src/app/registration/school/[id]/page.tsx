
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
  { id: "sman1tanjungredeb", namaSekolah: "SMA Negeri 1 Tanjung Redeb", akreditasi: "A", kuota: 280, jumlahPendaftar: 210, statusPendaftaran: "Buka", alamat: "Jl. Jenderal Sudirman No.50, Tanjung Redeb, Kab. Berau, Kalimantan Timur", telepon: "0554-21045" },
  { id: "smkn1berau", namaSekolah: "SMK Negeri 1 Berau", akreditasi: "A", kuota: 320, jumlahPendaftar: 295, statusPendaftaran: "Segera Penuh", alamat: "Jl. Murjani II, Gayam, Tanjung Redeb, Kab. Berau, Kalimantan Timur", telepon: "0554-22112" },
  { id: "sman2berau", namaSekolah: "SMA Negeri 2 Berau", akreditasi: "B", kuota: 240, jumlahPendaftar: 180, statusPendaftaran: "Buka", alamat: "Jl. H. Isa III, Karang Ambun, Tanjung Redeb, Kab. Berau, Kalimantan Timur", telepon: "0554-23451" },
  { id: "smamuhammadiyahberau", namaSekolah: "SMA Muhammadiyah Tanjung Redeb", akreditasi: "B", kuota: 150, jumlahPendaftar: 150, statusPendaftaran: "Tutup", alamat: "Jl. SA Maulana, Bugis, Tanjung Redeb, Kab. Berau, Kalimantan Timur", telepon: "0554-21987" },
  { id: "smkyphbberau", namaSekolah: "SMK YPSHB Berau", akreditasi: "B", kuota: 200, jumlahPendaftar: 125, statusPendaftaran: "Buka", alamat: "Jl. Pangeran Antasari, Teluk Bayur, Kab. Berau, Kalimantan Timur", telepon: "0554-24001" },
];

type ApplicantStatus = "Terverifikasi" | "Menunggu Verifikasi" | "Berkas tidak sesuai";
interface Applicant {
  id: string;
  no: number;
  fullName: string;
  nisn: string;
  jalur: "Afirmasi" | "Mutasi" | "Prestasi" | "Domisili" | "Umum";
  asalSekolah: string;
  status: ApplicantStatus;
  peringkat: number;
}

// Mock applicants for each school in Berau
const schoolApplicantsData: Record<string, Applicant[]> = {
  "sman1tanjungredeb": [
    { id: 'app1-1', no: 1, fullName: 'Aulia Rahman Hakim', nisn: '0051122334', jalur: 'Prestasi', asalSekolah: 'SMP Negeri 1 Tanjung Redeb', status: 'Terverifikasi', peringkat: 1 },
    { id: 'app1-2', no: 2, fullName: 'Dewi Anggraini Putri', nisn: '0052233445', jalur: 'Domisili', asalSekolah: 'SMP Negeri 2 Teluk Bayur', status: 'Menunggu Verifikasi', peringkat: 2 },
    { id: 'app1-3', no: 3, fullName: 'Rahmat Hidayatullah', nisn: '0053344556', jalur: 'Afirmasi', asalSekolah: 'MTs Al-Kautsar Berau', status: 'Terverifikasi', peringkat: 3 },
    { id: 'app1-4', no: 4, fullName: 'Siti Aminah', nisn: '0054455667', jalur: 'Prestasi', asalSekolah: 'SMP Negeri 1 Tanjung Redeb', status: 'Menunggu Verifikasi', peringkat: 4 },
  ],
  "smkn1berau": [
    { id: 'app2-1', no: 1, fullName: 'Putri Amelia Sari', nisn: '0064455667', jalur: 'Prestasi', asalSekolah: 'SMP Negeri 1 Sambaliung', status: 'Berkas tidak sesuai', peringkat: 1 },
    { id: 'app2-2', no: 2, fullName: 'Fajar Maulana Ishaq', nisn: '0065566778', jalur: 'Domisili', asalSekolah: 'SMP Negeri 1 Tanjung Redeb', status: 'Menunggu Verifikasi', peringkat: 2 },
    { id: 'app2-3', no: 3, fullName: 'Nur Azizah Fitriani', nisn: '0066677889', jalur: 'Umum', asalSekolah: 'SMP IT Ash-Shohwah Berau', status: 'Terverifikasi', peringkat: 3 },
  ],
  "sman2berau": [
    { id: 'app3-1', no: 1, fullName: 'Bayu Saputra Dinata', nisn: '0077788990', jalur: 'Umum', asalSekolah: 'SMP Negeri 3 Gunung Tabur', status: 'Terverifikasi', peringkat: 1 },
    { id: 'app3-2', no: 2, fullName: 'Linda Wati', nisn: '0078899001', jalur: 'Domisili', asalSekolah: 'SMP Negeri 5 Segah', status: 'Menunggu Verifikasi', peringkat: 2 },
  ],
   "smamuhammadiyahberau": [
    { id: 'app4-1', no: 1, fullName: 'Muhammad Iqbal', nisn: '0091234567', jalur: 'Prestasi', asalSekolah: 'MTs Muhammadiyah Berau', status: 'Terverifikasi', peringkat: 1},
   ],
   "smkyphbberau": [
    { id: 'app5-1', no: 1, fullName: 'Indah Permatasari Dewi', nisn: '0088899001', jalur: 'Prestasi', asalSekolah: 'SMP Kristen Berau', status: 'Menunggu Verifikasi', peringkat: 1 },
    { id: 'app5-2', no: 2, fullName: 'Agus Setiawan', nisn: '0089900112', jalur: 'Umum', asalSekolah: 'SMP PGRI Tanjung Redeb', status: 'Terverifikasi', peringkat: 2},
   ],
};

const jalurOptions = ["Semua", "Afirmasi", "Mutasi", "Prestasi", "Domisili", "Umum"];
const asalSekolahOptions = ["Semua", "SMP Negeri 1 Tanjung Redeb", "SMP Negeri 2 Teluk Bayur", "MTs Al-Kautsar Berau", "SMP Negeri 1 Sambaliung", "SMP IT Ash-Shohwah Berau", "SMP Negeri 3 Gunung Tabur", "SMP Kristen Berau", "SMP PGRI Tanjung Redeb", "SMP Negeri 5 Segah", "MTs Muhammadiyah Berau"];

const getApplicantStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Terverifikasi":
      return "default"; 
    case "Menunggu Verifikasi":
      return "secondary"; 
    case "Berkas tidak sesuai":
      return "destructive"; 
    default:
      return "default"; // Fallback, though ideally unreachable with strict typing
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
          <CardDescription>Detail informasi sekolah dan daftar pendaftar di Kabupaten Berau.</CardDescription>
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
                    <TableHead>Asal Sekolah</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Jalur</TableHead>
                    <TableHead className="text-right">Peringkat</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredApplicants.length > 0 ? (
                    filteredApplicants.map((applicant, index) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="font-medium">{applicant.fullName}</TableCell>
                        <TableCell>{applicant.nisn}</TableCell>
                        <TableCell>{applicant.asalSekolah}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getApplicantStatusBadgeVariant(applicant.status)}>
                            {applicant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{applicant.jalur}</TableCell>
                        <TableCell className="text-right">{applicant.peringkat}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
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
