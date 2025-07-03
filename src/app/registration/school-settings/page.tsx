
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building, AlertCircle, Edit, PlusCircle, Trash2, Settings } from 'lucide-react';

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

    const form = useForm<MajorFormValues>({
        resolver: zodResolver(majorFormSchema),
        defaultValues: {
          name: '',
          berkasPendukung: '',
          quota: { afirmasi: 0, mutasi: 0, prestasi: 0, domisili: 0 }
        },
    });

    React.useEffect(() => {
        const credentials = getFromLocalStorage<LoginCredentials | null>("loginCredentials", null);
        if (credentials?.role !== 'headmaster' || !credentials.username) {
            toast({ variant: "destructive", title: "Akses Ditolak", description: "Hanya kepala sekolah yang dapat mengakses halaman ini." });
            router.replace('/registration/home');
            return;
        }

        const currentUser = getUsers().find(u => u.username === credentials.username);
        if (!currentUser || !currentUser.npsn) {
            toast({ variant: "destructive", title: "Sekolah Tidak Terhubung", description: "Akun Anda tidak terhubung dengan sekolah manapun." });
            setIsLoading(false);
            return;
        }

        const userSchool = getSchoolByNPSN(currentUser.npsn);
        if (userSchool) {
            setSchool(userSchool);
        }
        setIsLoading(false);
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
            totals.afirmasi += major.quota.afirmasi;
            totals.mutasi += major.quota.mutasi;
            totals.prestasi += major.quota.prestasi;
            totals.domisili += major.quota.domisili;
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
            totals.afirmasi += major.quota.afirmasi;
            totals.mutasi += major.quota.mutasi;
            totals.prestasi += major.quota.prestasi;
            totals.domisili += major.quota.domisili;
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
