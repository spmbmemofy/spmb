
"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowUp, ArrowDown, Building, Database, Filter as FilterIcon, Search as SearchIcon, Award, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getSchools, type School } from "@/lib/schoolService";
import { getApplicants, isPriority } from "@/lib/applicantService";
import type { Applicant } from "@/lib/types";
import { getJalur } from "@/lib/pathwayService";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define a type for the ranked applicant data
interface RankedApplicant extends Applicant {
  finalScore: number;
  placementStatus: 'Lulus' | 'Tidak Lulus' | 'Menunggu';
}

// Function to calculate final score for an applicant at a specific school
const calculateScoreForSchool = (applicant: Applicant, schoolId: string): number => {
    const totalNilaiRapor = Object.values(applicant.semesterGrades).reduce((a, b) => a + b, 0);
    const nilaiPrestasi = applicant.jalur === 'Prestasi' ? (applicant.nilaiPrestasi || 0) : 0;
    const isFirstChoice = applicant.schoolSelections && applicant.schoolSelections[0]?.schoolId === schoolId;
    const nilaiTambahan = isFirstChoice ? 25 : 0;
    return totalNilaiRapor + nilaiPrestasi + nilaiTambahan;
};

export default function RankingProcessPage() {
  const [rankedApplicants, setRankedApplicants] = React.useState<RankedApplicant[]>([]);
  const [schools, setSchools] = React.useState<School[]>([]);
  const [jalurOptions, setJalurOptions] = React.useState<string[]>([]);
  
  const [selectedSchool, setSelectedSchool] = React.useState("Semua Sekolah");
  const [selectedJalur, setSelectedJalur] = React.useState("Semua Jalur");
  const [searchTerm, setSearchTerm] = React.useState("");

  React.useEffect(() => {
    const allApplicants = getApplicants();
    const allSchools = getSchools();
    setSchools(allSchools.filter(s => s.jenjang !== 'SMP'));
    setJalurOptions(["Semua Jalur", ...getJalur().map(j => j.name)]);

    // Process applicants for ranking
    const processedApplicants: RankedApplicant[] = allApplicants
      .filter(app => app.statusVerifikasi === 'Terverifikasi')
      .map(app => {
        let finalScore = 0;
        if (app.diterimaDiSekolahId) {
            finalScore = calculateScoreForSchool(app, app.diterimaDiSekolahId);
        } else if (app.schoolSelections && app.schoolSelections.length > 0) {
            // Calculate score for their first choice if not placed
            finalScore = calculateScoreForSchool(app, app.schoolSelections[0].schoolId);
        }

        const placementStatus = app.diterimaDiSekolahId ? 'Lulus' : 'Tidak Lulus';
        
        return {
          ...app,
          finalScore,
          placementStatus,
        };
      })
      .sort((a, b) => {
        if (a.diterimaDiSekolahId && !b.diterimaDiSekolahId) return -1;
        if (!a.diterimaDiSekolahId && b.diterimaDiSekolahId) return 1;
        if (a.diterimaDiSekolahId && b.diterimaDiSekolahId) {
            if (a.diterimaDiSekolahId !== b.diterimaDiSekolahId) {
                return a.diterimaDiSekolahId.localeCompare(b.diterimaDiSekolahId);
            }
            return (a.peringkat || Infinity) - (b.peringkat || Infinity);
        }
        return b.finalScore - a.finalScore; // For unplaced students, sort by score descending
      });

    setRankedApplicants(processedApplicants);
  }, []);

  const filteredAndSortedApplicants = React.useMemo(() => {
    return rankedApplicants
      .filter(applicant => {
        const schoolMatch = selectedSchool === "Semua Sekolah" || applicant.diterimaDiSekolahId === selectedSchool;
        const jalurMatch = selectedJalur === "Semua Jalur" || applicant.jalur === selectedJalur;
        const searchMatch =
          searchTerm === "" ||
          applicant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          applicant.nisn.includes(searchTerm);
        return schoolMatch && jalurMatch && searchMatch;
      });
  }, [rankedApplicants, selectedSchool, selectedJalur, searchTerm]);
  
  const getPlacementSchool = (applicant: RankedApplicant): School | undefined => {
      if (!applicant.diterimaDiSekolahId) return undefined;
      return schools.find(s => s.id === applicant.diterimaDiSekolahId);
  }

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-7xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
              <Award size={28} />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-headline">Hasil Akhir dan Proses Seleksi</CardTitle>
              <CardDescription className="text-md mt-1">
                Lihat hasil akhir penempatan siswa di seluruh sekolah berdasarkan peringkat.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold text-primary">Filter Hasil Seleksi</h3>
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
              <Select value={selectedSchool} onValueChange={setSelectedSchool}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter Sekolah Penempatan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua Sekolah">Semua Sekolah</SelectItem>
                  {schools.map(school => <SelectItem key={school.id} value={school.id}>{school.namaSekolah}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={selectedJalur} onValueChange={setSelectedJalur}>
                <SelectTrigger>
                    <SelectValue placeholder="Filter Jalur Pendaftaran" />
                </SelectTrigger>
                <SelectContent>
                  {jalurOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center w-[50px]">No.</TableHead>
                    <TableHead>Nama Lengkap</TableHead>
                    <TableHead>NISN</TableHead>
                    <TableHead>Jalur</TableHead>
                    <TableHead>Sekolah Penempatan</TableHead>
                    <TableHead className="text-center">Peringkat</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedApplicants.length > 0 ? (
                    filteredAndSortedApplicants.map((applicant, index) => {
                      const placementSchool = getPlacementSchool(applicant);
                      return (
                        <TableRow key={applicant.id}>
                          <TableCell className="text-center">{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            <Link href={`/registration/applicant-detail/${applicant.id}`} className="hover:underline text-primary">
                              {applicant.fullName}
                            </Link>
                          </TableCell>
                          <TableCell>{applicant.nisn}</TableCell>
                          <TableCell>{applicant.jalur}</TableCell>
                          <TableCell>
                            {placementSchool ? (
                              <Link href={`/registration/school/${placementSchool.id}`} className="hover:underline text-primary flex items-center">
                                <Building className="mr-2 h-4 w-4 opacity-70" />
                                {placementSchool.namaSekolah}
                              </Link>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {applicant.peringkat ?? '-'}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={applicant.placementStatus === 'Lulus' ? 'default' : 'destructive'}>
                              {applicant.placementStatus}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground h-24"> 
                        Tidak ada data pendaftar yang cocok dengan kriteria filter.
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
