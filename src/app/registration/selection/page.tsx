
"use client";

import * as React from "react";
import Link from "next/link";
import { ClipboardList } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { generateAllMockApplicants } from "@/lib/mockData";
import { initialSchoolData } from "@/lib/schoolData";
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
  const [applicants, setApplicants] = React.useState<Applicant[]>([]);
  const [schoolName, setSchoolName] = React.useState("");

  React.useEffect(() => {
    const allApplicants = generateAllMockApplicants();
    const verifierSchoolApplicants = allApplicants.filter(app => app.sekolahTujuanId === VERIFIER_SCHOOL_ID);
    setApplicants(verifierSchoolApplicants);

    const school = initialSchoolData.find(s => s.id === VERIFIER_SCHOOL_ID);
    setSchoolName(school?.namaSekolah || "Sekolah Tidak Ditemukan");
  }, []);


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
                Klik nama pendaftar untuk melihat detail dan melakukan verifikasi. Sekolah: <span className="font-semibold">{schoolName}</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
                {applicants.length > 0 ? (
                  applicants.map((applicant, index) => (
                    <TableRow key={applicant.id}>
                      <TableCell className="text-center">{index + 1}</TableCell>
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
                      Belum ada pendaftar untuk sekolah ini.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
