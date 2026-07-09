
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { GraduationCap, LogIn, CheckCircle, UserPlus, Info, Megaphone, School, Route, Calendar, Map, BarChart, Users } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusCheckForm } from '@/components/landing/status-check-form';
import { getApplicants } from '@/lib/applicantService';
import { getSchools } from '@/lib/schoolService';
import { getStages } from '@/lib/stageService';
import { useEffect, useState } from 'react';
import { pullFromSupabase } from '@/lib/localStorage';
import { initializeAllData } from '@/lib/initializeDatabase';

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
    answer: "Siapkan file scan Kartu Keluarga, Akta Kelahiran, Surat Keterangan Lulus (SKL), dan rapor semester 1-5 dalam format digital (PDF/JPG). Pastikan ukuran file tidak lebih dari 2MB per dokumen."
  },
  {
    question: "Berapa banyak sekolah yang bisa saya pilih?",
    answer: "Anda dapat memilih hingga 5 kombinasi sekolah/jurusan. Pastikan untuk mengurutkannya berdasarkan prioritas utama Anda."
  },
  {
    question: "Bagaimana jika saya melakukan kesalahan saat mengisi data?",
    answer: "Selama data belum diverifikasi oleh panitia, Anda masih dapat mengubahnya melalui dasbor pendaftar."
  },
  {
    question: "Bagaimana proses seleksi dilakukan?",
    answer: "Seleksi dilakukan berdasarkan peringkat nilai akhir di setiap sekolah dan jalur yang dipilih."
  }
];

