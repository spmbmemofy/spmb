"use client";

import * as React from "react";
import Link from "next/link";
import { Building, Search as SearchIcon, Filter, ShieldAlert, Award, FileText, ArrowRight, CheckCircle, Clock, MapPin, Navigation as NavigationIcon, Lock, Unlock } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { getSchools, updateSchool, type School } from "@/lib/schoolService";
import { getApplicants } from "@/lib/applicantService";
import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function SchoolMonitoringPage() {
  const [schools, setSchools] = React.useState<School[]>([]);
  const [allApplicants, setAllApplicants] = React.useState<any[]>([]);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedJenjang, setSelectedJenjang] = React.useState("Semua Jenjang");
  const [userRole, setUserRole] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // Map Picker States
  const [selectedSchoolForMap, setSelectedSchoolForMap] = React.useState<School | null>(null);
  const [mapCoords, setMapCoords] = React.useState({ lat: -2.15, lng: 117.48 });
  const [searchQuery, setSearchQuery] = React.useState("");
  const mapRef = React.useRef<any>(null);
  const markerRef = React.useRef<any>(null);

  // Map Lock States
  const [isMapLocked, setIsMapLocked] = React.useState(true);
  const isMapLockedRef = React.useRef(true);

  React.useEffect(() => {
    isMapLockedRef.current = isMapLocked;
    if (markerRef.current) {
      if (isMapLocked) {
        markerRef.current.dragging?.disable();
      } else {
        markerRef.current.dragging?.enable();
      }
    }
  }, [isMapLocked]);

  React.useEffect(() => {
    if (selectedSchoolForMap) {
      setIsMapLocked(true);
    }
  }, [selectedSchoolForMap]);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !selectedSchoolForMap) return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L) return;

      const container = document.getElementById('monitoring-map-picker');
      if (!container || mapRef.current) return;

      const setupMap = (lat: number, lng: number) => {
        const map = L.map('monitoring-map-picker').setView([lat, lng], 15);
        mapRef.current = map;

        const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        });

        const satelliteImg = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
        });

        const satelliteLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Labels &copy; Esri'
        });

        const satelliteHybrid = L.layerGroup([satelliteImg, satelliteLabels]);

        const baseMaps = {
            "Peta Standard": osm,
            "Satelit (Hybrid)": satelliteHybrid
        };

        osm.addTo(map);
        L.control.layers(baseMaps).addTo(map);

        const marker = L.marker([lat, lng], { draggable: !isMapLockedRef.current }).addTo(map);
        markerRef.current = marker;

        marker.on('dragend', () => {
          if (isMapLockedRef.current) return;
          const position = marker.getLatLng();
          setMapCoords({ lat: position.lat, lng: position.lng });
        });

        map.on('click', (e: any) => {
          if (isMapLockedRef.current) return;
          const position = e.latlng;
          marker.setLatLng(position);
          setMapCoords({ lat: position.lat, lng: position.lng });
        });
      };

      const savedLat = selectedSchoolForMap.latitude;
      const savedLng = selectedSchoolForMap.longitude;

      const isDefaultCoords = !savedLat || !savedLng || (Math.abs(savedLat - (-2.15)) < 0.0001 && Math.abs(savedLng - 117.48) < 0.0001);

      if (!isDefaultCoords) {
        setMapCoords({ lat: savedLat, lng: savedLng });
        setupMap(savedLat, savedLng);
      } else {
        // Geocode based on address/kecamatan
        const cleanKecamatan = selectedSchoolForMap.kecamatan ? selectedSchoolForMap.kecamatan.replace(/^kec\.\s+/i, '').trim() : '';
        const queryText = `${selectedSchoolForMap.alamat ? selectedSchoolForMap.alamat + ", " : ""}${cleanKecamatan ? "Kecamatan " + cleanKecamatan : ""}, Berau, Kalimantan Timur`;
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              setMapCoords({ lat, lng });
              setupMap(lat, lng);
            } else if (cleanKecamatan) {
              // Fallback 1: Geocode just the subdistrict (kecamatan)
              const queryKec = `Kecamatan ${cleanKecamatan}, Berau, Kalimantan Timur`;
              fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryKec)}`)
                .then(r => r.json())
                .then(dataKec => {
                  if (dataKec && dataKec.length > 0) {
                    const lat = parseFloat(dataKec[0].lat);
                    const lng = parseFloat(dataKec[0].lon);
                    setMapCoords({ lat, lng });
                    setupMap(lat, lng);
                  } else {
                    setupMap(-2.15, 117.48);
                  }
                })
                .catch(() => setupMap(-2.15, 117.48));
            } else {
              setupMap(-2.15, 117.48);
            }
          })
          .catch(() => {
            if (cleanKecamatan) {
              const queryKec = `Kecamatan ${cleanKecamatan}, Berau, Kalimantan Timur`;
              fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryKec)}`)
                .then(r => r.json())
                .then(dataKec => {
                  if (dataKec && dataKec.length > 0) {
                    const lat = parseFloat(dataKec[0].lat);
                    const lng = parseFloat(dataKec[0].lon);
                    setMapCoords({ lat, lng });
                    setupMap(lat, lng);
                  } else {
                    setupMap(-2.15, 117.48);
                  }
                })
                .catch(() => setupMap(-2.15, 117.48));
            } else {
              setupMap(-2.15, 117.48);
            }
          });
      }
    };

    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => {
        setTimeout(initMap, 200);
      };
      document.body.appendChild(script);
    } else {
      setTimeout(initMap, 200);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [selectedSchoolForMap]);

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Berau")}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const firstResult = data[0];
        const lat = parseFloat(firstResult.lat);
        const lon = parseFloat(firstResult.lon);
        
        setMapCoords({ lat, lng: lon });

        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([lat, lon], 16);
          markerRef.current.setLatLng([lat, lon]);
        }
        toast({ title: "Lokasi Ditemukan", description: `Menampilkan hasil pencarian untuk "${firstResult.display_name}".` });
      } else {
        toast({ variant: "destructive", title: "Lokasi Tidak Ditemukan", description: "Coba kata kunci pencarian alamat yang lain." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Gagal menghubungkan ke layanan peta." });
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast({ variant: "destructive", title: "Geolocation Tidak Didukung", description: "Browser Anda tidak mendukung layanan lokasi saat ini." });
      return;
    }

    toast({ title: "Mendapatkan Lokasi...", description: "Harap izinkan akses GPS pada browser Anda." });

    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      setMapCoords({ lat, lng });

      if (mapRef.current && markerRef.current) {
        mapRef.current.setView([lat, lng], 15);
        markerRef.current.setLatLng([lat, lng]);
      }
      toast({ title: "Lokasi Ditemukan", description: `Titik koordinat berhasil diposisikan ke lokasi GPS Anda.` });
    }, (error) => {
      toast({ variant: "destructive", title: "Akses Lokasi Ditolak", description: "Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif." });
    }, { enableHighAccuracy: true });
  };

  const handleSaveLocation = () => {
    if (!selectedSchoolForMap) return;
    try {
      const updated = {
        ...selectedSchoolForMap,
        latitude: mapCoords.lat,
        longitude: mapCoords.lng
      };
      updateSchool(updated);
      setSchools(getSchools().filter((s) => s.jenjang !== "SMP")); // refetch and update list
      toast({
        title: "Lokasi Disimpan",
        description: `Titik koordinat lokasi untuk ${selectedSchoolForMap.namaSekolah} berhasil diperbarui.`,
      });
      setSelectedSchoolForMap(null);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Gagal Menyimpan", description: e.message });
    }
  };

  React.useEffect(() => {
    const creds = getFromLocalStorage<LoginCredentials | null>("loginCredentials", null);
    if (!creds || !creds.role || !["superadmin", "admin", "branch_admin"].includes(creds.role)) {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Hanya Admin Cabang dan Administrator yang dapat mengakses halaman ini.",
      });
      router.replace("/registration/home");
      return;
    }
    setUserRole(creds.role);
    setSchools(getSchools().filter((s) => s.jenjang !== "SMP"));
    setAllApplicants(getApplicants());
    setIsLoading(false);
  }, [router, toast]);

  const schoolStats = React.useMemo(() => {
    return schools.map((school) => {
      // Filter applicants selecting this school as their primary (1st choice) choice
      const schoolApplicants = allApplicants.filter(
        (app) => app.schoolSelections && app.schoolSelections[0]?.schoolId === school.id
      );
      const totalPendaftar = schoolApplicants.length;
      const totalTerverifikasi = schoolApplicants.filter(
        (app) => app.statusVerifikasi === "Terverifikasi"
      ).length;
      const totalPending = schoolApplicants.filter(
        (app) => app.statusVerifikasi === "Menunggu Verifikasi"
      ).length;

      const fillRate = school.kuota ? (totalPendaftar / school.kuota) * 100 : 0;

      return {
        ...school,
        totalPendaftar,
        totalTerverifikasi,
        totalPending,
        fillRate: parseFloat(fillRate.toFixed(1)),
      };
    });
  }, [schools, allApplicants]);

  const filteredSchools = React.useMemo(() => {
    return schoolStats.filter((school) => {
      const matchSearch =
        school.namaSekolah.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.npsn.includes(searchTerm);
      const matchJenjang =
        selectedJenjang === "Semua Jenjang" || school.jenjang === selectedJenjang;
      return matchSearch && matchJenjang;
    });
  }, [schoolStats, searchTerm, selectedJenjang]);

  const aggregateStats = React.useMemo(() => {
    const totalKuota = schoolStats.reduce((acc, curr) => acc + (curr.kuota || 0), 0);
    const totalPendaftar = schoolStats.reduce((acc, curr) => acc + curr.totalPendaftar, 0);
    const totalTerverifikasi = schoolStats.reduce((acc, curr) => acc + curr.totalTerverifikasi, 0);
    const totalPending = schoolStats.reduce((acc, curr) => acc + curr.totalPending, 0);
    
    return {
      totalSchools: schoolStats.length,
      totalKuota,
      totalPendaftar,
      totalTerverifikasi,
      totalPending,
      averageFillRate: totalKuota > 0 ? parseFloat(((totalPendaftar / totalKuota) * 100).toFixed(1)) : 0,
    };
  }, [schoolStats]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-4">
        <p className="text-muted-foreground">Memuat data monitoring...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col p-4 sm:p-6 md:p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl sm:text-3xl font-bold font-headline">Monitoring Sekolah Cabang</h1>
        <p className="text-muted-foreground">
          Pantau kuota, jumlah pendaftar, dan status verifikasi seluruh SMA/SMK di wilayah dinas.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Sekolah</CardTitle>
            <Building className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateStats.totalSchools}</div>
            <p className="text-xs text-muted-foreground">Sekolah Terdaftar (SMA/SMK)</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Kapasitas Wilayah</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateStats.totalKuota}</div>
            <p className="text-xs text-muted-foreground">Total Kuota Tersedia</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Registran</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{aggregateStats.totalPendaftar}</div>
            <p className="text-xs text-muted-foreground">
              {aggregateStats.averageFillRate}% Kuota Terisi secara Akumulatif
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Status Berkas</CardTitle>
            <div className="flex gap-1">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold flex gap-2 items-baseline">
              <span className="text-emerald-600">{aggregateStats.totalTerverifikasi} <span className="text-xs font-normal text-muted-foreground">OK</span></span>
              <span className="text-muted-foreground text-sm">/</span>
              <span className="text-amber-600">{aggregateStats.totalPending} <span className="text-xs font-normal text-muted-foreground">Antre</span></span>
            </div>
            <p className="text-xs text-muted-foreground">Siswa Terverifikasi vs Menunggu</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Table Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Daftar Lembaga Sekolah Tujuan</CardTitle>
          <CardDescription>Cari dan filter sekolah untuk memantau data secara spesifik.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama sekolah atau NPSN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full sm:w-[200px]">
              <Select value={selectedJenjang} onValueChange={setSelectedJenjang}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenjang" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Semua Jenjang">Semua Jenjang</SelectItem>
                  <SelectItem value="SMA">SMA</SelectItem>
                  <SelectItem value="SMK">SMK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px] text-center">No</TableHead>
                  <TableHead>NPSN</TableHead>
                  <TableHead>Nama Sekolah</TableHead>
                  <TableHead className="text-center">Jenjang</TableHead>
                  <TableHead className="text-center">Akreditasi</TableHead>
                  <TableHead className="text-right">Kuota</TableHead>
                  <TableHead className="text-right">Pendaftar</TableHead>
                  <TableHead className="text-right">Terverifikasi</TableHead>
                  <TableHead className="text-right">Antrean</TableHead>
                  <TableHead className="text-right">Persentase</TableHead>
                  <TableHead className="text-center">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSchools.length > 0 ? (
                  filteredSchools.map((school, index) => {
                    const fillPercentage = school.fillRate;
                    let fillBadgeColor = "secondary";
                    if (fillPercentage >= 95) fillBadgeColor = "destructive";
                    else if (fillPercentage >= 70) fillBadgeColor = "default";
                    else if (fillPercentage > 0) fillBadgeColor = "outline";

                    return (
                      <TableRow key={school.id}>
                        <TableCell className="text-center">{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{school.npsn}</TableCell>
                        <TableCell className="font-medium">{school.namaSekolah}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{school.jenjang}</Badge>
                        </TableCell>
                        <TableCell className="text-center">{school.akreditasi}</TableCell>
                        <TableCell className="text-right">{school.kuota}</TableCell>
                        <TableCell className="text-right font-semibold">{school.totalPendaftar}</TableCell>
                        <TableCell className="text-right text-emerald-600">{school.totalTerverifikasi}</TableCell>
                        <TableCell className="text-right text-amber-600">{school.totalPending}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={fillBadgeColor as any}>
                            {fillPercentage}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/registration/school/${school.id}`}>
                                Detail <ArrowRight className="ml-1 h-3.5 w-3.5" />
                              </Link>
                            </Button>
                            <Button size="sm" variant="ghost" className="text-primary hover:text-primary animate-pulse-subtle" onClick={() => {
                              setSelectedSchoolForMap(school);
                              setSearchQuery("");
                            }}>
                              <MapPin className="h-3.5 w-3.5 mr-1" /> Lokasi
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                      Tidak ada sekolah yang cocok dengan kriteria filter.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      {/* Map Picker Dialog */}
      <Dialog open={selectedSchoolForMap !== null} onOpenChange={(open) => { if (!open) setSelectedSchoolForMap(null); }}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Atur Lokasi Koordinat untuk {selectedSchoolForMap?.namaSekolah}</DialogTitle>
            <DialogDescription>
              Tentukan lokasi sekolah pada peta. Geser penanda (marker) atau klik pada peta untuk menetapkan koordinat lokasi sekolah secara akurat.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex flex-wrap items-center gap-2">
              <Input 
                placeholder={isMapLocked ? "Koordinat terkunci. Buka kunci untuk mencari..." : "Cari lokasi/alamat sekolah..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSearchLocation(); } }}
                disabled={isMapLocked}
                className="flex-1 min-w-[200px]"
              />
              <Button type="button" variant="outline" onClick={handleSearchLocation} disabled={isMapLocked}>
                <SearchIcon className="h-4 w-4 mr-2" /> Cari
              </Button>
              <Button type="button" variant="secondary" onClick={handleLocateMe} disabled={isMapLocked} className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                <NavigationIcon className="h-4 w-4 mr-2" /> Gunakan lokasi saat ini
              </Button>
            </div>
            
            <div className="relative rounded-lg overflow-hidden border bg-muted/20">
              <div 
                id="monitoring-map-picker" 
                className="w-full h-80 relative" 
                style={{ minHeight: '320px', zIndex: 1 }}
              />
              
              {/* Sleek Floating Status Banner */}
              <div className={`absolute top-4 left-1/2 -translate-x-1/2 z-[400] flex items-center gap-3 px-4 py-2 rounded-full border shadow-xl backdrop-blur-md transition-all duration-300 ${
                isMapLocked 
                  ? 'bg-amber-500/95 border-amber-600/20 text-white' 
                  : 'bg-green-600/95 border-green-700/20 text-white'
              }`}>
                {isMapLocked ? (
                  <>
                    <Lock className="h-4 w-4 shrink-0 animate-pulse text-amber-100" />
                    <span className="text-xs font-semibold whitespace-nowrap tracking-wide">Koordinat Terkunci</span>
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => setIsMapLocked(false)}
                      className="h-7 px-3 text-xs font-bold rounded-full bg-white text-amber-700 hover:bg-white/90 shadow-sm border-0"
                    >
                      Ubah Lokasi
                    </Button>
                  </>
                ) : (
                  <>
                    <Unlock className="h-4 w-4 shrink-0 text-green-100" />
                    <span className="text-xs font-semibold whitespace-nowrap tracking-wide">Mode Edit Aktif</span>
                    <Button 
                      type="button" 
                      size="sm" 
                      onClick={() => setIsMapLocked(true)}
                      className="h-7 px-3 text-xs font-bold rounded-full bg-white text-green-700 hover:bg-white/90 shadow-sm border-0"
                    >
                      Kunci Lokasi
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lat-input">Latitude</Label>
                <Input id="lat-input" value={mapCoords.lat.toFixed(6)} readOnly className="font-mono bg-muted" />
              </div>
              <div>
                <Label htmlFor="lng-input">Longitude</Label>
                <Input id="lng-input" value={mapCoords.lng.toFixed(6)} readOnly className="font-mono bg-muted" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">Batal</Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveLocation}>Simpan Koordinat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
