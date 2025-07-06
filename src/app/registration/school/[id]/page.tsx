
"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, School as SchoolIcon, Users, Filter as FilterIcon, Search as SearchIcon, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, PieChart, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSchoolById, type School } from "@/lib/schoolService";
import { cn } from "@/lib/utils";
import { statusVerifikasiOptionsPlain } from "@/lib/mockData";
import { getApplicants, isPriority } from "@/lib/applicantService";
import type { Applicant, ApplicantStatus, SortConfig, SortKey, SortDirection } from "@/lib/types";
import { getJalur } from "@/lib/pathwayService";
import { getStages } from "@/lib/stageService";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";


interface PathwayStats {
  nama: string;
  kuota: number;
  terverifikasi: number;
  menungguVerifikasi: number;
  berkasTidakSesuai: number;
  totalPendaftar: number;
}


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

const calculateScoreForSchool = (applicant: Applicant, schoolId: string): number => {
    const totalNilaiRapor = Object.values(applicant.semesterGrades).reduce((a, b) => a + b, 0);
    const nilaiPrestasi = applicant.jalur === 'Prestasi' ? (applicant.nilaiPrestasi || 0) : 0;
    const isFirstChoice = applicant.schoolSelections && applicant.schoolSelections[0]?.schoolId === schoolId;
    const nilaiTambahan = isFirstChoice ? 25 : 0;
    return totalNilaiRapor + nilaiPrestasi + nilaiTambahan;
};


