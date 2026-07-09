
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Building, MoreHorizontal, Edit, Trash2, Search as SearchIcon, PlusCircle, Settings, MapPin, Navigation as NavigationIcon, Upload, Download, FileSpreadsheet, AlertTriangle, CheckCircle2, X, Lock, Unlock } from 'lucide-react';
import * as XLSX from 'xlsx';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getSchools, addSchool, updateSchool, deleteSchool, getSchoolById, type School, type SchoolJenjang } from "@/lib/schoolService";
import { addUser, deleteUsersByNpsn } from "@/lib/userService";
import { deleteApplicantsBySchoolId } from "@/lib/applicantService";
import { deleteManagedApplicantsBySchoolId } from "@/lib/managedApplicantService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Major } from "@/lib/types";
import { getDistricts, getSubdistricts, addressData } from "@/lib/addressData";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";


export const schoolFormSchema = z.object({
  id: z.string().optional(),
  npsn: z.string().length(8, { message: "NPSN harus memiliki 8 karakter." }),
  namaSekolah: z.string().min(3, { message: "Nama sekolah minimal 3 karakter." }),
  jenjang: z.enum(["SMP", "SMA", "SMK"]),
  jenis: z.enum(["Negeri", "Swasta"]),
  alamat: z.string().min(10, { message: "Alamat lengkap minimal 10 karakter." }),
  province: z.string().min(1, "Provinsi harus dipilih."),
  district: z.string().min(1, "Kabupaten/Kota harus dipilih."),
  kecamatan: z.string().min(1, { message: "Kecamatan wajib dipilih." }),
  telepon: z.string().min(9, { message: "Nomor telepon minimal 9 karakter." }),
  akreditasi: z.enum(["A", "B", "C", "Belum Terakreditasi"]),
  
  kuota: z.coerce.number().int().min(0).optional(),
  latitude: z.coerce.number().optional(),
  longitude: z.coerce.number().optional(),
  jalurKuota: z.object({
    afirmasi: z.coerce.number().int().min(0).optional(),
    mutasi: z.coerce.number().int().min(0).optional(),
    prestasi: z.coerce.number().int().min(0).optional(),
    domisili: z.coerce.number().int().min(0).optional(),
  }).optional(),
  majors: z.array(z.any()).optional(), // Keep majors flexible for internal state
  allowedGenders: z.array(z.string()).optional(),
  allowedReligions: z.array(z.string()).optional(),
});

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

type SchoolFormValues = z.infer<typeof schoolFormSchema>;
type MajorFormValues = z.infer<typeof majorFormSchema>;
type SchoolDialogTabs = "info_umum" | "data_pendaftaran" | "aturan_khusus" | "lokasi_peta";

