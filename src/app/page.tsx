
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { ArrowRight, Calendar, GraduationCap, LogIn, Map, Route, BarChart, Users, CheckCircle, Award, UserPlus, Info, Megaphone } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { StatusCheckForm } from '@/components/landing/status-check-form';
import { getApplicants } from '@/lib/applicantService';
import { getSchools } from '@/lib/schoolService';
import { getStages } from '@/lib/stageService';
import { useEffect, useState } from 'react';

const infoCards = [
  {
    icon: Route,
    title: 'Alur Pendaftaran',
    description: 'Pahami alur pendaftaran mulai dari pembuatan akun, pengisian biodata, pemilihan sekolah, hingga verifikasi berkas.',
  },
  {
    icon: Calendar,
    title: 'Jadwal Penting',
    description: 'Catat semua tanggal penting pendaftaran, verifikasi, pengumuman, dan daftar ulang untuk setiap tahap.',
  },
  {
    icon: Map,
    title: 'Jalur Tersedia',
    description: 'Temukan informasi lengkap mengenai jalur pendaftaran yang tersedia, seperti Afirmasi, Prestasi, dan Domisili.',
  },
  {
    icon: BarChart,
    title: 'Daya Tampung',
    description: 'Lihat daya tampung atau kuota penerimaan untuk setiap sekolah dan jurusan yang Anda minati.',
  },
];

const faqs = [
  {
    question: "Dokumen apa saja yang perlu disiapkan?",
    answer: "Siapkan file scan Kartu Keluarga, Akta Kelahiran, Surat Keterangan Lulus (SKL), dan rapor semester 1-5 dalam format digital (PDF/JPG). Pastikan ukuran file tidak lebih dari 2MB per dokumen. Dokumen tambahan mungkin diperlukan tergantung jalur yang Anda pilih."
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
    question: "Bagaimana proses seleksi dilakukan?",
    answer: "Seleksi dilakukan berdasarkan peringkat nilai akhir di setiap sekolah dan jalur yang dipilih. Nilai akhir dihitung dari total nilai rapor semester 1-5, ditambah nilai prestasi (untuk jalur prestasi) dan bonus lainnya sesuai aturan. Peringkat diurutkan dari nilai tertinggi hingga kuota terpenuhi."
  },
  {
    question: "Kapan saya bisa melihat hasil pengumuman?",
    answer: "Hasil pengumuman akan ditampilkan di halaman status dan halaman pengumuman setelah tahap verifikasi dan seleksi selesai sesuai dengan jadwal yang telah ditentukan."
  }
];

export default function LandingPage() {
  const [stats, setStats] = useState<any[]>([]);
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    const allSchools = getSchools();
    const allApplicants = getApplicants();
    const allStages = getStages();

    const destinationSchools = allSchools.filter(s => s.jenjang === 'SMA' || s.jenjang === 'SMK');
    const totalQuota = destinationSchools.reduce((sum, school) => sum + (school.kuota || 0), 0);
    const totalApplicants = allApplicants.length;
    const verifiedApplicants = allApplicants.filter(app => app.statusVerifikasi === 'Terverifikasi').length;

    setStats([
      { icon: GraduationCap, value: destinationSchools.length.toString(), label: 'Sekolah Tujuan' },
      { icon: Users, value: totalQuota.toLocaleString('id-ID'), label: 'Total Kuota' },
      { icon: LogIn, value: totalApplicants.toLocaleString('id-ID'), label: 'Jumlah Pendaftar' },
      { icon: CheckCircle, value: verifiedApplicants.toLocaleString('id-ID'), label: 'Pendaftar Terverifikasi' },
    ]);
  
    const scheduleData = allStages.map(stage => {
      const startDate = new Date(stage.startDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
      const endDate = new Date(stage.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      
      return {
        date: `${startDate} - ${endDate}`,
        title: stage.name,
        description: `Proses pendaftaran, verifikasi, dan seleksi untuk jalur yang termasuk dalam ${stage.name}.`
      }
    });
    setSchedule(scheduleData);
  }, []);


  return (
    <div className="flex flex-col min-h-dvh bg-muted/30 text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg">SPMB 2026</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/selection-results">
                    <Megaphone className="mr-2 h-4 w-4" /> Lihat Hasil Seleksi
                </Link>
            </Button>
            <Button asChild>
                <Link href="#login">
                    <LogIn className="mr-2 h-4 w-4" /> Masuk
                </Link>
            </Button>
          </div>
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
                    <div className="mt-8 flex flex-wrap gap-4">
                        <Button size="lg" asChild>
                            <Link href="#login">
                                Saya Sudah Punya Akun
                                <LogIn className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>

                         <Dialog>
                            <DialogTrigger asChild>
                                <Button size="lg" variant="secondary">
                                    <UserPlus className="mr-2 h-5 w-5" />
                                    Belum Punya Akun?
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Info className="h-6 w-6 text-primary" />
                                    Informasi Pembuatan Akun
                                </DialogTitle>
                                <DialogDescription>
                                    Berikut adalah cara untuk mendapatkan akun pendaftaran Anda.
                                </DialogDescription>
                                </DialogHeader>
                                <div className="py-4 space-y-4 text-sm">
                                    <div className="rounded-lg border p-4">
                                        <h4 className="font-semibold mb-2">Bagi Siswa Dalam Daerah</h4>
                                        <p className="text-muted-foreground">
                                        Akun pendaftaran Anda akan dibuatkan dan didistribusikan oleh <strong>operator dari sekolah (SMP/MTs) Anda masing-masing</strong>. Silakan hubungi pihak sekolah Anda untuk mendapatkan akun.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <h4 className="font-semibold mb-2">Bagi Siswa Lulusan Luar Daerah</h4>
                                        <p className="text-muted-foreground">
                                        Harap melapor ke <strong>Cabang Dinas Pendidikan</strong> yang menaungi sekolah tujuan Anda dengan membawa berkas-berkas yang diperlukan untuk dibuatkan akun pendaftaran.
                                        </p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="relative h-80 lg:h-full rounded-2xl overflow-hidden shadow-2xl">
                    <Image
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                        alt="Siswa-siswi ceria belajar bersama"
                        fill
                        className="object-cover"
                        priority
                        data-ai-hint="happy students studying"
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
                            <StatusCheckForm />
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