interface DisplayApplicant extends Applicant {
    finalScore: number | null;
    hypotheticalRank: number | null;
}

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const schoolId = params.id as string;
  
  const [school, setSchool] = React.useState<School | undefined>();
  const [currentSchoolApplicants, setCurrentSchoolApplicants] = React.useState<Applicant[]>([]);
  const [jalurOptions, setJalurOptions] = React.useState<string[]>([]);
  const [stageName, setStageName] = React.useState<string>("");
  
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedJalur, setSelectedJalur] = React.useState("Semua Jalur");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("Semua Status");
  const [sortConfig, setSortConfig] = React.useState<SortConfig>({ key: 'peringkat', direction: 'ascending' });
  
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    if (schoolId) {
        const foundSchool = getSchoolById(schoolId);
        const allJalur = getJalur();
        const allStages = getStages();
        
        setSchool(foundSchool);
        
        if (foundSchool) {
          const stage = allStages.find(s => allJalur.find(j => j.tahapId === s.id && foundSchool.jalurKuota && Object.keys(foundSchool.jalurKuota).includes(j.name.toLowerCase())));
          setStageName(stage?.name || 'Tidak ada tahap');
        }

        setJalurOptions(["Semua Jalur", ...allJalur.map(j => j.name)]);
        const allApplicants = getApplicants();
        const schoolApplicants = allApplicants.filter(app => 
          app.schoolSelections?.some(selection => selection.schoolId === schoolId)
        );
        setCurrentSchoolApplicants(schoolApplicants);
    }
  }, [schoolId]);


  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedJalur, selectedStatus, pageSize]); 

  const applicantsForDisplay = React.useMemo<DisplayApplicant[]>(() => {
    if (!school) return [];

    // Map all applicants who chose this school to the DisplayApplicant type
    const allDisplayApplicants = new Map(
      currentSchoolApplicants.map(app => [
        app.id,
        { ...app, finalScore: null, hypotheticalRank: null } as DisplayApplicant
      ])
    );

    const applicantsByPathway: Record<string, DisplayApplicant[]> = {};

    // For each applicant who chose this school...
    for (const applicant of currentSchoolApplicants) {
        // Only consider verified applicants for ranking.
        if (applicant.statusVerifikasi !== 'Terverifikasi') continue;

        // Check if the applicant is already placed in a higher-priority school.
        if (applicant.diterimaDiSekolahId) {
            const acceptedAtIndex = applicant.schoolSelections.findIndex(s => s.schoolId === applicant.diterimaDiSekolahId);
            const currentSchoolIndex = applicant.schoolSelections.findIndex(s => s.schoolId === school.id);
            
            // If they are accepted at a school with a lower index (higher priority), they do not compete here.
            if (acceptedAtIndex !== -1 && currentSchoolIndex !== -1 && acceptedAtIndex < currentSchoolIndex) {
                continue; // Skip this applicant from the ranking pool.
            }
        }

        // If the applicant is competing for a spot at this school, add them to the correct pathway group.
        const displayApp = allDisplayApplicants.get(applicant.id);
        if (displayApp) {
            displayApp.finalScore = calculateScoreForSchool(applicant, school.id);
            if (!applicantsByPathway[applicant.jalur]) {
                applicantsByPathway[applicant.jalur] = [];
            }
            applicantsByPathway[applicant.jalur].push(displayApp);
        }
    }

    // Now, sort and rank within each pathway group.
    for (const jalur in applicantsByPathway) {
        const group = applicantsByPathway[jalur];
        group.sort((a, b) => {
            if (jalur === 'Domisili') {
                const isAPriority = isPriority(a, school);
                const isBPriority = isPriority(b, school);
                if (isAPriority !== isBPriority) {
                    return isAPriority ? -1 : 1;
                }
            }
            return (b.finalScore ?? 0) - (a.finalScore ?? 0);
        });

        // Assign rank to the sorted applicants in this group
        group.forEach((app, index) => {
            app.hypotheticalRank = index + 1;
        });
    }

    // Return the full list of display applicants, now with ranks updated.
    return Array.from(allDisplayApplicants.values());
  }, [currentSchoolApplicants, school]);

  const filteredApplicants = React.useMemo(() => {
    return applicantsForDisplay.filter(applicant => {
      const searchTermMatch =
        applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.nisn.includes(searchTerm);
      const jalurMatch = selectedJalur === "Semua Jalur" || applicant.jalur === selectedJalur;
      const statusMatch = selectedStatus === "Semua Status" || applicant.statusVerifikasi === selectedStatus;
      return searchTermMatch && jalurMatch && statusMatch; 
    });
  }, [applicantsForDisplay, searchTerm, selectedJalur, selectedStatus]);

  const sortedApplicants = React.useMemo(() => {
    let sortableItems = [...filteredApplicants];
    if (sortConfig.key !== null && sortConfig.key !== 'no') {
      sortableItems.sort((a, b) => {
        if (sortConfig.key === 'peringkat') {
          const rankA = a.hypotheticalRank;
          const rankB = b.hypotheticalRank;
          
          if (rankA === null && rankB === null) return 0;
          if (rankA === null) return 1;
          if (rankB === null) return -1;
          
          const comparison = rankA - rankB;
          return sortConfig.direction === 'ascending' ? comparison : -comparison;
        }

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

  const pathwayStats: PathwayStats[] = React.useMemo(() => {
    if (!school || !currentSchoolApplicants.length) {
      return [];
    }
    
    const pathways = getJalur();

    return pathways
        .filter(jalur => (school.jenjang === 'SMA' && school.jalurKuota) || (school.jenjang === 'SMK' && school.majors))
        .map(jalur => {
        const jalurName = jalur.name;
        const pathwayKey = jalurName.toLowerCase() as keyof NonNullable<typeof school.jalurKuota>;
        
        let kuota = 0;
        if (school.jenjang === 'SMA' && school.jalurKuota) {
            kuota = school.jalurKuota[pathwayKey] ?? 0;
        } else if (school.jenjang === 'SMK' && school.majors) {
            kuota = school.majors.reduce((total, major) => total + (major.quota[pathwayKey] ?? 0), 0);
        }

        const applicantsInPathwayForThisSchool = currentSchoolApplicants.filter(app => app.jalur === jalurName);

        const terverifikasi = applicantsInPathwayForThisSchool.filter(app => app.statusVerifikasi === "Terverifikasi").length;
        const menungguVerifikasi = applicantsInPathwayForThisSchool.filter(app => app.statusVerifikasi === "Menunggu Verifikasi").length;
        const berkasTidakSesuai = applicantsInPathwayForThisSchool.filter(app => app.statusVerifikasi === "Berkas tidak sesuai").length;
        const totalPendaftar = applicantsInPathwayForThisSchool.length;

        return {
            nama: jalurName,
            kuota,
            terverifikasi,
            menungguVerifikasi,
            berkasTidakSesuai,
            totalPendaftar,
        };
    }).filter(stats => stats.totalPendaftar > 0 || stats.kuota > 0);
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
            <Button onClick={() => router.back()} className="mx-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali
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
            <Button variant="outline" onClick={() => router.back()} size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali
            </Button>
          </div>
          <CardDescription>Detail informasi sekolah dan daftar pendaftar di Kabupaten Berau.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section className="border rounded-lg p-4 space-y-4">
            <h3 className="text-lg font-semibold mb-3 text-primary">Informasi Umum Sekolah</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><span className="font-medium text-muted-foreground">Akreditasi:</span> {school.akreditasi}</div>
              <div><span className="font-medium text-muted-foreground">Tahap Pendaftaran:</span> {stageName}</div>
              <div><span className="font-medium text-muted-foreground">Total Kuota Keseluruhan:</span> {school.kuota}</div>
              <div><span className="font-medium text-muted-foreground">Total Pendaftar:</span> {currentSchoolApplicants.length}</div>
              <div className="md:col-span-2"><span className="font-medium text-muted-foreground">Alamat:</span> {school.alamat}</div>
              <div className="md:col-span-2"><span className="font-medium text-muted-foreground">Telepon:</span> {school.telepon}</div>
              {school.allowedGenders && school.allowedGenders.length > 0 && (
                <div className="md:col-span-2"><span className="font-medium text-muted-foreground">Khusus Jenis Kelamin:</span> <span className="font-semibold text-primary">{school.allowedGenders.join(', ')}</span></div>
              )}
              {school.allowedReligions && school.allowedReligions.length > 0 && (
                  <div className="md:col-span-2"><span className="font-medium text-muted-foreground">Khusus Agama:</span> <span className="font-semibold text-primary">{school.allowedReligions.join(', ')}</span></div>
              )}
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
                  {["Semua Status", ...statusVerifikasiOptionsPlain].map(status => (
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
                    paginatedApplicants.map((applicant, index) => {
                      let rankClass = "";
                      if (applicant.hypotheticalRank) {
                        const pathwayKey = (applicant.jalur.toLowerCase()) as keyof NonNullable<typeof school.jalurKuota>;
                        const quota = school.jalurKuota ? school.jalurKuota[pathwayKey] ?? 0 : 0;
                        if (quota > 0 && applicant.hypotheticalRank <= quota) {
                          rankClass = "text-green-600";
                        } else {
                          rankClass = "text-red-600";
                        }
                      }

                      return (
                        <TableRow key={applicant.id}>
                          <TableCell className="text-center">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                                <Link href={`/registration/applicant-detail/${applicant.id}`} className="hover:underline text-primary">
                                    {applicant.fullName}
                                </Link>
                                {isPriority(applicant, school) && (
                                    <TooltipProvider>
                                        <Tooltip>
                                            <TooltipTrigger>
                                                <Star className="h-4 w-4 text-yellow-500 fill-yellow-400" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>Pendaftar Prioritas Domisili</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TooltipProvider>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>{applicant.nisn}</TableCell>
                          <TableCell>{applicant.asalSekolahNama}</TableCell>
                          <TableCell className="text-center">
                            <Badge variant={getApplicantStatusBadgeVariant(applicant.statusVerifikasi)}>
                              {applicant.statusVerifikasi}
                            </Badge>
                          </TableCell>
                          <TableCell>{applicant.jalur}</TableCell>
                          <TableCell className={cn("text-right font-medium", rankClass)}>
                            {applicant.hypotheticalRank ?? '-'}
                          </TableCell>
                        </TableRow>
                      );
                    })
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
