
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import * as z from "zod";
import * as xlsx from "xlsx";
import { Users, MoreHorizontal, Edit, Trash2, PlusCircle, Upload, KeyRound, Eye, EyeOff, FileDown, History } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { getSchoolByNPSN, type School } from "@/lib/schoolService";
import { getUsers, addUser, updateUser, deleteUser } from "@/lib/userService";
import { getManagedApplicants, addManagedApplicant, updateManagedApplicant, deleteManagedApplicant } from "@/lib/managedApplicantService";
import type { ManagedApplicant, ExcelRow } from "@/lib/types";
import { addressData, getDistricts, getSubdistricts, getVillages } from "@/lib/addressData";
import { addImportLog, getImportHistory, type ImportLog } from "@/lib/importHistoryService";

const religionOptions = [ "Islam", "Kristen Protestan", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya" ];
const occupationOptions = [ "Tidak Bekerja", "Ibu Rumah Tangga", "PNS/TNI/Polri", "Pegawai Swasta", "Wiraswasta", "Petani/Nelayan/Peternak", "Buruh", "Profesional", "Pensiunan", "Lainnya" ];
const incomeOptions = [ "-", "< Rp 1.000.000", "Rp 1.000.000 - Rp 2.500.000", "Rp 2.500.001 - Rp 5.000.000", "Rp 5.000.001 - Rp 7.500.000", "Rp 7.500.001 - Rp 15.000.000", "> Rp 15.000.000" ];

const indonesianProvinces = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", 
  "Sumatera Selatan", "Bangka Belitung", "Bengkulu", "Lampung", "DKI Jakarta", 
  "Jawa Barat", "Banten", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur", 
  "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat", 
  "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", 
  "Sulawesi Utara", "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", 
  "Sulawesi Tenggara", "Maluku", "Maluku Utara", "Papua", "Papua Barat", 
  "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya"
];

const kaltimDistricts = [
  "Kabupaten Berau", "Kota Samarinda", "Kota Balikpapan", "Kota Bontang", 
  "Kabupaten Kutai Kartanegara", "Kabupaten Kutai Timur", "Kabupaten Kutai Barat", 
  "Kabupaten Paser", "Kabupaten Penajam Paser Utara", "Kabupaten Mahakam Ulu"
];

const applicantFormSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  nisn: z.string().length(10, { message: "NISN harus 10 digit." }),
  nik: z.string().length(16, { message: "NIK harus 16 digit." }).optional().or(z.literal('')),
  placeOfBirth: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["Laki-laki", "Perempuan"], { required_error: "Jenis kelamin harus dipilih." }),
  religion: z.string().optional(),
  contactNumber: z.string().optional(),
  
  streetName: z.string().optional(),
  rtRw: z.string().optional(),
  province: z.string().optional().or(z.literal('')),
  district: z.string().optional().or(z.literal('')),
  subdistrict: z.string().optional().or(z.literal('')),
  village: z.string().optional().or(z.literal('')),

  fatherName: z.string().optional(),
  fatherOccupation: z.string().optional(),
  fatherIncome: z.string().optional(),
  motherName: z.string().optional(),
  motherOccupation: z.string().optional(),
  motherIncome: z.string().optional(),
  guardianName: z.string().optional(),
  semesterGrades: z.object({
    semester1: z.coerce.number().min(0).max(100),
    semester2: z.coerce.number().min(0).max(100),
    semester3: z.coerce.number().min(0).max(100),
    semester4: z.coerce.number().min(0).max(100),
    semester5: z.coerce.number().min(0).max(100),
  })
});

type ApplicantFormValues = z.infer<typeof applicantFormSchema>;
type TabValue = "personal" | "parent" | "grades";

const defaultFormValues: ApplicantFormValues = {
    fullName: '', nisn: '', nik: '', placeOfBirth: '', dateOfBirth: '', gender: 'Laki-laki', religion: '', contactNumber: '', 
    province: 'Kalimantan Timur', district: 'Kabupaten Berau', subdistrict: '', village: '', streetName: '', rtRw: '',
    fatherName: '', fatherOccupation: '', fatherIncome: '', motherName: '', motherOccupation: '', motherIncome: '', guardianName: '',
    semesterGrades: { semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 0 }
};