export default function LandingPage() {
  const [schedule, setSchedule] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      await pullFromSupabase();
      initializeAllData();
      
      const allStages = getStages();
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
    }
    loadData();
  }, []);

  return (
    <div className="flex flex-col min-h-dvh bg-muted/30 text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span className="font-bold text-lg">SPMB 2026</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/schools">
                    <School className="mr-2 h-4 w-4" /> Daftar Sekolah
                </Link>
            </Button>
            <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/selection-results">
                    <Megaphone className="mr-2 h-4 w-4" /> Hasil Seleksi
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
                                </DialogHeader>
                                <div className="py-4 space-y-4 text-sm">
                                    <div className="rounded-lg border p-4">
                                        <h4 className="font-semibold mb-2">Bagi Siswa Dalam Daerah</h4>
                                        <p className="text-muted-foreground">
                                        Akun pendaftaran Anda akan dibuatkan oleh <strong>operator dari sekolah (SMP/MTs) asal</strong>.
                                        </p>
                                    </div>
                                    <div className="rounded-lg border p-4">
                                        <h4 className="font-semibold mb-2">Bagi Siswa Lulusan Luar Daerah</h4>
                                        <p className="text-muted-foreground">
                                        Harap melapor ke <strong>Cabang Dinas Pendidikan</strong> setempat dengan membawa berkas persyaratan.
                                        </p>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-2xl">
                    <style>{`
                        @keyframes float-up { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
                        @keyframes float-down { 0%,100%{transform:translateY(0)} 50%{transform:translateY(10px)} }
                        @keyframes pulse-ring { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.6)} }
                        @keyframes slide-in-r { from{opacity:0;transform:translateX(30px)} to{opacity:1;transform:translateX(0)} }
                        @keyframes slide-in-l { from{opacity:0;transform:translateX(-30px)} to{opacity:1;transform:translateX(0)} }
                        @keyframes grow-bar { from{width:0} to{width:var(--w)} }
                        @keyframes tick-in { from{opacity:0;transform:scale(0)} to{opacity:1;transform:scale(1)} }
                        @keyframes spin-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
                        @keyframes fade-cycle { 0%,100%{opacity:0.3} 50%{opacity:1} }
                        .card-float-a { animation: float-up 4s ease-in-out infinite; }
                        .card-float-b { animation: float-down 5s ease-in-out infinite; }
                        .card-float-c { animation: float-up 3.5s ease-in-out infinite 0.5s; }
                        .slide-r { animation: slide-in-r 0.8s ease forwards; }
                        .slide-l { animation: slide-in-l 0.8s ease forwards 0.2s; opacity:0; }
                        .bar1 { --w:72%; animation: grow-bar 2s ease forwards 0.5s; width:0; }
                        .bar2 { --w:55%; animation: grow-bar 2s ease forwards 0.8s; width:0; }
                        .bar3 { --w:40%; animation: grow-bar 2s ease forwards 1.1s; width:0; }
                        .bar4 { --w:85%; animation: grow-bar 2s ease forwards 1.4s; width:0; }
                        .tick1 { animation: tick-in 0.4s ease forwards 1.2s; opacity:0; }
                        .tick2 { animation: tick-in 0.4s ease forwards 1.5s; opacity:0; }
                        .tick3 { animation: tick-in 0.4s ease forwards 1.8s; opacity:0; }
                        .spin-orb { animation: spin-slow 8s linear infinite; }
                        .pulse-dot { animation: pulse-ring 1.8s ease-out infinite; }
                        .fade1 { animation: fade-cycle 2.5s ease-in-out infinite 0s; }
                        .fade2 { animation: fade-cycle 2.5s ease-in-out infinite 0.8s; }
                        .fade3 { animation: fade-cycle 2.5s ease-in-out infinite 1.6s; }
                    `}</style>

                    {/* Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-blue-500/10" />

                    {/* Decorative spinning ring */}
                    <div className="spin-orb absolute -top-16 -right-16 w-64 h-64 rounded-full border-2 border-dashed border-primary/20" />
                    <div className="spin-orb absolute -bottom-12 -left-12 w-48 h-48 rounded-full border border-dashed border-blue-400/20" style={{animationDirection:'reverse'}} />

                    {/* Main dashboard card */}
                    <div className="slide-r absolute top-8 left-8 right-8 bottom-8 bg-card rounded-2xl shadow-xl border border-border/60 overflow-hidden">
                        {/* Top bar */}
                        <div className="flex items-center gap-2 px-5 py-3 border-b border-border/50 bg-muted/30">
                            <div className="w-3 h-3 rounded-full bg-red-400" />
                            <div className="w-3 h-3 rounded-full bg-yellow-400" />
                            <div className="w-3 h-3 rounded-full bg-green-400" />
                            <div className="mx-3 flex-1 h-6 rounded-md bg-muted/60 text-xs text-muted-foreground flex items-center px-3">
                                spmb.beraukab.go.id
                            </div>
                        </div>

                        <div className="grid grid-cols-3 h-[calc(100%-44px)]">
                            {/* Left sidebar */}
                            <div className="col-span-1 border-r border-border/40 p-4 space-y-2 bg-muted/20">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Menu</p>
                                {[
                                  { label: 'Dashboard', active: true },
                                  { label: 'Biodata' },
                                  { label: 'Sekolah Tujuan' },
                                  { label: 'Dokumen' },
                                  { label: 'Status' },
                                ].map((item, i) => (
                                    <div key={i} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${item.active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                                        <div className={`w-2 h-2 rounded-full ${item.active ? 'bg-primary-foreground' : 'bg-muted-foreground/40'}`} />
                                        {item.label}
                                    </div>
                                ))}
                            </div>

                            {/* Main content */}
                            <div className="col-span-2 p-5 overflow-hidden space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-bold text-sm">Selamat Datang, Budi 👋</h3>
                                        <p className="text-[10px] text-muted-foreground">SPMB Kabupaten Berau 2026</p>
                                    </div>
                                    <div className="relative">
                                        <div className="pulse-dot absolute inset-0 rounded-full bg-green-400/50" />
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">B</div>
                                    </div>
                                </div>

                                {/* Stat cards */}
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { label: 'Kuota SMA', val: '1.240', color: 'bg-blue-500/10 text-blue-600', cls: 'fade1' },
                                        { label: 'Pendaftar', val: '3.782', color: 'bg-primary/10 text-primary', cls: 'fade2' },
                                        { label: 'Sekolah', val: '28', color: 'bg-green-500/10 text-green-600', cls: 'fade3' },
                                    ].map((s, i) => (
                                        <div key={i} className={`${s.color} ${s.cls} rounded-xl p-3 text-center`}>
                                            <p className="text-lg font-extrabold leading-none">{s.val}</p>
                                            <p className="text-[9px] mt-1 opacity-80">{s.label}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Progress bars */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Progres Jalur</p>
                                    {[
                                        { label: 'Afirmasi', cls: 'bar1', color: 'bg-blue-500' },
                                        { label: 'Prestasi', cls: 'bar2', color: 'bg-primary' },
                                        { label: 'Mutasi', cls: 'bar3', color: 'bg-yellow-500' },
                                        { label: 'Domisili', cls: 'bar4', color: 'bg-green-500' },
                                    ].map((b, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className="text-[9px] w-12 text-muted-foreground shrink-0">{b.label}</span>
                                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                                <div className={`${b.cls} ${b.color} h-full rounded-full`} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Checklist */}
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Kelengkapan Berkas</p>
                                    {[
                                        { label: 'Kartu Keluarga', cls: 'tick1' },
                                        { label: 'Akta Kelahiran', cls: 'tick2' },
                                        { label: 'Rapor Semester', cls: 'tick3' },
                                    ].map((c, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span className={`${c.cls} w-4 h-4 rounded-full bg-green-500 flex items-center justify-center`}>
                                                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 4l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/></svg>
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">{c.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating notification card */}
                    <div className="card-float-a absolute -right-2 top-24 w-44 bg-card border border-border shadow-xl rounded-xl p-3 text-xs space-y-1 z-10">
                        <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 3" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round"/></svg>
                            </div>
                            <span className="font-semibold text-green-600">Berkas Diterima</span>
                        </div>
                        <p className="text-muted-foreground text-[9px] leading-snug">Dokumen Anda telah diverifikasi oleh panitia.</p>
                    </div>

                    {/* Floating rank card */}
                    <div className="card-float-b absolute -left-2 bottom-24 w-40 bg-card border border-border shadow-xl rounded-xl p-3 text-xs z-10">
                        <p className="font-semibold text-[10px] text-muted-foreground mb-1.5">Peringkat Sementara</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-primary">#12</span>
                            <span className="text-[9px] text-muted-foreground">/ 340</span>
                        </div>
                        <p className="text-[9px] text-green-600 font-medium mt-1">▲ Jalur Domisili — SMAN 1</p>
                    </div>
                </div>
            </div>
          </div>
        </section>
        
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-24 space-y-20 sm:space-y-24">
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
                            <p className="text-muted-foreground text-sm">{card.description}</p>
                        </CardContent>
                    </Card>
                ))}
                </div>
            </section>

            <section id="login">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">Akses Portal Anda</h2>
                </div>
                <Card className="max-w-xl mx-auto shadow-2xl rounded-2xl">
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-14 rounded-t-2xl">
                            <TabsTrigger value="login" className="text-base rounded-tl-2xl">Masuk Akun</TabsTrigger>
                            <TabsTrigger value="status" className="text-base rounded-tr-2xl">Cek Status</TabsTrigger>
                        </TabsList>
                        <TabsContent value="login" className="p-8">
                            <LoginForm />
                        </TabsContent>
                        <TabsContent value="status" className="p-8">
                            <StatusCheckForm />
                        </TabsContent>
                    </Tabs>
                </Card>
            </section>
            
            <section id="jadwal">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">Jadwal Pelaksanaan</h2>
                </div>
                <Card className="rounded-2xl shadow-xl overflow-hidden">
                    <CardContent className="p-8 md:p-12">
                        <div className="space-y-12">
                            {schedule.map((item, index) => (
                                <div key={item.title} className="flex flex-col md:flex-row md:items-center gap-6">
                                    <div className="md:w-1/4">
                                        <p className="text-lg font-bold text-primary">{item.date}</p>
                                    </div>
                                    <div className="md:w-3/4 p-6 rounded-2xl border bg-card shadow-sm">
                                        <h3 className="text-xl font-bold">{item.title}</h3>
                                        <p className="mt-2 text-muted-foreground">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </section>

            <section id="faq">
                <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold">Pertanyaan Umum (FAQ)</h2>
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

      <footer className="border-t bg-background">
        <div className="container max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Panitia SPMB Kabupaten Berau. Dibuat oleh Memofy Studio.
        </div>
      </footer>
    </div>
  );
}
