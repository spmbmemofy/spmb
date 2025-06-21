
"use client";

import * as React from "react";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LayoutDashboard, Building, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const chartData = [
  { track: "Afirmasi", applicants: 62, fill: "var(--color-afirmasi)" },
  { track: "Mutasi", applicants: 62, fill: "var(--color-mutasi)" },
  { track: "Prestasi", applicants: 63, fill: "var(--color-prestasi)" },
  { track: "Domisili", applicants: 63, fill: "var(--color-domisili)" },
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

export const initialSchoolData = [
  {
    id: "sman1tanjungredeb",
    namaSekolah: "SMA Negeri 1 Tanjung Redeb",
    akreditasi: "A",
    kuota: 266,
    jalurKuota: { afirmasi: 56, mutasi: 14, prestasi: 84, domisili: 112 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka" as SchoolStatus,
    alamat: "Jl. Jenderal Sudirman No.50, Tanjung Redeb, Berau",
    telepon: "0554-21045",
    kecamatan: "Kec. Tanjung Redeb",
  },
  {
    id: "smkn1berau",
    namaSekolah: "SMK Negeri 1 Berau",
    akreditasi: "A",
    kuota: 304,
    jalurKuota: { afirmasi: 64, mutasi: 16, prestasi: 96, domisili: 128 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka" as SchoolStatus,
    alamat: "Jl. Murjani II, Gayam, Tanjung Redeb, Berau",
    telepon: "0554-22112",
    kecamatan: "Kec. Tanjung Redeb",
  },
  {
    id: "sman2berau",
    namaSekolah: "SMA Negeri 2 Berau",
    akreditasi: "B",
    kuota: 228,
    jalurKuota: { afirmasi: 48, mutasi: 12, prestasi: 72, domisili: 96 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka" as SchoolStatus,
    alamat: "Jl. H. Isa III, Karang Ambun, Tanjung Redeb, Berau",
    telepon: "0554-23451",
    kecamatan: "Kec. Tanjung Redeb",
  },
  {
    id: "smamuhammadiyahberau",
    namaSekolah: "SMA Muhammadiyah Tanjung Redeb",
    akreditasi: "B",
    kuota: 142,
    jalurKuota: { afirmasi: 30, mutasi: 7, prestasi: 45, domisili: 60 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka" as SchoolStatus,
    alamat: "Jl. SA Maulana, Bugis, Tanjung Redeb, Berau",
    telepon: "0554-21987",
    kecamatan: "Kec. Tanjung Redeb",
  },
  {
    id: "smkyphbberau",
    namaSekolah: "SMK YPSHB (Yayasan Pendidikan Sinar Harapan Bangsa) Berau",
    akreditasi: "B",
    kuota: 190,
    jalurKuota: { afirmasi: 40, mutasi: 10, prestasi: 60, domisili: 80 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka" as SchoolStatus,
    alamat: "Jl. Pangeran Antasari, Teluk Bayur, Berau",
    telepon: "0554-24001",
    kecamatan: "Kec. Teluk Bayur",
  },
];

export const initialOriginSchoolData = [
  {
    id: "smpn1tanjungredeb",
    namaSekolah: "SMP Negeri 1 Tanjung Redeb",
    status: "Negeri" as const,
    akreditasi: "A" as const,
    jumlahPendaftar: 25,
  },
  {
    id: "smpn2telukbayur",
    namaSekolah: "SMP Negeri 2 Teluk Bayur",
    status: "Negeri" as const,
    akreditasi: "A" as const,
    jumlahPendaftar: 18,
  },
  {
    id: "smpn3sambaliung",
    namaSekolah: "SMP Negeri 3 Sambaliung",
    status: "Negeri" as const,
    akreditasi: "B" as const,
    jumlahPendaftar: 15,
  },
  {
    id: "mtsalkholil",
    namaSekolah: "MTs Al-Kholil",
    status: "Swasta" as const,
    akreditasi: "B" as const,
    jumlahPendaftar: 22,
  },
  {
    id: "smpitashshohwah",
    namaSekolah: "SMP IT Ash-Shohwah Berau",
    status: "Swasta" as const,
    akreditasi: "A" as const,
    jumlahPendaftar: 12,
  },
];

export type SchoolStatus = "Buka" | "Segera Penuh" | "Tutup";
export type School = typeof initialSchoolData[0];
export type OriginSchool = typeof initialOriginSchoolData[0];

type SchoolSortKey = keyof Omit<School, 'jalurKuota' | 'alamat' | 'telepon' | 'id' | 'kecamatan'>;
type SortDirection = "ascending" | "descending";

interface SchoolSortConfig {
  key: SchoolSortKey | null;
  direction: SortDirection;
}

type OriginSchoolSortKey = keyof OriginSchool;
interface OriginSchoolSortConfig {
  key: OriginSchoolSortKey | null;
  direction: SortDirection;
}


const getStatusBadgeVariant = (status: SchoolStatus): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "Buka":
      return "default";
    case "Segera Penuh":
      return "secondary";
    case "Tutup":
      return "destructive";
    default:
      return "default";
  }
};


export default function DashboardPage() {
  const [schoolData, setSchoolData] = React.useState<School[]>(initialSchoolData);
  const [originSchoolData, setOriginSchoolData] = React.useState<OriginSchool[]>(initialOriginSchoolData);
  
  // State for destination school table
  const [schoolSortConfig, setSchoolSortConfig] = React.useState<SchoolSortConfig>({ key: 'namaSekolah', direction: 'ascending' });
  const [schoolPageSize, setSchoolPageSize] = React.useState(5);
  const [schoolCurrentPage, setSchoolCurrentPage] = React.useState(1);

  // State for origin school table
  const [originSchoolSortConfig, setOriginSchoolSortConfig] = React.useState<OriginSchoolSortConfig>({ key: 'namaSekolah', direction: 'ascending' });
  const [originSchoolPageSize, setOriginSchoolPageSize] = React.useState(5);
  const [originSchoolCurrentPage, setOriginSchoolCurrentPage] = React.useState(1);


  React.useEffect(() => {
    setSchoolCurrentPage(1);
  }, [schoolPageSize]);

  React.useEffect(() => {
    setOriginSchoolCurrentPage(1);
  }, [originSchoolPageSize]);

  // Logic for destination school table
  const sortedSchoolData = React.useMemo(() => {
    let sortableItems = [...schoolData];
    if (schoolSortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[schoolSortConfig.key!];
        const valB = b[schoolSortConfig.key!];
        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
        return schoolSortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [schoolData, schoolSortConfig]);

  const paginatedSchoolData = React.useMemo(() => {
    const startIndex = (schoolCurrentPage - 1) * schoolPageSize;
    return sortedSchoolData.slice(startIndex, startIndex + schoolPageSize);
  }, [sortedSchoolData, schoolCurrentPage, schoolPageSize]);

  const totalSchoolPages = React.useMemo(() => {
    return Math.ceil(sortedSchoolData.length / schoolPageSize);
  }, [sortedSchoolData.length, schoolPageSize]);

  const requestSchoolSort = (key: SchoolSortKey) => {
    let direction: SortDirection = 'ascending';
    if (schoolSortConfig.key === key && schoolSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSchoolSortConfig({ key, direction });
  };

  const getSchoolSortIcon = (key: SchoolSortKey) => {
    if (schoolSortConfig.key !== key) return null;
    return schoolSortConfig.direction === 'ascending' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const renderSchoolSortableHeader = (key: SchoolSortKey, label: string, className: string = "") => (
    <TableHead
      className={cn("font-semibold cursor-pointer hover:bg-muted/50", className)}
      onClick={() => requestSchoolSort(key)}
    >
      <div className="flex items-center">
        {label}
        {getSchoolSortIcon(key)}
      </div>
    </TableHead>
  );

  const handleSchoolPageSizeChange = (value: string) => setSchoolPageSize(parseInt(value, 10));
  const handlePreviousSchoolPage = () => setSchoolCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextSchoolPage = () => setSchoolCurrentPage((prev) => Math.min(prev + 1, totalSchoolPages));

  // Logic for origin school table
  const sortedOriginSchoolData = React.useMemo(() => {
    let sortableItems = [...originSchoolData];
    if (originSchoolSortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[originSchoolSortConfig.key!];
        const valB = b[originSchoolSortConfig.key!];
        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
        return originSchoolSortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [originSchoolData, originSchoolSortConfig]);

  const paginatedOriginSchoolData = React.useMemo(() => {
    const startIndex = (originSchoolCurrentPage - 1) * originSchoolPageSize;
    return sortedOriginSchoolData.slice(startIndex, startIndex + originSchoolPageSize);
  }, [sortedOriginSchoolData, originSchoolCurrentPage, originSchoolPageSize]);

  const totalOriginSchoolPages = React.useMemo(() => {
    return Math.ceil(sortedOriginSchoolData.length / originSchoolPageSize);
  }, [sortedOriginSchoolData.length, originSchoolPageSize]);

  const requestOriginSchoolSort = (key: OriginSchoolSortKey) => {
    let direction: SortDirection = 'ascending';
    if (originSchoolSortConfig.key === key && originSchoolSortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setOriginSchoolSortConfig({ key, direction });
  };

  const getOriginSchoolSortIcon = (key: OriginSchoolSortKey) => {
    if (originSchoolSortConfig.key !== key) return null;
    return originSchoolSortConfig.direction === 'ascending' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const renderOriginSchoolSortableHeader = (key: OriginSchoolSortKey, label: string, className: string = "") => (
    <TableHead
      className={cn("font-semibold cursor-pointer hover:bg-muted/50", className)}
      onClick={() => requestOriginSchoolSort(key)}
    >
      <div className="flex items-center">
        {label}
        {getOriginSchoolSortIcon(key)}
      </div>
    </TableHead>
  );

  const handleOriginSchoolPageSizeChange = (value: string) => setOriginSchoolPageSize(parseInt(value, 10));
  const handlePreviousOriginSchoolPage = () => setOriginSchoolCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextOriginSchoolPage = () => setOriginSchoolCurrentPage((prev) => Math.min(prev + 1, totalOriginSchoolPages));


  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-4xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <LayoutDashboard size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Beranda Pendaftaran</CardTitle>
          <CardDescription className="text-md">
            Ringkasan data pendaftar berdasarkan jalur penerimaan dan informasi sekolah di Kabupaten Berau.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-12">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary text-center">Distribusi Pendaftar per Jalur</h2>
            <div className="aspect-[16/9] w-full">
              <ChartContainer config={chartConfig} className="min-h-[300px] sm:min-h-[350px] md:min-h-[400px] w-full">
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
                     <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="applicants" radius={8} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>
          </section>

          <section>
            <div className="flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
                <div className="flex items-center space-x-2">
                    <Building className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-semibold text-primary">Informasi Sekolah Tujuan (Kab. Berau)</h2>
                </div>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {renderSchoolSortableHeader('namaSekolah', "Nama Sekolah")}
                    {renderSchoolSortableHeader('akreditasi', "Akreditasi", "text-center")}
                    {renderSchoolSortableHeader('kuota', "Total Kuota", "text-center")}
                    {renderSchoolSortableHeader('jumlahPendaftar', "Pendaftar", "text-center")}
                    {renderSchoolSortableHeader('statusPendaftaran', "Status", "text-center")}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSchoolData.length > 0 ? (
                    paginatedSchoolData.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">
                          <Link href={`/registration/school/${school.id}`} className="hover:underline text-primary">
                            {school.namaSekolah}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">{school.akreditasi}</TableCell>
                        <TableCell className="text-center">{school.kuota}</TableCell>
                        <TableCell className="text-center">{school.jumlahPendaftar}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={getStatusBadgeVariant(school.statusPendaftaran as SchoolStatus)}>
                            {school.statusPendaftaran}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                        Tidak ada data sekolah yang tersedia.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
             <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Data per halaman:</span>
                <Select value={schoolPageSize.toString()} onValueChange={handleSchoolPageSizeChange}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder={schoolPageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value={(sortedSchoolData.length > 0 ? sortedSchoolData.length.toString() : "5")}>Semua</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousSchoolPage}
                  disabled={schoolCurrentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {schoolCurrentPage} dari {totalSchoolPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextSchoolPage}
                  disabled={schoolCurrentPage === totalSchoolPages || totalSchoolPages === 0}
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Data sekolah dan pendaftar diperbarui secara berkala. Klik nama sekolah untuk detail.
            </p>
          </section>

          <section>
            <div className="flex items-center space-x-2 mb-6">
                <BookOpen className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold text-primary">Informasi Sekolah Asal Pendaftar</h2>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {renderOriginSchoolSortableHeader('namaSekolah', "Nama Sekolah Asal")}
                    {renderOriginSchoolSortableHeader('status', "Status", "text-center")}
                    {renderOriginSchoolSortableHeader('akreditasi', "Akreditasi", "text-center")}
                    {renderOriginSchoolSortableHeader('jumlahPendaftar', "Jumlah Pendaftar", "text-center")}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedOriginSchoolData.length > 0 ? (
                    paginatedOriginSchoolData.map((school) => (
                      <TableRow key={school.id}>
                        <TableCell className="font-medium">
                           <Link href={`/registration/origin-school/${school.id}`} className="hover:underline text-primary">
                            {school.namaSekolah}
                          </Link>
                        </TableCell>
                        <TableCell className="text-center">{school.status}</TableCell>
                        <TableCell className="text-center">{school.akreditasi}</TableCell>
                        <TableCell className="text-center">{school.jumlahPendaftar}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                     <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                        Tidak ada data sekolah asal yang tersedia.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Data per halaman:</span>
                <Select value={originSchoolPageSize.toString()} onValueChange={handleOriginSchoolPageSizeChange}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder={originSchoolPageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value={(sortedOriginSchoolData.length > 0 ? sortedOriginSchoolData.length.toString() : "5")}>Semua</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousOriginSchoolPage}
                  disabled={originSchoolCurrentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {originSchoolCurrentPage} dari {totalOriginSchoolPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextOriginSchoolPage}
                  disabled={originSchoolCurrentPage === totalOriginSchoolPages || totalOriginSchoolPages === 0}
                >
                  Berikutnya
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Data sekolah asal pendaftar yang terdaftar di sistem. Klik nama sekolah untuk detail.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}

    

    
