
"use client"

import * as React from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { TrendingUp, Users, School, BookOpen, Star, UserCheck } from 'lucide-react';
import { getSchools } from '@/lib/schoolService';
import { getApplicants } from '@/lib/applicantService';
import type { Applicant, Jalur } from '@/lib/types';

// This is example data. The chart will be empty if there are no real applicants.
const barChartExampleData = [
  { date: '1 Jul', pendaftar: 25 },
  { date: '2 Jul', pendaftar: 32 },
  { date: '3 Jul', pendaftar: 45 },
  { date: '4 Jul', pendaftar: 60 },
  { date: '5 Jul', pendaftar: 55 },
  { date: '6 Jul', pendaftar: 72 },
  { date: '7 Jul', pendaftar: 81 },
];

const barChartConfig = {
  pendaftar: {
    label: 'Pendaftar',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function HomePage() {
  const [allApplicants, setAllApplicants] = React.useState<Applicant[]>([]);
  const [schools, setSchools] = React.useState<ReturnType<typeof getSchools>>([]);

  React.useEffect(() => {
    setAllApplicants(getApplicants());
    setSchools(getSchools());
  }, []);

  const schoolStats = React.useMemo(() => {
     const schoolsWithPendaftar = schools.map(school => {
        const pendaftarCount = allApplicants.filter(app => {
            const hasChosenSchool = app.schoolSelections?.some(sel => sel.schoolId === school.id);
            return school.jenjang !== 'SMP' && hasChosenSchool;
        }).length;

        const asalSekolahCount = allApplicants.filter(app => app.asalSekolahId === school.id).length;
        
        const finalPendaftarCount = school.jenjang === 'SMP' ? asalSekolahCount : pendaftarCount;

        const terverifikasi = allApplicants.filter(app => app.asalSekolahId === school.id && app.statusVerifikasi === 'Terverifikasi').length;
        const prosesVerifikasi = asalSekolahCount - terverifikasi;

        return { ...school, jumlahPendaftar: finalPendaftarCount, terverifikasi, prosesVerifikasi };
    });

    const destinationSchools = schoolsWithPendaftar
      .filter(s => s.jenjang !== 'SMP')
      .sort((a, b) => (b.jumlahPendaftar || 0) - (a.jumlahPendaftar || 0));

    const originSchools = schoolsWithPendaftar
      .filter(s => s.jenjang === 'SMP')
      .sort((a, b) => (b.jumlahPendaftar || 0) - (a.jumlahPendaftar || 0));

    return { destinationSchools, originSchools };
  }, [allApplicants, schools]);


  const globalStats = React.useMemo(() => {
    if (allApplicants.length === 0) {
      return {
        totalPendaftar: 0,
        kuotaTerisi: 0,
        totalKuota: 0,
        persentaseKuota: "0.0",
        sekolahTujuanTeratas: '-',
        sekolahAsalTeratas: '-',
        menungguVerifikasi: 0,
        jalurFavorit: '-',
        jalurDistribution: [],
        terverifikasi: 0,
        jumlahSiswa: 0,
        belumAktivasi: 0,
        belumMendaftar: 0,
      };
    }
    
    // Total pendaftar is the unique set of applicants
    const totalPendaftar = new Set(allApplicants.map(app => app.id)).size;
    const totalKuota = schoolStats.destinationSchools.reduce((acc, school) => acc + (school.kuota || 0), 0);
    const kuotaTerisi = Math.min(totalPendaftar, totalKuota);
    const persentaseKuota = totalKuota > 0 ? ((kuotaTerisi / totalKuota) * 100).toFixed(1) : "0.0";
    
    const sekolahTujuanTeratas = schoolStats.destinationSchools[0]?.namaSekolah || '-';
    const sekolahAsalTeratas = schoolStats.originSchools[0]?.namaSekolah || '-';
    
    const menungguVerifikasi = allApplicants.filter(app => app.statusVerifikasi === "Menunggu Verifikasi").length;

    const jalurCounts = allApplicants.reduce((acc, app) => {
        acc[app.jalur] = (acc[app.jalur] || 0) + 1;
        return acc;
    }, {} as Record<Jalur, number>);
    
    const jalurFavorit = Object.keys(jalurCounts).length > 0
        ? Object.entries(jalurCounts).sort((a, b) => b[1] - a[1])[0][0]
        : '-';

    const jalurDistribution = Object.entries(jalurCounts).map(([name, value]) => ({ name: name.toLowerCase(), value, fill: `var(--color-${name.toLowerCase()})` }));

    const terverifikasi = allApplicants.filter(app => app.statusVerifikasi === 'Terverifikasi').length;
    const jumlahSiswa = totalPendaftar;
    const belumAktivasi = 0; // Placeholder
    const belumMendaftar = 0; // Placeholder

    return { 
        totalPendaftar, 
        kuotaTerisi, 
        totalKuota, 
        persentaseKuota, 
        sekolahTujuanTeratas, 
        sekolahAsalTeratas, 
        menungguVerifikasi, 
        jalurFavorit, 
        jalurDistribution,
        terverifikasi,
        jumlahSiswa,
        belumAktivasi,
        belumMendaftar,
    };
  }, [allApplicants, schoolStats]);
  
  const pieChartConfig = {
    pendaftar: { label: "Pendaftar" },
    afirmasi: { label: "Afirmasi", color: "hsl(var(--chart-1))" },
    mutasi: { label: "Mutasi", color: "hsl(var(--chart-2))" },
    prestasi: { label: "Prestasi", color: "hsl(var(--chart-3))" },
    domisili: { label: "Domisili", color: "hsl(var(--chart-4))" },
  } satisfies ChartConfig;

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold font-headline">Beranda Dasbor</h1>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Ringkasan Status Pendaftar</CardTitle>
            <CardDescription>
              Ringkasan keseluruhan status pendaftar dalam sistem.
              <br />
              <span className="text-xs text-muted-foreground">*Data 'Belum Aktivasi' dan 'Belum Mendaftar' adalah placeholder karena tidak tersedia di sistem saat ini.</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center">Jumlah Siswa</TableHead>
                  <TableHead className="text-center">Belum Aktivasi</TableHead>
                  <TableHead className="text-center">Belum Mendaftar</TableHead>
                  <TableHead className="text-center">Menunggu Verifikasi</TableHead>
                  <TableHead className="text-center">Terverifikasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-center text-lg font-bold">{globalStats.jumlahSiswa}</TableCell>
                  <TableCell className="text-center text-lg font-bold">{globalStats.belumAktivasi}</TableCell>
                  <TableCell className="text-center text-lg font-bold">{globalStats.belumMendaftar}</TableCell>
                  <TableCell className="text-center text-lg font-bold">{globalStats.menungguVerifikasi}</TableCell>
                  <TableCell className="text-center text-lg font-bold">{globalStats.terverifikasi}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.totalPendaftar}</div>
            <p className="text-xs text-muted-foreground">{allApplicants.length > 0 ? "+5% dari kemarin" : "Belum ada data"}</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kuota Terisi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.persentaseKuota}%</div>
            <p className="text-xs text-muted-foreground">{globalStats.kuotaTerisi} dari {globalStats.totalKuota} total kuota</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalStats.menungguVerifikasi}</div>
            <p className="text-xs text-muted-foreground">Pendaftar perlu ditinjau</p>
          </CardContent>
        </Card>
         <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jalur Favorit</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{globalStats.jalurFavorit}</div>
            <p className="text-xs text-muted-foreground">Paling banyak dipilih</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sekolah Tujuan Teratas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{globalStats.sekolahTujuanTeratas}</div>
            <p className="text-xs text-muted-foreground">Paling banyak diminati</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sekolah Asal Teratas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{globalStats.sekolahAsalTeratas}</div>
            <p className="text-xs text-muted-foreground">Pendaftar terbanyak</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Statistik Pendaftar Harian</CardTitle>
             <CardDescription>
                Data pendaftar harian akan ditampilkan di sini saat pendaftaran dimulai.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            {allApplicants.length > 0 ? (
                <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                <BarChart data={barChartExampleData} margin={{ top: 20, right: 20, bottom: 5, left: -10 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    />
                        <YAxis 
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Bar dataKey="pendaftar" fill="var(--color-pendaftar)" radius={4} />
                </BarChart>
                </ChartContainer>
            ) : (
                <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
                    Belum ada data pendaftar.
                </div>
            )}
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 flex flex-col">
           <CardHeader>
            <CardTitle>Distribusi Pendaftar per Jalur</CardTitle>
            <CardDescription>Visualisasi pembagian pendaftar berdasarkan jalur yang dipilih.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex items-center justify-center pb-0">
            {allApplicants.length > 0 ? (
                <ChartContainer
                config={pieChartConfig}
                className="mx-auto aspect-square h-full max-h-[250px]"
                >
                <PieChart>
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel nameKey="value" />}
                    />
                    <Pie
                    data={globalStats.jalurDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    strokeWidth={5}
                    />
                </PieChart>
                </ChartContainer>
            ) : (
                <div className="text-muted-foreground">Belum ada data.</div>
            )}
          </CardContent>
           <CardFooter className="flex-col gap-2 text-sm pt-4">
            <div className="flex w-full items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                Afirmasi
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                Mutasi
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
                Prestasi
              </div>
               <div className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-4))' }} />
                Domisili
              </div>
            </div>
          </CardFooter>
        </Card>
      </section>
      
      <section className="grid gap-6 grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Peringkat Sekolah Tujuan</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[50px]">Peringkat</TableHead>
                  <TableHead>Nama Sekolah</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead className="text-right">Kuota</TableHead>
                  <TableHead className="text-right">Jml. Pendaftar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolStats.destinationSchools.length > 0 ? (
                    schoolStats.destinationSchools.slice(0, 5).map((school, index) => (
                    <TableRow key={school.id}>
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell>
                        <Link href={`/registration/school/${school.id}`} className="font-medium hover:underline text-primary">{school.namaSekolah}</Link>
                        </TableCell>
                        <TableCell>{school.alamat}</TableCell>
                        <TableCell className="text-right">{school.kuota || '-'}</TableCell>
                        <TableCell className="text-right font-bold">{school.jumlahPendaftar}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Belum ada data sekolah tujuan.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Peringkat Sekolah Asal</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-center w-[50px]">Peringkat</TableHead>
                  <TableHead>Nama Sekolah</TableHead>
                  <TableHead>Alamat</TableHead>
                  <TableHead className="text-right">Terverifikasi</TableHead>
                  <TableHead className="text-right">Proses Verifikasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                 {schoolStats.originSchools.length > 0 ? (
                    schoolStats.originSchools.slice(0, 5).map((school, index) => (
                    <TableRow key={school.npsn}>
                        <TableCell className="text-center font-medium">{index + 1}</TableCell>
                        <TableCell>
                        <Link href={`/registration/origin-school/${school.id}`} className="font-medium hover:underline text-primary">{school.namaSekolah}</Link>
                        </TableCell>
                        <TableCell>{school.alamat}</TableCell>
                        <TableCell className="text-right">{school.terverifikasi}</TableCell>
                        <TableCell className="text-right">{school.prosesVerifikasi}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Belum ada data sekolah asal.
                        </TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
