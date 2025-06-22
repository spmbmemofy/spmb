
"use client"

import * as React from 'react';
import Link from 'next/link';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { TrendingUp, Users, School, BookOpen } from 'lucide-react';
import { initialSchoolData } from '@/lib/schoolData';
import { initialOriginSchoolData } from '@/lib/schoolData';

const chartData = [
  { date: '1 Jul', pendaftar: 25 },
  { date: '2 Jul', pendaftar: 32 },
  { date: '3 Jul', pendaftar: 45 },
  { date: '4 Jul', pendaftar: 60 },
  { date: '5 Jul', pendaftar: 55 },
  { date: '6 Jul', pendaftar: 72 },
  { date: '7 Jul', pendaftar: 81 },
];

const chartConfig = {
  pendaftar: {
    label: 'Pendaftar',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

export default function HomePage() {

  const sortedSchoolsByDestination = [...initialSchoolData].sort((a, b) => b.jumlahPendaftar - a.jumlahPendaftar).slice(0, 5);
  const sortedSchoolsByOrigin = [...initialOriginSchoolData].sort((a, b) => b.jumlahPendaftar - a.jumlahPendaftar).slice(0, 5);
  const totalPendaftar = initialOriginSchoolData.reduce((acc, school) => acc + school.jumlahPendaftar, 0);
  const totalKuota = initialSchoolData.reduce((acc, school) => acc + school.kuota, 0);
  const kuotaTerisi = Math.min(totalPendaftar, totalKuota); // simple logic
  const persentaseKuota = totalKuota > 0 ? ((kuotaTerisi / totalKuota) * 100).toFixed(1) : "0.0";
  const sekolahTujuanTeratas = sortedSchoolsByDestination[0]?.namaSekolah || '-';
  const sekolahAsalTeratas = sortedSchoolsByOrigin[0]?.namaSekolah || '-';


  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8 space-y-6">
      <h1 className="text-2xl sm:text-3xl font-bold font-headline">Beranda Dasbor</h1>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendaftar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendaftar}</div>
            <p className="text-xs text-muted-foreground">+5% dari kemarin</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kuota Terisi</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{persentaseKuota}%</div>
            <p className="text-xs text-muted-foreground">{kuotaTerisi} dari {totalKuota} total kuota</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sekolah Tujuan Teratas</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{sekolahTujuanTeratas}</div>
            <p className="text-xs text-muted-foreground">Paling banyak diminati</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sekolah Asal Teratas</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">{sekolahAsalTeratas}</div>
            <p className="text-xs text-muted-foreground">Pendaftar terbanyak</p>
          </CardContent>
        </Card>
      </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Statistik Pendaftar Harian</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: -10 }}>
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
                  <TableHead>Nama Sekolah</TableHead>
                  <TableHead className="text-right">Jumlah Pendaftar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSchoolsByDestination.map((school) => (
                  <TableRow key={school.id}>
                    <TableCell>
                      <Link href={`/registration/school/${school.id}`} className="font-medium hover:underline text-primary">{school.namaSekolah}</Link>
                    </TableCell>
                    <TableCell className="text-right">{school.jumlahPendaftar}</TableCell>
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
