
"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { getApplicants, type Applicant } from "@/lib/applicantService";
import { getSchoolById, type School } from "@/lib/schoolService";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Printer, AlertCircle, FileText, Edit, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";

const semesterKeys: (keyof Applicant['semesterGrades'])[] = ["semester1", "semester2", "semester3", "semester4", "semester5"];
const semesterLabels = ["Semester 1", "Semester 2", "Semester 3", "Semester 4", "Semester 5"];

interface PopulatedSelection {
  school: School;
  major: string | null;
}

export default function RegistrationProofPage() {
  const router = useRouter();
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [applicant, setApplicant] = React.useState<Applicant | null>(null);
  const [selections, setSelections] = React.useState<PopulatedSelection[]>([]);

  React.useEffect(() => {
    const loginCreds = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    if (!loginCreds?.username) {
        router.replace('/registration/status');
        return;
    }

    const currentApplicant = getApplicants().find(app => app.nisn === loginCreds.username);

    if (!currentApplicant || !currentApplicant.statusVerifikasi || currentApplicant.statusVerifikasi === "Menunggu Verifikasi") {
        router.replace('/registration/status');
        return;
    }
    
    setApplicant(currentApplicant);
    
    const populatedSelections = (currentApplicant.schoolSelections || [])
        .map(sel => ({
            school: getSchoolById(sel.schoolId)!,
            major: sel.major
        }))
        .filter(item => item.school);
    setSelections(populatedSelections);
    
    setIsLoading(false);
  }, [router]);

  const handleDownloadPdf = () => {
    setIsDownloading(true);
    const input = document.getElementById('pdf-content');
    if (!input || !applicant) {
      console.error("Content element or applicant data not found for PDF generation.");
      setIsDownloading(false);
      return;
    }

    html2canvas(input, { scale: 2, useCORS: true })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        let imgHeight = pdfWidth / ratio;
        let heightLeft = imgHeight;
        
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`bukti-pendaftaran-${applicant.nisn}.pdf`);
        setIsDownloading(false);
      })
      .catch(err => {
        console.error("Error generating PDF:", err);
        setIsDownloading(false);
      });
  };

  const totalNilai = React.useMemo(() => {
    if (!applicant) return "0.00";
    return Object.values(applicant.semesterGrades).reduce((acc, val) => acc + val, 0).toFixed(2);
  }, [applicant]);

  if (isLoading || !applicant) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Memuat data bukti pendaftaran...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 sm:p-8">
       <div className="max-w-4xl mx-auto mb-6 flex justify-end">
         <Button onClick={handleDownloadPdf} disabled={isDownloading} className="print-hide">
            <Printer className="mr-2 h-4 w-4" />
            {isDownloading ? "Mengunduh..." : "Unduh sebagai PDF"}
          </Button>
       </div>
      <div id="pdf-content" className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 sm:p-12 shadow-lg rounded-md">
        <header className="flex items-center justify-between border-b-4 border-gray-800 dark:border-gray-200 pb-4 mb-8">
          <div className="flex items-center">
             <Image 
                src="https://placehold.co/80x80.png"
                alt="Logo Dinas Pendidikan" 
                width={80} 
                height={80} 
                className="h-20 w-20"
                data-ai-hint="logo icon"
              />
            <div className="ml-4">
              <h1 className="text-xl sm:text-2xl font-bold uppercase text-gray-800 dark:text-gray-100">SPMB 2026</h1>
              <p className="text-sm sm:text-md text-gray-600 dark:text-gray-300">Seleksi Penerimaan Mahasiswa Baru - Tahun 2026</p>
            </div>
          </div>
        </header>

        <main className="space-y-10">
          <h2 className="text-center text-xl sm:text-2xl font-bold underline decoration-2 underline-offset-4 text-gray-800 dark:text-gray-200">BUKTI PENDAFTARAN</h2>
          
          <section>
             <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary flex items-center"><FileText className="mr-2"/> Data Diri Pendaftar</h3>
             <div className="flex flex-col sm:flex-row gap-8">
                <div className="w-32 h-40 flex-shrink-0">
                    {applicant.profilePhotoDataUri ? (
                        <Image src={applicant.profilePhotoDataUri} alt="Foto Profil" width={128} height={160} className="object-cover border-2 border-gray-300 rounded-md" />
                    ) : (
                        <div className="w-32 h-40 bg-gray-200 flex items-center justify-center rounded-md">
                            <span className="text-xs text-gray-500">Foto 3x4</span>
                        </div>
                    )}
                </div>
                <div className="flex-grow">
                    <Table>
                        <TableBody>
                            <TableRow><TableCell className="font-semibold w-1/3">Nama Lengkap</TableCell><TableCell>{applicant.fullName}</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold">NISN</TableCell><TableCell>{applicant.nisn}</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold">NIK</TableCell><TableCell>{applicant.nik}</TableCell></TableRow>
                            <TableRow><TableCell className="font-semibold">Tempat, Tanggal Lahir</TableCell><TableCell>{applicant.placeOfBirth}, {new Date(applicant.dateOfBirth!).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</TableCell></TableRow>
                             <TableRow><TableCell className="font-semibold">Sekolah Asal</TableCell><TableCell>{applicant.asalSekolahNama}</TableCell></TableRow>
                        </TableBody>
                    </Table>
                </div>
             </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary flex items-center"><Edit className="mr-2"/> Data Nilai Rapor</h3>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold">Semester</TableHead>
                    <TableHead className="text-right font-bold">Rata-rata Nilai</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {semesterKeys.map((key, index) => (
                    <TableRow key={key}>
                      <TableCell className="font-medium">{semesterLabels[index]}</TableCell>
                      <TableCell className="text-right">{applicant.semesterGrades[key].toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell className="text-right font-bold text-lg">JUMLAH KESELURUHAN NILAI</TableCell>
                    <TableCell className="text-right font-bold text-lg">{totalNilai}</TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 text-primary flex items-center"><CheckCircle className="mr-2"/> Jalur dan Pilihan Sekolah</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-semibold w-1/3">Jalur Pendaftaran</TableCell>
                  <TableCell className="font-bold text-primary">{applicant.jalur || "Tidak ada"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <div className="overflow-x-auto rounded-md border mt-4">
               <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="font-bold w-[10%]">Prioritas</TableHead>
                        <TableHead className="font-bold">Nama Sekolah Tujuan</TableHead>
                        <TableHead className="font-bold">Jurusan</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {selections.map((sel, index) => (
                        <TableRow key={index}>
                            <TableCell className="text-center font-bold">{index + 1}</TableCell>
                            <TableCell>{sel.school.namaSekolah}</TableCell>
                            <TableCell>{sel.major || "-"}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
               </Table>
            </div>
          </section>

          <div className="pt-8 text-sm text-gray-700 dark:text-gray-300">
            <AlertCircle className="inline h-4 w-4 mr-1"/>
            <span className="font-semibold">Pernyataan:</span> Saya yang bertanda tangan di bawah ini menyatakan bahwa seluruh data yang saya isikan adalah benar dan dapat dipertanggungjawabkan. Apabila di kemudian hari ditemukan ketidaksesuaian, saya bersedia menerima sanksi sesuai dengan peraturan yang berlaku.
          </div>

          <footer className="pt-16">
            <div className="flex justify-between items-start text-center text-sm">
                <div className="w-1/2 sm:w-1/3">
                    <p>Verifikator</p>
                    <p className="font-semibold">{selections[0]?.school?.namaSekolah || "Sekolah Pilihan Pertama"}</p>
                    <div className="h-24"></div>
                    <p className="font-semibold underline">( {applicant.verifiedBy || 'Petugas Verifikator'} )</p>
                    <p>Petugas Sekolah</p>
                </div>
                 <div className="w-1/2 sm:w-1/3">
                    <p>Berau, {new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    <p>Pendaftar,</p>
                    <div className="h-24"></div>
                    <p className="font-semibold underline">( {applicant.fullName} )</p>
                    <p>NISN. {applicant.nisn}</p>
                </div>
            </div>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-12 text-center italic">
                Dokumen ini dicetak oleh sistem pada {new Date().toLocaleString('id-ID')} dan merupakan bukti pendaftaran yang sah.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
