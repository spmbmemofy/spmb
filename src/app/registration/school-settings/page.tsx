
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building, AlertCircle, Edit, PlusCircle, Trash2, Settings, MapPin, Search as SearchIcon, Navigation as NavigationIcon, Lock, Unlock } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getSchoolByNPSN, updateSchool, type School } from "@/lib/schoolService";
import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { getUsers } from "@/lib/userService";
import type { Major } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { getVillages } from "@/lib/addressData";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const majorFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, "Nama jurusan minimal 3 karakter."),
  berkasPendukung: z.string().optional(),
  quota: z.object({
    afirmasi: z.coerce.number().int().min(0),
    mutasi: z.coerce.number().int().min(0),
    prestasi: z.coerce.number().int().min(0),
    domisili: z.coerce.number().int().min(0),
  })
});

const religionOptions = [ "Islam", "Kristen Protestan", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya" ];

type MajorFormValues = z.infer<typeof majorFormSchema>;

export default function SchoolSettingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);
    const [school, setSchool] = React.useState<School | null>(null);
    
    // State for Major Dialog
    const [isMajorDialogOpen, setIsMajorDialogOpen] = React.useState(false);
    const [editingMajor, setEditingMajor] = React.useState<Major | null>(null);
    
    // State for Delete Alert
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
    const [majorToDelete, setMajorToDelete] = React.useState<Major | null>(null);

    // State for special rules
    const [allowedGenders, setAllowedGenders] = React.useState<('Laki-laki' | 'Perempuan')[]>([]);
    const [allowedReligions, setAllowedReligions] = React.useState<string[]>([]);
    const [isSaving, setIsSaving] = React.useState(false);

    // State for map locations
    const mapRef = React.useRef<any>(null);
    const markerRef = React.useRef<any>(null);
    const [mapCoords, setMapCoords] = React.useState({ lat: -2.15, lng: 117.48 }); // Berau center
    const [searchQuery, setSearchQuery] = React.useState("");

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
        if (typeof window === 'undefined' || !school) return;

        // Dynamically load Leaflet stylesheet
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

            const container = document.getElementById('school-map-picker');
            if (!container || mapRef.current) return;

            const setupMap = (lat: number, lng: number) => {
                const map = L.map('school-map-picker').setView([lat, lng], 15);
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

            const savedLat = school.latitude;
            const savedLng = school.longitude;

            const isDefaultCoords = !savedLat || !savedLng || (Math.abs(savedLat - (-2.15)) < 0.0001 && Math.abs(savedLng - 117.48) < 0.0001);

            if (!isDefaultCoords) {
                setMapCoords({ lat: savedLat, lng: savedLng });
                setupMap(savedLat, savedLng);
            } else {
                // Attempt to geocode school district/address
                const cleanKecamatan = school.kecamatan ? school.kecamatan.replace(/^kec\.\s+/i, '').trim() : '';
                const queryText = `${school.alamat ? school.alamat + ", " : ""}${cleanKecamatan ? "Kecamatan " + cleanKecamatan : ""}, Berau, Kalimantan Timur`;
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
    }, [school]);

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

    const form = useForm<MajorFormValues>({
        resolver: zodResolver(majorFormSchema),
        defaultValues: {
          name: '',
          berkasPendukung: '',
          quota: { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 }
        },
    });

    const [isAdminMode, setIsAdminMode] = React.useState(false);
    const [smaSmkSchools, setSmaSmkSchools] = React.useState<School[]>([]);
    const [selectedSchoolId, setSelectedSchoolId] = React.useState<string>("");

    const handleSchoolChange = (schoolId: string) => {
        setSelectedSchoolId(schoolId);
        const targetSchool = smaSmkSchools.find(s => s.id === schoolId);
        if (targetSchool) {
            setSchool(targetSchool);
            setAllowedGenders(targetSchool.allowedGenders || []);
            setAllowedReligions(targetSchool.allowedReligions || []);
            if (targetSchool.latitude && targetSchool.longitude) {
                setMapCoords({ lat: targetSchool.latitude, lng: targetSchool.longitude });
            }
        }
    };

    React.useEffect(() => {
        const credentials = getFromLocalStorage<LoginCredentials | null>("loginCredentials", null);
        if (!credentials?.username || !['headmaster', 'superadmin', 'branch_admin'].includes(credentials.role || '')) {
            toast({ variant: "destructive", title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengakses halaman ini." });
            router.replace('/registration/home');
            return;
        }

        const isAdmin = ['superadmin', 'branch_admin'].includes(credentials.role || '');
        setIsAdminMode(isAdmin);

        if (isAdmin) {
            const schools = getSchools().filter(s => s.jenjang === 'SMA' || s.jenjang === 'SMK');
            setSmaSmkSchools(schools);
            if (schools.length > 0) {
                const defaultSchool = schools[0];
                setSelectedSchoolId(defaultSchool.id);
                setSchool(defaultSchool);
                setAllowedGenders(defaultSchool.allowedGenders || []);
                setAllowedReligions(defaultSchool.allowedReligions || []);
                if (defaultSchool.latitude && defaultSchool.longitude) {
                    setMapCoords({ lat: defaultSchool.latitude, lng: defaultSchool.longitude });
                }
            }
            setIsLoading(false);
        } else {
            const currentUser = getUsers().find(u => u.username === credentials.username);
            if (!currentUser || !currentUser.npsn) {
                toast({ variant: "destructive", title: "Sekolah Tidak Terhubung", description: "Akun Anda tidak terhubung dengan sekolah manapun." });
                setIsLoading(false);
                return;
            }

            const userSchool = getSchoolByNPSN(currentUser.npsn);
            if (userSchool) {
                if (userSchool.jenjang === 'SMP') {
                    router.replace('/registration/applicant-data');
                    return;
                }
                setSchool(userSchool);
                setAllowedGenders(userSchool.allowedGenders || []);
                setAllowedReligions(userSchool.allowedReligions || []);
                if (userSchool.latitude && userSchool.longitude) {
                    setMapCoords({ lat: userSchool.latitude, lng: userSchool.longitude });
                }
            }
            setIsLoading(false);
        }
    }, [router, toast]);
    
    const handleOpenMajorDialog = (major: Major | null = null) => {
        setEditingMajor(major);
        if (major) {
            form.reset(major);
        } else {
            form.reset({
              id: undefined,
              name: '',
              berkasPendukung: '',
              quota: { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 }
            });
        }
        setIsMajorDialogOpen(true);
    };

    const handleDeleteMajorClick = (major: Major) => {
      setMajorToDelete(major);
      setIsDeleteAlertOpen(true);
    };

    const handleConfirmDeleteMajor = () => {
        if (!majorToDelete || !school) return;

        const updatedMajors = school.majors?.filter(m => m.id !== majorToDelete.id) || [];
        
        // Recalculate total quotas
        const newTotalQuota = updatedMajors.reduce((sum, major) => sum + Object.values(major.quota).reduce((s, q) => s + q, 0), 0);
        const newJalurKuota = updatedMajors.reduce((totals, major) => {
            totals.afirmasi = (totals.afirmasi || 0) + major.quota.afirmasi;
            totals.mutasi = (totals.mutasi || 0) + major.quota.mutasi;
            totals.prestasi = (totals.prestasi || 0) + major.quota.prestasi;
            totals.domisili = (totals.domisili || 0) + major.quota.domisili;
            return totals;
        }, { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 });

        const updatedSchoolData = { ...school, majors: updatedMajors, kuota: newTotalQuota, jalurKuota: newJalurKuota };
        
        try {
            updateSchool(updatedSchoolData);
            setSchool(updatedSchoolData);
            toast({ title: "Jurusan Dihapus", description: `Jurusan "${majorToDelete.name}" telah dihapus.` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menghapus", description: error.message });
        }
        
        setIsDeleteAlertOpen(false);
        setMajorToDelete(null);
    };

    const processMajorForm = (data: MajorFormValues) => {
        if (!school) return;

        let updatedMajors: Major[];
        if (editingMajor) { // Update existing major
            updatedMajors = school.majors?.map(m => m.id === editingMajor.id ? { ...m, ...data } : m) || [];
        } else { // Add new major
            const newMajor: Major = { ...data, id: `major-${Date.now()}` };
            updatedMajors = [...(school.majors || []), newMajor];
        }

        // Recalculate total quotas
        const newTotalQuota = updatedMajors.reduce((sum, major) => sum + Object.values(major.quota).reduce((s, q) => s + q, 0), 0);
        const newJalurKuota = updatedMajors.reduce((totals, major) => {
            totals.afirmasi = (totals.afirmasi || 0) + major.quota.afirmasi;
            totals.mutasi = (totals.mutasi || 0) + major.quota.mutasi;
            totals.prestasi = (totals.prestasi || 0) + major.quota.prestasi;
            totals.domisili = (totals.domisili || 0) + major.quota.domisili;
            return totals;
        }, { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 });

        const updatedSchoolData = { ...school, majors: updatedMajors, kuota: newTotalQuota, jalurKuota: newJalurKuota };
        
        try {
            updateSchool(updatedSchoolData);
            setSchool(updatedSchoolData);
            toast({ title: "Data Jurusan Disimpan", description: `Perubahan pada jurusan "${data.name}" telah disimpan.` });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        }

        setIsMajorDialogOpen(false);
    };

    const handleSaveSpecialRules = () => {
        if (!school) return;
        setIsSaving(true);
        
        const updatedSchoolData = {
            ...school,
            allowedGenders,
            allowedReligions,
            latitude: mapCoords.lat,
            longitude: mapCoords.lng
        };

        try {
            updateSchool(updatedSchoolData);
            setSchool(updatedSchoolData); // Update local state
            toast({ title: "Pengaturan & Lokasi Disimpan", description: "Perubahan aturan pendaftaran dan koordinat lokasi sekolah telah disimpan." });
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex flex-1 items-center justify-center p-4">Memuat data sekolah...</div>;
    }

    if (!school) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-4">
                <Card className="w-full max-w-lg shadow-2xl">
                    <CardHeader>
                        <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
                        <CardTitle className="text-center">Sekolah Tidak Ditemukan</CardTitle>
                        <CardDescription className="text-center">
                            Data sekolah yang terhubung dengan akun Anda tidak dapat ditemukan. Silakan hubungi admin.
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
                <Card className="w-full max-w-5xl shadow-2xl">
                    <CardHeader>
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
                                <Building size={28} />
                            </div>
                            <div>
                                <CardTitle className="text-2xl sm:text-3xl font-headline">Kelola Sekolah</CardTitle>
                                <CardDescription className="text-md mt-1">
                                    Lihat dan perbarui data untuk {school.namaSekolah}.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                        {isAdminMode && (
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
                                <div className="space-y-1 text-left">
                                    <h4 className="text-sm font-semibold text-primary">Mode Administrator / Wilayah</h4>
                                    <p className="text-xs text-muted-foreground">Pilih SMA/SMK untuk memantau dan mengubah pengaturan sekolah.</p>
                                </div>
                                <div className="w-full sm:w-80">
                                    <Select value={selectedSchoolId} onValueChange={handleSchoolChange}>
                                        <SelectTrigger className="w-full bg-background"><SelectValue placeholder="Pilih sekolah..." /></SelectTrigger>
                                        <SelectContent>
                                            {smaSmkSchools.map(sch => (
                                                <SelectItem key={sch.id} value={sch.id}>{sch.namaSekolah}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}

                        <section>
                            <h3 className="text-xl font-semibold mb-3 text-primary">Profil Sekolah</h3>
                             <div className="space-y-2 rounded-md border p-4 text-sm">
                                 <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">NPSN</span><span>{school.npsn}</span></div>
                                 <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Nama Sekolah</span><span>{school.namaSekolah}</span></div>
                                 <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Jenjang</span><span>{school.jenjang}</span></div>
                                 <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Jenis</span><span>{school.jenis}</span></div>
                                 <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Akreditasi</span><span>{school.akreditasi}</span></div>
                                 <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Alamat</span><span>{school.alamat}, {school.kecamatan}</span></div>
                                 <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Telepon</span><span>{school.telepon}</span></div>
                            </div>
                        </section>
                        {school.jenjang !== 'SMK' && (
                            <section className="space-y-4">
                                <h3 className="text-xl font-semibold text-primary">Wilayah Penerimaan Domisili (Zonasi)</h3>
                                <div className="rounded-md border p-6 bg-muted/10 space-y-6">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-4">
                                        <div>
                                            <h4 className="font-semibold text-foreground">Kecamatan Asal Sekolah: {school.kecamatan ? school.kecamatan.replace(/^kec\.\s+/i, '') : '-'}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Berikut adalah wilayah kelurahan/desa penerimaan domisili yang telah diatur oleh Admin Cabang Dinas / Superadmin untuk sekolah Anda.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {school.allowedVillages && school.allowedVillages.length > 0 ? (
                                        <div className="overflow-hidden rounded-lg border bg-card">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead className="w-1/3">Kelurahan / Desa</TableHead>
                                                        <TableHead className="w-1/3">Status Penerimaan</TableHead>
                                                        <TableHead className="w-1/3">Rincian RT Prioritas</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {school.allowedVillages.map(village => {
                                                        const priorityRule = school.priorityDomiciles?.find(p => p.village === village);
                                                        const isPrioritised = !!priorityRule;
                                                        
                                                        return (
                                                            <TableRow key={village} className={isPrioritised ? "bg-primary/5 hover:bg-primary/10" : ""}>
                                                                <TableCell className="font-medium">{village}</TableCell>
                                                                <TableCell>
                                                                    {isPrioritised ? (
                                                                        <Badge variant="default" className="bg-green-600 text-white hover:bg-green-600">
                                                                            Prioritas Utama
                                                                        </Badge>
                                                                    ) : (
                                                                        <Badge variant="secondary">
                                                                            Zonasi Standar
                                                                        </Badge>
                                                                    )}
                                                                </TableCell>
                                                                <TableCell className="text-sm">
                                                                    {isPrioritised ? (
                                                                        priorityRule.rts && priorityRule.rts.length > 0 ? (
                                                                            <span>RT: <strong className="font-mono">{priorityRule.rts.join(', ')}</strong></span>
                                                                        ) : (
                                                                            <span className="text-xs text-muted-foreground italic">Semua RT Prioritas</span>
                                                                        )
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground">-</span>
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    })}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-md p-4">
                                            ⚠️ <strong>Belum Diatur:</strong> Wilayah penerimaan domisili sekolah ini belum diatur oleh Admin Cabang Dinas / Superadmin.
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                        {(school.jenjang === 'SMK') && (
                            <section>
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-xl font-semibold text-primary">Manajemen Jurusan</h3>
                                   <Button onClick={() => handleOpenMajorDialog()}>
                                      <PlusCircle className="mr-2 h-4 w-4" /> Tambah Jurusan
                                  </Button>
                                </div>
                                <div className="rounded-md border">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Nama Jurusan</TableHead>
                                        <TableHead className="text-center">Total Kuota</TableHead>
                                        <TableHead>Berkas Pendukung</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {school.majors && school.majors.length > 0 ? (
                                        school.majors.map(major => (
                                          <TableRow key={major.id}>
                                            <TableCell className="font-medium">{major.name}</TableCell>
                                            <TableCell className="text-center">{Object.values(major.quota).reduce((a, b) => a + b, 0)}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{major.berkasPendukung || '-'}</TableCell>
                                            <TableCell className="text-right">
                                              <Button variant="ghost" size="icon" onClick={() => handleOpenMajorDialog(major)}>
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteMajorClick(major)}>
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </TableCell>
                                          </TableRow>
                                        ))
                                      ) : (
                                        <TableRow>
                                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                            Belum ada jurusan yang ditambahkan.
                                          </TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                                <CardFooter className="pt-4 text-sm text-muted-foreground">
                                  Total Kuota Keseluruhan Sekolah: <span className="font-bold text-foreground ml-2">{school.kuota || 0}</span>
                                </CardFooter>
                            </section>
                        )}
                         <section>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center"><MapPin className="mr-2"/> Lokasi Koordinat Sekolah</CardTitle>
                                    <CardDescription>
                                        Tentukan lokasi geografis sekolah pada peta. Geser penanda (marker) atau klik pada peta untuk menetapkan koordinat lokasi sekolah secara akurat.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
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
                                            id="school-map-picker" 
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
                                            <Label htmlFor="latitude">Latitude</Label>
                                            <Input id="latitude" value={mapCoords.lat.toFixed(6)} readOnly className="font-mono bg-muted" />
                                        </div>
                                        <div>
                                            <Label htmlFor="longitude">Longitude</Label>
                                            <Input id="longitude" value={mapCoords.lng.toFixed(6)} readOnly className="font-mono bg-muted" />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="text-xs text-muted-foreground">
                                    Titik koordinat ini akan disimpan ke dalam database profil sekolah Anda.
                                </CardFooter>
                            </Card>
                        </section>

                         <section>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center"><Settings className="mr-2"/> Aturan Pendaftaran Khusus</CardTitle>
                                    <CardDescription>
                                        Atur filter pendaftaran berdasarkan jenis kelamin atau agama. Jika tidak ada yang dipilih pada suatu kategori, semua akan diizinkan.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold text-muted-foreground">Filter Jenis Kelamin</h4>
                                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-2">
                                            {['Laki-laki', 'Perempuan'].map((gender) => (
                                                <div key={gender} className="flex flex-row items-center space-x-2 space-y-0">
                                                    <Checkbox
                                                        id={`gender-${gender}`}
                                                        checked={allowedGenders.includes(gender as any)}
                                                        onCheckedChange={(checked) => {
                                                            setAllowedGenders(prev => 
                                                                checked ? [...prev, gender as any] : prev.filter(g => g !== gender)
                                                            );
                                                        }}
                                                    />
                                                    <Label htmlFor={`gender-${gender}`} className="font-normal">{gender}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <Separator />
                                    <div>
                                        <h4 className="font-semibold text-muted-foreground">Filter Agama</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                                            {religionOptions.map(religion => (
                                                <div key={religion} className="flex flex-row items-center space-x-2 space-y-0">
                                                    <Checkbox
                                                        id={`religion-${religion}`}
                                                        checked={allowedReligions.includes(religion)}
                                                        onCheckedChange={(checked) => {
                                                            setAllowedReligions(prev => 
                                                                checked ? [...prev, religion] : prev.filter(r => r !== religion)
                                                            );
                                                        }}
                                                    />
                                                    <Label htmlFor={`religion-${religion}`} className="font-normal">{religion}</Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button onClick={handleSaveSpecialRules} disabled={isSaving}>
                                        {isSaving ? "Menyimpan..." : "Simpan Aturan Khusus"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </section>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isMajorDialogOpen} onOpenChange={setIsMajorDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingMajor ? "Edit Jurusan" : "Tambah Jurusan Baru"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processMajorForm)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                            <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nama Jurusan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <Card>
                                <CardHeader><CardTitle className="text-base">Pembagian Kuota per Jalur</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FormField control={form.control} name="quota.afirmasi" render={({ field }) => ( <FormItem><FormLabel>Afirmasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="quota.mutasi" render={({ field }) => ( <FormItem><FormLabel>Mutasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="quota.prestasi" render={({ field }) => ( <FormItem><FormLabel>Prestasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="quota.domisili" render={({ field }) => ( <FormItem><FormLabel>Domisili</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </CardContent>
                            </Card>
                             <FormField control={form.control} name="berkasPendukung" render={({ field }) => ( <FormItem><FormLabel>Berkas Pendukung (Opsional)</FormLabel><CardDescription>Sebutkan berkas khusus yang diperlukan untuk jurusan ini, jika ada. Contoh: Surat Keterangan Tidak Buta Warna.</CardDescription><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />

                            <DialogFooter className="pt-4">
                                <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                                <Button type="submit">Simpan Jurusan</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Jurusan?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Apakah Anda yakin ingin menghapus jurusan "{majorToDelete?.name}"? Tindakan ini tidak dapat diurungkan.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDeleteMajor} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
