
"use client";

import * as React from "react";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FileText, Save } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { initialSchoolData } from "@/app/registration/dashboard/page"; // Import school data

const pathwayOptions = ["Afirmasi", "Mutasi", "Prestasi", "Domisili"];

export default function DocumentsPage() {
  const { toast } = useToast();
  const [selectedSchoolId, setSelectedSchoolId] = React.useState<string>("");
  const [selectedPathway, setSelectedPathway] = React.useState<string>("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    if (!selectedSchoolId || !selectedPathway) {
      toast({
        variant: "destructive",
        title: "Pilihan Tidak Lengkap",
        description: "Harap pilih sekolah tujuan dan jalur pendaftaran.",
      });
      setIsSubmitting(false);
      return;
    }

    const schoolName = initialSchoolData.find(s => s.id === selectedSchoolId)?.namaSekolah || "Tidak Diketahui";

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Pilihan Disimpan",
        description: `Anda memilih ${schoolName} melalui jalur ${selectedPathway}.`,
      });
      console.log("Pilihan Sekolah:", selectedSchoolId, "Jalur:", selectedPathway);
      setIsSubmitting(false);
      // Here you might want to enable the document upload section or navigate
    }, 1000);
  };

  return (
    <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <FileText size={40} />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-headline">Pilih Sekolah & Jalur Pendaftaran</CardTitle>
          <CardDescription className="text-md">
            Silakan pilih sekolah tujuan dan jalur pendaftaran Anda sebelum melanjutkan ke tahap unggah dokumen.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="school-select">Pilih Sekolah Tujuan</Label>
            <Select value={selectedSchoolId} onValueChange={setSelectedSchoolId}>
              <SelectTrigger id="school-select" className="w-full">
                <SelectValue placeholder="Pilih sekolah tujuan Anda" />
              </SelectTrigger>
              <SelectContent>
                {initialSchoolData.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    {school.namaSekolah} (Tahap {school.tahapPendaftaran})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pathway-select">Pilih Jalur Pendaftaran</Label>
            <Select value={selectedPathway} onValueChange={setSelectedPathway}>
              <SelectTrigger id="pathway-select" className="w-full">
                <SelectValue placeholder="Pilih jalur pendaftaran" />
              </SelectTrigger>
              <SelectContent>
                {pathwayOptions.map((pathway) => (
                  <SelectItem key={pathway} value={pathway}>
                    {pathway}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="text-center pt-6">
            <h3 className="text-lg font-semibold mb-2 text-primary">Tahap Berikutnya: Unggah Dokumen</h3>
            <p className="text-muted-foreground text-sm">
              Setelah menyimpan pilihan sekolah dan jalur, fitur untuk mengunggah dokumen yang diperlukan akan tersedia di bagian bawah halaman ini atau pada langkah berikutnya.
            </p>
            {/* Placeholder for document upload form or components can be expanded here */}
            {selectedSchoolId && selectedPathway && (
                 <div className="mt-6 p-4 border-dashed border-2 border-border rounded-md min-h-[150px] flex flex-col items-center justify-center">
                    <p className="text-muted-foreground font-medium">Area Unggah Dokumen</p>
                    <p className="text-xs text-muted-foreground mt-1">Komponen unggah dokumen akan muncul di sini.</p>
                    <Button variant="outline" className="mt-4" disabled>
                        Pilih Dokumen (Nonaktif)
                    </Button>
                 </div>
            )}
          </div>

        </CardContent>
        <CardFooter className="flex justify-end pt-6">
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedSchoolId || !selectedPathway}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Menyimpan..." : "Simpan Pilihan & Lanjutkan"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
