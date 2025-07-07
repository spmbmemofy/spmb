
"use client";

import * as React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Megaphone, Search as SearchIcon, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Filter as FilterIcon, FileDown } from 'lucide-react';
import { getStages, type Tahap } from '@/lib/stageService';
import { getApplicants, type Applicant, calculateApplicantScore } from '@/lib/applicantService';
import type { SortConfig, SortDirection } from '@/lib/types';
import { getJalur, type Jalur } from '@/lib/pathwayService';
import { getSchoolById, getSchools, type School } from '@/lib/schoolService';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import * as xlsx from "xlsx";

type AnnouncementSortKey = keyof Applicant | 'finalScore' | 'no';

export default function AnnouncementPage() {
  const [publishedAnnouncements, setPublishedAnnouncements] = React.useState<Tahap[]>([]);
  const [allApplicants, setAllApplicants] = React.useState<Applicant[]>([]);
  const [allPathways, setAllPathways] = React.useState<Jalur[]>([]);
  const [allStages, setAllStages] = React.useState<Tahap[]>([]);
  const [allSchools, setAllSchools] = React.useState<School[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedOriginSchool, setSelectedOriginSchool] = React.useState("Semua Asal Sekolah");
  const [selectedDestinationSchool, setSelectedDestinationSchool] = React.useState("Semua Sekolah Tujuan");
  const [selectedPathway, setSelectedPathway] = React.useState("Semua Jalur");
  const [selectedStage, setSelectedStage] = React.useState("Semua Tahap");
  
  const [sortConfig, setSortConfig] = React.useState<SortConfig & { key: AnnouncementSortKey | null }>({ key: 'diterimaDiSekolahId', direction: 'ascending' });
  const [currentPage, setCurrentPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  
  React.useEffect(() => {
    const stages = getStages();
    const published = stages.filter(stage => stage.isAnnouncementPublished);
    setPublishedAnnouncements(published);
    
    setAllApplicants(getApplicants());
    setAllPathways(getJalur());
    setAllStages(getStages());
    setAllSchools(getSchools());
    setIsLoading(false);
  }, []);

  const pathwayToStageNameMap = React.useMemo(() => {
    if (allStages.length === 0 || allPathways.length === 0) return new Map();
    
    const stageMap = new Map(allStages.map(s => [s.id, s.name]));
    const pathwayMap = new Map<string, string>();
    
    allPathways.forEach(p => {
        const stageName = stageMap.get(p.tahapId);
        if (stageName) {
            pathwayMap.set(p.name, stageName);
        }
    });
    
    return pathwayMap;
  }, [allStages, allPathways]);

  const pathwayToStageIdMap = React.useMemo(() => {
    if (allPathways.length === 0) return new Map();
    const pathwayMap = new Map<string, string>();
    allPathways.forEach(p => {
        pathwayMap.set(p.name, p.tahapId);
    });
    return pathwayMap;
  }, [allPathways]);


  const relevantApplicants = React.useMemo(() => {
    const stageIds = new Set(publishedAnnouncements.map(stage => stage.id));
    const pathwaysInPublishedStages = allPathways.filter(p => stageIds.has(p.tahapId)).map(p => p.name);
    
    return allApplicants
      .filter(app => pathwaysInPublishedStages.includes(app.jalur) && app.diterimaDiSekolahId)
      .map(app => ({
        ...app,
        finalScore: calculateApplicantScore(app, app.diterimaDiSekolahId!)
      }));
  }, [publishedAnnouncements, allPathways, allApplicants]);
  
  const filteredApplicants = React.useMemo(() => {
    return relevantApplicants.filter(applicant => {
        const searchTermMatch = 
            applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            applicant.nisn.includes(searchTerm);
        const originSchoolMatch = selectedOriginSchool === "Semua Asal Sekolah" || applicant.asalSekolahNama === selectedOriginSchool;
        const destinationSchoolMatch = selectedDestinationSchool === "Semua Sekolah Tujuan" || applicant.sekolahTujuanNama === selectedDestinationSchool;
        const pathwayMatch = selectedPathway === "Semua Jalur" || applicant.jalur === selectedPathway;
        const stageIdForApplicant = pathwayToStageIdMap.get(applicant.jalur);
        const stageMatch = selectedStage === "Semua Tahap" || stageIdForApplicant === selectedStage;

        return searchTermMatch && originSchoolMatch && destinationSchoolMatch && pathwayMatch && stageMatch;
    });
  }, [relevantApplicants, searchTerm, selectedOriginSchool, selectedDestinationSchool, selectedPathway, selectedStage, pathwayToStageIdMap]);

  const sortedApplicants = React.useMemo(() => {
    let sortableItems = [...filteredApplicants];
    if (sortConfig.key && sortConfig.key !== 'no') {
      sortableItems.sort((a, b) => {
        const key = sortConfig.key as keyof typeof a;
        // @ts-ignore
        const valA = a[key];
        // @ts-ignore
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

  const totalPages = Math.ceil(sortedApplicants.length / pageSize);

  const requestSort = (key: AnnouncementSortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIcon = (key: AnnouncementSortKey) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const { originSchoolOptions, destinationSchoolOptions, pathwayOptions } = React.useMemo(() => {
    const origins = new Set(relevantApplicants.map(app => app.asalSekolahNama));
    const destinations = new Set(relevantApplicants.map(app => app.sekolahTujuanNama));
    const pathways = new Set(relevantApplicants.map(app => app.jalur));

    return {
        originSchoolOptions: ["Semua Asal Sekolah", ...Array.from(origins).sort()],
        destinationSchoolOptions: ["Semua Sekolah Tujuan", ...Array.from(destinations).sort()],
        pathwayOptions: ["Semua Jalur", ...Array.from(pathways).sort()],
    };
  }, [relevantApplicants]);
  
  const handleDownloadExcel = () => {
    if (!sortedApplicants || sortedApplicants.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Tidak Ada Data',
        description: 'Tidak ada data untuk diunduh berdasarkan filter saat ini.',
      });
      return;
    }

    const dataToExport = sortedApplicants.map((app, index) => {
      const placementChoice = app.schoolSelections.findIndex(s => s.schoolId === app.diterimaDiSekolahId) + 1;
      const totalNilaiRapor = Object.values(app.semesterGrades).reduce((a, b) => a + b, 0);
      const stageName = pathwayToStageNameMap.get(app.jalur) || '-';

      return {
        'No.': index + 1,
        'Nama Pendaftar': app.fullName,
        'NISN': app.nisn,
        'NIK': app.nik || '-',
        'Asal Sekolah': app.asalSekolahNama,
        'Diterima di Sekolah': getSchoolById(app.diterimaDiSekolahId!)?.namaSekolah || '-',
        'Tahap': stageName,
        'Jalur': app.jalur,
        'Pilihan Ke-': placementChoice > 0 ? placementChoice : '-',
        'Peringkat di Sekolah': app.peringkat,
        'Total Nilai Rapor': totalNilaiRapor.toFixed(2),
        'Nilai Prestasi': app.jalur === 'Prestasi' ? (app.nilaiPrestasi || 0) : '-',
        'Nilai Akhir Seleksi': app.finalScore.toFixed(2),
        'Tempat Lahir': app.placeOfBirth || '-',
        'Tanggal Lahir': app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString('id-ID') : '-',
        'Jenis Kelamin': app.gender || '-',
      };
    });

    const worksheet = xlsx.utils.json_to_sheet(dataToExport);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Hasil Seleksi');
    
    const columnWidths = [
      { wch: 5 },   // No.
      { wch: 30 },  // Nama Pendaftar
      { wch: 15 },  // NISN
      { wch: 20 },  // NIK
      { wch: 30 },  // Asal Sekolah
      { wch: 30 },  // Diterima di Sekolah
      { wch: 15 },  // Tahap
      { wch: 20 },  // Jalur
      { wch: 10 },  // Pilihan Ke-
      { wch: 15 },  // Peringkat di Sekolah
      { wch: 15 },  // Total Nilai Rapor
      { wch: 15 },  // Nilai Prestasi
      { wch: 15 },  // Nilai Akhir Seleksi
      { wch: 20 },  // Tempat Lahir
      { wch: 20 },  // Tanggal Lahir
      { wch: 15 },  // Jenis Kelamin
    ];
    worksheet['!cols'] = columnWidths;

    xlsx.writeFile(workbook, 'Hasil_Seleksi_PMB_2026.xlsx');
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className="text-center text-muted-foreground">Memuat pengumuman...</p>;
    }
    
    if (publishedAnnouncements.length === 0) {
      return (
        <p className="text-center text-muted-foreground py-10">
          Belum ada pengumuman yang dipublikasikan saat ini.
        </p>
      );
    }
    
    return (
        <div className="space-y-6">
            <section className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center space-x-2">
                <FilterIcon className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-primary">Filter Hasil Seleksi</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                        placeholder="Cari Nama/NISN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        />
                    </div>
                    <Select value={selectedOriginSchool} onValueChange={setSelectedOriginSchool}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{originSchoolOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={selectedDestinationSchool} onValueChange={setSelectedDestinationSchool}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{destinationSchoolOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={selectedPathway} onValueChange={setSelectedPathway}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{pathwayOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={selectedStage} onValueChange={setSelectedStage}>
                        <SelectTrigger><SelectValue placeholder="Filter Tahap"/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Semua Tahap">Semua Tahap</SelectItem>
                            {allStages.map(stage => <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </section>
            
            <section>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">No.</TableHead>
                                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('fullName')}>
                                  <div className="flex items-center">Nama Pendaftar{getSortIcon('fullName')}</div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('nisn')}>
                                  <div className="flex items-center">NISN{getSortIcon('nisn')}</div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('asalSekolahNama')}>
                                   <div className="flex items-center">Asal Sekolah{getSortIcon('asalSekolahNama')}</div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('diterimaDiSekolahId')}>
                                   <div className="flex items-center">Diterima di Sekolah{getSortIcon('diterimaDiSekolahId')}</div>
                                </TableHead>
                                <TableHead>
                                   <div className="flex items-center">Tahap</div>
                                </TableHead>
                                <TableHead className="cursor-pointer hover:bg-muted/50" onClick={() => requestSort('jalur')}>
                                   <div className="flex items-center">Jalur{getSortIcon('jalur')}</div>
                                </TableHead>
                                <TableHead className="cursor-pointer text-right hover:bg-muted/50" onClick={() => requestSort('finalScore')}>
                                   <div className="flex items-center justify-end">Nilai Akhir{getSortIcon('finalScore')}</div>
                                </TableHead>
                                <TableHead className="cursor-pointer text-center hover:bg-muted/50" onClick={() => requestSort('peringkat')}>
                                   <div className="flex items-center justify-center">Peringkat{getSortIcon('peringkat')}</div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedApplicants.length > 0 ? (
                                paginatedApplicants.map((app, index) => (
                                <TableRow key={app.id}>
                                    <TableCell className="text-center">{(currentPage - 1) * pageSize + index + 1}</TableCell>
                                    <TableCell>
                                        <Link href={`/registration/applicant-detail/${app.id}`} className="font-medium hover:underline text-primary">
                                            {app.fullName}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{app.nisn}</TableCell>
                                    <TableCell>{app.asalSekolahNama}</TableCell>
                                    <TableCell>{getSchoolById(app.diterimaDiSekolahId!)?.namaSekolah}</TableCell>
                                    <TableCell>{pathwayToStageNameMap.get(app.jalur) || '-'}</TableCell>
                                    <TableCell>{app.jalur}</TableCell>
                                    <TableCell className="text-right font-mono">{app.finalScore.toFixed(2)}</TableCell>
                                    <TableCell className="text-center font-mono">{app.peringkat}</TableCell>
                                </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center text-muted-foreground h-24">
                                        Tidak ada pendaftar yang cocok dengan kriteria.
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
        </div>
    );
  };
  
  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-7xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <Megaphone size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Pengumuman Hasil Seleksi</CardTitle>
          <CardDescription className="text-md">
            Informasi hasil akhir kelulusan pendaftar SPMB 2026.
          </CardDescription>
          <div className="flex justify-center pt-4">
            <Button onClick={handleDownloadExcel} disabled={isLoading || sortedApplicants.length === 0}>
              <FileDown className="mr-2 h-4 w-4" />
              Unduh Hasil (Excel)
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-left space-y-8">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
}
