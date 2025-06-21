
export type School = {
  id: string;
  namaSekolah: string;
  alamat: string;
  kecamatan: string;
  akreditasi: "A" | "B" | "C" | "Belum Terakreditasi";
  kuota: number;
  type: "SMA" | "SMK";
  majors?: string[];
  jalurKuota?: { afirmasi: number; mutasi: number; prestasi: number; domisili: number; };
  jumlahPendaftar?: number;
  statusPendaftaran?: "Buka" | "Tutup" | "Segera Penuh";
  telepon?: string;
  tahapPendaftaran?: number;
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
  },
  {
    id: "sman2berau",
    namaSekolah: "SMA Negeri 2 Berau",
    alamat: "Jl. H. Isa III, Karang Ambun, Tanjung Redeb, Berau",
    kecamatan: "Kec. Tanjung Redeb",
    kuota: 228,
    akreditasi: "B",
    type: "SMA",
  },
  {
    id: "smamuhammadiyahberau",
    namaSekolah: "SMA Muhammadiyah Tanjung Redeb",
    alamat: "Jl. SA Maulana, Bugis, Tanjung Redeb, Berau",
    kecamatan: "Kec. Tanjung Redeb",
    kuota: 142,
    akreditasi: "B",
    type: "SMA",
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
  },
];
