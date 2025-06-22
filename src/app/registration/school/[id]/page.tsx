
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, School as SchoolIcon, Users, Filter as FilterIcon, Search as SearchIcon, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, PieChart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSchoolById, type School } from "@/lib/schoolService";
import { cn } from "@/lib/utils";
import { generateAllMockApplicants, jalurOptionsPlain, statusVerifikasiOptionsPlain } from "@/lib/mockData";
import type { Applicant, ApplicantStatus, SortConfig, SortKey, SortDirection } from "@/lib/types";

interface PathwayStats {
  nama: string;
  kuota: number;
  terverifikasi: number;
  menungguVerifikasi: number;
  berkasTidakSesuai: number;
  totalPendaftar: number;
}


const jalurOptions = ["Semua Jalur", ...jalurOptionsPlain];
const statusOptions = ["Semua Status", ...statusVerifikasiOptionsPlain];


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

export default function SchoolDetailPage() {
  const params = useParams();
  const schoolId = params.id as string;
  
  const [school, setSchool] = React.useState<School | undefined>();
  const [currentSchoolApplicants, setCurrentSchoolApplicants] = React.useState<Applicant[]>([]);

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedJalur, setSelectedJalur] = React.useState("Semua Jalur");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("Semua Status");
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'peringkat', direction: 'ascending' });
  
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    if (schoolId) {
        const foundSchool = getSchoolById(schoolId);
        setSchool(foundSchool);
        const allApplicants = generateAllMockApplicants();
        const schoolApplicants = allApplicants.filter(app => app.sekolahTujuanId === schoolId);
        setCurrentSchoolApplicants(schoolApplicants);
    }
  }, [schoolId]);


  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedJalur, selectedStatus, pageSize]); 

  const filteredApplicants = React.useMemo(() => {
    return currentSchoolApplicants.filter(applicant => {
      const searchTermMatch =
        applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.nisn.includes(searchTerm);
      const jalurMatch = selectedJalur === "Semua Jalur" || applicant.jalur === selectedJalur;
      const statusMatch = selectedStatus === "Semua Status" || applicant.statusVerifikasi === selectedStatus;
      return searchTermMatch && jalurMatch && statusMatch; 
    });
  }, [currentSchoolApplicants, searchTerm, selectedJalur, selectedStatus]);

  const sortedApplicants = React.useMemo(() => {
    let sortableItems = [...filteredApplicants];
    if (sortConfig.key !== null && sortConfig.key !== 'no') {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key as keyof Applicant;
        const valA = a[key];
        const valB = b[key];

        let comparison = 0;
        
        if ((valA === null || valA === undefined) && (valB === null || valB === undefined)) comparison = 0;
        else if (valA === null || valA === undefined) comparison = 1;
        else if (valB === null || valB === undefined) comparison = -1;
        else if (key === 'peringkat') {
          comparison = (valA as number) - (valB as number);
        }
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

  const pathwayStats: PathwayStats[] = React.useMemo(() => {
    if (!school || !school.jalurKuota || !currentSchoolApplicants.length) {
      return [];
    }

    return jalurOptionsPlain.map(jalurName => {
      const pathwayKey = jalurName.toLowerCase() as keyof typeof school.jalurKuota;
      const kuota = school.jalurKuota?.[pathwayKey] ?? 0;

      const applicantsInPathway = currentSchoolApplicants.filter(app => app.jalur === jalurName);

      const terverifikasi = applicantsInPathway.filter(app => app.statusVerifikasi === "Terverifikasi").length;
      const menungguVerifikasi = applicantsInPathway.filter(app => app.statusVerifikasi === "Menunggu Verifikasi").length;
      const berkasTidakSesuai = applicantsInPathway.filter(app => app.statusVerifikasi === "Berkas tidak sesuai").length;
      const totalPendaftar = applicantsInPathway.length;

      return {
        nama: jalurName,
        kuota,
        terverifikasi,
        menungguVerifikasi,
        berkasTidakSesuai,
        totalPendaftar,
      };
    });
  }, [currentSchoolApplicants, school]);


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
              <Link href="/registration/all-data">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Semua Data
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
              <Link href="/registration/all-data">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
              </Link>
            </Button>
          </div>
          <CardDescription>Detail informasi sekolah dan daftar pendaftar di Kabupaten Berau.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="border rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold mb-3 text-primary">Informasi Umum Sekolah</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><span className="font-medium text-muted-foreground">Akreditasi:</span> {school.akreditasi}</div>
              <div><span className="font-medium text-muted-foreground">Tahap Pendaftaran:</span> {school.tahapPendaftaran}</div>
              <div><span className="font-medium text-muted-foreground">Total Kuota Keseluruhan:</span> {school.kuota}</div>
              <div><span className="font-medium text-muted-foreground">Total Pendaftar:</span> {currentSchoolApplicants.length}</div>
              <div><span className="font-medium text-muted-foreground">Status Pendaftaran Umum:</span> <Badge variant={school.statusPendaftaran === "Buka" ? "default" : school.statusPendaftaran === "Segera Penuh" ? "secondary" : "destructive"}>{school.statusPendaftaran}</Badge></div>
              <div className="md:col-span-2"><span className="font-medium text-muted-foreground">Alamat:</span> {school.alamat}</div>
              <div className="md:col-span-2"><span className="font-medium text-muted-foreground">Telepon:</span> {school.telepon}</div>
            </div>
          </section>

          <section className="border rounded-lg p-4 space-y-4">
             <div className="flex items-center space-x-2 mb-3">
                <PieChart className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Ringkasan Kuota & Pendaftar per Jalur</h3>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Jalur</TableHead>
                    <TableHead className="text-center font-semibold">Kuota</TableHead>
                    <TableHead className="text-center font-semibold">Terverifikasi</TableHead>
                    <TableHead className="text-center font-semibold">Menunggu Verifikasi</TableHead>
                    <TableHead className="text-center font-semibold whitespace-nowrap">Berkas Tdk. Sesuai</TableHead>
                    <TableHead className="text-center font-semibold">Total Pendaftar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pathwayStats.length > 0 ? (
                    pathwayStats.map((stats) => (
                      <TableRow key={stats.nama}>
                        <TableCell className="font-medium">{stats.nama}</TableCell>
                        <TableCell className="text-center">{stats.kuota}</TableCell>
                        <TableCell className="text-center">{stats.terverifikasi}</TableCell>
                        <TableCell className="text-center">{stats.menungguVerifikasi}</TableCell>
                        <TableCell className="text-center">{stats.berkasTidakSesuai}</TableCell>
                        <TableCell className="text-center font-medium">{stats.totalPendaftar}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        Data ringkasan jalur belum tersedia.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>

          <section className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Filter Daftar Pendaftar</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative sm:col-span-1">
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
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter berdasarkan Status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
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
                     <TableHead className="w-[60px] cursor-pointer text-center hover:bg-muted/50" onClick={() => requestSort('no')}>
                      <div className="flex items-center justify-center">No.{getSortIcon('no')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('fullName')}>
                      <div className="flex items-center">Nama Lengkap{getSortIcon('fullName')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('nisn')}>
                      <div className="flex items-center">NISN{getSortIcon('nisn')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('asalSekolahNama')}>
                      <div className="flex items-center">Asal Sekolah{getSortIcon('asalSekolahNama')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-center hover:bg-muted/50" onClick={() => requestSort('statusVerifikasi')}>
                      <div className="flex items-center justify-center">Status{getSortIcon('statusVerifikasi')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('jalur')}>
                      <div className="flex items-center">Jalur{getSortIcon('jalur')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-right hover:bg-muted/50" onClick={() => requestSort('peringkat')}>
                      <div className="flex items-center justify-end">Peringkat{getSortIcon('peringkat')}</div>
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
                        <TableCell>{applicant.asalSekolahNama}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getApplicantStatusBadgeVariant(applicant.statusVerifikasi)}>
                            {applicant.statusVerifikasi}
                          </Badge>
                        </TableCell>
                        <TableCell>{applicant.jalur}</TableCell>
                        <TableCell
                            className={cn(
                                "text-right font-medium",
                                (() => {
                                if (applicant.peringkat && school.jalurKuota) {
                                    const pathwayKey = applicant.jalur.toLowerCase() as keyof NonNullable<typeof school.jalurKuota>;
                                    const pathwayQuota = school.jalurKuota[pathwayKey];
                                    if (pathwayQuota !== undefined && applicant.peringkat <= pathwayQuota) {
                                    return 'text-green-600';
                                    }
                                    return 'text-red-600'; 
                                }
                                return ''; 
                                })()
                            )}
                            >
                            {applicant.peringkat ?? '-'}
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
