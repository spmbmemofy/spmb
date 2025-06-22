
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
import { Building, MoreHorizontal, Edit, Trash2, Search as SearchIcon, PlusCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getSchools, addSchool, updateSchool, deleteSchool, type School, type SchoolJenjang } from "@/lib/schoolService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const schoolFormSchema = z.object({
  id: z.string(),
  npsn: z.string().length(8, { message: "NPSN harus memiliki 8 karakter." }),
  namaSekolah: z.string().min(3, { message: "Nama sekolah minimal 3 karakter." }),
  jenjang: z.enum(["SMP", "SMA", "SMK"]),
  jenis: z.enum(["Negeri", "Swasta"]),
  alamat: z.string().min(10, { message: "Alamat lengkap minimal 10 karakter." }),
  kecamatan: z.string().min(3, { message: "Kecamatan minimal 3 karakter." }),
  telepon: z.string().min(9, { message: "Nomor telepon minimal 9 karakter." }),
  akreditasi: z.enum(["A", "B", "C", "Belum Terakreditasi"]),
  
  wilayah: z.string().optional(),
  kuota: z.coerce.number().int().min(0).optional(),
  jalurKuota: z.object({
    afirmasi: z.coerce.number().int().min(0).optional(),
    mutasi: z.coerce.number().int().min(0).optional(),
    prestasi: z.coerce.number().int().min(0).optional(),
    domisili: z.coerce.number().int().min(0).optional(),
  }).optional(),
  majors: z.string().optional(),
  statusPendaftaran: z.enum(["Buka", "Tutup", "Segera Penuh"]).optional(),
  tahapPendaftaran: z.coerce.number().int().min(1).optional(),
}).refine(data => {
    if (data.jenjang === 'SMA' || data.jenjang === 'SMK') {
        const totalKuota = data.kuota ?? 0;
        const jalur = data.jalurKuota;
        if (!jalur) return false;
        const totalJalur = (jalur.afirmasi ?? 0) + (jalur.mutasi ?? 0) + (jalur.prestasi ?? 0) + (jalur.domisili ?? 0);
        return totalJalur === totalKuota;
    }
    return true;
}, {
    message: "Jumlah kuota per jalur harus sama dengan Total Kuota Keseluruhan.",
    path: ["jalurKuota.afirmasi"],
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export default function SchoolManagementPage() {
    const [schools, setSchools] = React.useState<School[]>([]);
    const [smpSearchTerm, setSmpSearchTerm] = React.useState("");
    const [smaSmkSearchTerm, setSmaSmkSearchTerm] = React.useState("");
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingSchool, setEditingSchool] = React.useState<School | null>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [schoolToDeleteId, setSchoolToDeleteId] = React.useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolFormSchema),
        defaultValues: {},
    });

    const selectedJenjang = form.watch("jenjang");

    React.useEffect(() => {
        setSchools(getSchools());
    }, []);

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

    const handleOpenDialog = (school: School | null = null) => {
        setEditingSchool(school);
        if (school) {
            form.reset({
                ...school,
                majors: school.majors ? school.majors.join('\n') : '',
            });
        } else {
            form.reset({
                id: '', npsn: '', namaSekolah: '', jenjang: 'SMA', jenis: 'Negeri',
                alamat: '', kecamatan: '', telepon: '', akreditasi: 'A',
                wilayah: '', kuota: 0, jalurKuota: { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 },
                majors: '', statusPendaftaran: 'Buka', tahapPendaftaran: 1,
            });
        }
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (schoolId: string) => {
        setSchoolToDeleteId(schoolId);
        setIsAlertOpen(true);
    };

    const handleConfirmDelete = () => {
        if (schoolToDeleteId) {
            deleteSchool(schoolToDeleteId);
            setSchools(getSchools());
            toast({ title: "Sekolah Dihapus", description: "Data sekolah telah berhasil dihapus dari sistem." });
        }
        setIsAlertOpen(false);
        setSchoolToDeleteId(null);
    };

    const processForm = (data: SchoolFormValues) => {
        try {
            const schoolData = {
                ...data,
                majors: data.majors ? data.majors.split('\n').filter(m => m.trim() !== '') : [],
            };

            if (editingSchool) {
                updateSchool(schoolData as School);
                toast({ title: "Sekolah Diperbarui", description: `Data untuk ${data.namaSekolah} telah diperbarui.` });
            } else {
                const { id, ...newSchoolData } = schoolData;
                addSchool(newSchoolData as Omit<School, 'id'>);
                toast({ title: "Sekolah Ditambahkan", description: `${data.namaSekolah} telah ditambahkan ke sistem.` });
            }
            setSchools(getSchools());
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        }
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
                                            <DropdownMenuItem onClick={() => handleOpenDialog(school)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                <span>Edit</span>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteClick(school.id)} className="text-destructive focus:text-destructive">
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
                            <Button onClick={() => handleOpenDialog()}>
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingSchool ? "Edit Sekolah" : "Tambah Sekolah Baru"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processForm)} className="space-y-6 py-4">
                            <Tabs defaultValue="info_umum" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info_umum">Informasi Umum</TabsTrigger>
                                    <TabsTrigger value="data_pendaftaran" disabled={selectedJenjang === 'SMP'}>
                                        Data Pendaftaran (SMA/SMK)
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="info_umum" className="pt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="npsn" render={({ field }) => ( <FormItem><FormLabel>NPSN</FormLabel><FormControl><Input {...field} disabled={!!editingSchool} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="namaSekolah" render={({ field }) => ( <FormItem><FormLabel>Nama Sekolah</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="jenjang" render={({ field }) => ( <FormItem><FormLabel>Jenjang</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="SMP">SMP</SelectItem><SelectItem value="SMA">SMA</SelectItem><SelectItem value="SMK">SMK</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="jenis" render={({ field }) => ( <FormItem><FormLabel>Jenis Sekolah</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Negeri">Negeri</SelectItem><SelectItem value="Swasta">Swasta</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="akreditasi" render={({ field }) => ( <FormItem><FormLabel>Akreditasi</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem><SelectItem value="Belum Terakreditasi">Belum Terakreditasi</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="telepon" render={({ field }) => ( <FormItem><FormLabel>Telepon</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                    <FormField control={form.control} name="alamat" render={({ field }) => ( <FormItem><FormLabel>Alamat</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    <FormField control={form.control} name="kecamatan" render={({ field }) => ( <FormItem><FormLabel>Kecamatan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                </TabsContent>
                                <TabsContent value="data_pendaftaran" className="pt-4 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField control={form.control} name="wilayah" render={({ field }) => ( <FormItem><FormLabel>Wilayah (1-10)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="tahapPendaftaran" render={({ field }) => ( <FormItem><FormLabel>Tahap Pendaftaran</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="statusPendaftaran" render={({ field }) => ( <FormItem><FormLabel>Status Pendaftaran</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Buka">Buka</SelectItem><SelectItem value="Tutup">Tutup</SelectItem><SelectItem value="Segera Penuh">Segera Penuh</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                    </div>
                                     <div>
                                        <FormField control={form.control} name="kuota" render={({ field }) => ( <FormItem><FormLabel>Total Kuota Keseluruhan</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                    </div>
                                    <Card>
                                        <CardHeader><CardTitle className="text-base">Pembagian Kuota per Jalur</CardTitle><CardDescription>Total kuota jalur harus sama dengan kuota keseluruhan.</CardDescription></CardHeader>
                                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <FormField control={form.control} name="jalurKuota.afirmasi" render={({ field }) => ( <FormItem><FormLabel>Afirmasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                            <FormField control={form.control} name="jalurKuota.mutasi" render={({ field }) => ( <FormItem><FormLabel>Mutasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                            <FormField control={form.control} name="jalurKuota.prestasi" render={({ field }) => ( <FormItem><FormLabel>Prestasi</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                            <FormField control={form.control} name="jalurKuota.domisili" render={({ field }) => ( <FormItem><FormLabel>Domisili</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem> )} />
                                        </CardContent>
                                        <FormMessage className="px-6 pb-4">{form.formState.errors.jalurKuota?.afirmasi?.message}</FormMessage>
                                    </Card>

                                    {selectedJenjang === 'SMK' && (
                                        <FormField control={form.control} name="majors" render={({ field }) => ( <FormItem><FormLabel>Jurusan</FormLabel><CardDescription>Masukkan satu jurusan per baris.</CardDescription><FormControl><Textarea {...field} rows={5} /></FormControl><FormMessage /></FormItem> )} />
                                    )}
                                </TabsContent>
                            </Tabs>
                            <DialogFooter>
                                <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                                <Button type="submit">Simpan</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

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
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Ya, Hapus Sekolah
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
