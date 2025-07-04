
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowDown, UserPlus, Edit3, School, FileUp, Megaphone, Heart, GraduationCap, MapPin, Briefcase, User, Building, LogIn, CheckCircle } from 'lucide-react';
import { LoginForm } from '@/components/auth/login-form';
import { Badge } from '@/components/ui/badge';


const alurPendaftaran = [
  { icon: UserPlus, title: 'Dapatkan Akun', description: 'Dapatkan akun dan kata sandi dari operator sekolah asal Anda (SMP/MTs) atau dari Dinas Pendidikan.' },
  { icon: Edit3, title: 'Lengkapi Biodata', description: 'Masuk dan lengkapi biodata, data orang tua, nilai rapor, serta unggah foto profil.' },
  { icon: School, title: 'Pilih Jalur & Sekolah', description: 'Pilih jalur pendaftaran dan urutkan 1-5 sekolah/jurusan tujuan.' },
  { icon: FileUp, title: 'Unggah Berkas', description: 'Unggah semua dokumen persyaratan yang diperlukan sesuai dengan jalur yang dipilih.' },
  { icon: Megaphone, title: 'Lihat Pengumuman', description: 'Pantau status pendaftaran Anda dan lihat hasil pengumuman akhir.' },
];

const jalurPendaftaran = [
    { icon: Heart, title: 'Afirmasi', description: 'Diperuntukkan bagi calon siswa dari keluarga kurang mampu atau penyandang disabilitas.' },
    { icon: GraduationCap, title: 'Prestasi', description: 'Berdasarkan prestasi akademik (nilai rapor) atau non-akademik (lomba).' },
    { icon: MapPin, title: 'Zonasi/Domisili', description: 'Berdasarkan jarak tempat tinggal calon siswa dengan sekolah tujuan.' },
    { icon: Briefcase, title: 'Mutasi Orang Tua', description: 'Untuk calon siswa yang orang tuanya pindah tugas.' },
];

const faqs = [
  {
    question: "Dokumen apa saja yang perlu disiapkan?",
    answer: "Siapkan file scan Kartu Keluarga, Akta Kelahiran, Surat Keterangan Lulus (SKL), dan rapor semester 1-5. Dokumen tambahan mungkin diperlukan tergantung jalur yang dipilih."
  },
  {
    question: "Berapa banyak sekolah yang bisa saya pilih?",
    answer: "Anda dapat memilih hingga 5 sekolah/jurusan tujuan. Pastikan untuk mengurutkannya berdasarkan prioritas utama Anda."
  },
  {
    question: "Bagaimana jika saya melakukan kesalahan saat mengisi data?",
    answer: "Selama data belum diverifikasi, Anda masih dapat mengubahnya. Jika pendaftaran ditolak karena kesalahan data, Anda akan diberi kesempatan untuk melakukan perbaikan."
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
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <GraduationCap className="h-7 w-7 text-primary" />
            <span>PMB 2026</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="#alur" className="transition-colors hover:text-primary">Alur</Link>
            <Link href="#jalur" className="transition-colors hover:text-primary">Jalur</Link>
            <Link href="#faq" className="transition-colors hover:text-primary">FAQ</Link>
          </nav>
          <Button asChild>
              <Link href="#login-section">
                  <LogIn className="mr-2 h-4 w-4" /> Masuk
              </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative container text-center py-24 sm:py-32 md:py-40 flex flex-col items-center">
            <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)]"></div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tighter max-w-4xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
              Portal Penerimaan Murid Baru 2026
            </h1>
            <p className="mt-6 max-w-2xl text-lg sm:text-xl text-muted-foreground">
              Mulai langkah pertama menuju masa depan cerah Anda. Sistem PMB online yang mudah, transparan, dan terpercaya untuk Kabupaten Berau.
            </p>
            <div className="mt-8 flex gap-4">
                 <Button size="lg" asChild>
                    <Link href="#login-section">
                        <UserPlus className="mr-2"/>
                        Mulai Pendaftaran
                    </Link>
                </Button>
                 <Button size="lg" variant="outline" asChild>
                    <Link href="/selection-results">
                        Lihat Hasil Seleksi
                    </Link>
                </Button>
            </div>
        </section>
        
        {/* Alur Pendaftaran Section */}
        <section id="alur" className="py-20 lg:py-24">
          <div className="container px-4">
            <div className="text-center space-y-4 mb-16">
              <Badge variant="outline">Langkah 1</Badge>
              <h2 className="text-3xl md:text-4xl font-bold">Alur Pendaftaran</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground">
                Ikuti 5 langkah mudah untuk menyelesaikan proses pendaftaran Anda dari awal hingga akhir.
              </p>
            </div>
            <div className="relative">
                <div className="absolute top-8 left-0 w-full h-0.5 bg-border hidden md:block"></div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-x-8 gap-y-12 relative">
                  {alurPendaftaran.map((item, index) => (
                    <div key={index} className="flex flex-col items-center text-center space-y-3">
                      <div className="mb-4 bg-background border-2 border-primary text-primary rounded-full p-4 w-16 h-16 flex items-center justify-center relative z-10">
                        <item.icon className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </section>

        {/* Login & Info Section */}
        <section id="login-section" className="py-20 lg:py-24 bg-muted/40">
          <div className="container">
            <div className="mx-auto max-w-2xl text-center">
              <div className="space-y-2 mb-8">
                <Badge variant="outline">Langkah 2</Badge>
                <h2 className="text-3xl md:text-4xl font-bold">Masuk & Lengkapi Data</h2>
                <p className="text-muted-foreground text-lg !mt-4">
                  Gunakan akun yang telah Anda dapatkan dari operator sekolah (untuk siswa dalam kabupaten) atau dari dinas pendidikan (untuk siswa luar kabupaten) untuk masuk.
                </p>
              </div>
              <LoginForm />
            </div>
          </div>
        </section>

        {/* Jalur Pendaftaran Section */}
        <section id="jalur" className="py-20 lg:py-24">
          <div className="container px-4">
             <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Jalur Pendaftaran</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground">
                Pilih jalur yang paling sesuai dengan kriteria dan kondisi Anda. Setiap jalur memiliki persyaratan dan kuota yang berbeda.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {jalurPendaftaran.map((jalur, index) => (
                    <Card key={index} className="flex flex-col text-center items-center p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                        <div className="mb-4 p-4 bg-primary/10 text-primary rounded-full">
                            <jalur.icon className="h-8 w-8"/>
                        </div>
                        <CardTitle className="text-xl mb-2">{jalur.title}</CardTitle>
                        <CardDescription className="flex-grow">
                            {jalur.description}
                        </CardDescription>
                    </Card>
                ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 lg:py-24 bg-muted/40">
          <div className="container max-w-4xl px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Pertanyaan Umum (FAQ)</h2>
              <p className="mx-auto text-muted-foreground">
                Temukan jawaban untuk pertanyaan yang paling sering diajukan.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full bg-background rounded-lg border">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg text-left px-6 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground px-6">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-8 text-center text-sm text-muted-foreground px-4">
          &copy; {new Date().getFullYear()} PMB 2026. Dibuat oleh Memofy Studio.
        </div>
      </footer>
    </div>
  );
}
