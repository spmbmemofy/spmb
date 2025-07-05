
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Building, Database, Filter as FilterIcon, Search as SearchIcon, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getSchools } from "@/lib/schoolService";
import { statusVerifikasiOptionsPlain } from "@/lib/mockData";
import { getApplicants } from "@/lib/applicantService";
import type { Applicant, ApplicantStatus, SortConfig, SortDirection, SortKey } from "@/lib/types";
import { getJalur } from "@/lib/pathwayService";

const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Terverifikasi": return "default";
    case "Menunggu Verifikasi": return "secondary";
    case "Berkas tidak sesuai": return "destructive";
    case "Dibatalkan": return "destructive";
    default: return "secondary";
  }
};

export default function AllDataPage() {
  const [allApplicants, setAllApplicants] = React.useState<Applicant[]>([]);
  const [schools, setSchools] = React.useState<ReturnType<typeof getSchools>>([]);
  const [jalurOptions, setJalurOptions] = React.useState<string[]>([]);
  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedSekolahTujuan, setSelectedSekolahTujuan] = React.useState("Semua Sekolah Tujuan");
  const [selectedJalur, setSelectedJalur] = React.useState("Semua Jalur");
  const [selectedStatus, setSelectedStatus] = React.useState("Semua Status");
  
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'fullName', direction: 'ascending' });
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setAllApplicants(getApplicants());
    setSchools(getSchools());
    setJalurOptions(["Semua Jalur", ...getJalur().map(j => j.name)]);
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSekolahTujuan, selectedJalur, selectedStatus, pageSize]);

  const filteredApplicants = React.useMemo(() => {
    return allApplicants.filter(applicant => {
      const searchTermMatch =
        applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.nisn.includes(searchTerm);
      const sekolahTujuanMatch = selectedSekolahTujuan === "Semua Sekolah Tujuan" || applicant.sekolahTujuanNama === selectedSekolahTujuan;
      const jalurMatch = selectedJalur === "Semua Jalur" || applicant.jalur === selectedJalur;
      const statusMatch = selectedStatus === "Semua Status" || applicant.statusVerifikasi === selectedStatus;
      return searchTermMatch && sekolahTujuanMatch && jalurMatch && statusMatch;
    });
  }, [allApplicants, searchTerm, selectedSekolahTujuan, selectedJalur, selectedStatus]);

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

  const sekolahTujuanOptions = ["Semua Sekolah Tujuan", ...schools.filter(s => s.jenjang !== 'SMP').map(s => s.namaSekolah)];
  const statusOptions = ["Semua Status", ...statusVerifikasiOptionsPlain];

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-7xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
              <Database size={28} />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-headline">Semua Data Pendaftar</CardTitle>
              <CardDescription className="text-md mt-1">
                Kelola dan lihat semua data pendaftar di seluruh sekolah.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Filter Data</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                 <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari Nama/NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedSekolahTujuan} onValueChange={setSelectedSekolahTujuan}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {sekolahTujuanOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedJalur} onValueChange={setSelectedJalur}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {jalurOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section>
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
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('sekolahTujuanNama')}>
                      <div className="flex items-center">Sekolah Tujuan{getSortIcon('sekolahTujuanNama')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('jalur')}>
                      <div className="flex items-center">Jalur{getSortIcon('jalur')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-center hover:bg-muted/50" onClick={() => requestSort('statusVerifikasi')}>
                      <div className="flex items-center justify-center">Status Verifikasi{getSortIcon('statusVerifikasi')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer text-center hover:bg-muted/50" onClick={() => requestSort('peringkat')}>
                      <div className="flex items-center justify-center">Peringkat{getSortIcon('peringkat')}</div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApplicants.length > 0 ? (
                    paginatedApplicants.map((applicant, index) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="text-center">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/registration/applicant-detail/${applicant.id}`} className="hover:underline text-primary">
                            {applicant.fullName}
                          </Link>
                        </TableCell>
                        <TableCell>{applicant.nisn}</TableCell>
                        <TableCell>
                            <Link href={`/registration/origin-school/${applicant.asalSekolahId}`} className="hover:underline text-primary flex items-center gap-2">
                                <BookOpen className="h-4 w-4 opacity-70" />
                                {applicant.asalSekolahNama}
                            </Link>
                        </TableCell>
                        <TableCell>
                            <Link href={`/registration/school/${applicant.sekolahTujuanId}`} className="hover:underline text-primary flex items-center gap-2">
                                <Building className="h-4 w-4 opacity-70" />
                                {applicant.sekolahTujuanNama}
                            </Link>
                        </TableCell>
                        <TableCell>{applicant.jalur}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(applicant.statusVerifikasi)}>
                            {applicant.statusVerifikasi}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center font-mono">
                          {(() => {
                            if (applicant.diterimaDiSekolahId && applicant.peringkat && applicant.statusVerifikasi === 'Terverifikasi') {
                              const school = schools.find(s => s.id === applicant.diterimaDiSekolahId);
                              if (school?.jalurKuota) {
                                const pathwayKey = applicant.jalur.toLowerCase() as keyof typeof school.jalurKuota;
                                const quota = school.jalurKuota[pathwayKey];
                                if (quota !== undefined && applicant.peringkat <= quota) {
                                  return <span className="text-green-600 font-bold">{applicant.peringkat}</span>;
                                } else {
                                  return <span className="text-red-600">{applicant.peringkat}</span>;
                                }
                              }
                              return <span>{applicant.peringkat}</span>;
                            }
                            return <span>-</span>;
                          })()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground h-24"> 
                        Tidak ada data pendaftar yang cocok dengan kriteria filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
             <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Data per halaman:</span>
                <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                  <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
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
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Sebelumnya
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
