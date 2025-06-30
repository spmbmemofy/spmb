
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { GraduationCap, MoreHorizontal, Edit, Trash2, PlusCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getJalur, addJalur, updateJalur, deleteJalur, type Jalur } from "@/lib/pathwayService";
import type { SchoolJenjang } from "@/lib/schoolService";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const pathwayFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Nama jalur minimal 3 karakter." }),
  tahapPendaftaran: z.coerce.number().int().min(1, { message: "Tahap pendaftaran harus minimal 1." }),
  startDate: z.string().min(1, { message: "Tanggal buka wajib diisi." }),
  endDate: z.string().min(1, { message: "Tanggal tutup wajib diisi." }),
  allowedJenjang: z.array(z.enum(["SMP", "SMA", "SMK"])).min(1, { message: "Pilih setidaknya satu jenjang." }),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: "Tanggal tutup harus setelah tanggal buka.",
    path: ["endDate"],
});


type PathwayFormValues = z.infer<typeof pathwayFormSchema>;
const jenjangOptions: SchoolJenjang[] = ["SMA", "SMK", "SMP"];

const toDateTimeLocal = (isoString: string | undefined): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        // Adjust for timezone offset to display correctly in local time
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    } catch {
        return '';
    }
};

export default function PathwayManagementPage() {
    const [pathways, setPathways] = React.useState<Jalur[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingPathway, setEditingPathway] = React.useState<Jalur | null>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [pathwayToDelete, setPathwayToDelete] = React.useState<Jalur | null>(null);
    const { toast } = useToast();

    const form = useForm<PathwayFormValues>({
        resolver: zodResolver(pathwayFormSchema),
        defaultValues: { name: '', tahapPendaftaran: 1, allowedJenjang: ["SMA", "SMK"], startDate: '', endDate: '' },
    });

    React.useEffect(() => {
        setPathways(getJalur());
    }, []);

    const handleOpenDialog = (pathway: Jalur | null = null) => {
        setEditingPathway(pathway);
        if (pathway) {
            form.reset({
                ...pathway,
                startDate: toDateTimeLocal(pathway.startDate),
                endDate: toDateTimeLocal(pathway.endDate),
            });
        } else {
            form.reset({
                id: undefined,
                name: '',
                tahapPendaftaran: 1,
                allowedJenjang: ["SMA", "SMK"],
                startDate: toDateTimeLocal(new Date().toISOString()),
                endDate: toDateTimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
            });
        }
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (pathway: Jalur) => {
        setPathwayToDelete(pathway);
        setIsAlertOpen(true);
    };

    const handleConfirmDelete = () => {
        if (pathwayToDelete) {
            deleteJalur(pathwayToDelete.id);
            setPathways(getJalur());
            toast({ title: "Jalur Dihapus", description: `Jalur "${pathwayToDelete.name}" telah berhasil dihapus.` });
        }
        setIsAlertOpen(false);
        setPathwayToDelete(null);
    };

    const processForm = (data: PathwayFormValues) => {
        try {
            const pathwayData = {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
            };

            if (editingPathway) {
                updateJalur({ ...pathwayData, id: editingPathway.id });
                toast({ title: "Jalur Diperbarui", description: `Jalur "${data.name}" telah diperbarui.` });
            } else {
                addJalur(pathwayData);
                toast({ title: "Jalur Ditambahkan", description: `Jalur "${data.name}" telah ditambahkan.` });
            }
            setPathways(getJalur());
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        }
    };

    return (
        <>
            <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
                <Card className="w-full max-w-7xl shadow-2xl">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
                                    <GraduationCap size={28} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl sm:text-3xl font-headline">Manajemen Jalur Penerimaan</CardTitle>
                                    <CardDescription className="text-md mt-1">
                                        Kelola jalur pendaftaran, jadwal, dan tahap pembukaannya.
                                    </CardDescription>
                                </div>
                            </div>
                            <Button onClick={() => handleOpenDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Jalur
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Jalur</TableHead>
                                        <TableHead className="text-center">Tahap</TableHead>
                                        <TableHead>Tanggal Buka</TableHead>
                                        <TableHead>Tanggal Tutup</TableHead>
                                        <TableHead>Jenjang</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pathways.length > 0 ? (
                                        pathways.map((pathway) => (
                                            <TableRow key={pathway.id}>
                                                <TableCell className="font-medium">{pathway.name}</TableCell>
                                                <TableCell className="text-center">{pathway.tahapPendaftaran}</TableCell>
                                                <TableCell>{new Date(pathway.startDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                                                <TableCell>{new Date(pathway.endDate).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
                                                <TableCell className="flex gap-1">
                                                    {pathway.allowedJenjang.map(j => <Badge key={j} variant="outline">{j}</Badge>)}
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
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(pathway)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDeleteClick(pathway)} className="text-destructive focus:text-destructive">
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
                                            <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                                Belum ada jalur pendaftaran yang ditambahkan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingPathway ? "Edit Jalur" : "Tambah Jalur Baru"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processForm)} className="space-y-6 py-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Jalur</FormLabel>
                                    <FormControl><Input {...field} placeholder="Contoh: Prestasi Akademik" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="tahapPendaftaran" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tahap Pendaftaran</FormLabel>
                                    <FormControl><Input type="number" {...field} placeholder="Contoh: 1" min="1" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="startDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tanggal & Waktu Buka</FormLabel>
                                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="endDate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tanggal & Waktu Tutup</FormLabel>
                                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField
                                control={form.control}
                                name="allowedJenjang"
                                render={() => (
                                    <FormItem>
                                    <FormLabel>Jenjang yang Diizinkan</FormLabel>
                                    <div className="flex gap-4 pt-2">
                                        {jenjangOptions.map((jenjang) => (
                                        <FormField
                                            key={jenjang}
                                            control={form.control}
                                            name="allowedJenjang"
                                            render={({ field }) => (
                                            <FormItem key={jenjang} className="flex flex-row items-center space-x-2 space-y-0">
                                                <FormControl>
                                                <Checkbox
                                                    checked={field.value?.includes(jenjang)}
                                                    onCheckedChange={(checked) => {
                                                    const currentValues = field.value || [];
                                                    return checked
                                                        ? field.onChange([...currentValues, jenjang])
                                                        : field.onChange(currentValues.filter(value => value !== jenjang));
                                                    }}
                                                />
                                                </FormControl>
                                                <FormLabel className="font-normal">{jenjang}</FormLabel>
                                            </FormItem>
                                            )}
                                        />
                                        ))}
                                    </div>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="pt-4">
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
                            Tindakan ini akan menghapus jalur "{pathwayToDelete?.name}" secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Ya, Hapus Jalur
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
