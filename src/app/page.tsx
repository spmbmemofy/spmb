
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

const infoCards = [
  {
    icon: Route,
    title: 'Alur Pendaftaran',
    description: 'Pahami langkah-langkah pendaftaran dari awal hingga akhir.',
    href: '#alur',
  },
  {
    icon: Calendar,
    title: 'Jadwal Penting',
    description: 'Lihat semua tanggal penting pelaksanaan SPMB 2026.',
    href: '#jadwal',
  },
  {
    icon: Map,
    title: 'Jalur Tersedia',
    description: 'Ketahui berbagai jalur pendaftaran yang dibuka tahun ini.',
    href: '#jalur',
  },
  {
    icon: BarChart,
    title: 'Daya Tampung',
    description: 'Informasi kuota penerimaan untuk setiap sekolah tujuan.',
    href: '/registration/home', // Placeholder link
  },
];

const schedule = [
  {
    date: '10 - 25 Juni 2026',
    title: 'Pendaftaran & Verifikasi Berkas',
    description: 'Siswa melakukan pendaftaran online, melengkapi biodata, memilih sekolah, dan mengunggah berkas persyaratan.',
    status: 'ongoing',
  },
  {
    date: '26 - 28 Juni 2026',
    title: 'Pemeringkatan & Seleksi',
    description: 'Sistem melakukan pemeringkatan otomatis berdasarkan nilai dan kriteria jalur yang dipilih.',
    status: 'upcoming',
  },
  {
    date: '29 Juni 2026',
    title: 'Pengumuman Hasil Seleksi',
    description: 'Hasil akhir seleksi diumumkan secara online melalui portal ini.',
    status: 'upcoming',
  },
  {
    date: '30 Juni - 2 Juli 2026',
    title: 'Daftar Ulang',
    description: 'Siswa yang dinyatakan lulus melakukan proses daftar ulang di sekolah penerima.',
    status: 'upcoming',
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
  return (
    <div className="flex flex-col min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="container flex h-16 max-w-7xl items-center justify-between">
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
        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center text-white">
            <Image
                src="https://placehold.co/1600x900.png"
                alt="Siswa-siswi ceria di lingkungan sekolah"
                layout="fill"
                objectFit="cover"
                className="brightness-[.4]"
                data-ai-hint="school students education"
            />
            <div className="relative z-10 container max-w-4xl px-4">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                    Selamat Datang di Portal SPMB 2026
                </h1>
                <p className="mt-6 text-lg sm:text-xl text-white/90">
                    Sistem Penerimaan Murid Baru Online untuk Kabupaten Berau. Transparan, akuntabel, dan mudah diakses.
                </p>
                <div className="mt-8">
                    <Button size="lg" variant="secondary" asChild>
                        <Link href="#jadwal">
                            Lihat Jadwal Pelaksanaan <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                </div>
            </div>
        </section>
        
        {/* Login & Status Check Section */}
        <section id="login" className="py-16 md:-mt-24 relative z-20">
            <div className="container max-w-4xl">
                <Tabs defaultValue="login" className="w-full flex flex-col items-center">
                    <TabsList className="grid grid-cols-2 h-12">
                        <TabsTrigger value="login" className="text-base">Masuk Akun</TabsTrigger>
                        <TabsTrigger value="status" className="text-base">Cek Status Pendaftaran</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="w-full">
                        <Card className="rounded-t-none">
                            <CardHeader className="text-center">
                                <CardTitle>Login Pendaftar / Petugas</CardTitle>
                                <CardDescription>Gunakan akun yang telah Anda dapatkan untuk masuk ke sistem.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <LoginForm />
                            </CardContent>
                        </Card>
                    </TabsContent>
                    <TabsContent value="status" className="w-full">
                        <Card className="rounded-t-none">
                           <CardHeader className="text-center">
                                <CardTitle>Cek Status Pendaftaran</CardTitle>
                                <CardDescription>Masukkan NISN Anda untuk melihat status verifikasi dan hasil seleksi.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex w-full items-center space-x-2">
                                    <Input type="text" placeholder="Masukkan NISN Anda..." />
                                    <Button type="submit">
                                        <Search className="mr-2 h-4 w-4" /> Cek
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </section>

        {/* Info Cards Section */}
        <section id="informasi" className="py-16 bg-muted/50">
          <div className="container max-w-7xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {infoCards.map((card) => (
                <Card key={card.title} className="group hover:border-primary hover:shadow-lg transition-all">
                    <CardHeader>
                        <div className="mb-4 w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                            <card.icon className="h-6 w-6" />
                        </div>
                        <CardTitle>{card.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{card.description}</p>
                    </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Schedule Section */}
        <section id="jadwal" className="py-20 md:py-28">
            <div className="container max-w-5xl">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">Jadwal Pelaksanaan</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Catat tanggal-tanggal penting berikut agar tidak terlewat.
                    </p>
                </div>
                <div className="relative">
                    <div className="absolute left-1/2 -translate-x-1/2 h-full w-0.5 bg-border hidden md:block" aria-hidden="true"></div>
                    <div className="space-y-12 md:space-y-0">
                        {schedule.map((item, index) => (
                            <div key={item.title} className="relative flex items-center md:justify-center">
                                <div className={cn("md:w-1/2 flex", index % 2 === 0 ? 'md:justify-end' : 'md:justify-start')}>
                                    <div className={cn("w-full md:max-w-sm p-6 rounded-lg border bg-card shadow-sm", index % 2 === 0 ? 'md:mr-12' : 'md:ml-12')}>
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
            </div>
        </section>

        {/* Statistics Section */}
        <section id="statistik" className="py-20 md:py-28 bg-muted/50">
            <div className="container max-w-7xl">
                 <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold">Statistik Pendaftaran</h2>
                    <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
                        Data pendaftaran diperbarui secara real-time.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => (
                        <Card key={index} className="text-center">
                            <CardContent className="p-6">
                                <stat.icon className="h-10 w-10 text-primary mx-auto mb-4" />
                                <p className="text-4xl font-bold">{stat.value}</p>
                                <p className="mt-1 text-muted-foreground">{stat.label}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
        
        {/* FAQ Section */}
        <section id="faq" className="py-20 md:py-28">
          <div className="container max-w-4xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Pertanyaan Umum (FAQ)</h2>
              <p className="mt-4 mx-auto text-muted-foreground">
                Temukan jawaban untuk pertanyaan yang paling sering diajukan.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="py-4 text-lg text-left hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container max-w-7xl py-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Panitia SPMB Kabupaten Berau. Dibuat oleh Memofy Studio.
        </div>
      </footer>
    </div>
  );
}
