
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { getManagedSchools, addManagedSchool, updateManagedSchool, deleteManagedSchool } from "@/lib/schoolManagementService";
import { type ManagedSchool } from "@/lib/school-management-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const schoolFormSchema = z.object({
  npsn: z.string().min(8, { message: "NPSN harus memiliki minimal 8 karakter." }).max(8, { message: "NPSN tidak boleh lebih dari 8 karakter." }),
  namaSekolah: z.string().min(3, { message: "Nama sekolah minimal 3 karakter." }),
  jenjang: z.enum(["SMP", "SMA", "SMK"], { required_error: "Jenjang sekolah wajib dipilih."}),
  jenis: z.enum(["Negeri", "Swasta"], { required_error: "Jenis sekolah wajib dipilih."}),
  wilayah: z.string().optional().refine((val) => {
    if (!val) return true; // Allow empty or undefined
    const num = Number(val);
    return !isNaN(num) && num >= 1 && num <= 10 && Number.isInteger(num);
  }, {
    message: "Wilayah harus berupa angka bulat antara 1 dan 10.",
  }),
});

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export default function SchoolManagementPage() {
    const [schools, setSchools] = React.useState<ManagedSchool[]>([]);
    const [smpSearchTerm, setSmpSearchTerm] = React.useState("");
    const [smaSmkSearchTerm, setSmaSmkSearchTerm] = React.useState("");
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingSchool, setEditingSchool] = React.useState<ManagedSchool | null>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [schoolToDeleteNPSN, setSchoolToDeleteNPSN] = React.useState<string | null>(null);
    const { toast } = useToast();

    const form = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolFormSchema),
        defaultValues: { npsn: '', namaSekolah: '', jenjang: 'SMA', jenis: 'Negeri', wilayah: '' },
    });

    const selectedJenjang = form.watch("jenjang");

    React.useEffect(() => {
        setSchools(getManagedSchools());
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

    const handleOpenDialog = (school: ManagedSchool | null = null) => {
        setEditingSchool(school);
        if (school) {
            form.reset(school);
        } else {
            form.reset({ npsn: '', namaSekolah: '', jenjang: 'SMA', jenis: 'Negeri', wilayah: '' });
        }
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (npsn: string) => {
        setSchoolToDeleteNPSN(npsn);
        setIsAlertOpen(true);
    };

    const handleConfirmDelete = () => {
        if (schoolToDeleteNPSN) {
            deleteManagedSchool(schoolToDeleteNPSN);
            setSchools(getManagedSchools());
            toast({ title: "Sekolah Dihapus", description: "Data sekolah telah berhasil dihapus dari sistem." });
        }
        setIsAlertOpen(false);
        setSchoolToDeleteNPSN(null);
    };

    const processForm = (data: SchoolFormValues) => {
        try {
            if (editingSchool) {
                updateManagedSchool(data);
                toast({ title: "Sekolah Diperbarui", description: `Data untuk ${data.namaSekolah} telah diperbarui.` });
            } else {
                addManagedSchool(data);
                toast({ title: "Sekolah Ditambahkan", description: `${data.namaSekolah} telah ditambahkan ke sistem.` });
            }
            setSchools(getManagedSchools());
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        }
    };

    const renderSchoolTable = (schoolList: ManagedSchool[], type: 'smp' | 'sma_smk') => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>NPSN</TableHead>
                        <TableHead>Nama Sekolah</TableHead>
                        {type === 'sma_smk' && <TableHead>Wilayah</TableHead>}
                        <TableHead>Jenjang</TableHead>
                        <TableHead>Jenis</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {schoolList.length > 0 ? (
                        schoolList.map((school) => (
                            <TableRow key={school.npsn}>
                                <TableCell className="font-mono">{school.npsn}</TableCell>
                                <TableCell className="font-medium">{school.namaSekolah}</TableCell>
                                {type === 'sma_smk' && <TableCell>{school.wilayah || '-'}</TableCell>}
                                <TableCell>
                                    <Badge variant={school.jenjang === 'SMA' || school.jenjang === 'SMK' ? 'default' : 'secondary'}>
                                        {school.jenjang}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline">{school.jenis}</Badge>
                                </TableCell>
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
                                            <DropdownMenuItem onClick={() => handleDeleteClick(school.npsn)} className="text-destructive focus:text-destructive">
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
                            <TableCell colSpan={type === 'sma_smk' ? 6 : 5} className="h-24 text-center text-muted-foreground">
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
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingSchool ? "Edit Sekolah" : "Tambah Sekolah Baru"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processForm)} className="space-y-4 py-4">
                            <FormField control={form.control} name="npsn" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>NPSN</FormLabel>
                                    <FormControl><Input {...field} disabled={!!editingSchool} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="namaSekolah" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Sekolah</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="jenjang" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jenjang</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="SMP">SMP</SelectItem>
                                            <SelectItem value="SMA">SMA</SelectItem>
                                            <SelectItem value="SMK">SMK</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="jenis" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jenis Sekolah</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Negeri">Negeri</SelectItem>
                                            <SelectItem value="Swasta">Swasta</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            {(selectedJenjang === 'SMA' || selectedJenjang === 'SMK') && (
                                <FormField control={form.control} name="wilayah" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Wilayah</FormLabel>
                                        <FormControl><Input {...field} placeholder="Contoh: 1" /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button type="button" variant="secondary">Batal</Button>
                                </DialogClose>
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
