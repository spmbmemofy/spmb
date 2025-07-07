
"use client";

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, Calendar, GraduationCap, LogIn, Map, Route, Search, BarChart, Users, CheckCircle } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { getApplicants, type ApplicantStatus } from '@/lib/applicantService';

const infoCards = [
  {
    icon: Route,
    title: 'Alur Pendaftaran',
    description: 'Pahami langkah-langkah pendaftaran dari awal hingga akhir.',
  },
  {
    icon: Calendar,
    title: 'Jadwal Penting',
    description: 'Lihat semua tanggal penting pelaksanaan SPMB 2026.',
  },
  {
    icon: Map,
    title: 'Jalur Tersedia',
    description: 'Ketahui berbagai jalur pendaftaran yang dibuka tahun ini.',
  },
  {
    icon: BarChart,
    title: 'Daya Tampung',
    description: 'Informasi kuota penerimaan untuk setiap sekolah tujuan.',
  },
];

const schedule = [
  {
    date: '10 - 25 Juni 2026',
    title: 'Pendaftaran & Verifikasi Berkas',
    description: 'Siswa melakukan pendaftaran online, melengkapi biodata, memilih sekolah, dan mengunggah berkas persyaratan.',
  },
  {
    date: '26 - 28 Juni 2026',
    title: 'Pemeringkatan & Seleksi',
    description: 'Sistem melakukan pemeringkatan otomatis berdasarkan nilai dan kriteria jalur yang dipilih.',
  },
  {
    date: '29 Juni 2026',
    title: 'Pengumuman Hasil Seleksi',
    description: 'Hasil akhir seleksi diumumkan secara online melalui portal ini.',
  },
  {
    date: '30 Juni - 2 Juli 2026',
    title: 'Daftar Ulang',
    description: 'Siswa yang dinyatakan lulus melakukan proses daftar ulang di sekolah penerima.',
  },
];

const stats = [
    { icon: GraduationCap, value: '52', label: 'Sekolah Tujuan' },
    { icon: Users, value: '10,430', label: 'Total Kuota' },
    { icon: LogIn, value: '8,972', label: 'Jumlah Pendaftar' },
    { icon: CheckCircle, value: '7,150', label: 'Pendaftar Terverifikasi' },
];

const faqs = [
  {
    question: "Dokumen apa saja yang perlu disiapkan?",
    answer: "Siapkan file scan Kartu Keluarga, Akta Kelahiran, Surat Keterangan Lulus (SKL), dan rapor semester 1-5 dalam format digital (PDF/JPG). Dokumen tambahan mungkin diperlukan tergantung jalur yang Anda pilih."
  },
  {
    question: "Berapa banyak sekolah yang bisa saya pilih?",
    answer: "Anda dapat memilih hingga 5 kombinasi sekolah/jurusan. Pastikan untuk mengurutkannya berdasarkan prioritas utama Anda, karena urutan sangat menentukan proses seleksi."
  },
  {
    question: "Bagaimana jika saya melakukan kesalahan saat mengisi data?",
    answer: "Selama data belum diverifikasi oleh panitia, Anda masih dapat mengubahnya melalui dasbor pendaftar. Jika pendaftaran ditolak karena kesalahan data, Anda akan diberi kesempatan untuk melakukan perbaikan sesuai jadwal."
  },
    {
    question: "Kapan saya bisa melihat hasil pengumuman?",
    answer: "Hasil pengumuman akan ditampilkan di halaman status dan halaman pengumuman setelah tahap verifikasi dan seleksi selesai sesuai dengan jadwal yang telah ditentukan."
  }
];

