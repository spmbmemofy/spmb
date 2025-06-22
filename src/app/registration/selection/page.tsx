
"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardList, Filter as FilterIcon, Search as SearchIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getApplicants } from "@/lib/applicantService";
import { jalurOptionsPlain, statusVerifikasiOptionsPlain } from "@/lib/mockData";
import { getSchoolById } from "@/lib/schoolService";
import type { Applicant, ApplicantStatus } from "@/lib/types";

const VERIFIER_SCHOOL_ID = "sman4berau";

const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Terverifikasi": return "default";
    case "Menunggu Verifikasi": return "secondary";
    case "Berkas tidak sesuai": return "destructive";
    default: return "secondary";
  }
};

export default function VerificationPage() {
  const [allApplicants, setAllApplicants] = React.useState<Applicant[]>([]);
  const [schoolName, setSchoolName] = React.useState("");

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedJalur, setSelectedJalur] = React.useState("Semua Jalur");
  const [selectedStatus, setSelectedStatus] = React.useState("Semua Status");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    const applicantsData = getApplicants();
    const verifierSchoolApplicants = applicantsData.filter(app => app.sekolahTujuanId === VERIFIER_SCHOOL_ID);
    setAllApplicants(verifierSchoolApplicants);

    const school = getSchoolById(VERIFIER_SCHOOL_ID);
    setSchoolName(school?.namaSekolah || "Sekolah Tidak Ditemukan");
  }, []);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedJalur, selectedStatus, pageSize]);

  const filteredApplicants = React.useMemo(() => {
    return allApplicants.filter(applicant => {
      const searchTermMatch =
        applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.nisn.includes(searchTerm);
      const jalurMatch = selectedJalur === "Semua Jalur" || applicant.jalur === selectedJalur;
      const statusMatch = selectedStatus === "Semua Status" || applicant.statusVerifikasi === selectedStatus;
      return searchTermMatch && jalurMatch && statusMatch;
    });
  }, [allApplicants, searchTerm, selectedJalur, selectedStatus]);

  const paginatedApplicants = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredApplicants.slice(startIndex, startIndex + pageSize);
  }, [filteredApplicants, currentPage, pageSize]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(filteredApplicants.length / pageSize);
  }, [filteredApplicants.length, pageSize]);

  const jalurOptions = ["Semua Jalur", ...jalurOptionsPlain];
  const statusOptions = ["Semua Status", ...statusVerifikasiOptionsPlain];

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-5xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
              <ClipboardList size={28} />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-headline">Daftar Tunggu Verifikasi</CardTitle>
              <CardDescription className="text-md mt-1">
                Kelola, cari, dan filter pendaftar untuk sekolah: <span className="font-semibold">{schoolName}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Filter Data Pendaftar</h3>
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
                    <TableHead className="w-[50px] text-center">No.</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Asal Sekolah</TableHead>
                    <TableHead>Jalur</TableHead>
                    <TableHead className="text-center">Status Verifikasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedApplicants.length > 0 ? (
                    paginatedApplicants.map((applicant, index) => (
                      <TableRow key={applicant.id}>
                        <TableCell className="text-center">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                        <TableCell className="font-medium">
                          <Link href={`/registration/verify/${applicant.id}`} className="hover:underline text-primary">
                            {applicant.fullName}
                          </Link>
                        </TableCell>
                        <TableCell>{applicant.nisn}</TableCell>
                        <TableCell>{applicant.asalSekolahNama}</TableCell>
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
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Tidak ada data pendaftar yang cocok dengan kriteria filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
          
           <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Data per halaman:</span>
                <Select value={String(pageSize)} onValueChange={(val) => setPageSize(Number(val))}>
                  <SelectTrigger className="w-[80px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
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

        </CardContent>
      </Card>
    </div>
  );
}
