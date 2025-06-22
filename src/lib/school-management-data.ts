
export type SchoolJenjang = 'SMP' | 'SMA' | 'SMK';
export type SchoolJenis = 'Negeri' | 'Swasta';

export interface ManagedSchool {
  npsn: string; // Primary Key
  namaSekolah: string;
  jenjang: SchoolJenjang;
  jenis: SchoolJenis;
}

export const initialManagedSchools: ManagedSchool[] = [
  { npsn: '30401918', namaSekolah: 'SMP Negeri 1 Tanjung Redeb', jenjang: 'SMP', jenis: 'Negeri' },
  { npsn: '30401878', namaSekolah: 'SMP Negeri 2 Teluk Bayur', jenjang: 'SMP', jenis: 'Negeri' },
  { npsn: '69753308', namaSekolah: 'MTs Al-Kholil', jenjang: 'SMP', jenis: 'Swasta' },
  { npsn: '30401827', namaSekolah: 'SMA Negeri 1 Tanjung Redeb', jenjang: 'SMA', jenis: 'Negeri' },
  { npsn: '30401828', namaSekolah: 'SMK Negeri 1 Berau', jenjang: 'SMK', jenis: 'Negeri' },
  { npsn: '30404228', namaSekolah: 'SMA Negeri 4 Berau', jenjang: 'SMA', jenis: 'Negeri' },
];