export default function ManagedApplicantPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);
    const [operatorSchool, setOperatorSchool] = React.useState<School | null>(null);
    const [applicants, setApplicants] = React.useState<ManagedApplicant[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingApplicant, setEditingApplicant] = React.useState<ManagedApplicant | null>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [applicantToDelete, setApplicantToDelete] = React.useState<ManagedApplicant | null>(null);
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [activeTab, setActiveTab] = React.useState<TabValue>('personal');
    
    const [isAccountInfoDialogOpen, setIsAccountInfoDialogOpen] = React.useState(false);
    const [accountInfo, setAccountInfo] = React.useState({ username: '', password: '' });
    const [accountInfoDialogTitle, setAccountInfoDialogTitle] = React.useState('');
    const [isNewApplicantSession, setIsNewApplicantSession] = React.useState(false);
    const [visiblePasswordId, setVisiblePasswordId] = React.useState<string | null>(null);
    
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = React.useState(false);
    const [importHistory, setImportHistory] = React.useState<ImportLog[]>([]);

    const form = useForm<ApplicantFormValues>({
        resolver: zodResolver(applicantFormSchema),
        defaultValues: defaultFormValues,
    });
    
    const watchedProvince = useWatch({ control: form.control, name: "province" });
    const watchedDistrict = useWatch({ control: form.control, name: "district" });
    const watchedSubdistrict = useWatch({ control: form.control, name: "subdistrict" });
    
    const isBerau = watchedProvince === "Kalimantan Timur" && watchedDistrict === "Kabupaten Berau";
    const districtOptions = watchedProvince === "Kalimantan Timur" ? kaltimDistricts : [];
    const subdistrictOptions = isBerau ? getSubdistricts(watchedProvince as any, watchedDistrict as any) : [];
    const villageOptions = isBerau ? getVillages(watchedProvince as any, watchedDistrict as any, watchedSubdistrict) : [];

    React.useEffect(() => {
        const credentials = getFromLocalStorage<LoginCredentials | null>("loginCredentials", null);
        if (!credentials || !credentials.username) {
            router.replace('/registration/home');
            return;
        }

        const user = getUsers().find(u => u.username === credentials.username);
        if (!user || !user.npsn) {
            toast({ variant: "destructive", title: "Sekolah tidak terhubung" });
            setIsLoading(false);
            return;
        }

        const school = getSchoolByNPSN(user.npsn);
        
        const isAuthorized = credentials.role === 'smp_operator' || (credentials.role === 'headmaster' && school?.jenjang === 'SMP');
        if (!isAuthorized) {
            toast({ variant: "destructive", title: "Akses Ditolak", description: "Hanya operator/kepala sekolah SMP yang dapat mengakses halaman ini." });
            router.replace('/registration/home');
            return;
        }

        if (school) {
            setOperatorSchool(school);
            const schoolApplicants = getManagedApplicants().filter(a => a.asalSekolahId === school.id);
            setApplicants(schoolApplicants);
            setImportHistory(getImportHistory(school.id));
        }
        setIsLoading(false);
    }, [router, toast]);

    const showAccountInfo = (applicant: ManagedApplicant, title: string) => {
        const user = getUsers().find(u => u.username === applicant.nisn);
        if (user && user.password) {
            setAccountInfo({ username: user.username, password: user.password });
            setAccountInfoDialogTitle(title);
            setIsAccountInfoDialogOpen(true);
        } else {
            toast({
                variant: "destructive",
                title: "Akun Tidak Ditemukan",
                description: `Gagal menemukan akun login untuk NISN ${applicant.nisn}.`,
            });
        }
    };
    
    const handleOpenDialog = (applicant: ManagedApplicant | null = null) => {
        setActiveTab('personal');
        setEditingApplicant(applicant);
        setIsNewApplicantSession(!applicant); // Track if this is a new entry
        if (applicant) {
            form.reset({
                ...defaultFormValues,
                ...applicant,
                province: applicant.province || "Kalimantan Timur",
                district: applicant.district || "Kabupaten Berau",
            });
        } else {
            form.reset(defaultFormValues);
        }
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (applicant: ManagedApplicant) => {
        setApplicantToDelete(applicant);
        setIsAlertOpen(true);
    };

    const handleConfirmDelete = () => {
        if (applicantToDelete && operatorSchool) {
            const userToDeleteAccount = getUsers().find(u => u.username === applicantToDelete.nisn);
            
            if (userToDeleteAccount) {
                deleteUser(userToDeleteAccount.id);
            } else {
                deleteManagedApplicant(applicantToDelete.id);
            }
            
            setApplicants(getManagedApplicants().filter(a => a.asalSekolahId === operatorSchool.id));
            toast({ title: "Pendaftar Dihapus", description: `Data untuk ${applicantToDelete.fullName} telah dihapus.` });
        }
        setIsAlertOpen(false);
        setApplicantToDelete(null);
    };

    const processFormAndNavigate = (data: ApplicantFormValues) => {
        if (!operatorSchool) return;
        try {
            const applicantData = { ...data, asalSekolahId: operatorSchool.id };
            let savedApplicant: ManagedApplicant | undefined;
            
            if (editingApplicant) {
                savedApplicant = updateManagedApplicant({ ...applicantData, id: data.nisn });
                if (savedApplicant) {
                    setApplicants(prev => prev.map(a => a.id === savedApplicant!.id ? savedApplicant! : a));
                    
                    const userToUpdate = getUsers().find(u => u.username === editingApplicant.nisn);
                    if (userToUpdate) {
                        updateUser({
                            ...userToUpdate,
                            username: savedApplicant.nisn,
                            fullName: savedApplicant.fullName,
                        });
                    }
                }
            } else {
                savedApplicant = addManagedApplicant(applicantData);
                if(savedApplicant) setApplicants(prev => [...prev, savedApplicant!]);
                setEditingApplicant(savedApplicant);
            }
            
            const tabsOrder: TabValue[] = ['personal', 'parent', 'grades'];
            const currentTabIndex = tabsOrder.indexOf(activeTab);
            const isLastTab = currentTabIndex === tabsOrder.length - 1;

            if (isLastTab) {
                if (isNewApplicantSession) {
                    try {
                        const password = Math.random().toString(36).substring(2, 10);
                        addUser({
                            fullName: data.fullName,
                            username: data.nisn,
                            password: password,
                            role: 'applicant'
                        });
                    } catch (userError: any) {
                        if (!userError.message.includes('sudah ada')) {
                           throw userError;
                        }
                    }
                }

                toast({ title: "Data Disimpan", description: "Semua data pendaftar telah berhasil disimpan." });
                setIsDialogOpen(false);

                if (savedApplicant) {
                    const title = isNewApplicantSession ? "Akun Pendaftar Berhasil Dibuat" : "Informasi Akun Pendaftar";
                    showAccountInfo(savedApplicant, title);
                }
            } else {
                toast({ title: "Data Disimpan", description: `Data pada tab ini disimpan. Melanjutkan...` });
                setActiveTab(tabsOrder[currentTabIndex + 1]);
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        }
    };
    
    const calculateAverage = (grades: ManagedApplicant['semesterGrades']) => {
        const values = Object.values(grades);
        const sum = values.reduce((acc, val) => acc + val, 0);
        return (sum / values.length).toFixed(2);
    };

    const handleDownloadTemplate = () => {
        const headers = [
            "Nama Lengkap", "NISN", "Tempat Lahir", "Tanggal Lahir", "Jenis Kelamin",
            "Nama Ibu Kandung", 
            "Rata-rata Nilai Semester 1", "Rata-rata Nilai Semester 2", 
            "Rata-rata Nilai Semester 3", "Rata-rata Nilai Semester 4", 
            "Rata-rata Nilai Semester 5"
        ];
        const ws = xlsx.utils.aoa_to_sheet([headers]);
        const wb = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(wb, ws, "Template Pendaftar");
        xlsx.writeFile(wb, "Template_Pendaftar_SMP.xlsx");
        toast({ title: "Template Diunduh", description: "Template Excel untuk data pendaftar telah berhasil diunduh." });
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !operatorSchool) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            let successCount = 0;
            let errorCount = 0;
            const errors: string[] = [];
            
            try {
                const data = e.target?.result;
                const workbook = xlsx.read(data, { type: 'binary', cellDates: true });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: ExcelRow[] = xlsx.utils.sheet_to_json(worksheet);

                 json.forEach((row: any, index) => {
                    try {
                        if (!row["Nama Lengkap"] || !row["NISN"] || !row["Jenis Kelamin"] || !row["Nama Ibu Kandung"] || 
                            row["Rata-rata Nilai Semester 1"] === undefined ||
                            row["Rata-rata Nilai Semester 2"] === undefined ||
                            row["Rata-rata Nilai Semester 3"] === undefined ||
                            row["Rata-rata Nilai Semester 4"] === undefined ||
                            row["Rata-rata Nilai Semester 5"] === undefined) {
                            throw new Error("Kolom Nama Lengkap, NISN, Jenis Kelamin, Nama Ibu Kandung, dan Rata-rata Nilai Semester 1-5 wajib diisi.");
                        }

                        const sem1 = Number(row["Rata-rata Nilai Semester 1"]);
                        const sem2 = Number(row["Rata-rata Nilai Semester 2"]);
                        const sem3 = Number(row["Rata-rata Nilai Semester 3"]);
                        const sem4 = Number(row["Rata-rata Nilai Semester 4"]);
                        const sem5 = Number(row["Rata-rata Nilai Semester 5"]);

                        if ([sem1, sem2, sem3, sem4, sem5].some(val => isNaN(val) || val < 0 || val > 100)) {
                            throw new Error("Nilai rata-rata semester harus berupa angka antara 0 dan 100.");
                        }

                        const newApplicantData: Omit<ManagedApplicant, 'id'> = {
                            fullName: row["Nama Lengkap"],
                            nisn: String(row["NISN"]),
                            placeOfBirth: row["Tempat Lahir"] ? String(row["Tempat Lahir"]) : undefined,
                            dateOfBirth: row["Tanggal Lahir"] instanceof Date 
                                ? row["Tanggal Lahir"].toISOString().split('T')[0] 
                                : String(row["Tanggal Lahir"] || ''),
                            gender: row["Jenis Kelamin"] as any,
                            motherName: String(row["Nama Ibu Kandung"]),
                            asalSekolahId: operatorSchool.id,
                            province: 'Kalimantan Timur',
                            district: 'Kabupaten Berau',
                            semesterGrades: {
                                semester1: sem1,
                                semester2: sem2,
                                semester3: sem3,
                                semester4: sem4,
                                semester5: sem5,
                            }
                        };
                        addManagedApplicant(newApplicantData);
                        
                        try {
                           const password = Math.random().toString(36).substring(2, 10);
                           addUser({
                             fullName: newApplicantData.fullName,
                             username: newApplicantData.nisn,
                             password: password,
                             role: 'applicant'
                           });
                        } catch (userError: any) {
                            if (!userError.message.includes('sudah ada')) {
                                throw userError;
                            }
                        }

                        successCount++;
                    } catch (e: any) {
                        errorCount++;
                        errors.push(`Baris ${index + 2}: ${e.message}`);
                    }
                });

                setApplicants(getManagedApplicants().filter(a => a.asalSekolahId === operatorSchool.id));
                toast({
                    title: "Import Selesai",
                    description: `${successCount} data berhasil diimpor, ${errorCount} data gagal. Lihat riwayat untuk detail.`,
                });

            } catch (e) {
                toast({ variant: "destructive", title: "Gagal Membaca File", description: "Pastikan format file Excel sudah benar dan tidak rusak." });
                errorCount = 1;
                errors.push("Gagal membaca file Excel. Pastikan format benar.");
            } finally {
                addImportLog({
                    schoolId: operatorSchool.id,
                    fileName: file.name,
                    timestamp: new Date().toISOString(),
                    successCount,
                    errorCount,
                    errors,
                });
                setImportHistory(getImportHistory(operatorSchool.id));
            }
        };
        reader.readAsBinaryString(file);
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    if (isLoading) return <div className="p-4">Memuat data...</div>;
    if (!operatorSchool) return <div className="p-4">Akun Anda tidak terhubung ke sekolah manapun.</div>;

    return (
        <>
            <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
                <Card className="w-full max-w-5xl shadow-2xl">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
                                    <Users size={28} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl sm:text-3xl font-headline">Data Pendaftar</CardTitle>
                                    <CardDescription className="text-md mt-1">
                                        Kelola data calon pendaftar dari {operatorSchool.namaSekolah}.
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".xlsx, .xls" className="hidden"/>
                                <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Unduh Template
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setIsHistoryDialogOpen(true)}>
                                    <History className="mr-2 h-4 w-4" />
                                    Riwayat Impor
                                </Button>
                                <Button type="button" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import Excel
                                </Button>
                                <Button type="button" onClick={() => handleOpenDialog()}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Manual
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Lengkap</TableHead>
                                        <TableHead>NISN</TableHead>
                                        <TableHead>Jenis Kelamin</TableHead>
                                        <TableHead>Rata-rata Nilai</TableHead>
                                        <TableHead>Kata Sandi</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applicants.length > 0 ? (
                                        applicants.map(applicant => {
                                            const user = getUsers().find(u => u.username === applicant.nisn);
                                            return (
                                            <TableRow key={applicant.id}>
                                                <TableCell className="font-medium">
                                                    <button onClick={() => handleOpenDialog(applicant)} className="text-primary hover:underline text-left">
                                                        {applicant.fullName}
                                                    </button>
                                                </TableCell>
                                                <TableCell>{applicant.nisn}</TableCell>
                                                <TableCell>{applicant.gender}</TableCell>
                                                <TableCell>{calculateAverage(applicant.semesterGrades)}</TableCell>
                                                <TableCell>
                                                    {user ? (
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-mono">
                                                                {visiblePasswordId === applicant.id ? user.password : '********'}
                                                            </span>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={() => setVisiblePasswordId(visiblePasswordId === applicant.id ? null : applicant.id)}
                                                                aria-label="Toggle password visibility"
                                                            >
                                                                {visiblePasswordId === applicant.id ? (
                                                                    <EyeOff className="h-4 w-4" />
                                                                ) : (
                                                                    <Eye className="h-4 w-4" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs italic">Akun belum dibuat</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(applicant)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => showAccountInfo(applicant, "Informasi Akun Pendaftar")}><KeyRound className="mr-2 h-4 w-4" />Lihat Akun</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDeleteClick(applicant)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Hapus</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        )})
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-24 text-center">Belum ada data pendaftar.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingApplicant ? "Edit Pendaftar" : "Tambah Pendaftar Baru"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processFormAndNavigate)} className="space-y-4 py-4 pr-2">
                            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="personal">Data Diri</TabsTrigger>
                                    <TabsTrigger value="parent">Data Orang Tua</TabsTrigger>
                                    <TabsTrigger value="grades">Nilai Rapor</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="personal" className="pt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="nisn" render={({ field }) => ( <FormItem><FormLabel>NISN</FormLabel><FormControl><Input {...field} disabled={!!editingApplicant} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="nik" render={({ field }) => ( <FormItem><FormLabel>NIK</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Jenis Kelamin</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="placeOfBirth" render={({ field }) => ( <FormItem><FormLabel>Tempat Lahir</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => ( <FormItem><FormLabel>Tanggal Lahir</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="religion" render={({ field }) => ( <FormItem><FormLabel>Agama</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Agama"/></SelectTrigger></FormControl><SelectContent>{religionOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="contactNumber" render={({ field }) => ( <FormItem><FormLabel>No. Kontak</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                    <div className="space-y-4 rounded-md border p-4">
                                        <h3 className="text-sm font-medium text-muted-foreground">Alamat Lengkap</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField control={form.control} name="province" render={({ field }) => ( <FormItem><FormLabel>Provinsi</FormLabel><Select onValueChange={(value) => { field.onChange(value); form.setValue("district", ""); form.setValue("subdistrict", ""); form.setValue("village", ""); }} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Provinsi" /></SelectTrigger></FormControl><SelectContent>{indonesianProvinces.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="district" render={({ field }) => ( 
                                                <FormItem>
                                                    <FormLabel>Kabupaten/Kota</FormLabel>
                                                    {watchedProvince === "Kalimantan Timur" ? (
                                                        <Select onValueChange={(value) => { field.onChange(value); form.setValue("subdistrict", ""); form.setValue("village", ""); }} value={field.value} disabled={!watchedProvince}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Pilih Kabupaten/Kota" /></SelectTrigger></FormControl>
                                                            <SelectContent>{districtOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <FormControl><Input {...field} placeholder="Tulis Kabupaten/Kota..." disabled={!watchedProvince} /></FormControl>
                                                    )}
                                                    <FormMessage />
                                                </FormItem> 
                                            )} />
                                            <FormField control={form.control} name="subdistrict" render={({ field }) => ( 
                                                <FormItem>
                                                    <FormLabel>Kecamatan</FormLabel>
                                                    {isBerau ? (
                                                        <Select onValueChange={(value) => { field.onChange(value); form.setValue("village", ""); }} value={field.value} disabled={!watchedDistrict}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Pilih Kecamatan" /></SelectTrigger></FormControl>
                                                            <SelectContent>{subdistrictOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <FormControl><Input {...field} placeholder="Tulis Kecamatan..." disabled={!watchedDistrict} /></FormControl>
                                                    )}
                                                    <FormMessage />
                                                </FormItem> 
                                            )} />
                                            <FormField control={form.control} name="village" render={({ field }) => ( 
                                                <FormItem>
                                                    <FormLabel>Kelurahan/Desa</FormLabel>
                                                    {isBerau ? (
                                                        <Select onValueChange={field.onChange} value={field.value} disabled={!watchedSubdistrict}>
                                                            <FormControl><SelectTrigger><SelectValue placeholder="Pilih Kelurahan/Desa" /></SelectTrigger></FormControl>
                                                            <SelectContent>{villageOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                                                        </Select>
                                                    ) : (
                                                        <FormControl><Input {...field} placeholder="Tulis Kelurahan/Desa..." disabled={!watchedSubdistrict} /></FormControl>
                                                    )}
                                                    <FormMessage />
                                                </FormItem> 
                                            )} />
                                            <FormField control={form.control} name="streetName" render={({ field }) => ( <FormItem><FormLabel>Nama Jalan &amp; No. Rumah</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="rtRw" render={({ field }) => ( <FormItem><FormLabel>RT/RW</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="parent" className="pt-4 space-y-6">
                                    <Card>
                                        <CardHeader><CardTitle className="text-base">Data Ayah</CardTitle></CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField control={form.control} name="fatherName" render={({ field }) => ( <FormItem><FormLabel>Nama Ayah</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="fatherOccupation" render={({ field }) => ( <FormItem><FormLabel>Pekerjaan Ayah</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Pekerjaan"/></SelectTrigger></FormControl><SelectContent>{occupationOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="fatherIncome" render={({ field }) => ( <FormItem><FormLabel>Penghasilan Ayah</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Penghasilan"/></SelectTrigger></FormControl><SelectContent>{incomeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader><CardTitle className="text-base">Data Ibu</CardTitle></CardHeader>
                                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <FormField control={form.control} name="motherName" render={({ field }) => ( <FormItem><FormLabel>Nama Ibu</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="motherOccupation" render={({ field }) => ( <FormItem><FormLabel>Pekerjaan Ibu</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Pekerjaan"/></SelectTrigger></FormControl><SelectContent>{occupationOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                            <FormField control={form.control} name="motherIncome" render={({ field }) => ( <FormItem><FormLabel>Penghasilan Ibu</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Pilih Penghasilan"/></SelectTrigger></FormControl><SelectContent>{incomeOptions.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem> )} />
                                        </CardContent>
                                    </Card>
                                     <Card>
                                        <CardHeader><CardTitle className="text-base">Data Wali (opsional)</CardTitle></CardHeader>
                                        <CardContent>
                                            <FormField control={form.control} name="guardianName" render={({ field }) => ( <FormItem><FormLabel>Nama Wali</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                                
                                <TabsContent value="grades" className="pt-4">
                                     <Card>
                                        <CardHeader><CardTitle className="text-base">Nilai Rapor</CardTitle></CardHeader>
                                        <CardContent className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                            <FormField control={form.control} name="semesterGrades.semester1" render={({ field }) => (<FormItem><FormLabel>SMT 1</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="semesterGrades.semester2" render={({ field }) => (<FormItem><FormLabel>SMT 2</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="semesterGrades.semester3" render={({ field }) => (<FormItem><FormLabel>SMT 3</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="semesterGrades.semester4" render={({ field }) => (<FormItem><FormLabel>SMT 4</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="semesterGrades.semester5" render={({ field }) => (<FormItem><FormLabel>SMT 5</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                            <DialogFooter className="pt-4">
                                <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                                <Button type="submit">
                                    {activeTab === 'grades' ? 'Simpan' : 'Simpan dan lanjutkan'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>Tindakan ini akan menghapus data pendaftar beserta akun loginnya secara permanen.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
            <AlertDialog open={isAccountInfoDialogOpen} onOpenChange={setIsAccountInfoDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                           <KeyRound className="h-6 w-6 text-green-600" /> {accountInfoDialogTitle}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Harap berikan informasi login berikut kepada siswa yang bersangkutan untuk melanjutkan proses pendaftaran.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4 space-y-2">
                        <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                            <span className="font-medium text-muted-foreground">Username (NISN)</span>
                            <span className="font-mono font-bold">{accountInfo.username}</span>
                        </div>
                        <div className="flex justify-between items-center bg-muted p-3 rounded-md">
                            <span className="font-medium text-muted-foreground">Password</span>
                            <span className="font-mono font-bold">{accountInfo.password}</span>
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogAction onClick={() => setIsAccountInfoDialogOpen(false)}>Tutup</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            
             <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Riwayat Impor Excel</DialogTitle>
                        <DialogDescription>
                            Berikut adalah catatan semua aktivitas impor data dari file Excel.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto pr-4 my-4">
                        {importHistory.length > 0 ? (
                             <Accordion type="single" collapsible className="w-full">
                                {importHistory.map((log) => (
                                    <AccordionItem value={log.id} key={log.id}>
                                        <AccordionTrigger>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full pr-4">
                                                <div className="flex-1 text-left">
                                                    <p className="font-medium truncate">{log.fileName}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {new Date(log.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2 mt-2 sm:mt-0">
                                                    <Badge variant={log.successCount > 0 ? "default" : "secondary"}>Sukses: {log.successCount}</Badge>
                                                    <Badge variant={log.errorCount > 0 ? "destructive" : "secondary"}>Gagal: {log.errorCount}</Badge>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                           {log.errors.length > 0 ? (
                                                <div className="text-sm space-y-1 bg-muted p-3 rounded-md">
                                                     <p className="font-semibold text-destructive mb-2">Detail Error:</p>
                                                     <ul className="list-disc pl-5">
                                                        {log.errors.map((error, idx) => <li key={idx}>{error}</li>)}
                                                     </ul>
                                                </div>
                                           ) : (
                                               <p className="text-sm text-muted-foreground text-center py-4">Tidak ada error pada impor ini.</p>
                                           )}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        ) : (
                            <p className="text-center text-muted-foreground py-10">Belum ada riwayat impor.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" onClick={() => setIsHistoryDialogOpen(false)}>Tutup</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
