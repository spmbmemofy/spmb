
"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardList, Filter as FilterIcon, Search as SearchIcon, ChevronLeft, ChevronRight, ArrowUp, ArrowDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { getApplicants } from "@/lib/applicantService";
import { statusVerifikasiOptionsPlain } from "@/lib/mockData";
import { getSchoolByNPSN, getSchools } from "@/lib/schoolService";
import type { Applicant, ApplicantStatus, SortConfig, SortDirection, SortKey } from "@/lib/types";
import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { getUsers } from "@/lib/userService";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
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

export default function VerificationPage() {
  const [allApplicants, setAllApplicants] = React.useState<Applicant[]>([]);
  const [jalurOptions, setJalurOptions] = React.useState<string[]>([]);
  const [schoolName, setSchoolName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedJalur, setSelectedJalur] = React.useState("Semua Jalur");
  const [selectedStatus, setSelectedStatus] = React.useState("Semua Status");
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'submissionTimestamp', direction: 'descending' });

  const [isAdminMode, setIsAdminMode] = React.useState(false);
  const [smaSmkSchools, setSmaSmkSchools] = React.useState<any[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = React.useState<string>("");

  const loadApplicantsForSchool = React.useCallback((schoolId: string) => {
    const applicantsData = getApplicants();
    const verifierSchoolApplicants = applicantsData.filter(app => {
        return app.schoolSelections?.some(sel => sel.schoolId === schoolId) 
            && app.schoolSelections[0].schoolId === schoolId
            && app.statusVerifikasi !== 'Dibatalkan';
    });
    setAllApplicants(verifierSchoolApplicants);
    setIsLoading(false);
  }, []);

  React.useEffect(() => {
    const creds = getFromLocalStorage<LoginCredentials | null>('loginCredentials', null);
    if (!creds?.username) {
        toast({ variant: 'destructive', title: 'Sesi tidak ditemukan', description: 'Silakan login kembali.' });
        router.replace('/');
        return;
    }

    const user = getUsers().find(u => u.username === creds.username);
    if (!user) {
        toast({ variant: 'destructive', title: 'Pengguna tidak ditemukan' });
        router.replace('/');
        return;
    }

    const isAdmin = ['superadmin', 'branch_admin'].includes(creds.role || '');
    setIsAdminMode(isAdmin);

    if (isAdmin) {
        const schools = getSchools().filter(s => s.jenjang === 'SMA' || s.jenjang === 'SMK');
        setSmaSmkSchools(schools);
        if (schools.length > 0) {
            setSelectedSchoolId(schools[0].id);
            setSchoolName(schools[0].namaSekolah);
            loadApplicantsForSchool(schools[0].id);
        } else {
            setIsLoading(false);
        }
    } else {
        if (!user.npsn) {
            toast({ variant: 'destructive', title: 'Akun tidak terhubung', description: 'Akun verifikator Anda tidak terhubung ke sekolah manapun.' });
            setIsLoading(false);
            return;
        }
        const verifierSchool = getSchoolByNPSN(user.npsn);
        if (!verifierSchool) {
            toast({ variant: 'destructive', title: 'Sekolah tidak ditemukan', description: `Sekolah dengan NPSN ${user.npsn} tidak ditemukan.` });
            setIsLoading(false);
            return;
        }
        setSchoolName(verifierSchool.namaSekolah);
        loadApplicantsForSchool(verifierSchool.id);
    }
    
    setJalurOptions(["Semua Jalur", ...getJalur().map(j => j.name)]);
  }, [router, toast, loadApplicantsForSchool]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedJalur, selectedStatus, pageSize, sortConfig]);

  const requestSort = (key: SortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  const handleSchoolChange = (schoolId: string) => {
    setSelectedSchoolId(schoolId);
    const targetSchool = smaSmkSchools.find(s => s.id === schoolId);
    if (targetSchool) {
      setSchoolName(targetSchool.namaSekolah);
      loadApplicantsForSchool(schoolId);
    }
  };

  const getSortIcon = (key: SortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  };

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

  const sortedApplicants = React.useMemo(() => {
    let sortableItems = [...filteredApplicants];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key as keyof Applicant;
        const valA = a[key];
        const valB = b[key];

        let comparison = 0;
        if (valA === null || valA === undefined) comparison = 1;
        else if (valB === null || valB === undefined) comparison = -1;
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
  
  const statusOptions = ["Semua Status", ...statusVerifikasiOptionsPlain.filter(s => s !== 'Dibatalkan')];
  
  if (isLoading) {
    return <div className="p-4 text-center">Memuat data verifikasi...</div>;
  }

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-7xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
              <ClipboardList size={28} />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-headline">Daftar Tunggu Verifikasi</CardTitle>
              <CardDescription className="text-md mt-1">
                Kelola, cari, dan filter pendaftar untuk sekolah: <span className="font-semibold">{schoolName || "Tidak ada sekolah"}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isAdminMode && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="space-y-1 text-left">
                <h4 className="text-sm font-semibold text-primary">Mode Administrator / Wilayah</h4>
                <p className="text-xs text-muted-foreground">Pilih SMA/SMK untuk memantau dan memverifikasi berkas pendaftar.</p>
              </div>
              <div className="w-full sm:w-80">
                <Select value={selectedSchoolId} onValueChange={handleSchoolChange}>
                  <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Pilih sekolah..." /></SelectTrigger>
                  <SelectContent>
                    {smaSmkSchools.map(sch => (
                      <SelectItem key={sch.id} value={sch.id}>{sch.namaSekolah}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

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
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('fullName')}>
                      <div className="flex items-center">Nama Lengkap{getSortIcon('fullName')}</div>
                    </TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Asal Sekolah</TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('jalur')}>
                      <div className="flex items-center">Jalur{getSortIcon('jalur')}</div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('submissionTimestamp')}>
                      <div className="flex items-center">Waktu Pendaftaran{getSortIcon('submissionTimestamp')}</div>
                    </TableHead>
                    <TableHead className="text-center cursor-pointer hover:bg-muted/50" onClick={() => requestSort('statusVerifikasi')}>
                      <div className="flex items-center justify-center">Status{getSortIcon('statusVerifikasi')}</div>
                    </TableHead>
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
                        <TableCell>
                          {applicant.submissionTimestamp ? new Date(applicant.submissionTimestamp).toLocaleString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                          }) : '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(applicant.statusVerifikasi)}>
                            {applicant.statusVerifikasi}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
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
