
"use client";

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { School as SchoolIcon, ArrowLeft, Users, CheckCircle, MapPin, Phone, Award, ClipboardList, Building2 } from 'lucide-react';

import { getSchoolById, type School } from '@/lib/schoolService';
import { getApplicants } from '@/lib/applicantService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

export default function SchoolDetailPage() {
    const params = useParams();
    const router = useRouter();
    const schoolId = params.id as string;

    const [school, setSchool] = React.useState<School | null>(null);
    const [applicantCount, setApplicantCount] = React.useState(0);
    const [isLoading, setIsLoading] = React.useState(true);

    React.useEffect(() => {
        if (schoolId) {
            const foundSchool = getSchoolById(schoolId);
            setSchool(foundSchool || null);

            if (foundSchool) {
                const allApplicants = getApplicants();
                const count = allApplicants.filter(app => 
                    app.schoolSelections?.some(sel => sel.schoolId === schoolId)
                ).length;
                setApplicantCount(count);
            }
        }
        setIsLoading(false);
    }, [schoolId]);

    if (isLoading) {
        return <div className="flex flex-1 items-center justify-center p-4">Memuat data sekolah...</div>;
    }

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
                        <Button className="mx-auto" onClick={() => router.back()}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }
    
    const quotaFilledPercentage = school.kuota && school.kuota > 0 ? ((applicantCount / school.kuota) * 100).toFixed(1) : 0;

    return (
        <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-5xl space-y-8">
                <Card className="w-full shadow-2xl overflow-hidden">
                    <div className="relative h-48 sm:h-64 bg-muted">
                        <Image 
                            src={`https://placehold.co/1200x400.png`}
                            alt={`Foto ${school.namaSekolah}`}
                            fill
                            className="object-cover"
                            data-ai-hint="school building photo"
                        />
                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                         <div className="absolute bottom-0 left-0 p-6">
                            <Badge variant={school.jenis === 'Negeri' ? 'default' : 'secondary'} className="text-sm mb-2">{school.jenis}</Badge>
                            <h1 className="text-3xl sm:text-4xl font-bold text-white shadow-lg">{school.namaSekolah}</h1>
                            <p className="text-lg text-white/90 mt-1">{school.alamat}</p>
                         </div>
                    </div>
                     <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3">
                            <Users className="h-8 w-8 text-primary"/>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Pendaftar</p>
                                <p className="text-xl font-bold">{applicantCount}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <CheckCircle className="h-8 w-8 text-primary"/>
                            <div>
                                <p className="text-sm text-muted-foreground">Total Kuota</p>
                                <p className="text-xl font-bold">{school.kuota || '-'}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-3">
                            <Award className="h-8 w-8 text-primary"/>
                            <div>
                                <p className="text-sm text-muted-foreground">Akreditasi</p>
                                <p className="text-xl font-bold">{school.akreditasi}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone className="h-8 w-8 text-primary"/>
                            <div>
                                <p className="text-sm text-muted-foreground">Telepon</p>
                                <p className="text-xl font-bold">{school.telepon}</p>
                            </div>
                        </div>
                     </CardContent>
                </Card>
                
                {school.jenjang === 'SMK' && school.majors && school.majors.length > 0 && (
                    <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center"><ClipboardList className="mr-3 h-6 w-6 text-primary"/>Jurusan Tersedia</CardTitle>
                            <CardDescription>Berikut adalah daftar jurusan yang dibuka beserta rincian kuota per jalur pendaftaran.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="font-semibold">Nama Jurusan</TableHead>
                                            <TableHead className="text-center font-semibold">Afirmasi</TableHead>
                                            <TableHead className="text-center font-semibold">Mutasi</TableHead>
                                            <TableHead className="text-center font-semibold">Prestasi</TableHead>
                                            <TableHead className="text-center font-semibold">Domisili</TableHead>
                                            <TableHead className="text-center font-semibold">Total Kuota</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {school.majors.map(major => (
                                            <TableRow key={major.id}>
                                                <TableCell className="font-medium">{major.name}</TableCell>
                                                <TableCell className="text-center">{major.quota.afirmasi}</TableCell>
                                                <TableCell className="text-center">{major.quota.mutasi}</TableCell>
                                                <TableCell className="text-center">{major.quota.prestasi}</TableCell>
                                                <TableCell className="text-center">{major.quota.domisili}</TableCell>
                                                <TableCell className="text-center font-bold">{Object.values(major.quota).reduce((a, b) => a + b, 0)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}
                
                {school.jenjang === 'SMA' && school.jalurKuota && (
                     <Card className="shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center"><ClipboardList className="mr-3 h-6 w-6 text-primary"/>Kuota Pendaftaran</CardTitle>
                            <CardDescription>Berikut adalah rincian kuota pendaftaran berdasarkan jalur yang tersedia.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                {Object.entries(school.jalurKuota).map(([jalur, kuota]) => (
                                    <div key={jalur} className="p-4 rounded-lg bg-muted">
                                        <p className="text-sm font-medium capitalize text-muted-foreground">{jalur}</p>
                                        <p className="text-3xl font-bold mt-1">{kuota}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
