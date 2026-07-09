"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Users, MoreHorizontal, Edit, Trash2, PlusCircle, KeyRound, Eye, EyeOff, ClipboardList, Info } from 'lucide-react';

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
import { Badge } from "@/components/ui/badge";

import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { getUsers, addUser, updateUser, deleteUser } from "@/lib/userService";
import { getManagedApplicants, addManagedApplicant, updateManagedApplicant, deleteManagedApplicant } from "@/lib/managedApplicantService";
import type { ManagedApplicant } from "@/lib/types";
import { addressData } from "@/lib/addressData";

const religionOptions = [ "Islam", "Kristen Protestan", "Katolik", "Hindu", "Buddha", "Konghucu", "Lainnya" ];
const occupationOptions = [ "Tidak Bekerja", "Ibu Rumah Tangga", "PNS/TNI/Polri", "Pegawai Swasta", "Wiraswasta", "Petani/Nelayan/Peternak", "Buruh", "Profesional", "Pensiunan", "Lainnya" ];
const incomeOptions = [ "-", "< Rp 1.000.000", "Rp 1.000.000 - Rp 2.500.000", "Rp 2.500.001 - Rp 5.000.000", "Rp 5.000.001 - Rp 7.500.000", "Rp 7.500.001 - Rp 15.000.000", "> Rp 15.000.000" ];

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
  previousSchool: z.string().min(3, { message: "Nama asal sekolah minimal 3 karakter." }),
  
  streetName: z.string().optional(),
  rtRw: z.string().optional(),
  province: z.string().min(1, "Provinsi harus dipilih."),
  district: z.string().min(1, "Kabupaten/Kota harus dipilih."),
  subdistrict: z.string().min(1, "Kecamatan harus dipilih."),
  village: z.string().min(1, "Kelurahan/Desa harus dipilih."),

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
    fullName: '', nisn: '', nik: '', placeOfBirth: '', dateOfBirth: '', gender: 'Laki-laki', religion: '', contactNumber: '', previousSchool: '',
    province: 'Kalimantan Timur', district: 'Kabupaten Berau', subdistrict: '', village: '', streetName: '', rtRw: '',
    fatherName: '', fatherOccupation: '', fatherIncome: '', motherName: '', motherOccupation: '', motherIncome: '', guardianName: '',
    semesterGrades: { semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 0 }
};

