
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowRight, UserPlus, Edit3, School, ClipboardCheck, Megaphone, Heart, GraduationCap, MapPin, Briefcase } from 'lucide-react';

const alurPendaftaran = [
  { icon: UserPlus, title: 'Buat Akun', description: 'Buat akun pendaftaran Anda menggunakan NISN yang valid.' },
  { icon: Edit3, title: 'Isi Biodata', description: 'Lengkapi biodata diri, data orang tua, dan nilai rapor Anda.' },
  { icon: School, title: 'Pilih Sekolah & Jalur', description: 'Pilih jalur pendaftaran dan sekolah tujuan sesuai prioritas.' },
  { icon: ClipboardCheck, title: 'Verifikasi Berkas', description: 'Panitia akan memeriksa kesesuaian data dan berkas Anda.' },
  { icon: Megaphone, title: 'Pengumuman', description: 'Lihat hasil seleksi pendaftaran Anda secara online.' },
];

const jalurPendaftaran = [
    { icon: Heart, title: 'Afirmasi', description: 'Diperuntukkan bagi calon siswa dari keluarga kurang mampu atau penyandang disabilitas.' },
    { icon: GraduationCap, title: 'Prestasi', description: 'Berdasarkan prestasi akademik (nilai rapor) atau non-akademik (lomba).' },
    { icon: MapPin, title: 'Domisili/Zonasi', description: 'Berdasarkan jarak tempat tinggal calon siswa dengan sekolah tujuan.' },
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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <GraduationCap className="h-6 w-6 text-primary" />
            <span>PMB 2026</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
                <Link href="/selection-results">
                    Seleksi
                </Link>
            </Button>
            <Button asChild>
              <Link href="/login">
                Masuk
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="container grid md:grid-cols-2 gap-10 items-center py-16 sm:py-20 md:py-24 lg:py-28 px-4">
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter">
              Selamat Datang di Portal PMB 2026
            </h1>
            <p className="max-w-xl text-md sm:text-lg text-muted-foreground">
              Mulai langkah pertama menuju masa depan cerah Anda. Sistem Penerimaan Murid Baru (PMB) online yang mudah, transparan, dan terpercaya.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild>
                <Link href="/login">Daftar / Masuk Sekarang</Link>
              </Button>
            </div>
          </div>
          <div className="hidden md:block">
            <Image
              src="https://placehold.co/600x400.png"
              alt="Ilustrasi siswa belajar"
              width={600}
              height={400}
              className="rounded-xl shadow-2xl"
              data-ai-hint="students studying school"
            />
          </div>
        </section>

        {/* Alur Pendaftaran Section */}
        <section id="alur" className="py-20 bg-muted/50">
          <div className="container px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold">Alur Pendaftaran</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground">
                Ikuti 5 langkah mudah untuk menyelesaikan proses pendaftaran Anda dari awal hingga akhir.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {alurPendaftaran.map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                  <div className="mb-4 bg-primary text-primary-foreground rounded-full p-4 w-fit">
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Jalur Pendaftaran Section */}
        <section id="jalur" className="py-20">
          <div className="container px-4">
             <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold">Jalur Pendaftaran</h2>
              <p className="max-w-2xl mx-auto text-muted-foreground">
                Pilih jalur yang paling sesuai dengan kriteria dan kondisi Anda.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {jalurPendaftaran.map((jalur, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader className="flex flex-row items-center gap-4">
                            <div className="p-3 bg-primary/10 text-primary rounded-lg">
                                <jalur.icon className="h-6 w-6"/>
                            </div>
                            <CardTitle className="text-xl">{jalur.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{jalur.description}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-muted/50">
          <div className="container max-w-3xl px-4">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold">Pertanyaan Umum (FAQ)</h2>
              <p className="mx-auto text-muted-foreground">
                Temukan jawaban untuk pertanyaan yang paling sering diajukan.
              </p>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-base text-muted-foreground">
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
