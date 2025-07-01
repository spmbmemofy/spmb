
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Building, MoreHorizontal, Edit, Trash2, Search as SearchIcon, PlusCircle } from 'lucide-react';

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
import { getSchools, addSchool, updateSchool, deleteSchool, type School, type SchoolJenjang } from "@/lib/schoolService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import type { Major } from "@/lib/types";
import { getStages, type Tahap } from "@/lib/stageService";
import { getDistricts, getSubdistricts } from "@/lib/addressData";

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
  
  tahapId: z.string().optional(),
  kuota: z.coerce.number().int().min(0).optional(),
  jalurKuota: z.object({
    afirmasi: z.coerce.number().int().min(0).optional(),
    mutasi: z.coerce.number().int().min(0).optional(),
    prestasi: z.coerce.number().int().min(0).optional(),
    domisili: z.coerce.number().int().min(0).optional(),
  }).optional(),
  majors: z.array(z.any()).optional(), // Keep majors flexible for internal state
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

export default function SchoolManagementPage() {
    const [schools, setSchools] = React.useState<School[]>([]);
    const [stages, setStages] = React.useState<Tahap[]>([]);
    const [smpSearchTerm, setSmpSearchTerm] = React.useState("");
    const [smaSmkSearchTerm, setSmaSmkSearchTerm] = React.useState("");
    
    // School Dialog State
    const [isSchoolDialogOpen, setIsSchoolDialogOpen] = React.useState(false);
    const [editingSchool, setEditingSchool] = React.useState<School | null>(null);
    const [schoolToDeleteId, setSchoolToDeleteId] = React.useState<string | null>(null);
    const [activeDialogTab, setActiveDialogTab] = React.useState("info_umum");
    
    // Major Dialog State (within school dialog)
    const [isMajorDialogOpen, setIsMajorDialogOpen] = React.useState(false);
    const [editingMajor, setEditingMajor] = React.useState<Major | null>(null);
    const [majorToDelete, setMajorToDelete] = React.useState<Major | null>(null);
    
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [isMajorAlertOpen, setIsMajorAlertOpen] = React.useState(false);

    const { toast } = useToast();

    const schoolForm = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolFormSchema),
        defaultValues: {},
    });

     const majorForm = useForm<MajorFormValues>({
        resolver: zodResolver(majorFormSchema),
        defaultValues: {
            name: '',
            berkasPendukung: '',
            quota: { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 }
        },
    });

    const selectedJenjang = schoolForm.watch("jenjang");
    const jalurKuotaValues = schoolForm.watch("jalurKuota");
    const currentMajors = schoolForm.watch("majors") as Major[] || [];
    
    const selectedProvince = schoolForm.watch("province");
    const selectedDistrict = schoolForm.watch("district");
    
    const districtOptions = getDistricts(selectedProvince as any);
    const subdistrictOptions = getSubdistricts(selectedProvince as any, selectedDistrict as any);

    React.useEffect(() => {
        setSchools(getSchools());
        setStages(getStages());
    }, []);

    React.useEffect(() => {
        if (selectedJenjang === 'SMA' && jalurKuotaValues) {
            const totalKuota = Object.values(jalurKuotaValues).reduce((sum, val) => sum + (val || 0), 0);
            schoolForm.setValue('kuota', totalKuota, { shouldValidate: true });
        }
    }, [jalurKuotaValues, selectedJenjang, schoolForm]);

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
        setActiveDialogTab('info_umum');
        setEditingSchool(school);
        if (school) {
            schoolForm.reset({
                ...school,
                jalurKuota: school.jalurKuota || { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 }
            });
        } else {
            schoolForm.reset({
                id: '', npsn: '', namaSekolah: '', jenjang: 'SMA', jenis: 'Negeri',
                alamat: '', kecamatan: '', telepon: '', akreditasi: 'A',
                province: 'Kalimantan Timur', district: 'Kabupaten Berau',
                tahapId: undefined,
                kuota: 0, jalurKuota: { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 }, majors: []
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
            deleteSchool(schoolToDeleteId);
            setSchools(getSchools());
            toast({ title: "Sekolah Dihapus", description: "Data sekolah telah berhasil dihapus dari sistem." });
        }
        setIsAlertOpen(false);
        setSchoolToDeleteId(null);
    };

    const processSchoolForm = (data: SchoolFormValues) => {
        try {
            const finalData = { ...data };
            if (data.jenjang === 'SMA' && data.jalurKuota) {
                finalData.kuota = Object.values(data.jalurKuota).reduce((sum, val) => sum + (val || 0), 0);
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
                setSchools(getSchools());
                setIsSchoolDialogOpen(false);
            } else {
                const { id, ...newSchoolData } = finalData;
                const newlyAddedSchool = addSchool(newSchoolData as Omit<School, 'id'>);
                
                toast({ title: "Informasi Umum Disimpan", description: `Lanjutkan mengisi data pendaftaran untuk ${data.namaSekolah}.` });

                setSchools(getSchools());
                setEditingSchool(newlyAddedSchool);
                setActiveDialogTab('data_pendaftaran');
            }
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        }
    };

    // Major Management Handlers
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


    const renderSchoolTable = (schoolList: School[], type: 'smp' | 'sma_smk') => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
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
                            <TableRow key={school.npsn}>
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
                            <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                Tidak ada sekolah yang cocok dengan kriteria.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );

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
                            <Button onClick={() => handleOpenSchoolDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Sekolah
                            </Button>
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
                            <Tabs 
                                defaultValue="info_umum" 
                                className="w-full"
                                value={activeDialogTab}
                                onValueChange={(value) => setActiveDialogTab(value as "info_umum" | "data_pendaftaran")}
                            >
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info_umum">Informasi Umum</TabsTrigger>
                                    <TabsTrigger value="data_pendaftaran" disabled={selectedJenjang === 'SMP'}>
                                        Data Pendaftaran (SMA/SMK)
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
                                    {selectedJenjang !== 'SMP' && (
                                        <FormField
                                            control={schoolForm.control}
                                            name="tahapId"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Tahap Pendaftaran</FormLabel>
                                                    <Select onValueChange={field.onChange} value={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Pilih tahap pendaftaran untuk sekolah ini" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {stages.map(stage => (
                                                                <SelectItem key={stage.id} value={stage.id}>
                                                                    {stage.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormDescription>
                                                        Tahap di mana sekolah ini akan membuka pendaftaran.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    )}

                                     {selectedJenjang === 'SMA' && (
                                        <>
                                            <FormField control={schoolForm.control} name="kuota" render={({ field }) => ( <FormItem><FormLabel>Total Kuota (SMA)</FormLabel><FormControl><Input type="number" {...field} disabled /></FormControl><FormDescription>Total kuota dihitung otomatis dari jumlah kuota per jalur.</FormDescription><FormMessage /></FormItem> )} />
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
                            </Tabs>
                            <DialogFooter className="pt-4">
                                <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                                <Button type="submit">
                                    {editingSchool ? "Simpan Perubahan" : "Simpan"}
                                </Button>
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
        </>
    );
}
