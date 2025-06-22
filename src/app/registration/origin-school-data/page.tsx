
"use client";

import * as React from "react";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building, Users, AlertCircle, Edit } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";
import { getApplicants } from "@/lib/applicantService";
import { getSchoolByNPSN, getSchoolById, updateSchool, type School } from "@/lib/schoolService";
import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import type { Applicant, ApplicantStatus } from "@/lib/types";
import { getUsers } from "@/lib/userService";
import { schoolFormSchema } from "@/app/registration/school-management/page";


const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";

const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
        case "Terverifikasi": return "default";
        case "Menunggu Verifikasi": return "secondary";
        case "Berkas tidak sesuai": return "destructive";
        default: return "secondary";
    }
};

type SchoolFormValues = z.infer<typeof schoolFormSchema>;

export default function OriginSchoolDataPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = React.useState(true);
    const [school, setSchool] = React.useState<School | null>(null);
    const [applicants, setApplicants] = React.useState<Applicant[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const form = useForm<SchoolFormValues>({
        resolver: zodResolver(schoolFormSchema),
        defaultValues: {},
    });

    React.useEffect(() => {
        const credentials = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
        if (!credentials || credentials.role !== 'smp_operator' || !credentials.username) {
            toast({ variant: "destructive", title: "Akses Ditolak", description: "Anda tidak memiliki izin untuk mengakses halaman ini." });
            router.replace('/registration/home');
            return;
        }

        const allUsers = getUsers();
        const currentUser = allUsers.find(u => u.username === credentials.username);
        
        if (!currentUser || !currentUser.npsn) {
            toast({ variant: "destructive", title: "Data Tidak Lengkap", description: "Akun Anda tidak terhubung dengan sekolah manapun." });
            setIsLoading(false);
            return;
        }

        const userSchool = getSchoolByNPSN(currentUser.npsn);
        
        if (userSchool) {
            setSchool(userSchool);
            form.reset({
                ...userSchool,
                majors: userSchool.majors ? userSchool.majors.join('\n') : '',
            });
        }

        const allApplicants = getApplicants();
        const schoolApplicants = allApplicants.filter(app => app.asalSekolahId === userSchool?.id);
        setApplicants(schoolApplicants);
        setIsLoading(false);
    }, [router, toast, form]);

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

            updateSchool(schoolData as School);
            toast({ title: "Sekolah Diperbarui", description: `Data untuk ${data.namaSekolah} telah diperbarui.` });
            
            const updatedSchool = getSchoolById(school.id);
            setSchool(updatedSchool || null);

            setIsDialogOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        }
    };


    if (isLoading) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center p-4">
                <p>Memuat data sekolah Anda...</p>
            </div>
        );
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
                            <CardTitle className="text-2xl sm:text-3xl font-headline">{school.namaSekolah}</CardTitle>
                            <CardDescription className="text-md mt-1">
                                Berikut adalah data lengkap sekolah Anda dan daftar siswa pendaftar.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8">
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-primary">Profil Sekolah</h3>
                            <Button variant="outline" size="sm" onClick={handleOpenDialog}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit Data Sekolah
                            </Button>
                        </div>
                        <div className="space-y-2 rounded-md border p-4">
                             <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">NPSN</span><span>{school.npsn}</span></div>
                             <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Jenis</span><span>{school.jenis}</span></div>
                             <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Akreditasi</span><span>{school.akreditasi}</span></div>
                             <div className="flex justify-between py-1"><span className="font-medium text-muted-foreground">Alamat</span><span>{school.alamat}</span></div>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-semibold mb-4 text-primary">Siswa Pendaftar dari {school.namaSekolah}</h3>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Lengkap</TableHead>
                                        <TableHead>NISN</TableHead>
                                        <TableHead>Sekolah Tujuan</TableHead>
                                        <TableHead>Jalur</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {applicants.length > 0 ? (
                                        applicants.map(applicant => (
                                            <TableRow key={applicant.id}>
                                                <TableCell className="font-medium">{applicant.fullName}</TableCell>
                                                <TableCell>{applicant.nisn}</TableCell>
                                                <TableCell>{applicant.sekolahTujuanNama}</TableCell>
                                                <TableCell>{applicant.jalur}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant={getStatusBadgeVariant(applicant.statusVerifikasi)}>
                                                        {applicant.statusVerifikasi}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                Belum ada siswa dari sekolah Anda yang mendaftar.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </section>
                </CardContent>
            </Card>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Edit Data Sekolah</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(processForm)} className="space-y-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="npsn" render={({ field }) => ( <FormItem><FormLabel>NPSN</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="namaSekolah" render={({ field }) => ( <FormItem><FormLabel>Nama Sekolah</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="jenjang" render={({ field }) => ( <FormItem><FormLabel>Jenjang</FormLabel><Select onValueChange={field.onChange} value={field.value} disabled><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="SMP">SMP</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="jenis" render={({ field }) => ( <FormItem><FormLabel>Jenis Sekolah</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="Negeri">Negeri</SelectItem><SelectItem value="Swasta">Swasta</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="akreditasi" render={({ field }) => ( <FormItem><FormLabel>Akreditasi</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="A">A</SelectItem><SelectItem value="B">B</SelectItem><SelectItem value="C">C</SelectItem><SelectItem value="Belum Terakreditasi">Belum Terakreditasi</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                            <FormField control={form.control} name="telepon" render={({ field }) => ( <FormItem><FormLabel>Telepon</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                        <FormField control={form.control} name="alamat" render={({ field }) => ( <FormItem><FormLabel>Alamat</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="kecamatan" render={({ field }) => ( <FormItem><FormLabel>Kecamatan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                        
                        <DialogFooter className="pt-4">
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
