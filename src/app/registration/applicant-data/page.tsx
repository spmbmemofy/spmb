
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import * as xlsx from "xlsx";
import { Users, MoreHorizontal, Edit, Trash2, PlusCircle, Upload } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { getSchoolByNPSN, type School } from "@/lib/schoolService";
import { getUsers } from "@/lib/userService";
import { getManagedApplicants, addManagedApplicant, updateManagedApplicant, deleteManagedApplicant } from "@/lib/managedApplicantService";
import type { ManagedApplicant, ExcelRow } from "@/lib/types";

const applicantFormSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  nisn: z.string().length(10, { message: "NISN harus 10 digit." }),
  gender: z.enum(["Laki-laki", "Perempuan"], { required_error: "Jenis kelamin harus dipilih." }),
  semesterGrades: z.object({
    semester1: z.coerce.number().min(0).max(100),
    semester2: z.coerce.number().min(0).max(100),
    semester3: z.coerce.number().min(0).max(100),
    semester4: z.coerce.number().min(0).max(100),
    semester5: z.coerce.number().min(0).max(100),
  })
});

type ApplicantFormValues = z.infer<typeof applicantFormSchema>;

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

    const form = useForm<ApplicantFormValues>({
        resolver: zodResolver(applicantFormSchema),
        defaultValues: { semesterGrades: { semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 0 } },
    });

    React.useEffect(() => {
        const credentials = getFromLocalStorage<LoginCredentials | null>("loginCredentials", null);
        if (!credentials || credentials.role !== 'smp_operator' || !credentials.username) {
            toast({ variant: "destructive", title: "Akses Ditolak" });
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
        if (school) {
            setOperatorSchool(school);
            const schoolApplicants = getManagedApplicants().filter(a => a.asalSekolahId === school.id);
            setApplicants(schoolApplicants);
        }
        setIsLoading(false);
    }, [router, toast]);

    const handleOpenDialog = (applicant: ManagedApplicant | null = null) => {
        setEditingApplicant(applicant);
        if (applicant) {
            form.reset(applicant);
        } else {
            form.reset({ fullName: '', nisn: '', gender: 'Laki-laki', semesterGrades: { semester1: 0, semester2: 0, semester3: 0, semester4: 0, semester5: 0 } });
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
            setApplicants(prev => prev.filter(a => a.id !== applicantToDelete.id));
            toast({ title: "Pendaftar Dihapus", description: `Data untuk ${applicantToDelete.fullName} telah dihapus.` });
        }
        setIsAlertOpen(false);
        setApplicantToDelete(null);
    };

    const processForm = (data: ApplicantFormValues) => {
        if (!operatorSchool) return;
        try {
            const applicantData = { ...data, asalSekolahId: operatorSchool.id };
            if (editingApplicant) {
                const updated = updateManagedApplicant({ ...applicantData, id: editingApplicant.id });
                if (updated) setApplicants(prev => prev.map(a => a.id === updated.id ? updated : a));
                toast({ title: "Data Diperbarui" });
            } else {
                const added = addManagedApplicant(applicantData);
                setApplicants(prev => [...prev, added]);
                toast({ title: "Pendaftar Ditambahkan" });
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        }
    };
    
    const calculateAverage = (grades: ManagedApplicant['semesterGrades']) => {
        const values = Object.values(grades);
        const sum = values.reduce((acc, val) => acc + val, 0);
        return (sum / values.length).toFixed(2);
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !operatorSchool) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = e.target?.result;
                const workbook = xlsx.read(data, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json: ExcelRow[] = xlsx.utils.sheet_to_json(worksheet);

                let successCount = 0;
                let errorCount = 0;
                const errors: string[] = [];

                json.forEach((row, index) => {
                    try {
                        const newApplicant: Omit<ManagedApplicant, 'id'> = {
                            fullName: row["Nama Lengkap"],
                            nisn: String(row["NISN"]),
                            gender: row["Jenis Kelamin"],
                            asalSekolahId: operatorSchool.id,
                            semesterGrades: {
                                semester1: row["Nilai Semester 1"],
                                semester2: row["Nilai Semester 2"],
                                semester3: row["Nilai Semester 3"],
                                semester4: row["Nilai Semester 4"],
                                semester5: row["Nilai Semester 5"],
                            }
                        };
                        addManagedApplicant(newApplicant);
                        successCount++;
                    } catch (e: any) {
                        errorCount++;
                        errors.push(`Baris ${index + 2}: ${e.message}`);
                    }
                });

                setApplicants(getManagedApplicants().filter(a => a.asalSekolahId === operatorSchool.id));
                toast({
                    title: "Import Selesai",
                    description: `${successCount} data berhasil diimpor, ${errorCount} data gagal. ${errors.slice(0, 2).join(', ')}`,
                });

            } catch (e) {
                toast({ variant: "destructive", title: "Gagal Membaca File", description: "Pastikan format file Excel sudah benar." });
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
                            <div className="flex gap-2">
                                <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".xlsx, .xls" className="hidden"/>
                                <Button onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Import Excel
                                </Button>
                                <Button onClick={() => handleOpenDialog()}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Tambah Pendaftar
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
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applicants.length > 0 ? (
                                        applicants.map(applicant => (
                                            <TableRow key={applicant.id}>
                                                <TableCell className="font-medium">{applicant.fullName}</TableCell>
                                                <TableCell>{applicant.nisn}</TableCell>
                                                <TableCell>{applicant.gender}</TableCell>
                                                <TableCell>{calculateAverage(applicant.semesterGrades)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(applicant)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDeleteClick(applicant)} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Hapus</DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center">Belum ada data pendaftar.</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{editingApplicant ? "Edit Pendaftar" : "Tambah Pendaftar Baru"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processForm)} className="space-y-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField control={form.control} name="fullName" render={({ field }) => ( <FormItem><FormLabel>Nama Lengkap</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField control={form.control} name="nisn" render={({ field }) => ( <FormItem><FormLabel>NISN</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </div>
                            <FormField control={form.control} name="gender" render={({ field }) => ( <FormItem><FormLabel>Jenis Kelamin</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Laki-laki">Laki-laki</SelectItem><SelectItem value="Perempuan">Perempuan</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
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
                        <AlertDialogDescription>Tindakan ini akan menghapus data pendaftar secara permanen.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">Ya, Hapus</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
