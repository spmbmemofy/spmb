
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
import { LayoutDashboard, Building, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Filter } from "lucide-react";
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

const initialSchoolData = [
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
    tahapPendaftaran: 1 as const,
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
    tahapPendaftaran: 2 as const,
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
    tahapPendaftaran: 1 as const,
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
    tahapPendaftaran: 2 as const,
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
    tahapPendaftaran: 1 as const,
  },
];

export type SchoolStatus = "Buka" | "Segera Penuh" | "Tutup";
export type School = typeof initialSchoolData[0];

type SchoolSortKey = keyof School | 'tahapPendaftaran';
type SortDirection = "ascending" | "descending";

interface SchoolSortConfig {
  key: SchoolSortKey | null;
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
  const [sortConfig, setSortConfig] = React.useState<SchoolSortConfig>({ key: 'namaSekolah', direction: 'ascending' });
  const [selectedStage, setSelectedStage] = React.useState<string>("Semua Tahap"); // "Semua Tahap", "1", "2"

  const [pageSize, setPageSize] = React.useState(5);
  const [currentPage, setCurrentPage] = React.useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [pageSize, selectedStage]); 

  const filteredByStageSchoolData = React.useMemo(() => {
    if (selectedStage === "Semua Tahap") {
      return schoolData;
    }
    const stage = parseInt(selectedStage, 10);
    return schoolData.filter(school => school.tahapPendaftaran === stage);
  }, [schoolData, selectedStage]);


  const sortedSchoolData = React.useMemo(() => {
    let sortableItems = [...filteredByStageSchoolData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string') {
          comparison = valA.localeCompare(valB);
        } else {
          comparison = String(valA).localeCompare(String(valB));
        }
        
        return sortConfig.direction === 'ascending' ? comparison : -comparison;
      });
    }
    return sortableItems;
  }, [filteredByStageSchoolData, sortConfig]);

  const paginatedSchoolData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedSchoolData.slice(startIndex, startIndex + pageSize);
  }, [sortedSchoolData, currentPage, pageSize]);

  const totalPages = React.useMemo(() => {
    return Math.ceil(sortedSchoolData.length / pageSize);
  }, [sortedSchoolData.length, pageSize]);


  const requestSort = (key: SchoolSortKey) => {
    let direction: SortDirection = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: SchoolSortKey) => {
    if (sortConfig.key !== key) {
      return null;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp className="ml-1 h-3 w-3" />;
    }
    return <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const renderSortableHeader = (key: SchoolSortKey, label: string, className: string = "") => (
    <TableHead 
      className={cn("font-semibold cursor-pointer hover:bg-muted/50", className)}
      onClick={() => requestSort(key)}
    >
      <div className="flex items-center">
        {label}
        {getSortIcon(key)}
      </div>
    </TableHead>
  );

  const handlePageSizeChange = (value: string) => {
    setPageSize(parseInt(value, 10));
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

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
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground"/>
                    <Select value={selectedStage} onValueChange={setSelectedStage}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter Tahap" />
                        </SelectTrigger>
                        <SelectContent>
                        <SelectItem value="Semua Tahap">Semua Tahap</SelectItem>
                        <SelectItem value="1">Tahap 1</SelectItem>
                        <SelectItem value="2">Tahap 2</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {renderSortableHeader('namaSekolah' as SchoolSortKey, "Nama Sekolah")}
                    {renderSortableHeader('akreditasi' as SchoolSortKey, "Akreditasi", "text-center")}
                    {renderSortableHeader('tahapPendaftaran' as SchoolSortKey, "Tahap", "text-center")}
                    {renderSortableHeader('kuota' as SchoolSortKey, "Total Kuota", "text-center")}
                    {renderSortableHeader('jumlahPendaftar' as SchoolSortKey, "Pendaftar", "text-center")}
                    {renderSortableHeader('statusPendaftaran' as SchoolSortKey, "Status", "text-center")}
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
                        <TableCell className="text-center">{school.tahapPendaftaran}</TableCell>
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
                      <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                        Tidak ada data sekolah yang sesuai dengan filter.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
             <div className="flex items-center justify-between mt-4 flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Data per halaman:</span>
                <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                  <SelectTrigger className="w-[80px]">
                    <SelectValue placeholder={pageSize.toString()} />
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
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Sebelumnya
                </Button>
                <span className="text-sm text-muted-foreground">
                  Halaman {currentPage} dari {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages || totalPages === 0}
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
        </CardContent>
      </Card>
    </div>
  );
}
