
'use client';

export type Province = 'Kalimantan Timur';
export type District = 'Kabupaten Berau';

export const addressData: Record<Province, Record<District, Record<string, string[]>>> = {
  "Kalimantan Timur": {
    "Kabupaten Berau": {
      "Kec. Batu Putih": ["Balikukup", "Batu Putih", "Kayu Indah", "Lobang Kelatak", "Sumber Agung", "Tembudan", "Ampen Medang"],
      "Kec. Biatan": ["Biatan Bapinang", "Biatan Baru", "Biatan Ilir", "Biatan Lempake", "Biatan Ulu", "Bukit Makmur Jaya", "Karangan", "Manunggal Jaya"],
      "Kec. Biduk-Biduk": ["Biduk-Biduk", "Giring-Giring", "Pantai Harapan", "Teluk Sulaiman", "Teluk Sumbang", "Tanjung Perepat"],
      "Kec. Gunung Tabur": ["Batu-Batu", "Birang", "Gunung Tabur", "Maluang", "Melati Jaya", "Merancang Ilir", "Merancang Ulu", "Pulau Besing", "Sambakungan", "Samburakat", "Tasuk"],
      "Kec. Kelay": ["Lesan Dayak", "Long Beliu", "Long Duhung", "Long Keluh", "Long Lamcin", "Long Sului", "Mapulu", "Merabu", "Merasa", "Merapun", "Muara Lesan", "Panaan", "Sido Bangen"],
      "Kec. Maratua": ["Bohesilian", "Payung-Payung", "Teluk Alulu", "Teluk Harapan"],
      "Kec. Pulau Derawan": ["Kasai", "Pegat Betumbuk", "Pulau Derawan", "Tanjung Batu", "Teluk Semanting"],
      "Kec. Sambaliung": ["Bebanir", "Bena Baru", "Gurimbang", "Inaran", "Long Lanuk", "Pegat Bukur", "Pilanjau", "Rantau Panjang", "Sambaliung", "Suaran", "Sukan Tengah", "Sukan Uluh", "Tumbit Dayak"],
      "Kec. Segah": ["Batu Rajang", "Bukit Makmur", "Gunung Sari", "Harapan Jaya", "Long Ayan", "Long Ayap", "Long Laai", "Pandan Sari", "Punan Mahakam", "Punan Malinau", "Punan Segah", "Siduung Indah", "Tepian Buah"],
      "Kec. Tabalar": ["Buyung-Buyung", "Harapan Maju", "Semurut", "Tabalar Muara", "Tabalar Ulu", "Tubaan"],
      "Kec. Talisayan": ["Bumi Jaya", "Campur Sari", "Capuak", "Dumaring", "Eka Sapta", "Purnasari Jaya", "Suka Murya", "Sumber Mulya", "Talisayan", "Tunggal Bumi"],
      "Kec. Tanjung Redeb": ["Bugis", "Gayam", "Karang Ambun", "Sungai Bedungun", "Tanjung Redeb"],
      "Kec. Teluk Bayur": ["Labanan Jaya", "Labanan Makarti", "Labanan Makmur", "Rinding", "Tumbit Dayak", "Teluk Bayur"],
    }
  }
};

export const provinces = Object.keys(addressData) as Province[];
export const getDistricts = (province: Province | undefined): District[] => province && addressData[province] ? Object.keys(addressData[province]) as District[] : [];
export const getSubdistricts = (province: Province | undefined, district: District | undefined): string[] => (province && district && addressData[province]?.[district]) ? Object.keys(addressData[province][district]) : [];
export const getVillages = (province: Province | undefined, district: District | undefined, subdistrict: string | undefined): string[] => (province && district && subdistrict && addressData[province]?.[district]?.[subdistrict]) ? addressData[province][district][subdistrict] : [];
