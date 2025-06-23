
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building, AlertCircle, Edit } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getSchoolByNPSN, updateSchool, type School } from "@/lib/schoolService";
import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { getUsers } from "@/lib/userService";
import { schoolFormSchema } from "@/app/registration/school-management/page";
import { Badge } from "@/components/ui/badge";

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export default function SchoolSettingsPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);
    const [school, setSchool] = React.useState<School | null>(null);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const form = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolFormSchema),
        defaultValues: {},
    });

    const selectedJenjang = form.watch("jenjang");

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

    const handleOpenDialog = () => {
        if (school) {
            form.reset({
                ...school,
                majors: school.majors ? school.majors.join('\n') : '',
            });
            setIsDialogOpen(true);
        }
    };

    const processForm = (data: SchoolFormValues) => {
        if (!school) return;
        try {
            const schoolData = {
                ...data,
                majors: data.majors ? data.majors.split('\n').filter(m => m.trim() !== '') : [],
            };
            const updatedSchool = updateSchool(schoolData as School);
            toast({ title: "Sekolah Diperbarui", description: `Data untuk ${data.namaSekolah} telah diperbarui.` });
            setSchool(updatedSchool || null);
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
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
                <Card className="w-full max-w-4xl shadow-2xl">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                            <Button onClick={handleOpenDialog}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Data Sekolah
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <section>
                            <h3 className="text-lg font-semibold mb-3 text-primary">Informasi Umum</h3>
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
                        {(school.jenjang === 'SMA' || school.jenjang === 'SMK') && (
                            <section>
                                <h3 className="text-lg font-semibold mb-3 text-primary">Data Pendaftaran</h3>
                                <div className="space-y-2 rounded-md border p-4 text-sm">
                                    <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Total Kuota</span><span>{school.kuota ?? '-'}</span></div>
                                    <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Status Pendaftaran</span><Badge variant={school.statusPendaftaran === "Buka" ? "default" : "secondary"}>{school.statusPendaftaran ?? '-'}</Badge></div>
                                    <h4 className="font-medium pt-3">Kuota per Jalur:</h4>
                                    <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                        <li><span className="font-semibold text-foreground">{school.jalurKuota?.afirmasi ?? 0}</span> Afirmasi</li>
                                        <li><span className="font-semibold text-foreground">{school.jalurKuota?.mutasi ?? 0}</span> Mutasi</li>
                                        <li><span className="font-semibold text-foreground">{school.jalurKuota?.prestasi ?? 0}</span> Prestasi</li>
                                        <li><span className="font-semibold text-foreground">{school.jalurKuota?.domisili ?? 0}</span> Domisili</li>
                                    </ul>
                                    {school.jenjang === 'SMK' && school.majors && school.majors.length > 0 && (
                                        <>
                                        <h4 className="font-medium pt-3">Jurusan:</h4>
                                        <ul className="list-disc list-inside pl-2 text-muted-foreground">
                                            {school.majors.map(major => <li key={major}>{major}</li>)}
                                        </ul>
                                        </>
                                    )}
                                </div>
                            </section>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Data {school.namaSekolah}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processForm)} className="space-y-6 py-4">
                            <Tabs defaultValue="info_umum" className="w-full">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="info_umum">Informasi Umum</TabsTrigger>
                                    <TabsTrigger value="data_pendaftaran" disabled={school.jenjang === 'SMP'}>
                                        Data Pendaftaran
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent value="info_umum" className="pt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="npsn" render={({ field }) => ( <FormItem><FormLabel>NPSN</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="namaSekolah" render={({ field }) => ( <FormItem><FormLabel>Nama Sekolah</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                        <FormField control={form.control} name="jenjang" render={({ field }) => ( <FormItem><FormLabel>Jenjang</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="SMA">SMA</SelectItem><SelectItem value="SMK">SMK</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
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
                                <Button type="submit">Simpan Perubahan</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
