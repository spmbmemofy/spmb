
"use client"

import * as React from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, PieChart, Pie } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { TrendingUp, Users, School, BookOpen, Star, UserCheck } from 'lucide-react';
import { initialSchoolData, initialOriginSchoolData } from '@/lib/schoolData';
import { generateAllMockApplicants } from '@/lib/mockData';
import type { Applicant, Jalur } from '@/lib/types';


const barChartData = [
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

  React.useEffect(() => {
    // In a real app, this would be a fetch call.
    // For now, we generate mock data once on component mount.
    setAllApplicants(generateAllMockApplicants());
  }, []);

  const stats = React.useMemo(() => {
    if (allApplicants.length === 0) {
      return {
        totalPendaftar: 0,
        kuotaTerisi: 0,
        persentaseKuota: "0.0",
        sekolahTujuanTeratas: '-',
        sekolahAsalTeratas: '-',
        menungguVerifikasi: 0,
        jalurFavorit: '-',
        jalurDistribution: [],
      };
    }

    const totalPendaftar = allApplicants.length;
    const totalKuota = initialSchoolData.reduce((acc, school) => acc + school.kuota, 0);
    const kuotaTerisi = Math.min(totalPendaftar, totalKuota);
    const persentaseKuota = totalKuota > 0 ? ((kuotaTerisi / totalKuota) * 100).toFixed(1) : "0.0";
    
    const sortedSchoolsByDestination = [...initialSchoolData].sort((a, b) => b.jumlahPendaftar - a.jumlahPendaftar);
    const sekolahTujuanTeratas = sortedSchoolsByDestination[0]?.namaSekolah || '-';

    const sortedSchoolsByOrigin = [...initialOriginSchoolData].sort((a, b) => b.jumlahPendaftar - a.jumlahPendaftar);
    const sekolahAsalTeratas = sortedSchoolsByOrigin[0]?.namaSekolah || '-';
    
    const menungguVerifikasi = allApplicants.filter(app => app.statusVerifikasi === "Menunggu Verifikasi").length;

    const jalurCounts = allApplicants.reduce((acc, app) => {
        acc[app.jalur] = (acc[app.jalur] || 0) + 1;
        return acc;
    }, {} as Record<Jalur, number>);
    
    const jalurFavorit = Object.keys(jalurCounts).length > 0
        ? Object.entries(jalurCounts).sort((a, b) => b[1] - a[1])[0][0]
        : '-';

    const jalurDistribution = Object.entries(jalurCounts).map(([name, value]) => ({ name, value, fill: `var(--color-${name.toLowerCase()})` }));

    return { totalPendaftar, kuotaTerisi, totalKuota, persentaseKuota, sekolahTujuanTeratas, sekolahAsalTeratas, menungguVerifikasi, jalurFavorit, jalurDistribution };
  }, [allApplicants]);
  
  const pieChartConfig = {
    pendaftar: { label: "Pendaftar" },
    Afirmasi: { label: "Afirmasi", color: "hsl(var(--chart-1))" },
    Mutasi: { label: "Mutasi", color: "hsl(var(--chart-2))" },
    Prestasi: { label: "Prestasi", color: "hsl(var(--chart-3))" },
    Domisili: { label: "Domisili", color: "hsl(var(--chart-4))" },
  } satisfies ChartConfig;


  const sortedSchoolsByDestination = [...initialSchoolData].sort((a, b) => b.jumlahPendaftar - a.jumlahPendaftar).slice(0, 5);
  const sortedSchoolsByOrigin = [...initialOriginSchoolData].sort((a, b) => b.jumlahPendaftar - a.jumlahPendaftar).slice(0, 5);

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold font-headline">Beranda Dasbor</h1>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPendaftar}</div>
            <p className="text-xs text-muted-foreground">+5% dari kemarin</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kuota Terisi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.persentaseKuota}%</div>
            <p className="text-xs text-muted-foreground">{stats.kuotaTerisi} dari {stats.totalKuota} total kuota</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.menungguVerifikasi}</div>
            <p className="text-xs text-muted-foreground">Pendaftar perlu ditinjau</p>
          </CardContent>
        </Card>
         <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Jalur Favorit</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{stats.jalurFavorit}</div>
            <p className="text-xs text-muted-foreground">Paling banyak dipilih</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sekolah Tujuan Teratas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{stats.sekolahTujuanTeratas}</div>
            <p className="text-xs text-muted-foreground">Paling banyak diminati</p>
          </CardContent>
        </Card>
        <Card className="xl:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sekolah Asal Teratas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{stats.sekolahAsalTeratas}</div>
            <p className="text-xs text-muted-foreground">Pendaftar terbanyak</p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Statistik Pendaftar Harian</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={barChartConfig} className="h-[250px] w-full">
              <BarChart data={barChartData} margin={{ top: 20, right: 20, bottom: 5, left: -10 }}>
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
          </CardContent>
        </Card>
        <Card className="lg:col-span-2 flex flex-col">
           <CardHeader>
            <CardTitle>Distribusi Pendaftar per Jalur</CardTitle>
            <CardDescription>Visualisasi pembagian pendaftar berdasarkan jalur yang dipilih.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
             <ChartContainer
              config={pieChartConfig}
              className="mx-auto aspect-square h-[200px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="value" />}
                />
                <Pie
                  data={stats.jalurDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                />
              </PieChart>
            </ChartContainer>
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
                {sortedSchoolsByDestination.map((school, index) => (
                  <TableRow key={school.id}>
                    <TableCell className="text-center font-medium">{index + 1}</TableCell>
                    <TableCell>
                      <Link href={`/registration/school/${school.id}`} className="font-medium hover:underline text-primary">{school.namaSekolah}</Link>
                    </TableCell>
                    <TableCell>{school.alamat}</TableCell>
                    <TableCell className="text-right">{school.kuota}</TableCell>
                    <TableCell className="text-right font-bold">{school.jumlahPendaftar}</TableCell>
                  </TableRow>
                ))}
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
                  <TableHead>Nama Sekolah</TableHead>
                  <TableHead className="text-right">Jumlah Pendaftar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSchoolsByOrigin.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>
                       <Link href={`/registration/origin-school/${school.id}`} className="font-medium hover:underline text-primary">{school.namaSekolah}</Link>
                    </TableCell>
                    <TableCell className="text-right">{school.jumlahPendaftar}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
