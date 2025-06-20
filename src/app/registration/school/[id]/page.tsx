
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, School as SchoolIcon, Users, Filter as FilterIcon, Search as SearchIcon, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { School } from "@/app/registration/dashboard/page";
import { cn } from "@/lib/utils";

// Mock data for schools - in a real app, this would come from an API
const allSchoolsData: School[] = [
  {
    id: "sman1tanjungredeb",
    namaSekolah: "SMA Negeri 1 Tanjung Redeb",
    akreditasi: "A",
    kuota: 266,
    jalurKuota: { afirmasi: 56, mutasi: 14, prestasi: 84, domisili: 112 },
    jumlahPendaftar: 50, // This will be visually consistent due to 50 generated applicants
    statusPendaftaran: "Buka",
    alamat: "Jl. Jenderal Sudirman No.50, Tanjung Redeb, Kab. Berau, Kalimantan Timur",
    telepon: "0554-21045"
  },
  {
    id: "smkn1berau",
    namaSekolah: "SMK Negeri 1 Berau",
    akreditasi: "A",
    kuota: 304,
    jalurKuota: { afirmasi: 64, mutasi: 16, prestasi: 96, domisili: 128 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka",
    alamat: "Jl. Murjani II, Gayam, Tanjung Redeb, Kab. Berau, Kalimantan Timur",
    telepon: "0554-22112"
  },
  {
    id: "sman2berau",
    namaSekolah: "SMA Negeri 2 Berau",
    akreditasi: "B",
    kuota: 228,
    jalurKuota: { afirmasi: 48, mutasi: 12, prestasi: 72, domisili: 96 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka",
    alamat: "Jl. H. Isa III, Karang Ambun, Tanjung Redeb, Kab. Berau, Kalimantan Timur",
    telepon: "0554-23451"
  },
  {
    id: "smamuhammadiyahberau",
    namaSekolah: "SMA Muhammadiyah Tanjung Redeb",
    akreditasi: "B",
    kuota: 142,
    jalurKuota: { afirmasi: 30, mutasi: 7, prestasi: 45, domisili: 60 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka",
    alamat: "Jl. SA Maulana, Bugis, Tanjung Redeb, Kab. Berau, Kalimantan Timur",
    telepon: "0554-21987"
  },
  {
    id: "smkyphbberau",
    namaSekolah: "SMK YPSHB Berau", // Shortened for consistency
    akreditasi: "B",
    kuota: 190,
    jalurKuota: { afirmasi: 40, mutasi: 10, prestasi: 60, domisili: 80 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka",
    alamat: "Jl. Pangeran Antasari, Teluk Bayur, Kab. Berau, Kalimantan Timur",
    telepon: "0554-24001"
  },
];

type ApplicantStatus = "Terverifikasi" | "Menunggu Verifikasi" | "Berkas tidak sesuai";
interface Applicant {
  id: string;
  noRegistrasi: string;
  fullName: string;
  nisn: string;
  jalur: "Afirmasi" | "Mutasi" | "Prestasi" | "Domisili";
  asalSekolah: string;
  status: ApplicantStatus;
  peringkat: number;
}

const schoolIds = ["sman1tanjungredeb", "smkn1berau", "sman2berau", "smamuhammadiyahberau", "smkyphbberau"];
const jalurOptionsPlain: Applicant['jalur'][] = ["Afirmasi", "Mutasi", "Prestasi", "Domisili"];
const asalSekolahOptionsPlain = [ // Base options if dynamic generation fails or for initial state
  "SMP Negeri 1 Tanjung Redeb", "SMP Negeri 2 Teluk Bayur", "MTs Al-Kautsar Berau",
  "SMP Negeri 1 Sambaliung", "SMP IT Ash-Shohwah Berau", "SMP Negeri 3 Gunung Tabur",
  "SMP Kristen Berau", "SMP PGRI Tanjung Redeb", "SMP Negeri 5 Segah", "MTs Muhammadiyah Berau",
  "SMP YPPSB Sangatta", "SMP Vidatra Bontang", "SMP Islam Bunga Bangsa Samarinda"
];
const statusOptionsPlain: ApplicantStatus[] = ["Terverifikasi", "Menunggu Verifikasi", "Berkas tidak sesuai"];
const firstNames = ["Ahmad", "Budi", "Citra", "Dewi", "Eka", "Fajar", "Gita", "Hendra", "Indah", "Joko", "Lia", "Mira", "Nina", "Omar", "Putu", "Rahmat", "Sari", "Tono", "Umar", "Vina", "Wati", "Yoga", "Zaki", "Amir", "Bella"];
const lastNames = ["Santoso", "Wijaya", "Kusuma", "Lestari", "Pratama", "Wahyuni", "Setiawan", "Handayani", "Permana", "Wulandari", "Hakim", "Saleh", "Putri", "Maulana", "Siregar", "Abdullah", "Batubara", "Chandra", "Daulay", "Effendi"];

const jalurOptions = ["Semua", ...jalurOptionsPlain];


const getApplicantStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Terverifikasi":
      return "default";
    case "Menunggu Verifikasi":
      return "secondary";
    case "Berkas tidak sesuai":
      return "destructive";
    default:
      return "default";
  }
};

type SortKey = keyof Applicant | 'no';
type SortDirection = "ascending" | "descending";

interface SortConfig {
  key: SortKey | null;
  direction: SortDirection;
}


export default function SchoolDetailPage() {
  const params = useParams();
  const schoolId = params.id as string;

  const [currentSchoolApplicants, setCurrentSchoolApplicants] = React.useState<Applicant[]>([]);
  const [dynamicAsalSekolahOptions, setDynamicAsalSekolahOptions] = React.useState<string[]>(["Semua", ...asalSekolahOptionsPlain]);


  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedJalur, setSelectedJalur] = React.useState("Semua");
  const [selectedAsalSekolah, setSelectedAsalSekolah] = React.useState("Semua");
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'peringkat', direction: 'ascending' });
  
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    if (!schoolId) {
      setCurrentSchoolApplicants([]);
      setDynamicAsalSekolahOptions(["Semua", ...asalSekolahOptionsPlain]);
      return;
    }

    const schoolIndex = schoolIds.findIndex(id => id === schoolId);
    if (schoolIndex === -1) {
        setCurrentSchoolApplicants([]);
        setDynamicAsalSekolahOptions(["Semua", ...asalSekolahOptionsPlain]);
        return; // School ID not found in our list
    }

    const generatedApplicants: Applicant[] = [];
    for (let i = 0; i < 50; i++) {
      const studentNumber = i + 1;
      const firstNameIndex = Math.floor(Math.random() * firstNames.length);
      const lastNameIndex = Math.floor(Math.random() * lastNames.length);
      const nisnSchoolCode = String(schoolIndex + 1).padStart(2, '0');
      const nisnStudentCode = String(studentNumber).padStart(3, '0');

      generatedApplicants.push({
        id: `app${schoolIndex + 1}-${studentNumber}`,
        noRegistrasi: `REG${schoolIndex + 1}${String(studentNumber).padStart(4, '0')}`,
        fullName: `${firstNames[firstNameIndex]} ${lastNames[lastNameIndex]}`,
        nisn: `005${nisnSchoolCode}${nisnStudentCode}${Math.floor(100 + Math.random() * 900)}`,
        jalur: jalurOptionsPlain[i % jalurOptionsPlain.length],
        asalSekolah: asalSekolahOptionsPlain[i % asalSekolahOptionsPlain.length],
        status: statusOptionsPlain[i % statusOptionsPlain.length],
        peringkat: studentNumber,
      });
    }
    setCurrentSchoolApplicants(generatedApplicants);

    const uniqueAsalSekolah = [...new Set(generatedApplicants.map(a => a.asalSekolah).filter(Boolean))];
    setDynamicAsalSekolahOptions(["Semua", ...uniqueAsalSekolah.sort()]);
    setCurrentPage(1); // Reset page on data change

  }, [schoolId]);


  const school = allSchoolsData.find(s => s.id === schoolId);
  // Use currentSchoolApplicants for filtering, sorting, and display
  const applicants = currentSchoolApplicants; 

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedJalur, selectedAsalSekolah, pageSize]);

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

  const sortedApplicants = React.useMemo(() => {
    let sortableItems = [...filteredApplicants];
    if (sortConfig.key !== null && sortConfig.key !== 'no') {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key as keyof Applicant];
        const valB = b[sortConfig.key as keyof Applicant];

        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    } else if (sortConfig.key === 'no' && sortConfig.direction === 'descending') {
       // For 'No.' column, descending means reverse of ascending order
       // This part might need adjustment if 'no' is based on original index vs current page index
    }
    return sortableItems;
  }, [filteredApplicants, sortConfig]);

  const paginatedApplicants = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedApplicants.slice(startIndex, startIndex + pageSize);
  }, [sortedApplicants, currentPage, pageSize]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(sortedApplicants.length / pageSize);
  }, [sortedApplicants.length, pageSize]);


  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) {
      return null;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="ml-1 h-3 w-3" />;
    }
    return <ArrowDown className="ml-1 h-3 w-3" />;
  };

  if (!school) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Sekolah Tidak Ditemukan</CardTitle>
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

  const renderSortableHeader = (key: SortKey, label: string, className: string = "") => (
    <TableHead className={cn("cursor-pointer hover:bg-muted/50", className)} onClick={() => requestSort(key)}>
      <div className="flex items-center">
        {label}
        {getSortIcon(key)}
      </div>
    </TableHead>
  );

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value, 10));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };


  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8 space-y-6">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center space-x-3">
              <SchoolIcon className="h-8 w-8 text-primary" />
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-headline">{school.namaSekolah}</CardTitle>
            </div>
            <Button variant="outline" asChild size="sm" className="w-full sm:w-auto">
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
              <div><span className="font-medium text-muted-foreground">Total Kuota:</span> {school.kuota}</div>
              <div><span className="font-medium text-muted-foreground">Jumlah Pendaftar:</span> {applicants.length}</div>
              <div><span className="font-medium text-muted-foreground">Status Pendaftaran:</span> <Badge variant={school.statusPendaftaran === "Buka" ? "default" : school.statusPendaftaran === "Segera Penuh" ? "secondary" : "destructive"}>{school.statusPendaftaran}</Badge></div>
              <div className="md:col-span-2"><span className="font-medium text-muted-foreground">Alamat:</span> {school.alamat}</div>
              <div className="md:col-span-2"><span className="font-medium text-muted-foreground">Telepon:</span> {school.telepon}</div>
              {school.jalurKuota && (
                <div className="md:col-span-2 mt-3">
                  <h4 className="font-medium text-muted-foreground mb-1">Kuota per Jalur:</h4>
                  <ul className="list-disc list-inside text-sm space-y-0.5 pl-4">
                    <li>Afirmasi: {school.jalurKuota.afirmasi}</li>
                    <li>Mutasi: {school.jalurKuota.mutasi}</li>
                    <li>Prestasi: {school.jalurKuota.prestasi}</li>
                    <li>Domisili: {school.jalurKuota.domisili}</li>
                  </ul>
                </div>
              )}
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
                  <SelectValue placeholder="Filter berdasarkan Jalur" />
                </SelectTrigger>
                <SelectContent>
                  {jalurOptions.map(jalur => (
                    <SelectItem key={jalur} value={jalur}>{jalur}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAsalSekolah} onValueChange={setSelectedAsalSekolah}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter berdasarkan Asal Sekolah" />
                </SelectTrigger>
                <SelectContent>
                  {dynamicAsalSekolahOptions.map(asal => (
                    <SelectItem key={asal} value={asal}>{asal}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section>
             <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Daftar Pendaftar ({sortedApplicants.length})</h3>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {renderSortableHeader('no' as SortKey, "No.", "w-[60px] text-center")}
                    {renderSortableHeader('fullName' as SortKey, "Nama Lengkap")}
                    {renderSortableHeader('nisn' as SortKey, "NISN")}
                    {renderSortableHeader('asalSekolah' as SortKey, "Asal Sekolah")}
                    {renderSortableHeader('status' as SortKey, "Status", "text-center")}
                    {renderSortableHeader('jalur' as SortKey, "Jalur")}
                    {renderSortableHeader('peringkat' as SortKey, "Peringkat", "text-right")}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApplicants.length > 0 ? (
                    paginatedApplicants.map((applicant, index) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="text-center">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="font-medium">{applicant.fullName}</TableCell>
                        <TableCell>{applicant.nisn}</TableCell>
                        <TableCell>{applicant.asalSekolah}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getApplicantStatusBadgeVariant(applicant.status)}>
                            {applicant.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{applicant.jalur}</TableCell>
                        <TableCell
                          className={cn(
                            "text-right font-medium",
                            applicant.peringkat <= school.kuota ? 'text-green-600' : 'text-red-600'
                          )}
                        >
                          {applicant.peringkat}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                        { currentSchoolApplicants.length === 0 ? "Memuat data pendaftar..." : "Tidak ada data pendaftar yang sesuai dengan filter."}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Data per halaman:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder={pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value={sortedApplicants.length > 0 ? sortedApplicants.length.toString() : "50"}>Semua</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
    