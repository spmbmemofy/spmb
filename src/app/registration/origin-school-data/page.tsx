
"use client";

import * as React from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { Building, Users, AlertCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getApplicants } from "@/lib/applicantService";
import { initialOriginSchoolData, type OriginSchool } from "@/lib/schoolData";
import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import type { Applicant, ApplicantStatus } from "@/lib/types";
import { getUsers } from "@/lib/userService";

const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";

const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
        case "Terverifikasi": return "default";
        case "Menunggu Verifikasi": return "secondary";
        case "Berkas tidak sesuai": return "destructive";
        default: return "secondary";
    }
};

export default function OriginSchoolDataPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);
    const [school, setSchool] = React.useState<OriginSchool | null>(null);
    const [applicants, setApplicants] = React.useState<Applicant[]>([]);

    React.useEffect(() => {
        const credentials = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
        if (!credentials || credentials.role !== 'smp_operator' || !credentials.username) {
            toast({ variant: "destructive", title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengakses halaman ini." });
            router.replace('/registration/home');
            return;
        }

        const allUsers = getUsers();
        const currentUser = allUsers.find(u => u.username === credentials.username);
        
        if (!currentUser || !currentUser.npsn) {
            toast({ variant: "destructive", title: "Data Tidak Lengkap", description: "Akun Anda tidak terhubung dengan sekolah manapun." });
            setIsLoading(false);
            return;
        }

        const userSchool = initialOriginSchoolData.find(s => s.npsn === currentUser.npsn);
        
        if (userSchool) {
            setSchool(userSchool);
        }

        const allApplicants = getApplicants();
        const schoolApplicants = allApplicants.filter(app => app.asalSekolahId === currentUser.npsn);
        setApplicants(schoolApplicants);
        setIsLoading(false);
    }, [router, toast]);

    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-4">
                <p>Memuat data sekolah Anda...</p>
            </div>
        );
    }
    
    if (!school) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-4">
                <Card className="w-full max-w-lg shadow-2xl">
                    <CardHeader>
                        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
                        <CardTitle className="text-center">Sekolah Tidak Ditemukan</CardTitle>
                        <CardDescription className="text-center">
                            Data sekolah yang terhubung dengan akun Anda tidak dapat ditemukan. Silakan hubungi admin.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-5xl shadow-2xl">
                <CardHeader>
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
                            <Building size={28} />
                        </div>
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl font-headline">{school.namaSekolah}</CardTitle>
                            <CardDescription className="text-md mt-1">
                                Berikut adalah data lengkap sekolah Anda dan daftar siswa pendaftar.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-primary">Profil Sekolah</h3>
                        <div className="space-y-2 rounded-md border p-4">
                             <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">NPSN</span><span>{school.npsn}</span></div>
                             <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Status</span><span>{school.status}</span></div>
                             <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Akreditasi</span><span>{school.akreditasi}</span></div>
                             <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Alamat</span><span>{school.alamat}</span></div>
                        </div>
                         <Alert className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Perubahan Data</AlertTitle>
                            <AlertDescription>
                                Untuk mengubah data profil sekolah, silakan hubungi Admin Dinas Pendidikan.
                            </AlertDescription>
                        </Alert>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-primary">Siswa Pendaftar dari {school.namaSekolah}</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Lengkap</TableHead>
                                        <TableHead>NISN</TableHead>
                                        <TableHead>Sekolah Tujuan</TableHead>
                                        <TableHead>Jalur</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applicants.length > 0 ? (
                                        applicants.map(applicant => (
                                            <TableRow key={applicant.id}>
                                                <TableCell className="font-medium">{applicant.fullName}</TableCell>
                                                <TableCell>{applicant.nisn}</TableCell>
                                                <TableCell>{applicant.sekolahTujuanNama}</TableCell>
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
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                Belum ada siswa dari sekolah Anda yang mendaftar.
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
