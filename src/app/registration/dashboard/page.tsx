
"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Building, MapPin, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type SchoolData = {
  id: string;
  namaSekolah: string;
  alamat: string;
  kuota: number;
  akreditasi: "A" | "B" | "C" | "Belum Terakreditasi";
};

const initialSchoolData: SchoolData[] = [
  {
    id: "sman1tanjungredeb",
    namaSekolah: "SMA Negeri 1 Tanjung Redeb",
    alamat: "Jl. Jenderal Sudirman No.50, Tanjung Redeb, Berau",
    kuota: 266,
    akreditasi: "A",
  },
  {
    id: "smkn1berau",
    namaSekolah: "SMK Negeri 1 Berau",
    alamat: "Jl. Murjani II, Gayam, Tanjung Redeb, Berau",
    kuota: 304,
    akreditasi: "A",
  },
  {
    id: "sman2berau",
    namaSekolah: "SMA Negeri 2 Berau",
    alamat: "Jl. H. Isa III, Karang Ambun, Tanjung Redeb, Berau",
    kuota: 228,
    akreditasi: "B",
  },
  {
    id: "smamuhammadiyahberau",
    namaSekolah: "SMA Muhammadiyah Tanjung Redeb",
    alamat: "Jl. SA Maulana, Bugis, Tanjung Redeb, Berau",
    kuota: 142,
    akreditasi: "B",
  },
  {
    id: "smkyphbberau",
    namaSekolah: "SMK YPSHB (Yayasan Pendidikan Sinar Harapan Bangsa) Berau",
    alamat: "Jl. Pangeran Antasari, Teluk Bayur, Berau",
    kuota: 190,
    akreditasi: "B",
  },
];

export default function SchoolDataPage() {
  const { toast } = useToast();
  const [schoolData, setSchoolData] = React.useState<SchoolData[]>(initialSchoolData);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleInputChange = (schoolId: string, field: keyof SchoolData, value: string | number) => {
    setSchoolData((prevData) =>
      prevData.map((school) =>
        school.id === schoolId ? { ...school, [field]: value } : school
      )
    );
  };

  const handleSaveChanges = () => {
    setIsSaving(true);
    console.log("Menyimpan data sekolah:", schoolData);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Perubahan Disimpan",
        description: "Data sekolah telah berhasil diperbarui.",
      });
      setIsSaving(false);
    }, 1500);
  };

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-5xl shadow-2xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
              <Building size={28} />
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-headline">Kelola Data Sekolah</CardTitle>
              <CardDescription className="text-md mt-1">
                Perbarui informasi sekolah, lokasi, dan kuota penerimaan.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary flex items-center">
              <MapPin className="mr-2" />
              Lokasi Sekolah
            </h3>
            <div className="border-2 border-dashed rounded-lg p-4">
              <p className="text-center text-muted-foreground mb-4">
                Pilih sekolah dari tabel di bawah untuk melihat atau mengubah lokasinya di peta.
              </p>
              <Image
                src="https://placehold.co/1200x400.png"
                alt="Peta Lokasi Sekolah"
                width={1200}
                height={400}
                className="w-full h-auto rounded-md object-cover"
                data-ai-hint="map view"
              />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold mb-4 text-primary">
              Detail Data Sekolah
            </h3>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[5%] text-center">No.</TableHead>
                    <TableHead className="w-[30%]">Nama Sekolah</TableHead>
                    <TableHead className="w-[40%]">Alamat</TableHead>
                    <TableHead className="w-[12.5%] text-center">Kuota</TableHead>
                    <TableHead className="w-[12.5%] text-center">Akreditasi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schoolData.map((school, index) => (
                    <TableRow key={school.id}>
                      <TableCell className="text-center font-medium">{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={school.namaSekolah}
                          onChange={(e) =>
                            handleInputChange(school.id, "namaSekolah", e.target.value)
                          }
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={school.alamat}
                          onChange={(e) =>
                            handleInputChange(school.id, "alamat", e.target.value)
                          }
                          className="w-full"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={school.kuota}
                          onChange={(e) =>
                            handleInputChange(
                              school.id,
                              "kuota",
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-full text-center"
                        />
                      </TableCell>
                      <TableCell>
                         <Input
                          value={school.akreditasi}
                          onChange={(e) =>
                            handleInputChange(school.id, "akreditasi", e.target.value)
                          }
                          className="w-full text-center"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Perubahan pada tabel akan disimpan saat Anda menekan tombol "Simpan Perubahan".
            </p>
          </section>
        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Button size="lg" onClick={handleSaveChanges} disabled={isSaving}>
            <Save className="mr-2 h-5 w-5" />
            {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
