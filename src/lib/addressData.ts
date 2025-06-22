
'use client';

export type Province = 'Kalimantan Timur';
export type District = 'Kabupaten Berau';

export const addressData: Record<Province, Record<District, Record<string, string[]>>> = {
  "Kalimantan Timur": {
    "Kabupaten Berau": {
      "Kec. Tanjung Redeb": ["Kel. Tanjung Redeb", "Kel. Gayam", "Kel. Karang Ambun", "Kel. Bugis", "Kel. Sungai Bedungun"],
      "Kec. Teluk Bayur": ["Kel. Teluk Bayur", "Kel. Rinding", "Desa Labanan Makmur", "Desa Tumbit Dayak"],
      "Kec. Sambaliung": ["Kel. Sambaliung", "Desa Bebanir Bangun", "Desa Gurimbang", "Desa Suaran", "Desa Sukan Tengah", "Desa Pegat Bukur"],
      "Kec. Gunung Tabur": ["Kel. Gunung Tabur", "Desa Maluang", "Desa Samburakat", "Desa Merancang Ulu", "Desa Merancang Ilir"],
      "Kec. Segah": ["Desa Tepian Buah", "Desa Gunung Sari", "Desa Long Ayan", "Desa Punan Segah", "Desa Harapan Jaya"],
      "Kec. Pulau Derawan": ["Desa Pulau Derawan", "Desa Tanjung Batu", "Desa Kasai", "Desa Teluk Semanting"],
      "Kec. Maratua": ["Desa Maratua Payung-Payung", "Desa Maratua Teluk Alulu", "Desa Maratua Bohesilian"],
      "Kec. Biatan": ["Desa Biatan Lempake", "Desa Biatan Bapinang", "Desa Karangan"],
      "Kec. Talisayan": ["Desa Talisayan", "Desa Bumi Jaya", "Desa Suka Murya"],
      "Kec. Tabalar": ["Desa Tabalar Muara", "Desa Tabalar Ulu", "Desa Tubaan"],
      "Kec. Batu Putih": ["Desa Batu Putih", "Desa Tembudan", "Desa Lobang Kelatak"],
      "Kec. Biduk-Biduk": ["Desa Biduk-Biduk", "Desa Teluk Sulaiman", "Desa Giring-Giring"],
      "Kec. Kelay": ["Desa Sido Bangen", "Desa Muara Lesan", "Desa Merasa"],
    }
  }
};

export const provinces = Object.keys(addressData) as Province[];
export const getDistricts = (province: Province | undefined): District[] => province && addressData[province] ? Object.keys(addressData[province]) as District[] : [];
export const getSubdistricts = (province: Province | undefined, district: District | undefined): string[] => (province && district && addressData[province]?.[district]) ? Object.keys(addressData[province][district]) : [];
export const getVillages = (province: Province | undefined, district: District | undefined, subdistrict: string | undefined): string[] => (province && district && subdistrict && addressData[province]?.[district]?.[subdistrict]) ? addressData[province][district][subdistrict] : [];
