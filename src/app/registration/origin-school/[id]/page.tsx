
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen as OriginSchoolIcon, Users, Filter as FilterIcon, Search as SearchIcon, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { initialSchoolData, initialOriginSchoolData, type OriginSchool } from "@/lib/schoolData";
import { cn } from "@/lib/utils";
import { generateAllMockApplicants, type Applicant, type ApplicantStatus, jalurOptionsPlain, statusVerifikasiOptionsPlain } from "@/lib/mockData";


const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Terverifikasi": return "default";
    case "Menunggu Verifikasi": return "secondary";
    case "Berkas tidak sesuai": return "destructive";
    default: return "default";
  }
};

type SortKey = keyof Applicant | 'no';
type SortDirection = "ascending" | "descending";
interface SortConfig {
  key: SortKey | null;
  direction: SortDirection;
}

export default function OriginSchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const originSchoolId = params.id as string;
  
  const [originSchool, setOriginSchool] = React.useState<OriginSchool | undefined>(undefined);
  const [applicants, setApplicants] = React.useState<Applicant[]>([]);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedSekolahTujuan, setSelectedSekolahTujuan] = React.useState("Semua Sekolah Tujuan");
  const [selectedJalur, setSelectedJalur] = React.useState("Semua Jalur");
  const [selectedStatus, setSelectedStatus] = React.useState("Semua Status");
  
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'fullName', direction: 'ascending' });
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const foundSchool = initialOriginSchoolData.find(s => s.id === originSchoolId);
    setOriginSchool(foundSchool);

    if (foundSchool) {
      const allApplicants = generateAllMockApplicants();
      const applicantsFromOrigin = allApplicants.filter(app => app.asalSekolahId === originSchoolId);
      setApplicants(applicantsFromOrigin);
    } else {
      setApplicants([]);
    }
    setCurrentPage(1);
  }, [originSchoolId]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSekolahTujuan, selectedJalur, selectedStatus, pageSize]);

  const filteredApplicants = React.useMemo(() => {
    return applicants.filter(applicant => {
      const searchTermMatch =
        applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.nisn.includes(searchTerm);
      const sekolahTujuanMatch = selectedSekolahTujuan === "Semua Sekolah Tujuan" || applicant.sekolahTujuanNama === selectedSekolahTujuan;
      const jalurMatch = selectedJalur === "Semua Jalur" || applicant.jalur === selectedJalur;
      const statusMatch = selectedStatus === "Semua Status" || applicant.statusVerifikasi === selectedStatus;
      return searchTermMatch && sekolahTujuanMatch && jalurMatch && statusMatch;
    });
  }, [applicants, searchTerm, selectedSekolahTujuan, selectedJalur, selectedStatus]);

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
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const renderSortableHeader = (key: SortKey, label: string, className: string = "") => (
    <TableHead className={cn("cursor-pointer hover:bg-muted/50", className)} onClick={() => requestSort(key)}>
      <div className="flex items-center">{label}{getSortIcon(key)}</div>
    </TableHead>
  );
  
  const handlePageSizeChange = (value: string) => setPageSize(parseInt(value, 10));
  const handlePreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  if (!originSchool) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-xl sm:text-2xl">Sekolah Asal Tidak Ditemukan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Maaf, data untuk sekolah asal ini tidak dapat ditemukan.</p>
          </CardContent>
          <CardFooter>
            <Button className="mx-auto" onClick={() => router.push('/registration/all-data')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Semua Data
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  const sekolahTujuanOptions = ["Semua Sekolah Tujuan", ...initialSchoolData.map(s => s.namaSekolah)];
  const jalurOptions = ["Semua Jalur", ...jalurOptionsPlain];
  const statusOptions = ["Semua Status", ...statusVerifikasiOptionsPlain];

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8 space-y-6">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div className="flex items-center space-x-3">
              <OriginSchoolIcon className="h-8 w-8 text-primary" />
              <CardTitle className="text-xl sm:text-2xl md:text-3xl font-headline">{originSchool.namaSekolah}</CardTitle>
            </div>
            <Button variant="outline" asChild size="sm" className="w-full sm:w-auto" onClick={() => router.push('/registration/all-data')}>
              <>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </>
            </Button>
          </div>
          <CardDescription>Detail informasi sekolah asal dan daftar siswa pendaftarnya.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="border rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold mb-3 text-primary">Informasi Umum Sekolah Asal</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><span className="font-medium text-muted-foreground">Status Sekolah:</span> {originSchool.status}</div>
              <div><span className="font-medium text-muted-foreground">Akreditasi:</span> {originSchool.akreditasi}</div>
              <div><span className="font-medium text-muted-foreground">Jumlah Pendaftar dari Sekolah Ini:</span> {originSchool.jumlahPendaftar}</div>
            </div>
          </section>

          <section className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Filter Daftar Siswa</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative sm:col-span-2 lg:col-span-1">
                 <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari Nama/NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSekolahTujuan} onValueChange={setSelectedSekolahTujuan}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Sekolah Tujuan" />
                </SelectTrigger>
                <SelectContent>
                  {sekolahTujuanOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedJalur} onValueChange={setSelectedJalur}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Jalur" />
                </SelectTrigger>
                <SelectContent>
                  {jalurOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter Status Verifikasi" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section>
             <div className="flex items-center space-x-2 mb-4">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Daftar Siswa ({sortedApplicants.length})</h3>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {renderSortableHeader('no', "No.", "w-[60px] text-center")}
                    {renderSortableHeader('fullName', "Nama Lengkap")}
                    {renderSortableHeader('nisn', "NISN")}
                    {renderSortableHeader('sekolahTujuanNama', "Sekolah Tujuan")}
                    {renderSortableHeader('jalur', "Jalur Pendaftaran")}
                    {renderSortableHeader('statusVerifikasi', "Status Verifikasi", "text-center")}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApplicants.length > 0 ? (
                    paginatedApplicants.map((applicant, index) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="text-center">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="font-medium">{applicant.fullName}</TableCell>
                        <TableCell>{applicant.nisn}</TableCell>
                        <TableCell>
                            <Link href={`/registration/school/${applicant.sekolahTujuanId}`} className="hover:underline text-primary flex items-center">
                                <Building className="mr-2 h-4 w-4 opacity-70" />
                                {applicant.sekolahTujuanNama}
                            </Link>
                        </TableCell>
                        <TableCell>{applicant.jalur}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(applicant.statusVerifikasi)}>
                            {applicant.statusVerifikasi}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground h-24"> 
                        { applicants.length === 0 && originSchoolId ? "Memuat data pendaftar..." : "Tidak ada data siswa yang sesuai dengan filter."}
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
                    <SelectItem value={(sortedApplicants.length > 0 ? sortedApplicants.length.toString() : "25")}>Semua</SelectItem>
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