export default function LandingPage() {
  const [nisnCheck, setNisnCheck] = React.useState('');
  const [checkResult, setCheckResult] = React.useState<React.ReactNode>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "Terverifikasi": return "default";
      case "Menunggu Verifikasi": return "secondary";
      case "Berkas tidak sesuai": return "destructive";
      case "Dibatalkan": return "destructive";
      default: return "secondary";
    }
  };

  const handleStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisnCheck) {
        setCheckResult(<p className="text-destructive">Harap masukkan NISN.</p>);
        return;
    }
    
    setIsChecking(true);
    setCheckResult(null);

    setTimeout(() => { // Simulate network delay
        const applicant = getApplicants().find(app => app.nisn === nisnCheck.trim());
        if (applicant) {
            setCheckResult(
                <>
                    <p className="font-medium">Status untuk: {applicant.fullName}</p>
                    <Badge variant={getStatusBadgeVariant(applicant.statusVerifikasi)} className="mt-2 text-base px-4 py-1">
                        {applicant.statusVerifikasi}
                    </Badge>
                    {applicant.statusVerifikasi === 'Berkas tidak sesuai' && (
                        <p className="text-sm text-destructive mt-2 italic">"{applicant.rejectionReason || 'Ada berkas yang tidak valid. Silakan login untuk perbaikan.'}"</p>
                    )}
                </>
            );
        } else {
            setCheckResult(<p className="text-destructive">Pendaftar dengan NISN tersebut tidak ditemukan.</p>);
        }
        setIsChecking(false);
    }, 500);
  };

  return (
    <div className="flex flex-col min-h-dvh bg-muted/30 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg">SPMB 2026</span>
          </Link>
          <Button asChild>
            <Link href="#login">
                <LogIn className="mr-2 h-4 w-4" /> Masuk
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 sm:py-24 bg-background">
          <div className="container max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="relative z-10">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                        Portal SPMB <span className="text-primary">Kabupaten Berau</span> 2026
                    </h1>
                    <p className="mt-6 text-lg sm:text-xl text-muted-foreground">
                        Sistem Penerimaan Murid Baru Online yang transparan, akuntabel, dan mudah diakses untuk seluruh calon siswa.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <Button size="lg" asChild>
                            <Link href="#login">
                                Mulai Pendaftaran <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                          <Link href="#informasi">
                              Lihat Informasi
                          </Link>
                      </Button>
                    </div>
                </div>
                <div className="relative h-80 lg:h-full rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                        src="https://placehold.co/800x600.png"
                        alt="Siswa-siswi ceria di lingkungan sekolah"
                        layout="fill"
                        objectFit="cover"
                        data-ai-hint="happy students school"
                    />
                </div>
            </div>
          </div>
        </section>
        
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 space-y-20 sm:space-y-24">
            {/* Info Cards Section */}
            <section id="informasi">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">Informasi Pendaftaran</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Semua yang perlu Anda ketahui tentang proses pendaftaran tahun ini.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {infoCards.map((card, index) => (
                    <Card key={index} className="group hover:border-primary hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-2xl">
                        <CardHeader>
                            <div className="mb-4 w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                                <card.icon className="h-7 w-7" />
                            </div>
                            <CardTitle>{card.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">{card.description}</p>
                        </CardContent>
                    </Card>
                ))}
                </div>
            </section>
            
            {/* Login & Status Check Section */}
            <section id="login">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">Akses Portal Anda</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">Masuk atau cek status pendaftaran Anda di sini.</p>
                </div>
                <Card className="max-w-xl mx-auto shadow-2xl rounded-2xl">
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-14 rounded-t-2xl">
                            <TabsTrigger value="login" className="text-base rounded-tl-2xl data-[state=active]:rounded-bl-none">Masuk Akun</TabsTrigger>
                            <TabsTrigger value="status" className="text-base rounded-tr-2xl data-[state=active]:rounded-br-none">Cek Status</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login" className="p-8">
                             <CardDescription className="text-center mb-6">Gunakan akun yang telah Anda dapatkan untuk masuk ke sistem.</CardDescription>
                            <LoginForm />
                        </TabsContent>
                        <TabsContent value="status" className="p-8">
                            <CardDescription className="text-center mb-6">Masukkan NISN Anda untuk melihat status verifikasi dan hasil seleksi.</CardDescription>
                            <form onSubmit={handleStatusCheck} className="flex w-full items-start space-x-2">
                                <Input 
                                    type="text" 
                                    placeholder="Masukkan NISN Anda..."
                                    value={nisnCheck}
                                    onChange={(e) => setNisnCheck(e.target.value)}
                                    disabled={isChecking}
                                />
                                <Button type="submit" disabled={isChecking || !nisnCheck}>
                                    {isChecking ? 'Mencari...' : <><Search className="mr-2 h-4 w-4" /> Cek</>}
                                </Button>
                            </form>
                            {checkResult && (
                                <div className="mt-6 text-center border-t pt-6">
                                    {checkResult}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </Card>
            </section>
            
            {/* Schedule Section */}
            <section id="jadwal">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">Jadwal Pelaksanaan</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Catat tanggal-tanggal penting berikut agar tidak terlewat.
                    </p>
                </div>
                <Card className="rounded-2xl shadow-xl overflow-hidden">
                    <CardContent className="p-8 md:p-12">
                        <div className="relative">
                            <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-border hidden md:block" aria-hidden="true"></div>
                            <div className="space-y-12 md:space-y-0">
                                {schedule.map((item, index) => (
                                    <div key={item.title} className="relative flex items-center md:justify-center">
                                        <div className={cn("md:w-1/2 flex", index % 2 === 0 ? 'md:justify-end' : 'md:justify-start')}>
                                            <div className={cn("w-full md:max-w-sm p-6 rounded-2xl border bg-card shadow-lg", index % 2 === 0 ? 'md:mr-12' : 'md:ml-12')}>
                                                <p className="text-sm font-semibold text-primary">{item.date}</p>
                                                <h3 className="mt-2 text-xl font-bold">{item.title}</h3>
                                                <p className="mt-2 text-muted-foreground">{item.description}</p>
                                            </div>
                                        </div>
                                        <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background hidden md:block"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </section>

            {/* Statistics Section */}
            <section id="statistik">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">Statistik Pendaftaran</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Data pendaftaran diperbarui secara real-time.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <Card key={index} className="text-center shadow-lg rounded-2xl">
                            <CardContent className="p-8">
                                <stat.icon className="h-12 w-12 text-primary mx-auto mb-5" />
                                <p className="text-4xl font-bold">{stat.value}</p>
                                <p className="mt-1 text-muted-foreground">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
            
            {/* FAQ Section */}
            <section id="faq">
                <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">Pertanyaan Umum (FAQ)</h2>
                <p className="mt-4 mx-auto text-muted-foreground max-w-2xl">
                    Temukan jawaban untuk pertanyaan yang paling sering diajukan.
                </p>
                </div>
                <Card className="max-w-4xl mx-auto shadow-xl rounded-2xl">
                <CardContent className="p-6 md:p-8">
                    <Accordion type="single" collapsible className="w-full">
                    {faqs.map((faq, index) => (
                        <AccordionItem value={`item-${index}`} key={index}>
                        <AccordionTrigger className="py-5 text-lg text-left hover:no-underline">
                            {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-base text-muted-foreground pb-5">
                            {faq.answer}
                        </AccordionContent>
                        </AccordionItem>
                    ))}
                    </Accordion>
                </CardContent>
                </Card>
            </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Panitia SPMB Kabupaten Berau. Dibuat oleh Memofy Studio.
        </div>
      </footer>
    </div>
  );
}
