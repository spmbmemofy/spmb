
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen as OriginSchoolIcon, Users, Filter as FilterIcon, Search as SearchIcon, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Building, PieChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { initialSchoolData, initialOriginSchoolData } from "@/lib/schoolData";
import type { OriginSchool } from "@/lib/schoolData";
import { cn } from "@/lib/utils";
import { jalurOptionsPlain, statusVerifikasiOptionsPlain } from "@/lib/mockData";
import { getApplicants } from "@/lib/applicantService";
import type { Applicant, ApplicantStatus, SortConfig, SortDirection, SortKey } from "@/lib/types";


const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Terverifikasi": return "default";
    case "Menunggu Verifikasi": return "secondary";
    case "Berkas tidak sesuai": return "destructive";
    default: return "default";
  }
};

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
      const allApplicants = getApplicants();
      const applicantsFromOrigin = allApplicants.filter(app => app.asalSekolahId === originSchoolId);
      setApplicants(applicantsFromOrigin);
    } else {
      setApplicants([]);
    }
  }, [originSchoolId]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSekolahTujuan, selectedJalur, selectedStatus, pageSize]);

  const schoolSummary = React.useMemo(() => {
    if (!applicants.length) return [];

    const summaryMap = new Map<string, {
        sekolahTujuanId: string;
        sekolahTujuanNama: string;
        total: number;
        terverifikasi: number;
        menunggu: number;
        tidakSesuai: number;
    }>();

    for (const applicant of applicants) {
        if (!summaryMap.has(applicant.sekolahTujuanNama)) {
            summaryMap.set(applicant.sekolahTujuanNama, {
                sekolahTujuanId: applicant.sekolahTujuanId,
                sekolahTujuanNama: applicant.sekolahTujuanNama,
                total: 0,
                terverifikasi: 0,
                menunggu: 0,
                tidakSesuai: 0,
            });
        }

        const stats = summaryMap.get(applicant.sekolahTujuanNama)!;
        stats.total++;
        if (applicant.statusVerifikasi === 'Terverifikasi') {
            stats.terverifikasi++;
        } else if (applicant.statusVerifikasi === 'Menunggu Verifikasi') {
            stats.menunggu++;
        } else if (applicant.statusVerifikasi === 'Berkas tidak sesuai') {
            stats.tidakSesuai++;
        }
    }

    return Array.from(summaryMap.values()).sort((a, b) => b.total - a.total);
  }, [applicants]);

  const summaryTotals = React.useMemo(() => {
    return schoolSummary.reduce(
      (acc, summary) => {
        acc.total += summary.total;
        acc.terverifikasi += summary.terverifikasi;
        acc.menunggu += summary.menunggu;
        acc.tidakSesuai += summary.tidakSesuai;
        return acc;
      },
      { total: 0, terverifikasi: 0, menunggu: 0, tidakSesuai: 0 }
    );
  }, [schoolSummary]);

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
        const key = sortConfig.key as keyof Applicant;
        const valA = a[key];
        const valB = b[key];

        let comparison = 0;
        
        if (valA === null || valA === undefined) comparison = 1;
        else if (valB === null || valB === undefined) comparison = -1;
        else if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
        } 
        else {
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
            <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => router.push('/registration/all-data')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
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
                <PieChart className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Ringkasan Pilihan Sekolah Tujuan (Total: {summaryTotals.total} Pendaftar)</h3>
            </div>
            <div className="overflow-x-auto rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Sekolah Tujuan</TableHead>
                            <TableHead className="text-center">Total Pendaftar</TableHead>
                            <TableHead className="text-center">Terverifikasi</TableHead>
                            <TableHead className="text-center">Menunggu</TableHead>
                            <TableHead className="text-center">Ditolak</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schoolSummary.length > 0 ? (
                            schoolSummary.map((summary) => (
                                <TableRow key={summary.sekolahTujuanId}>
                                    <TableCell className="font-medium">
                                        <Link href={`/registration/school/${summary.sekolahTujuanId}`} className="hover:underline text-primary">
                                            {summary.sekolahTujuanNama}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-center font-bold">{summary.total}</TableCell>
                                    <TableCell className="text-center">{summary.terverifikasi}</TableCell>
                                    <TableCell className="text-center">{summary.menunggu}</TableCell>
                                    <TableCell className="text-center">{summary.tidakSesuai}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                    Belum ada pendaftar dari sekolah ini.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow className="bg-muted/50">
                            <TableCell className="font-bold">Total Keseluruhan</TableCell>
                            <TableCell className="text-center font-bold">{summaryTotals.total}</TableCell>
                            <TableCell className="text-center font-bold">{summaryTotals.terverifikasi}</TableCell>
                            <TableCell className="text-center font-bold">{summaryTotals.menunggu}</TableCell>
                            <TableCell className="text-center font-bold">{summaryTotals.tidakSesuai}</TableCell>
                        </TableRow>
                    </TableFooter>
                </Table>
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
                    <TableHead className="w-[60px] cursor-pointer text-center hover:bg-muted/50" onClick={() => requestSort('no')}>
                      <div className="flex items-center justify-center">No.{getSortIcon('no')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('fullName')}>
                      <div className="flex items-center">Nama Lengkap{getSortIcon('fullName')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('nisn')}>
                      <div className="flex items-center">NISN{getSortIcon('nisn')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('sekolahTujuanNama')}>
                      <div className="flex items-center">Sekolah Tujuan{getSortIcon('sekolahTujuanNama')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('jalur')}>
                      <div className="flex items-center">Jalur Pendaftaran{getSortIcon('jalur')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-center hover:bg-muted/50" onClick={() => requestSort('statusVerifikasi')}>
                      <div className="flex items-center justify-center">Status Verifikasi{getSortIcon('statusVerifikasi')}</div>
                    </TableHead>
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
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
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
