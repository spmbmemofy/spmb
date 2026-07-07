
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
                <Card className="shadow-lg border-none bg-transparent shadow-none">
                    <CardHeader className="text-center">
                         <div className="mx-auto bg-primary text-primary-foreground rounded-full p-4 w-fit mb-6">
                            <SchoolIcon size={48} />
                        </div>
                        <CardTitle className="text-4xl font-extrabold tracking-tight">Daftar Sekolah Tujuan</CardTitle>
                        <CardDescription className="text-lg">Jelajahi semua sekolah SMA dan SMK yang tersedia di Kabupaten Berau.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 mb-10 bg-card p-6 rounded-2xl shadow-md border">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input 
                                    placeholder="Cari nama sekolah..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 h-12"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Select value={jenjangFilter} onValueChange={setJenjangFilter}>
                                    <SelectTrigger className="w-full sm:w-[160px] h-12">
                                        <SelectValue placeholder="Filter Jenjang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Semua">Semua Jenjang</SelectItem>
                                        <SelectItem value="SMA">SMA</SelectItem>
                                        <SelectItem value="SMK">SMK</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={kecamatanFilter} onValueChange={setKecamatanFilter}>
                                    <SelectTrigger className="w-full sm:w-[220px] h-12">
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
                                    <Card key={school.id} className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col border-none bg-card">
                                        <div className="relative h-48 bg-muted">
                                            <Image
                                                src={`https://placehold.co/800x450.png`}
                                                alt={`Foto ${school.namaSekolah}`}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                                data-ai-hint="school building"
                                            />
                                            <div className="absolute top-4 right-4">
                                                <Badge className="bg-primary/90 backdrop-blur-sm px-3 py-1">{school.jenjang}</Badge>
                                            </div>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-xl line-clamp-1">{school.namaSekolah}</CardTitle>
                                            <CardDescription className="flex items-center gap-1">
                                                <Filter className="h-3 w-3" />
                                                {school.kecamatan}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex-grow space-y-4 pt-2">
                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                <div className="bg-muted/50 p-2 rounded-lg">
                                                    <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Kuota</p>
                                                    <p className="text-lg font-bold">{school.kuota || '-'}</p>
                                                </div>
                                                <div className="bg-muted/50 p-2 rounded-lg">
                                                    <p className="text-muted-foreground text-xs uppercase font-bold tracking-wider">Akreditasi</p>
                                                    <p className="text-lg font-bold">{school.akreditasi}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="pt-0 pb-6 px-6">
                                            <Button asChild className="w-full h-11 rounded-xl" variant="outline">
                                                <Link href={`/school/${school.id}`}>
                                                    Lihat Profil
                                                    <ArrowRight className="ml-2 h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </CardFooter>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-24 bg-card rounded-3xl border border-dashed">
                                <SchoolIcon className="mx-auto h-16 w-16 text-muted-foreground mb-4 opacity-20" />
                                <p className="text-2xl font-bold text-muted-foreground">Sekolah tidak ditemukan</p>
                                <p className="text-muted-foreground mt-2">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
                                <Button variant="link" onClick={() => {setSearchTerm(''); setJenjangFilter('Semua'); setKecamatanFilter('Semua')}} className="mt-4">
                                    Reset Semua Filter
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
