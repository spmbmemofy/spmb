
"use client";

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { School as SchoolIcon, ArrowRight, Search, Filter } from 'lucide-react';

import { getSchools, type School } from '@/lib/schoolService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function SchoolListPage() {
    const [schools, setSchools] = React.useState<School[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [jenjangFilter, setJenjangFilter] = React.useState('Semua');
    const [kecamatanFilter, setKecamatanFilter] = React.useState('Semua');

    React.useEffect(() => {
        const allSchools = getSchools();
        const destinationSchools = allSchools.filter(s => s.jenjang === 'SMA' || s.jenjang === 'SMK');
        setSchools(destinationSchools);
    }, []);

    const kecamatanOptions = React.useMemo(() => {
        const allKecamatan = schools.map(s => s.kecamatan);
        return ['Semua', ...Array.from(new Set(allKecamatan)).sort()];
    }, [schools]);

    const filteredSchools = React.useMemo(() => {
        return schools.filter(school => {
            const searchMatch = school.namaSekolah.toLowerCase().includes(searchTerm.toLowerCase());
            const jenjangMatch = jenjangFilter === 'Semua' || school.jenjang === jenjangFilter;
            const kecamatanMatch = kecamatanFilter === 'Semua' || school.kecamatan === kecamatanFilter;
            return searchMatch && jenjangMatch && kecamatanMatch;
        });
    }, [schools, searchTerm, jenjangFilter, kecamatanFilter]);

    return (
        <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
            <div className="w-full max-w-6xl space-y-8">
                <Card className="shadow-lg">
                    <CardHeader className="text-center">
                         <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                            <SchoolIcon size={40} />
                        </div>
                        <CardTitle className="text-3xl font-bold">Daftar Sekolah Tujuan</CardTitle>
                        <CardDescription>Jelajahi semua sekolah SMA dan SMK yang tersedia dalam pendaftaran tahun ini.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col sm:flex-row gap-4 mb-8">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Cari nama sekolah..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 text-base"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Select value={jenjangFilter} onValueChange={setJenjangFilter}>
                                    <SelectTrigger className="w-full sm:w-[150px]">
                                        <SelectValue placeholder="Filter Jenjang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Semua">Semua Jenjang</SelectItem>
                                        <SelectItem value="SMA">SMA</SelectItem>
                                        <SelectItem value="SMK">SMK</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={kecamatanFilter} onValueChange={setKecamatanFilter}>
                                    <SelectTrigger className="w-full sm:w-[200px]">
                                        <SelectValue placeholder="Filter Kecamatan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {kecamatanOptions.map(kec => (
                                            <SelectItem key={kec} value={kec}>{kec}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {filteredSchools.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredSchools.map((school) => (
                                    <Card key={school.id} className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col">
                                        <div className="relative h-40">
                                            <Image
                                                src={`https://placehold.co/600x400.png`}
                                                alt={`Foto ${school.namaSekolah}`}
                                                fill
                                                className="object-cover"
                                                data-ai-hint="school building"
                                            />
                                        </div>
                                        <CardHeader>
                                            <CardTitle className="text-lg">{school.namaSekolah}</CardTitle>
                                            <CardDescription>{school.kecamatan}</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow">
                                            <div className="flex justify-between items-center text-sm text-muted-foreground">
                                                <span>Total Kuota</span>
                                                <span className="font-bold text-foreground">{school.kuota || '-'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm text-muted-foreground mt-2">
                                                <span>Akreditasi</span>
                                                <span className="font-bold text-foreground">{school.akreditasi}</span>
                                            </div>
                                        </CardContent>
                                        <CardFooter>
                                            <Button asChild className="w-full" variant="outline">
                                                <Link href={`/school/${school.id}`}>
                                                    Lihat Detail Sekolah
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-muted-foreground">
                                <p className="text-lg font-medium">Sekolah tidak ditemukan</p>
                                <p>Tidak ada sekolah yang cocok dengan kriteria pencarian atau filter Anda.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
