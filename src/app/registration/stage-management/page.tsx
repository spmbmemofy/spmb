
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Layers, MoreHorizontal, Edit, Trash2, PlusCircle } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getStages, addStage, updateStage, deleteStage, type Tahap } from "@/lib/stageService";

const stageFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Nama tahap minimal 3 karakter." }),
  startDate: z.string().min(1, { message: "Tanggal buka wajib diisi." }),
  endDate: z.string().min(1, { message: "Tanggal tutup wajib diisi." }),
}).refine(data => new Date(data.endDate) > new Date(data.startDate), {
    message: "Tanggal tutup harus setelah tanggal buka.",
    path: ["endDate"],
});


type StageFormValues = z.infer<typeof stageFormSchema>;

const toDateTimeLocal = (isoString: string | undefined): string => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        const timezoneOffset = date.getTimezoneOffset() * 60000;
        const localDate = new Date(date.getTime() - timezoneOffset);
        return localDate.toISOString().slice(0, 16);
    } catch {
        return '';
    }
};

export default function StageManagementPage() {
    const [stages, setStages] = React.useState<Tahap[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingStage, setEditingStage] = React.useState<Tahap | null>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [stageToDelete, setStageToDelete] = React.useState<Tahap | null>(null);
    const { toast } = useToast();

    const form = useForm<StageFormValues>({
        resolver: zodResolver(stageFormSchema),
        defaultValues: { name: '', startDate: '', endDate: '' },
    });

    React.useEffect(() => {
        setStages(getStages());
    }, []);

    const handleOpenDialog = (stage: Tahap | null = null) => {
        setEditingStage(stage);
        if (stage) {
            form.reset({
                ...stage,
                startDate: toDateTimeLocal(stage.startDate),
                endDate: toDateTimeLocal(stage.endDate),
            });
        } else {
            form.reset({
                id: undefined,
                name: '',
                startDate: toDateTimeLocal(new Date().toISOString()),
                endDate: toDateTimeLocal(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
            });
        }
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (stage: Tahap) => {
        setStageToDelete(stage);
        setIsAlertOpen(true);
    };

    const handleConfirmDelete = () => {
        if (stageToDelete) {
          try {
            deleteStage(stageToDelete.id);
            setStages(getStages());
            toast({ title: "Tahap Dihapus", description: `Tahap "${stageToDelete.name}" telah berhasil dihapus.` });
          } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menghapus", description: error.message });
          }
        }
        setIsAlertOpen(false);
        setStageToDelete(null);
    };

    const processForm = (data: StageFormValues) => {
        try {
            const stageData = {
                ...data,
                startDate: new Date(data.startDate).toISOString(),
                endDate: new Date(data.endDate).toISOString(),
            };

            if (editingStage) {
                updateStage({ ...stageData, id: editingStage.id });
                toast({ title: "Tahap Diperbarui", description: `Tahap "${data.name}" telah diperbarui.` });
            } else {
                addStage(stageData);
                toast({ title: "Tahap Ditambahkan", description: `Tahap "${data.name}" telah ditambahkan.` });
            }
            setStages(getStages());
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
                                    <Layers size={28} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl sm:text-3xl font-headline">Manajemen Tahap Pendaftaran</CardTitle>
                                    <CardDescription className="text-md mt-1">
                                        Kelola jadwal dan tahapan pembukaan pendaftaran.
                                    </CardDescription>
                                </div>
                            </div>
                            <Button onClick={() => handleOpenDialog()}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Tahap
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nama Tahap</TableHead>
                                        <TableHead>Tanggal Buka</TableHead>
                                        <TableHead>Tanggal Tutup</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stages.length > 0 ? (
                                        stages.map((stage) => (
                                            <TableRow key={stage.id}>
                                                <TableCell className="font-medium">{stage.name}</TableCell>
                                                <TableCell>{new Date(stage.startDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</TableCell>
                                                <TableCell>{new Date(stage.endDate).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' })}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                                <span className="sr-only">Buka menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => handleOpenDialog(stage)}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                <span>Edit</span>
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => handleDeleteClick(stage)} className="text-destructive focus:text-destructive">
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
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                Belum ada tahap pendaftaran yang ditambahkan.
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
                        <DialogTitle>{editingStage ? "Edit Tahap" : "Tambah Tahap Baru"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processForm)} className="space-y-6 py-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Tahap</FormLabel>
                                    <FormControl><Input {...field} placeholder="Contoh: Tahap 1" /></FormControl>
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
                            Tindakan ini akan menghapus tahap "{stageToDelete?.name}" secara permanen. Jalur pendaftaran yang terkait dengan tahap ini tidak akan dapat diakses.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Ya, Hapus Tahap
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
