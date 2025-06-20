
"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LayoutDashboard, Building } from "lucide-react";

const chartData = [
  { track: "Afirmasi", applicants: 120, fill: "var(--color-afirmasi)" },
  { track: "Mutasi", applicants: 75, fill: "var(--color-mutasi)" },
  { track: "Prestasi", applicants: 200, fill: "var(--color-prestasi)" },
  { track: "Domisili", applicants: 150, fill: "var(--color-domisili)" },
];

const chartConfig = {
  applicants: {
    label: "Jumlah Pendaftar",
  },
  afirmasi: {
    label: "Afirmasi",
    color: "hsl(var(--chart-1))",
  },
  mutasi: {
    label: "Mutasi",
    color: "hsl(var(--chart-2))",
  },
  prestasi: {
    label: "Prestasi",
    color: "hsl(var(--chart-3))",
  },
  domisili: {
    label: "Domisili",
    color: "hsl(var(--chart-4))",
  },
} satisfies ChartConfig;

const schoolData = [
  {
    id: "sma1",
    namaSekolah: "SMA Negeri 1 Kota Impian",
    akreditasi: "A",
    kuota: 250,
    jumlahPendaftar: 180,
    statusPendaftaran: "Buka",
  },
  {
    id: "sma2",
    namaSekolah: "SMA Swasta Harapan Bangsa",
    akreditasi: "A",
    kuota: 150,
    jumlahPendaftar: 145,
    statusPendaftaran: "Segera Penuh",
  },
  {
    id: "smk1",
    namaSekolah: "SMK Negeri 2 Teknologi Maju",
    akreditasi: "B",
    kuota: 300,
    jumlahPendaftar: 220,
    statusPendaftaran: "Buka",
  },
  {
    id: "sma3",
    namaSekolah: "SMA Negeri 3 Cendekia",
    akreditasi: "A",
    kuota: 200,
    jumlahPendaftar: 200,
    statusPendaftaran: "Tutup",
  },
  {
    id: "smk2",
    namaSekolah: "SMK Swasta Karya Guna",
    akreditasi: "B",
    kuota: 180,
    jumlahPendaftar: 105,
    statusPendaftaran: "Buka",
  },
];

type SchoolStatus = "Buka" | "Segera Penuh" | "Tutup";

const getStatusBadgeVariant = (status: SchoolStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Buka":
      return "default"; // Greenish or bluish - primary is sky blue
    case "Segera Penuh":
      return "secondary"; // Orangish - secondary is light primary, let's use default for now
    case "Tutup":
      return "destructive"; // Reddish
    default:
      return "default";
  }
};


export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <LayoutDashboard size={40} />
          </div>
          <CardTitle className="text-3xl font-headline">Beranda Pendaftaran</CardTitle>
          <CardDescription className="text-md">
            Ringkasan data pendaftar berdasarkan jalur penerimaan dan informasi sekolah.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary text-center">Distribusi Pendaftar per Jalur</h2>
            <div className="aspect-[16/9] w-full">
              <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="track"
                      tickLine={false}
                      tickMargin={10}
                      axisLine={false}
                      tickFormatter={(value) => value.slice(0, 10)}
                    />
                    <YAxis />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dashed" />}
                    />
                    <Bar dataKey="applicants" radius={8} />
                    <ChartLegend content={<ChartLegendContent />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </section>

          <section>
            <div className="flex items-center justify-center mb-6">
              <Building className="h-6 w-6 mr-2 text-primary" />
              <h2 className="text-xl font-semibold text-primary text-center">Informasi Sekolah Tujuan</h2>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Nama Sekolah</TableHead>
                    <TableHead className="text-center font-semibold">Akreditasi</TableHead>
                    <TableHead className="text-center font-semibold">Kuota</TableHead>
                    <TableHead className="text-center font-semibold">Pendaftar</TableHead>
                    <TableHead className="text-center font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolData.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">{school.namaSekolah}</TableCell>
                      <TableCell className="text-center">{school.akreditasi}</TableCell>
                      <TableCell className="text-center">{school.kuota}</TableCell>
                      <TableCell className="text-center">{school.jumlahPendaftar}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(school.statusPendaftaran as SchoolStatus)}>
                          {school.statusPendaftaran}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Data sekolah dan pendaftar diperbarui secara berkala.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
