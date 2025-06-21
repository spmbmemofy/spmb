
export type School = {
  id: string;
  namaSekolah: string;
  alamat: string;
  kecamatan: string;
  akreditasi: "A" | "B" | "C" | "Belum Terakreditasi";
  kuota: number;
  type: "SMA" | "SMK";
  majors?: string[];
  jalurKuota: { afirmasi: number; mutasi: number; prestasi: number; domisili: number; };
  jumlahPendaftar: number;
  statusPendaftaran: "Buka" | "Tutup" | "Segera Penuh";
  telepon: string;
  tahapPendaftaran: number;
};

export const initialSchoolData: School[] = [
  {
    id: "sman1tanjungredeb",
    namaSekolah: "SMA Negeri 1 Tanjung Redeb",
    alamat: "Jl. Jenderal Sudirman No.50, Tanjung Redeb, Berau",
    kecamatan: "Kec. Tanjung Redeb",
    kuota: 266,
    akreditasi: "A",
    type: "SMA",
    jalurKuota: { afirmasi: 56, mutasi: 14, prestasi: 84, domisili: 112 },
    jumlahPendaftar: 50, 
    statusPendaftaran: "Buka",
    telepon: "0554-21045",
    tahapPendaftaran: 1,
  },
  {
    id: "smkn1berau",
    namaSekolah: "SMK Negeri 1 Berau",
    alamat: "Jl. Murjani II, Gayam, Tanjung Redeb, Berau",
    kecamatan: "Kec. Tanjung Redeb",
    kuota: 304,
    akreditasi: "A",
    type: "SMK",
    majors: [
      "Teknik Komputer dan Jaringan",
      "Akuntansi dan Keuangan Lembaga",
      "Otomatisasi dan Tata Kelola Perkantoran",
      "Bisnis Daring dan Pemasaran",
    ],
    jalurKuota: { afirmasi: 61, mutasi: 15, prestasi: 91, domisili: 137 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka",
    telepon: "0554-21098",
    tahapPendaftaran: 1,
  },
  {
    id: "sman2berau",
    namaSekolah: "SMA Negeri 2 Berau",
    alamat: "Jl. H. Isa III, Karang Ambun, Tanjung Redeb, Berau",
    kecamatan: "Kec. Tanjung Redeb",
    kuota: 228,
    akreditasi: "B",
    type: "SMA",
    jalurKuota: { afirmasi: 46, mutasi: 11, prestasi: 68, domisili: 103 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka",
    telepon: "0554-22111",
    tahapPendaftaran: 1,
  },
  {
    id: "smamuhammadiyahberau",
    namaSekolah: "SMA Muhammadiyah Tanjung Redeb",
    alamat: "Jl. SA Maulana, Bugis, Tanjung Redeb, Berau",
    kecamatan: "Kec. Tanjung Redeb",
    kuota: 142,
    akreditasi: "B",
    type: "SMA",
    jalurKuota: { afirmasi: 28, mutasi: 7, prestasi: 43, domisili: 64 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka",
    telepon: "0554-23456",
    tahapPendaftaran: 2,
  },
  {
    id: "smkyphbberau",
    namaSekolah: "SMK YPSHB (Yayasan Pendidikan Sinar Harapan Bangsa) Berau",
    alamat: "Jl. Pangeran Antasari, Teluk Bayur, Berau",
    kecamatan: "Kec. Teluk Bayur",
    kuota: 190,
    akreditasi: "B",
    type: "SMK",
    majors: ["Farmasi Klinis dan Komunitas", "Teknologi Laboratorium Medik"],
    jalurKuota: { afirmasi: 38, mutasi: 10, prestasi: 57, domisili: 85 },
    jumlahPendaftar: 50,
    statusPendaftaran: "Buka",
    telepon: "0554-24567",
    tahapPendaftaran: 2,
  },
  {
    id: "sman4berau",
    namaSekolah: "SMA Negeri 4 Berau",
    alamat: "Jl. Poros Labanan, Labanan Makmur, Teluk Bayur, Berau",
    kecamatan: "Kec. Teluk Bayur",
    kuota: 200,
    akreditasi: "B",
    type: "SMA",
    jalurKuota: { afirmasi: 40, mutasi: 10, prestasi: 60, domisili: 90 },
    jumlahPendaftar: 40,
    statusPendaftaran: "Buka",
    telepon: "0554-25001",
    tahapPendaftaran: 1,
  },
];

export interface OriginSchool {
  id: string;
  namaSekolah: string;
  status: "Negeri" | "Swasta";
  akreditasi: "A" | "B" | "C" | "Belum Terakreditasi";
  jumlahPendaftar: number;
}

export const initialOriginSchoolData: OriginSchool[] = [
    { id: "smpn1tanjungredeb", namaSekolah: "SMP Negeri 1 Tanjung Redeb", status: "Negeri", akreditasi: "A", jumlahPendaftar: 25 },
    { id: "smpn2telukbayur", namaSekolah: "SMP Negeri 2 Teluk Bayur", status: "Negeri", akreditasi: "B", jumlahPendaftar: 18 },
    { id: "smpn3sambaliung", namaSekolah: "SMP Negeri 3 Sambaliung", status: "Negeri", akreditasi: "B", jumlahPendaftar: 22 },
    { id: "mtsalkholil", namaSekolah: "MTs Al-Kholil", status: "Swasta", akreditasi: "A", jumlahPendaftar: 15 },
    { id: "smpitashshohwah", namaSekolah: "SMP IT Ash-Shohwah Berau", status: "Swasta", akreditasi: "A", jumlahPendaftar: 20 },
    { id: "smpmuhammadiyah", namaSekolah: "SMP Muhammadiyah Tanjung Redeb", status: "Swasta", akreditasi: "B", jumlahPendaftar: 12 },
];