const religionOptions = [ "Islam", "Kristen Protestan", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya" ];

export default function SchoolManagementPage() {
    const [schools, setSchools] = React.useState<School[]>([]);
    const [smpSearchTerm, setSmpSearchTerm] = React.useState("");
    const [smaSmkSearchTerm, setSmaSmkSearchTerm] = React.useState("");
    
    // School Dialog State
    const [isSchoolDialogOpen, setIsSchoolDialogOpen] = React.useState(false);
    const [editingSchool, setEditingSchool] = React.useState<School | null>(null);
    const [schoolToDeleteId, setSchoolToDeleteId] = React.useState<string | null>(null);
    const [activeTab, setActiveTab] = React.useState<SchoolDialogTabs>('info_umum');
    
    // Major Dialog State (within school dialog)
    const [isMajorDialogOpen, setIsMajorDialogOpen] = React.useState(false);
    const [editingMajor, setEditingMajor] = React.useState<Major | null>(null);
    const [majorToDelete, setMajorToDelete] = React.useState<Major | null>(null);
    
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [isMajorAlertOpen, setIsMajorAlertOpen] = React.useState(false);

    // Excel Import State
    const [isImportDialogOpen, setIsImportDialogOpen] = React.useState(false);
    const [importPreviewData, setImportPreviewData] = React.useState<any[]>([]);
    const [importErrors, setImportErrors] = React.useState<string[]>([]);
    const [isImporting, setIsImporting] = React.useState(false);
    const importFileRef = React.useRef<HTMLInputElement>(null);

    // Bulk Delete State
    const [selectedSchoolIds, setSelectedSchoolIds] = React.useState<Set<string>>(new Set());
    const [isBulkDeleteAlertOpen, setIsBulkDeleteAlertOpen] = React.useState(false);

    const { toast } = useToast();

    const schoolForm = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolFormSchema),
        defaultValues: {},
    });

    const { watch, setValue, trigger } = schoolForm;
    const selectedJenjang = watch("jenjang");
    const watchAfirmasi = watch("jalurKuota.afirmasi");
    const watchMutasi = watch("jalurKuota.mutasi");
    const watchPrestasi = watch("jalurKuota.prestasi");
    const watchDomisili = watch("jalurKuota.domisili");
    const currentMajors = watch("majors") as Major[] || [];
    
    const selectedProvince = watch("province");
    const selectedDistrict = watch("district");
    
    const districtOptions = getDistricts(selectedProvince as any);
    const subdistrictOptions = getSubdistricts(selectedProvince as any, selectedDistrict as any);
    const isAdding = !editingSchool;

    // Map Picker States
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
    const [searchQuery, setSearchQuery] = React.useState("");

    React.useEffect(() => {
        if (typeof window === 'undefined' || activeTab !== 'lokasi_peta' || !isSchoolDialogOpen) return;

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

            const container = document.getElementById('management-map-picker');
            if (!container || mapRef.current) return;

            const setupMap = (lat: number, lng: number) => {
                const map = L.map('management-map-picker').setView([lat, lng], 15);
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
                    schoolForm.setValue("latitude", position.lat);
                    schoolForm.setValue("longitude", position.lng);
                });

                map.on('click', (e: any) => {
                    if (isMapLockedRef.current) return;
                    const position = e.latlng;
                    marker.setLatLng(position);
                    schoolForm.setValue("latitude", position.lat);
                    schoolForm.setValue("longitude", position.lng);
                });

                setTimeout(() => {
                    map.invalidateSize();
                }, 100);
            };

            const savedLat = schoolForm.getValues("latitude");
            const savedLng = schoolForm.getValues("longitude");

            const isDefaultCoords = !savedLat || !savedLng || (Math.abs(savedLat - (-2.15)) < 0.0001 && Math.abs(savedLng - 117.48) < 0.0001);

            if (!isDefaultCoords) {
                setupMap(savedLat, savedLng);
            } else {
                // Attempt to geocode school district/address
                const schoolAlamat = schoolForm.getValues("alamat");
                const schoolKecamatan = schoolForm.getValues("kecamatan");
                const cleanKecamatan = schoolKecamatan ? schoolKecamatan.replace(/^kec\.\s+/i, '').trim() : '';
                const queryText = `${schoolAlamat ? schoolAlamat + ", " : ""}${cleanKecamatan ? "Kecamatan " + cleanKecamatan : ""}, Berau, Kalimantan Timur`;
                
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(queryText)}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data && data.length > 0) {
                            const lat = parseFloat(data[0].lat);
                            const lng = parseFloat(data[0].lon);
                            schoolForm.setValue("latitude", lat);
                            schoolForm.setValue("longitude", lng);
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
                                        schoolForm.setValue("latitude", lat);
                                        schoolForm.setValue("longitude", lng);
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
                                        schoolForm.setValue("latitude", lat);
                                        schoolForm.setValue("longitude", lng);
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
    }, [activeTab, isSchoolDialogOpen, schoolForm]);

    const handleSearchLocation = async () => {
        if (!searchQuery.trim()) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ", Berau")}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const firstResult = data[0];
                const lat = parseFloat(firstResult.lat);
                const lon = parseFloat(firstResult.lon);
                
                schoolForm.setValue("latitude", lat);
                schoolForm.setValue("longitude", lon);

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
            
            schoolForm.setValue("latitude", lat);
            schoolForm.setValue("longitude", lng);

            if (mapRef.current && markerRef.current) {
                mapRef.current.setView([lat, lng], 15);
                markerRef.current.setLatLng([lat, lng]);
            }
            toast({ title: "Lokasi Ditemukan", description: `Titik koordinat berhasil diposisikan ke lokasi GPS Anda.` });
        }, (error) => {
            toast({ variant: "destructive", title: "Akses Lokasi Ditolak", description: "Gagal mendapatkan lokasi GPS. Pastikan izin lokasi aktif." });
        }, { enableHighAccuracy: true });
    };

    React.useEffect(() => {
        setSchools(getSchools());
    }, []);

    React.useEffect(() => {
        if (selectedJenjang === 'SMA') {
            const totalKuota = (Number(watchAfirmasi) || 0) +
                               (Number(watchMutasi) || 0) +
                               (Number(watchPrestasi) || 0) +
                               (Number(watchDomisili) || 0);
            setValue('kuota', totalKuota, { shouldValidate: true });
        }
    }, [watchAfirmasi, watchMutasi, watchPrestasi, watchDomisili, selectedJenjang, setValue]);

    const filteredSmpSchools = React.useMemo(() => {
        return schools.filter(school => 
            school.jenjang === 'SMP' &&
            (school.namaSekolah.toLowerCase().includes(smpSearchTerm.toLowerCase()) ||
            school.npsn.includes(smpSearchTerm))
        );
    }, [schools, smpSearchTerm]);

    const filteredSmaSmkSchools = React.useMemo(() => {
        return schools.filter(school => 
            (school.jenjang === 'SMA' || school.jenjang === 'SMK') &&
            (school.namaSekolah.toLowerCase().includes(smaSmkSearchTerm.toLowerCase()) ||
            school.npsn.includes(smaSmkSearchTerm))
        );
    }, [schools, smaSmkSearchTerm]);

    const handleOpenSchoolDialog = (school: School | null = null) => {
        setIsMapLocked(true);
        setActiveTab('info_umum');
        setEditingSchool(school);
        setSearchQuery("");
        if (school) {
            schoolForm.reset({
                ...school,
                jalurKuota: school.jalurKuota || { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 },
                allowedGenders: school.allowedGenders || [],
                allowedReligions: school.allowedReligions || [],
                latitude: school.latitude ?? -2.15,
                longitude: school.longitude ?? 117.48
            });
        } else {
            schoolForm.reset({
                id: '', npsn: '', namaSekolah: '', jenjang: 'SMA', jenis: 'Negeri',
                alamat: '', kecamatan: '', telepon: '', akreditasi: 'A',
                province: 'Kalimantan Timur', district: 'Kabupaten Berau',
                kuota: 0, jalurKuota: { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 }, majors: [],
                allowedGenders: ['Laki-laki', 'Perempuan'],
                allowedReligions: religionOptions,
                latitude: -2.15,
                longitude: 117.48
            });
        }
        setIsSchoolDialogOpen(true);
    };

    const handleDeleteSchoolClick = (schoolId: string) => {
        setSchoolToDeleteId(schoolId);
        setIsAlertOpen(true);
    };

    const handleConfirmDeleteSchool = () => {
        if (schoolToDeleteId) {
            // Find the school first to get NPSN and ID for cascade deletes
            const schoolToDelete = getSchoolById(schoolToDeleteId);
            
            // 1. Delete the school record
            deleteSchool(schoolToDeleteId);
            
            if (schoolToDelete) {
                // 2. Delete headmaster account(s) with this NPSN
                deleteUsersByNpsn(schoolToDelete.npsn);
                
                // 3. Delete applicants who selected this school as target
                const deletedApplicants = deleteApplicantsBySchoolId(schoolToDeleteId);
                
                // 4. Delete managed applicants from this origin school
                const deletedManaged = deleteManagedApplicantsBySchoolId(schoolToDeleteId);
                
                const details = [
                    `Akun kepala sekolah dihapus.`,
                    deletedApplicants > 0 ? `${deletedApplicants} data pendaftar terkait dihapus.` : null,
                    deletedManaged > 0 ? `${deletedManaged} data siswa terkelola dihapus.` : null,
                ].filter(Boolean).join(' ');

                toast({ 
                    title: "Sekolah & Data Terkait Dihapus", 
                    description: `"${schoolToDelete.namaSekolah}" berhasil dihapus. ${details}` 
                });
            }

            setSchools(getSchools());
        }
        setIsAlertOpen(false);
        setSchoolToDeleteId(null);
    };

    const processSchoolForm = (data: SchoolFormValues) => {
        try {
            const finalData: Partial<SchoolFormValues> & { kuota?: number } = { ...data };

            // Ensure jalurKuota exists if jenjang is SMA
            if (data.jenjang === 'SMA' && !data.jalurKuota) {
                finalData.jalurKuota = { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 };
            }

            if (data.jenjang === 'SMA' && finalData.jalurKuota) {
                finalData.kuota = Object.values(finalData.jalurKuota).reduce((sum, val) => sum + (Number(val) || 0), 0);
            } else if(data.jenjang === 'SMK') {
                const majors = data.majors as Major[] || [];
                finalData.kuota = majors.reduce((sum, major) => sum + Object.values(major.quota).reduce((s, q) => s + q, 0), 0);
                finalData.jalurKuota = majors.reduce((totals, major) => {
                    totals.afirmasi = (totals.afirmasi || 0) + major.quota.afirmasi;
                    totals.mutasi = (totals.mutasi || 0) + major.quota.mutasi;
                    totals.prestasi = (totals.prestasi || 0) + major.quota.prestasi;
                    totals.domisili = (totals.domisili || 0) + major.quota.domisili;
                    return totals;
                }, { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 });
            }

            if (editingSchool) {
                const schoolData = { ...editingSchool, ...finalData } as School;
                updateSchool(schoolData);
                toast({ title: "Sekolah Diperbarui", description: `Data untuk ${data.namaSekolah} telah diperbarui.` });
            } else {
                const { id, ...newSchoolData } = finalData;
                addSchool(newSchoolData as Omit<School, 'id'>);

                // Auto-create headmaster account
                try {
                    addUser({
                        username: data.npsn,
                        password: data.npsn,
                        role: 'headmaster',
                        fullName: `Kepala Sekolah ${data.namaSekolah}`,
                        npsn: data.npsn,
                    });
                } catch (userErr: any) {
                    // Account might already exist; silently ignore
                }

                toast({
                    title: "Sekolah Ditambahkan",
                    description: `Sekolah ${data.namaSekolah} berhasil ditambahkan. Akun kepala sekolah telah dibuat (username: ${data.npsn}).`,
                });
            }
            
            setSchools(getSchools());
            setIsSchoolDialogOpen(false);

        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        }
    };
    
    const handleNext = async (targetTab: SchoolDialogTabs) => {
        const fieldsToValidate: (keyof SchoolFormValues)[] = ['npsn', 'namaSekolah', 'jenjang', 'jenis', 'alamat', 'province', 'district', 'kecamatan', 'telepon', 'akreditasi'];
        const isValid = await trigger(fieldsToValidate, { shouldFocus: true });
        if (isValid) {
            setActiveTab(targetTab);
        } else {
            toast({
                variant: "destructive",
                title: "Data Tidak Lengkap",
                description: "Harap isi semua kolom yang wajib diisi pada tab Informasi Umum.",
            });
        }
    };

    // ==================== EXCEL IMPORT HANDLERS ====================

    const handleDownloadTemplate = () => {
        const headers = ['npsn', 'namaSekolah', 'jenjang', 'jenis', 'alamat', 'kecamatan', 'telepon', 'akreditasi', 'province', 'district'];
        const example = ['30400001', 'SMAN 1 Berau', 'SMA', 'Negeri', 'Jl. Merdeka No. 1', 'Tanjung Redeb', '(0554) 21234', 'A', 'Kalimantan Timur', 'Kabupaten Berau'];
        const notes = ['(8 digit)', '(Nama lengkap sekolah)', '(SMA/SMK/SMP)', '(Negeri/Swasta)', '(Alamat lengkap)', '(Nama kecamatan)', '(Nomor telepon)', '(A/B/C/Belum Terakreditasi)', '(Provinsi)', '(Kabupaten/Kota)'];
        
        const ws = XLSX.utils.aoa_to_sheet([headers, example, notes]);
        ws['!cols'] = headers.map(() => ({ wch: 25 }));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Template Sekolah');
        XLSX.writeFile(wb, 'template_import_sekolah.xlsx');
        toast({ title: 'Template Diunduh', description: 'File template_import_sekolah.xlsx berhasil diunduh.' });
    };

    const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const data = new Uint8Array(evt.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                const errors: string[] = [];
                const validRows: any[] = [];

                rows.forEach((row: any, idx: number) => {
                    const rowNum = idx + 2;
                    const npsn = String(row['npsn'] || '').trim();
                    const namaSekolah = String(row['namaSekolah'] || '').trim();
                    const jenjang = String(row['jenjang'] || '').trim();

                    if (!npsn) errors.push(`Baris ${rowNum}: Kolom "npsn" tidak boleh kosong.`);
                    if (!namaSekolah) errors.push(`Baris ${rowNum}: Kolom "namaSekolah" tidak boleh kosong.`);
                    if (!['SMA', 'SMK', 'SMP'].includes(jenjang)) errors.push(`Baris ${rowNum}: Kolom "jenjang" harus SMA, SMK, atau SMP (saat ini: "${jenjang}").`);

                    const rawKec = String(row['kecamatan'] || '').trim();
                    let matchedKecamatan = '';
                    if (rawKec) {
                        const subdistrictsList = Object.keys(addressData['Kalimantan Timur']['Kabupaten Berau']);
                        const found = subdistrictsList.find(sub => 
                            sub.toLowerCase() === rawKec.toLowerCase() ||
                            sub.toLowerCase() === `kec. ${rawKec.toLowerCase()}` ||
                            `kec. ${sub.toLowerCase()}` === rawKec.toLowerCase() ||
                            sub.replace(/kec\.\s+/i, '').toLowerCase() === rawKec.replace(/kec\.\s+/i, '').toLowerCase()
                        );
                        matchedKecamatan = found || rawKec;
                    }

                    validRows.push({
                        npsn,
                        namaSekolah,
                        jenjang: jenjang as any,
                        jenis: (['Negeri', 'Swasta'].includes(String(row['jenis']).trim()) ? String(row['jenis']).trim() : 'Negeri') as any,
                        alamat: String(row['alamat'] || '').trim(),
                        kecamatan: matchedKecamatan,
                        telepon: String(row['telepon'] || '').trim(),
                        akreditasi: (['A','B','C','Belum Terakreditasi'].includes(String(row['akreditasi']).trim()) ? String(row['akreditasi']).trim() : 'B') as any,
                        province: String(row['province'] || 'Kalimantan Timur').trim(),
                        district: String(row['district'] || 'Kabupaten Berau').trim(),
                        allowedGenders: ['Laki-laki', 'Perempuan'],
                        allowedReligions: [...religionOptions],
                        jalurKuota: { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 },
                        kuota: 0,
                    });
                });

                setImportErrors(errors);
                setImportPreviewData(validRows);
                setIsImportDialogOpen(true);
            } catch (err) {
                toast({ variant: 'destructive', title: 'Gagal Membaca File', description: 'File tidak valid. Pastikan format file adalah .xlsx atau .xls.' });
            }
        };
        reader.readAsArrayBuffer(file);
        // Reset input so same file can be re-imported
        e.target.value = '';
    };

    const handleConfirmImport = () => {
        setIsImporting(true);
        let successCount = 0;
        let skipCount = 0;
        const failedRows: string[] = [];

        importPreviewData.forEach((school) => {
            try {
                addSchool(school as Omit<School, 'id'>);
                // Auto-create headmaster account
                try { addUser({ username: school.npsn, password: school.npsn, role: 'headmaster', fullName: `Kepala Sekolah ${school.namaSekolah}`, npsn: school.npsn }); } catch {}
                successCount++;
            } catch (err: any) {
                if (err.message?.includes('NPSN yang sama')) {
                    skipCount++;
                } else {
                    failedRows.push(school.namaSekolah);
                }
            }
        });

        setSchools(getSchools());
        setIsImporting(false);
        setIsImportDialogOpen(false);
        setImportPreviewData([]);
        setImportErrors([]);

        toast({
            title: 'Import Selesai',
            description: `${successCount} sekolah berhasil ditambahkan.${ skipCount > 0 ? ` ${skipCount} sekolah dilewati (NPSN sudah ada).` : ''}${ failedRows.length > 0 ? ` ${failedRows.length} gagal.` : ''}`,
        });
    };

    // ==================== END EXCEL IMPORT HANDLERS ====================

    // ==================== BULK DELETE HANDLERS ====================

    const handleToggleSchool = (schoolId: string) => {
        setSelectedSchoolIds(prev => {
            const next = new Set(prev);
            if (next.has(schoolId)) next.delete(schoolId);
            else next.add(schoolId);
            return next;
        });
    };

    const handleToggleAll = (schoolList: School[]) => {
        const allIds = new Set(schoolList.map(s => s.id));
        const allSelected = schoolList.every(s => selectedSchoolIds.has(s.id));
        if (allSelected) {
            setSelectedSchoolIds(prev => {
                const next = new Set(prev);
                allIds.forEach(id => next.delete(id));
                return next;
            });
        } else {
            setSelectedSchoolIds(prev => {
                const next = new Set(prev);
                allIds.forEach(id => next.add(id));
                return next;
            });
        }
    };

    const handleConfirmBulkDelete = () => {
        let successCount = 0;
        let totalApplicants = 0;
        let totalManaged = 0;

        selectedSchoolIds.forEach(schoolId => {
            const school = getSchoolById(schoolId);
            if (!school) return;
            deleteSchool(schoolId);
            deleteUsersByNpsn(school.npsn);
            totalApplicants += deleteApplicantsBySchoolId(schoolId);
            totalManaged += deleteManagedApplicantsBySchoolId(schoolId);
            successCount++;
        });

        setSchools(getSchools());
        setSelectedSchoolIds(new Set());
        setIsBulkDeleteAlertOpen(false);

        const details = [
            totalApplicants > 0 ? `${totalApplicants} pendaftar dihapus.` : null,
            totalManaged > 0 ? `${totalManaged} siswa terkelola dihapus.` : null,
        ].filter(Boolean).join(' ');

        toast({
            title: `${successCount} Sekolah Dihapus`,
            description: `Seluruh data & akun terkait telah dihapus.${details ? ' ' + details : ''}`,
        });
    };

    // ==================== END BULK DELETE HANDLERS ====================

    const handleOpenMajorDialog = (major: Major | null = null) => {
        setEditingMajor(major);
        if (major) {
            majorForm.reset(major);
        } else {
            majorForm.reset({
                id: undefined, name: '', berkasPendukung: '',
                quota: { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 }
            });
        }
        setIsMajorDialogOpen(true);
    };

    const handleDeleteMajorClick = (major: Major) => {
        setMajorToDelete(major);
        setIsMajorAlertOpen(true);
    };
    
    const handleConfirmDeleteMajor = () => {
        if (!majorToDelete) return;
        const updatedMajors = currentMajors.filter(m => m.id !== majorToDelete.id);
        schoolForm.setValue('majors', updatedMajors, { shouldValidate: true });
        setIsMajorAlertOpen(false);
        setMajorToDelete(null);
    };

    const processMajorForm = (data: MajorFormValues) => {
        let updatedMajors: Major[];
        if (editingMajor) {
            updatedMajors = currentMajors.map(m => (m.id === editingMajor.id ? { ...m, ...data } : m));
        } else {
            const newMajor: Major = { ...data, id: `major-${Date.now()}` };
            updatedMajors = [...currentMajors, newMajor];
        }
        schoolForm.setValue('majors', updatedMajors, { shouldValidate: true });
        setIsMajorDialogOpen(false);
    };

     const majorForm = useForm<MajorFormValues>({
        resolver: zodResolver(majorFormSchema),
        defaultValues: {
            name: '',
            berkasPendukung: '',
            quota: { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 }
        },
    });


    const renderSchoolTable = (schoolList: School[], type: 'smp' | 'sma_smk') => {
        const allSelected = schoolList.length > 0 && schoolList.every(s => selectedSchoolIds.has(s.id));
        const someSelected = schoolList.some(s => selectedSchoolIds.has(s.id));
        return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-10">
                            <Checkbox
                                checked={allSelected}
                                data-state={someSelected && !allSelected ? 'indeterminate' : undefined}
                                onCheckedChange={() => handleToggleAll(schoolList)}
                                aria-label="Pilih semua"
                                className={someSelected && !allSelected ? 'opacity-70' : ''}
                            />
                        </TableHead>
                        <TableHead>NPSN</TableHead>
                        <TableHead>Nama Sekolah</TableHead>
                        {type === 'sma_smk' && <TableHead>Kuota</TableHead>}
                        <TableHead>Jenjang</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead>Akreditasi</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schoolList.length > 0 ? (
                        schoolList.map((school) => (
                            <TableRow
                                key={school.npsn}
                                data-state={selectedSchoolIds.has(school.id) ? 'selected' : undefined}
                                className={selectedSchoolIds.has(school.id) ? 'bg-primary/5' : ''}
                            >
                                <TableCell>
                                    <Checkbox
                                        checked={selectedSchoolIds.has(school.id)}
                                        onCheckedChange={() => handleToggleSchool(school.id)}
                                        aria-label={`Pilih ${school.namaSekolah}`}
                                    />
                                </TableCell>
                                <TableCell className="font-mono">{school.npsn}</TableCell>
                                <TableCell className="font-medium">{school.namaSekolah}</TableCell>
                                {type === 'sma_smk' && <TableCell>{school.kuota || '-'}</TableCell>}
                                <TableCell>
                                    <Badge variant={school.jenjang === 'SMA' || school.jenjang === 'SMK' ? 'default' : 'secondary'}>
                                        {school.jenjang}
                                    </Badge>
                                </TableCell>
                                <TableCell><Badge variant="outline">{school.jenis}</Badge></TableCell>
                                <TableCell>{school.akreditasi}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Buka menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenSchoolDialog(school)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteSchoolClick(school.id)} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                <span>Hapus</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                Tidak ada sekolah yang cocok dengan kriteria.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );};


    return (
        <>
            <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
                <Card className="w-full max-w-7xl shadow-2xl">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
                                    <Building size={28} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl sm:text-3xl font-headline">Manajemen Sekolah</CardTitle>
                                    <CardDescription className="text-md mt-1">
                                        Kelola semua data sekolah dalam sistem.
                                    </CardDescription>
                                </div>
                            </div>
                        <div className="flex flex-wrap gap-2">
                                <input
                                    ref={importFileRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    className="hidden"
                                    onChange={handleImportFileChange}
                                />
                                {selectedSchoolIds.size > 0 && (
                                    <Button
                                        variant="destructive"
                                        onClick={() => setIsBulkDeleteAlertOpen(true)}
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Hapus {selectedSchoolIds.size} Sekolah
                                    </Button>
                                )}
                                <Button variant="outline" onClick={handleDownloadTemplate}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Unduh Template
                                </Button>
                                <Button variant="outline" onClick={() => importFileRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import Excel
                                </Button>
                                <Button onClick={() => handleOpenSchoolDialog()}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Sekolah
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="sma_smk" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="sma_smk">SMA / SMK</TabsTrigger>
                                <TabsTrigger value="smp">SMP</TabsTrigger>
                            </TabsList>
                            <TabsContent value="sma_smk" className="space-y-4">
                                <div className="flex items-center gap-4 pt-4">
                                    <div className="relative flex-1">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cari SMA/SMK berdasarkan nama atau NPSN..."
                                            value={smaSmkSearchTerm}
                                            onChange={(e) => setSmaSmkSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                {renderSchoolTable(filteredSmaSmkSchools, 'sma_smk')}
                            </TabsContent>
                            <TabsContent value="smp" className="space-y-4">
                                <div className="flex items-center gap-4 pt-4">
                                    <div className="relative flex-1">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cari SMP berdasarkan nama atau NPSN..."
                                            value={smpSearchTerm}
                                            onChange={(e) => setSmpSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                {renderSchoolTable(filteredSmpSchools, 'smp')}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            {/* School Dialog */}
            <Dialog open={isSchoolDialogOpen} onOpenChange={setIsSchoolDialogOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingSchool ? "Edit Sekolah" : "Tambah Sekolah Baru"}</DialogTitle>
                    </DialogHeader>
                    <Form {...schoolForm}>
                        <form onSubmit={schoolForm.handleSubmit(processSchoolForm)} className="space-y-6 py-4 pr-2">
                            <Tabs value={activeTab} onValueChange={(value) => { if (!isAdding) setActiveTab(value as SchoolDialogTabs); }} className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="info_umum">Informasi Umum</TabsTrigger>
                                    <TabsTrigger value="data_pendaftaran" disabled={selectedJenjang === 'SMP'}>
                                        Data Pendaftaran
                                    </TabsTrigger>
                                    <TabsTrigger value="aturan_khusus" disabled={selectedJenjang === 'SMP'}>
                                        Aturan Khusus
                                    </TabsTrigger>
                                    <TabsTrigger value="lokasi_peta">
                                         Lokasi Peta
                                     </TabsTrigger>
                                </TabsList>
                                <TabsContent value="info_umum" className="pt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={schoolForm.control} name="npsn" render={({ field }) => ( <FormItem><FormLabel>NPSN</FormLabel><FormControl><Input {...field} disabled={!!editingSchool} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={schoolForm.control} name="namaSekolah" render={({ field }) => ( <FormItem><FormLabel>Nama Sekolah</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={schoolForm.control} name="jenjang" render={({ field }) => ( <FormItem><FormLabel>Jenjang</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="SMP">SMP</SelectItem><SelectItem value="SMA">SMA</SelectItem><SelectItem value="SMK">SMK</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                        <FormField control={schoolForm.control} name="jenis" render={({ field }) => ( <FormItem><FormLabel>Jenis Sekolah</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Negeri">Negeri</SelectItem><SelectItem value="Swasta">Swasta</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                        <FormField control={schoolForm.control} name="akreditasi" render={({ field }) => ( <FormItem><FormLabel>Akreditasi</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem><SelectItem value="Belum Terakreditasi">Belum Terakreditasi</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                        <FormField control={schoolForm.control} name="telepon" render={({ field }) => ( <FormItem><FormLabel>Telepon</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                    <div className="space-y-4 rounded-md border p-4">
                                      <h3 className="text-sm font-medium text-muted-foreground">Alamat Sekolah</h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={schoolForm.control} name="province" render={({ field }) => ( <FormItem><FormLabel>Provinsi</FormLabel><Select onValueChange={(value) => { field.onChange(value); schoolForm.setValue("district", ""); schoolForm.setValue("kecamatan", ""); }} value={field.value} disabled><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Kalimantan Timur">Kalimantan Timur</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                            <FormField control={schoolForm.control} name="district" render={({ field }) => ( <FormItem><FormLabel>Kabupaten/Kota</FormLabel><Select onValueChange={(value) => { field.onChange(value); schoolForm.setValue("kecamatan", ""); }} value={field.value} disabled><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Kabupaten Berau">Kabupaten Berau</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                            <FormField control={schoolForm.control} name="kecamatan" render={({ field }) => ( <FormItem><FormLabel>Kecamatan</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled={!selectedDistrict}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Kecamatan" /></SelectTrigger></FormControl><SelectContent>{subdistrictOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                      </div>
                                      <FormField control={schoolForm.control} name="alamat" render={({ field }) => ( <FormItem><FormLabel>Alamat Lengkap (Jalan, No. Rumah, dll)</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                </TabsContent>
                                <TabsContent value="data_pendaftaran" className="pt-4 space-y-6">
                                     {selectedJenjang === 'SMA' && (
                                        <>
                                            <FormField control={schoolForm.control} name="kuota" render={({ field }) => ( 
                                                <FormItem>
                                                    <FormLabel>Total Kuota (SMA)</FormLabel>
                                                    <FormControl>
                                                        <Input 
                                                          type="number" 
                                                          {...field} 
                                                          readOnly
                                                          className="bg-muted/50 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-default"
                                                        />
                                                    </FormControl>
                                                    <FormDescription>Total kuota dihitung otomatis dari jumlah kuota per jalur.</FormDescription>
                                                    <FormMessage />
                                                </FormItem> 
                                            )} />
                                            <Card>
                                                <CardHeader><CardTitle className="text-base">Pembagian Kuota per Jalur (SMA)</CardTitle></CardHeader>
                                                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    <FormField control={schoolForm.control} name="jalurKuota.afirmasi" render={({ field }) => ( <FormItem><FormLabel>Afirmasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                                    <FormField control={schoolForm.control} name="jalurKuota.mutasi" render={({ field }) => ( <FormItem><FormLabel>Mutasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                                    <FormField control={schoolForm.control} name="jalurKuota.prestasi" render={({ field }) => ( <FormItem><FormLabel>Prestasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                                    <FormField control={schoolForm.control} name="jalurKuota.domisili" render={({ field }) => ( <FormItem><FormLabel>Domisili</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                                </CardContent>
                                            </Card>
                                        </>
                                     )}

                                    {selectedJenjang === 'SMK' && (
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between">
                                                <div className="space-y-1.5">
                                                    <CardTitle className="text-base">Manajemen Jurusan (SMK)</CardTitle>
                                                    <CardDescription>Tambah, edit, atau hapus jurusan beserta kuotanya.</CardDescription>
                                                </div>
                                                <Button type="button" size="sm" onClick={() => handleOpenMajorDialog()}>
                                                    <PlusCircle className="mr-2 h-4 w-4" /> Tambah
                                                </Button>
                                            </CardHeader>
                                            <CardContent>
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Nama Jurusan</TableHead>
                                                            <TableHead>Total Kuota</TableHead>
                                                            <TableHead className="text-right">Aksi</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {currentMajors.length > 0 ? (
                                                            currentMajors.map(major => (
                                                                <TableRow key={major.id}>
                                                                    <TableCell>{major.name}</TableCell>
                                                                    <TableCell>{Object.values(major.quota).reduce((a, b) => a + b, 0)}</TableCell>
                                                                    <TableCell className="text-right">
                                                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleOpenMajorDialog(major)}>
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDeleteMajorClick(major)}>
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </TableCell>
                                                                </TableRow>
                                                            ))
                                                        ) : (
                                                            <TableRow>
                                                                <TableCell colSpan={3} className="h-20 text-center text-muted-foreground">
                                                                    Belum ada jurusan ditambahkan.
                                                                </TableCell>
                                                            </TableRow>
                                                        )}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>
                                    )}
                                </TabsContent>
                                 <TabsContent value="aturan_khusus" className="pt-4 space-y-6">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center"><Settings className="mr-2"/> Aturan Pendaftaran Khusus</CardTitle>
                                            <CardDescription>
                                                Atur filter pendaftaran berdasarkan jenis kelamin atau agama. Jika tidak ada yang dipilih pada suatu kategori, semua akan diizinkan.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            <FormField
                                                control={schoolForm.control}
                                                name="allowedGenders"
                                                render={() => (
                                                    <FormItem>
                                                        <h4 className="font-semibold text-muted-foreground">Filter Jenis Kelamin</h4>
                                                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-2">
                                                            {['Laki-laki', 'Perempuan'].map((gender) => (
                                                                <FormField
                                                                    key={gender}
                                                                    control={schoolForm.control}
                                                                    name="allowedGenders"
                                                                    render={({ field }) => (
                                                                        <FormItem key={gender} className="flex flex-row items-center space-x-2 space-y-0">
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    checked={field.value?.includes(gender)}
                                                                                    onCheckedChange={(checked) => {
                                                                                        const currentValues = field.value || [];
                                                                                        return checked
                                                                                            ? field.onChange([...currentValues, gender])
                                                                                            : field.onChange(currentValues.filter(value => value !== gender));
                                                                                    }}
                                                                                />
                                                                            </FormControl>
                                                                            <FormLabel className="font-normal">{gender}</FormLabel>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                            <Separator />
                                            <FormField
                                                control={schoolForm.control}
                                                name="allowedReligions"
                                                render={() => (
                                                    <FormItem>
                                                        <h4 className="font-semibold text-muted-foreground">Filter Agama</h4>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                                                            {religionOptions.map(religion => (
                                                                <FormField
                                                                    key={religion}
                                                                    control={schoolForm.control}
                                                                    name="allowedReligions"
                                                                    render={({ field }) => (
                                                                        <FormItem key={religion} className="flex flex-row items-center space-x-2 space-y-0">
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    checked={field.value?.includes(religion)}
                                                                                    onCheckedChange={(checked) => {
                                                                                        const currentValues = field.value || [];
                                                                                        return checked
                                                                                            ? field.onChange([...currentValues, religion])
                                                                                            : field.onChange(currentValues.filter(value => value !== religion));
                                                                                    }}
                                                                                />
                                                                            </FormControl>
                                                                            <FormLabel className="font-normal">{religion}</FormLabel>
                                                                        </FormItem>
                                                                    )}
                                                                />
                                                            ))}
                                                        </div>
                                                    </FormItem>
                                                )}
                                            />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                <TabsContent value="lokasi_peta" className="pt-4 space-y-4">
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
                                                    id="management-map-picker" 
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
                                                <FormField control={schoolForm.control} name="latitude" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Latitude</FormLabel>
                                                        <FormControl><Input {...field} value={field.value ?? ''} readOnly className="font-mono bg-muted" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                                <FormField control={schoolForm.control} name="longitude" render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Longitude</FormLabel>
                                                        <FormControl><Input {...field} value={field.value ?? ''} readOnly className="font-mono bg-muted" /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )} />
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                            <DialogFooter className="pt-4">
                                <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                                
                                {isAdding ? (
                                    <>
                                         {activeTab === 'info_umum' && (
                                             <Button 
                                                 type="button" 
                                                 onClick={selectedJenjang === 'SMP' ? () => handleNext('lokasi_peta') : () => handleNext('data_pendaftaran')}>
                                                 Lanjut
                                             </Button>
                                         )}
                                         {activeTab === 'data_pendaftaran' && (
                                             <>
                                                 <Button type="button" variant="outline" onClick={() => setActiveTab('info_umum')}>Kembali</Button>
                                                 <Button type="button" onClick={() => handleNext('aturan_khusus')}>Lanjut</Button>
                                             </>
                                         )}
                                         {activeTab === 'aturan_khusus' && (
                                             <>
                                                 <Button type="button" variant="outline" onClick={() => setActiveTab('data_pendaftaran')}>Kembali</Button>
                                                 <Button type="button" onClick={() => setActiveTab('lokasi_peta')}>Lanjut</Button>
                                             </>
                                         )}
                                         {activeTab === 'lokasi_peta' && (
                                             <>
                                                 <Button 
                                                     type="button" 
                                                     variant="outline" 
                                                     onClick={() => setActiveTab(selectedJenjang === 'SMP' ? 'info_umum' : 'aturan_khusus')}
                                                 >
                                                     Kembali
                                                 </Button>
                                                 <Button type="submit">Simpan Sekolah</Button>
                                             </>
                                         )}
                                    </>
                                ) : (
                                    <Button type="submit">Simpan Perubahan</Button>
                                )}
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* School Delete Alert */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat diurungkan. Data sekolah akan dihapus secara permanen dari sistem.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDeleteSchool} className="bg-destructive hover:bg-destructive/90">
                            Ya, Hapus Sekolah
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            {/* Major Dialog */}
            <Dialog open={isMajorDialogOpen} onOpenChange={setIsMajorDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingMajor ? "Edit Jurusan" : "Tambah Jurusan Baru"}</DialogTitle>
                    </DialogHeader>
                    <Form {...majorForm}>
                        <form onSubmit={majorForm.handleSubmit(processMajorForm)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                            <FormField control={majorForm.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Nama Jurusan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <Card>
                                <CardHeader><CardTitle className="text-base">Pembagian Kuota per Jalur</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <FormField control={majorForm.control} name="quota.afirmasi" render={({ field }) => ( <FormItem><FormLabel>Afirmasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={majorForm.control} name="quota.mutasi" render={({ field }) => ( <FormItem><FormLabel>Mutasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={majorForm.control} name="quota.prestasi" render={({ field }) => ( <FormItem><FormLabel>Prestasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={majorForm.control} name="quota.domisili" render={({ field }) => ( <FormItem><FormLabel>Domisili</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </CardContent>
                            </Card>
                             <FormField control={majorForm.control} name="berkasPendukung" render={({ field }) => ( <FormItem><FormLabel>Berkas Pendukung (Opsional)</FormLabel><CardDescription>Sebutkan berkas khusus yang diperlukan untuk jurusan ini, jika ada. Contoh: Surat Keterangan Tidak Buta Warna.</CardDescription><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />

                            <DialogFooter className="pt-4">
                                <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                                <Button type="submit">Simpan Jurusan</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
            
            {/* Major Delete Alert */}
            <AlertDialog open={isMajorAlertOpen} onOpenChange={setIsMajorAlertOpen}>
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

            {/* ===== BULK DELETE CONFIRMATION DIALOG ===== */}
            <AlertDialog open={isBulkDeleteAlertOpen} onOpenChange={setIsBulkDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trash2 className="h-5 w-5 text-destructive" />
                            Hapus {selectedSchoolIds.size} Sekolah?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus <strong>{selectedSchoolIds.size} sekolah</strong> beserta seluruh data terkaitnya secara permanen, termasuk:
                            <ul className="mt-2 list-disc list-inside space-y-1 text-sm">
                                <li>Akun kepala sekolah (username &amp; password)</li>
                                <li>Seluruh data pendaftar yang memilih sekolah ini</li>
                                <li>Seluruh data siswa terkelola dari sekolah ini</li>
                            </ul>
                            <span className="block mt-2 font-semibold text-destructive">Tindakan ini tidak dapat diurungkan.</span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmBulkDelete}
                            className="bg-destructive hover:bg-destructive/90"
                        >
                            Ya, Hapus Semua
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ===== IMPORT EXCEL PREVIEW DIALOG ===== */}

            <Dialog open={isImportDialogOpen} onOpenChange={(open) => { if (!open) { setIsImportDialogOpen(false); setImportPreviewData([]); setImportErrors([]); }}}>
                <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <FileSpreadsheet className="h-5 w-5 text-primary" />
                            Preview Import Sekolah
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                        {/* Validation Errors */}
                        {importErrors.length > 0 && (
                            <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4 space-y-2">
                                <div className="flex items-center gap-2 text-destructive font-semibold text-sm">
                                    <AlertTriangle className="h-4 w-4" />
                                    {importErrors.length} Peringatan Validasi — Baris bermasalah tetap akan disertakan, namun harap periksa kembali.
                                </div>
                                <ul className="space-y-1">
                                    {importErrors.map((err, i) => (
                                        <li key={i} className="text-xs text-destructive flex items-start gap-1.5">
                                            <X className="h-3 w-3 mt-0.5 shrink-0" />{err}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Summary */}
                        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-700">
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                            <span><strong>{importPreviewData.length}</strong> baris data siap diimpor. Akun kepala sekolah akan otomatis dibuat (username &amp; password = NPSN).</span>
                        </div>

                        {/* Preview Table */}
                        <div className="rounded-lg border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead className="bg-muted/50">
                                        <tr>
                                            {['#', 'NPSN', 'Nama Sekolah', 'Jenjang', 'Jenis', 'Kecamatan', 'Akreditasi'].map(h => (
                                                <th key={h} className="px-3 py-2 text-left font-semibold text-muted-foreground whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {importPreviewData.map((row, i) => (
                                            <tr key={i} className="border-t hover:bg-muted/30 transition-colors">
                                                <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                                                <td className="px-3 py-2 font-mono">{row.npsn || <span className="text-destructive italic">kosong</span>}</td>
                                                <td className="px-3 py-2 font-medium max-w-[200px] truncate">{row.namaSekolah || <span className="text-destructive italic">kosong</span>}</td>
                                                <td className="px-3 py-2">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.jenjang === 'SMA' ? 'bg-blue-100 text-blue-700' : row.jenjang === 'SMK' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                                                        {row.jenjang}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2">{row.jenis}</td>
                                                <td className="px-3 py-2">{row.kecamatan}</td>
                                                <td className="px-3 py-2 font-bold text-primary">{row.akreditasi}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t">
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={isImporting}>Batal</Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={handleConfirmImport}
                            disabled={isImporting || importPreviewData.length === 0}
                            className="min-w-[140px]"
                        >
                            {isImporting ? (
                                <span className="flex items-center gap-2"><span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" /> Mengimpor...</span>
                            ) : (
                                <span className="flex items-center gap-2"><Upload className="h-4 w-4" /> Import {importPreviewData.length} Sekolah</span>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

    