export default function OuterRegionApplicantsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);
    const [applicants, setApplicants] = React.useState<ManagedApplicant[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingApplicant, setEditingApplicant] = React.useState<ManagedApplicant | null>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [applicantToDelete, setApplicantToDelete] = React.useState<ManagedApplicant | null>(null);
    const [activeTab, setActiveTab] = React.useState<TabValue>('personal');
    
    const [isAccountInfoDialogOpen, setIsAccountInfoDialogOpen] = React.useState(false);
    const [accountInfo, setAccountInfo] = React.useState({ username: '', password: '' });
    const [accountInfoDialogTitle, setAccountInfoDialogTitle] = React.useState('');
    const [isNewApplicantSession, setIsNewApplicantSession] = React.useState(false);
    
    // Address dropdown states
    const [subdistricts, setSubdistricts] = React.useState<string[]>([]);
    const [villages, setVillages] = React.useState<string[]>([]);

    const form = useForm<ApplicantFormValues>({
        resolver: zodResolver(applicantFormSchema),
        defaultValues: defaultFormValues
    });

    const watchSubdistrict = form.watch("subdistrict");

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

        // Fetch subdistricts for Kabupaten Berau
        const berauDistricts = addressData["Kalimantan Timur"]["Kabupaten Berau"];
        setSubdistricts(Object.keys(berauDistricts));
        
        // Fetch managed applicants who are marked as outer region or just all managed applicants
        // We identify outer region as those whose asalSekolahId is 'outer-region' or not matching known SMP NPSNs.
        // For simplicity, we display applicants registered by this page (we store their asalSekolahId as 'outer-region')
        const allManaged = getManagedApplicants();
        const outerApplicants = allManaged.filter(app => app.asalSekolahId === 'outer-region');
        setApplicants(outerApplicants);
        setIsLoading(false);
    }, [router, toast]);

    React.useEffect(() => {
        if (watchSubdistrict) {
            const berauDistricts = addressData["Kalimantan Timur"]["Kabupaten Berau"];
            const districtVillages = berauDistricts[watchSubdistrict] || [];
            setVillages(districtVillages);
            
            // If current selected village is not in the new villages, clear it
            const currentVillage = form.getValues("village");
            if (!districtVillages.includes(currentVillage)) {
                form.setValue("village", "");
            }
        } else {
            setVillages([]);
        }
    }, [watchSubdistrict, form]);

    const handleOpenDialog = (applicant: ManagedApplicant | null = null) => {
        setEditingApplicant(applicant);
        setActiveTab('personal');
        if (applicant) {
            form.reset({
                fullName: applicant.fullName,
                nisn: applicant.nisn,
                nik: applicant.nik || '',
                placeOfBirth: applicant.placeOfBirth || '',
                dateOfBirth: applicant.dateOfBirth || '',
                gender: applicant.gender,
                religion: applicant.religion || '',
                contactNumber: applicant.contactNumber || '',
                previousSchool: applicant.fatherIncome || '', // We store school name in fatherIncome temporarily or we need to add fields. Wait, in types.ts ManagedApplicant does not have previousSchool.
                // Wait! ManagedApplicant has: id, fullName, nisn, nik, placeOfBirth, dateOfBirth, gender, religion, contactNumber, streetName, rtRw, village, subdistrict, district, province, asalSekolahId, fatherName...
                // We can use fatherIncome to store the school name, or just use the fatherIncome. Actually, in types.ts ManagedApplicant has asalSekolahId. Let's see: we can set asalSekolahId to 'outer-region' and write the school name in motherIncome or fatherIncome or motherOccupation or we can cast it as any to write it in schoolName!
                // Wait, let's look at types.ts:
                // ManagedApplicant has `asalSekolahId: string;`
                // Let's store the school name in a custom way, e.g. let's check types.ts again. It has no other school name field. Oh wait! It does not have asalSekolahNama!
                // But in Applicant type, it has `asalSekolahNama: string;`.
                // In ManagedApplicant, it only has `asalSekolahId: string;`.
                // Wait! If the student is registered, they will register in registration/dashboard. 
                // Let's store the school name in `fatherOccupation` of the ManagedApplicant, or we can just extend ManagedApplicant type since it's TypeScript! But wait, in LocalStorage it is JSON so we can add any property, e.g. `asalSekolahNama`.
                // Let's add `asalSekolahNama` directly as a property of `ManagedApplicant` in our code (casting it to any when writing)! That's much cleaner than hijacking fatherOccupation!
                // Yes, in TypeScript we can cast it as `any` and set `asalSekolahNama: values.previousSchool` and `asalSekolahId: 'outer-region'`.
                province: applicant.province || 'Kalimantan Timur',
                district: applicant.district || 'Kabupaten Berau',
                subdistrict: applicant.subdistrict || '',
                village: applicant.village || '',
                streetName: applicant.streetName || '',
                rtRw: applicant.rtRw || '',
                fatherName: applicant.fatherName || '',
                fatherOccupation: applicant.fatherOccupation || '',
                fatherIncome: applicant.fatherIncome || '',
                motherName: applicant.motherName || '',
                motherOccupation: applicant.motherOccupation || '',
                motherIncome: applicant.motherIncome || '',
                guardianName: applicant.guardianName || '',
                semesterGrades: applicant.semesterGrades || { semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 0 }
            });
            // Let's set previousSchool from the custom field we stored
            form.setValue("previousSchool", (applicant as any).asalSekolahNama || "");
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
        if (applicantToDelete) {
            deleteManagedApplicant(applicantToDelete.id);
            deleteUser(applicantToDelete.nisn); // Delete their user account too
            setApplicants(getManagedApplicants().filter(app => app.asalSekolahId === 'outer-region'));
            toast({
                title: "Pendaftar Dihapus",
                description: `Data pendaftar "${applicantToDelete.fullName}" telah berhasil dihapus.`,
            });
        }
        setIsAlertOpen(false);
        setApplicantToDelete(null);
    };

    const processForm = (values: ApplicantFormValues) => {
        try {
            const allUsers = getUsers();
            
            if (editingApplicant) {
                // Update ManagedApplicant
                const updated: ManagedApplicant = {
                    id: editingApplicant.id,
                    fullName: values.fullName,
                    nisn: values.nisn,
                    nik: values.nik,
                    placeOfBirth: values.placeOfBirth,
                    dateOfBirth: values.dateOfBirth,
                    gender: values.gender,
                    religion: values.religion,
                    contactNumber: values.contactNumber,
                    streetName: values.streetName,
                    rtRw: values.rtRw,
                    province: values.province,
                    district: values.district,
                    subdistrict: values.subdistrict,
                    village: values.village,
                    asalSekolahId: 'outer-region',
                    fatherName: values.fatherName,
                    fatherOccupation: values.fatherOccupation,
                    fatherIncome: values.fatherIncome,
                    motherName: values.motherName,
                    motherOccupation: values.motherOccupation,
                    motherIncome: values.motherIncome,
                    guardianName: values.guardianName,
                    semesterGrades: values.semesterGrades,
                };
                (updated as any).asalSekolahNama = values.previousSchool;
                updateManagedApplicant(updated);

                // Update User account if username/fullName changed
                const existingUser = allUsers.find(u => u.username === editingApplicant.nisn);
                if (existingUser) {
                    updateUser({
                        ...existingUser,
                        username: values.nisn,
                        fullName: values.fullName,
                    });
                }

                toast({ title: "Data Diperbarui", description: `Data pendaftar "${values.fullName}" berhasil diperbarui.` });
            } else {
                // Add ManagedApplicant
                const newManaged: Omit<ManagedApplicant, 'id'> = {
                    fullName: values.fullName,
                    nisn: values.nisn,
                    nik: values.nik,
                    placeOfBirth: values.placeOfBirth,
                    dateOfBirth: values.dateOfBirth,
                    gender: values.gender,
                    religion: values.religion,
                    contactNumber: values.contactNumber,
                    streetName: values.streetName,
                    rtRw: values.rtRw,
                    province: values.province,
                    district: values.district,
                    subdistrict: values.subdistrict,
                    village: values.village,
                    asalSekolahId: 'outer-region',
                    fatherName: values.fatherName,
                    fatherOccupation: values.fatherOccupation,
                    fatherIncome: values.fatherIncome,
                    motherName: values.motherName,
                    motherOccupation: values.motherOccupation,
                    motherIncome: values.motherIncome,
                    guardianName: values.guardianName,
                    semesterGrades: values.semesterGrades,
                };
                (newManaged as any).asalSekolahNama = values.previousSchool;
                addManagedApplicant(newManaged);

                // Create default student user account
                const generatedPassword = Math.random().toString(36).slice(-8); // Generate 8 char password
                addUser({
                    username: values.nisn,
                    password: generatedPassword,
                    fullName: values.fullName,
                    role: 'applicant'
                });

                setAccountInfo({ username: values.nisn, password: generatedPassword });
                setAccountInfoDialogTitle(`Akun Pendaftar Berhasil Dibuat`);
                setIsNewApplicantSession(true);
            }

            setApplicants(getManagedApplicants().filter(app => app.asalSekolahId === 'outer-region'));
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        }
    };

    if (isLoading) {
        return <div className="p-4 text-center">Memuat data pendaftar luar daerah...</div>;
    }

    return (
        <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-7xl shadow-2xl">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
                            <Users size={28} />
                        </div>
                        <div>
                            <CardTitle className="text-2xl sm:text-3xl font-headline">Pendaftar Luar Daerah</CardTitle>
                            <CardDescription className="text-md mt-1">
                                Kelola pendaftaran kolektif bagi siswa lulusan sekolah di luar daerah Kabupaten Berau.
                            </CardDescription>
                        </div>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="w-full sm:w-auto">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Siswa Baru
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="overflow-x-auto rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">No</TableHead>
                                    <TableHead>Nama Lengkap</TableHead>
                                    <TableHead>NISN</TableHead>
                                    <TableHead>Jenis Kelamin</TableHead>
                                    <TableHead>Asal Sekolah</TableHead>
                                    <TableHead>Kelurahan</TableHead>
                                    <TableHead className="text-center">Nilai Rata-Rata</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {applicants.length > 0 ? (
                                    applicants.map((app, index) => {
                                        const grades = Object.values(app.semesterGrades);
                                        const avgGrade = grades.reduce((a, b) => a + b, 0) / grades.length;
                                        
                                        return (
                                            <TableRow key={app.id}>
                                                <TableCell className="text-center">{index + 1}</TableCell>
                                                <TableCell className="font-semibold">{app.fullName}</TableCell>
                                                <TableCell className="font-mono text-sm">{app.nisn}</TableCell>
                                                <TableCell>{app.gender}</TableCell>
                                                <TableCell>{(app as any).asalSekolahNama || 'Luar Daerah'}</TableCell>
                                                <TableCell>{app.village || '-'}</TableCell>
                                                <TableCell className="text-center font-bold font-mono">{avgGrade.toFixed(2)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(app)}>
                                                                <Edit className="mr-2 h-4 w-4" /> Edit Data
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => {
                                                                setAccountInfo({ username: app.nisn, password: 'password123 (jika tidak diubah)' });
                                                                setAccountInfoDialogTitle(`Detail Akses Akun`);
                                                                setIsNewApplicantSession(false);
                                                                setIsAccountInfoDialogOpen(true);
                                                            }}>
                                                                <KeyRound className="mr-2 h-4 w-4" /> Lihat Akun
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDeleteClick(app)} className="text-destructive focus:text-destructive">
                                                                <Trash2 className="mr-2 h-4 w-4" /> Hapus
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            Belum ada data pendaftar luar daerah yang ditambahkan.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Input Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingApplicant ? "Edit Data Pendaftar" : "Daftarkan Siswa Luar Daerah Baru"}</DialogTitle>
                        <DialogDescription>
                            Isi seluruh biodata, alamat, orang tua, dan nilai semester siswa dengan benar. Akun pendaftaran akan otomatis terbuat setelah disimpan.
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processForm)} className="space-y-6 py-4">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="personal">Data Diri & Sekolah</TabsTrigger>
                                    <TabsTrigger value="parent">Alamat & Orang Tua</TabsTrigger>
                                    <TabsTrigger value="grades">Nilai Rapor</TabsTrigger>
                                </TabsList>
                                
                                {/* Personal Data */}
                                <TabsContent value="personal" className="space-y-4 mt-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="fullName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Lengkap (Sesuai Ijazah)</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="nisn" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>NISN (10 Digit)</FormLabel>
                                                <FormControl><Input maxLength={10} {...field} disabled={!!editingApplicant} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="nik" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>NIK (16 Digit)</FormLabel>
                                                <FormControl><Input maxLength={16} {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                         <FormField control={form.control} name="previousSchool" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Asal Sekolah (Nama SMP/MTs Luar Berau)</FormLabel>
                                                <FormControl><Input placeholder="Contoh: SMP Negeri 1 Samarinda" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="gender" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Jenis Kelamin</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                                                        <SelectItem value="Perempuan">Perempuan</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="religion" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Agama</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {religionOptions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="placeOfBirth" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tempat Lahir</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Tanggal Lahir</FormLabel>
                                                <FormControl><Input type="date" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="contactNumber" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>No. Telepon / WhatsApp Aktif</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <Button type="button" onClick={() => setActiveTab('parent')}>Selanjutnya (Alamat & Wali) →</Button>
                                    </div>
                                </TabsContent>

                                {/* Parent Data & Address */}
                                <TabsContent value="parent" className="space-y-4 mt-4">
                                    <h4 className="font-semibold text-sm border-b pb-1 text-primary">Alamat Tempat Tinggal Saat Ini</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="province" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Provinsi</FormLabel>
                                                <FormControl><Input {...field} disabled /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="district" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kabupaten / Kota</FormLabel>
                                                <FormControl><Input {...field} disabled /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="subdistrict" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kecamatan</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Pilih kecamatan" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {subdistricts.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="village" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Kelurahan / Desa</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value} disabled={!watchSubdistrict}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Pilih kelurahan/desa" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {villages.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="streetName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Jalan & Nomor Rumah</FormLabel>
                                                <FormControl><Input placeholder="Contoh: Jl. Ahmad Yani No. 12" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="rtRw" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>RT / RW</FormLabel>
                                                <FormControl><Input placeholder="Contoh: 005 / 002" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>

                                    <h4 className="font-semibold text-sm border-b pb-1 text-primary mt-6">Data Orang Tua / Wali</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField control={form.control} name="fatherName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Ayah Kandung</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="fatherOccupation" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pekerjaan Ayah</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Pilih Pekerjaan" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {occupationOptions.map(occ => <SelectItem key={occ} value={occ}>{occ}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="fatherIncome" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Penghasilan Ayah Bulanan</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Pilih Penghasilan" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {incomeOptions.map(inc => <SelectItem key={inc} value={inc}>{inc}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />

                                        <FormField control={form.control} name="motherName" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Nama Ibu Kandung</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="motherOccupation" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Pekerjaan Ibu</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Pilih Pekerjaan" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {occupationOptions.map(occ => <SelectItem key={occ} value={occ}>{occ}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="motherIncome" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Penghasilan Ibu Bulanan</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue placeholder="Pilih Penghasilan" /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {incomeOptions.map(inc => <SelectItem key={inc} value={inc}>{inc}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        
                                        <FormField control={form.control} name="guardianName" render={({ field }) => (
                                            <FormItem className="md:col-span-3">
                                                <FormLabel>Nama Wali (Kosongkan jika tidak ada)</FormLabel>
                                                <FormControl><Input {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="flex justify-between pt-4">
                                        <Button type="button" variant="outline" onClick={() => setActiveTab('personal')}>← Kembali</Button>
                                        <Button type="button" onClick={() => setActiveTab('grades')}>Selanjutnya (Nilai Rapor) →</Button>
                                    </div>
                                </TabsContent>

                                {/* Grades Data */}
                                <TabsContent value="grades" className="space-y-4 mt-4">
                                    <h4 className="font-semibold text-sm border-b pb-1 text-primary">Nilai Pengetahuan Umum Rapor (Skala 0 - 100)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                        <FormField control={form.control} name="semesterGrades.semester1" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Semester 1</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="semesterGrades.semester2" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Semester 2</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="semesterGrades.semester3" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Semester 3</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="semesterGrades.semester4" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Semester 4</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="semesterGrades.semester5" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Semester 5</FormLabel>
                                                <FormControl><Input type="number" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <div className="flex justify-between pt-6 border-t">
                                        <Button type="button" variant="outline" onClick={() => setActiveTab('parent')}>← Kembali</Button>
                                        <Button type="submit">Simpan & Daftarkan Siswa</Button>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* Account Info Dialog */}
            <Dialog open={isAccountInfoDialogOpen} onOpenChange={(open) => {
                setIsAccountInfoDialogOpen(open);
                if (!open && isNewApplicantSession) {
                    setIsAccountInfoDialogOpen(false);
                }
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <KeyRound className="h-6 w-6 text-primary" />
                            {accountInfoDialogTitle}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        {isNewApplicantSession && (
                            <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                                <div className="flex gap-2">
                                    <Info className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-amber-800 font-medium">
                                        Harap catat dan berikan detail login di bawah ini kepada siswa yang bersangkutan. Detail ini tidak akan ditampilkan kembali.
                                    </p>
                                </div>
                            </div>
                        )}
                        <div className="space-y-2 border rounded-lg p-4 bg-muted/40 font-mono text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Username / NISN:</span>
                                <span className="font-bold">{accountInfo.username}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Kata Sandi:</span>
                                <span className="font-bold text-primary">{accountInfo.password}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button">Tutup</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini akan menghapus data pendaftar kolektif luar daerah "{applicantToDelete?.fullName}" secara permanen, beserta dengan akses login akun mereka.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Ya, Hapus Data
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
