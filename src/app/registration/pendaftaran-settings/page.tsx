
"use client";

import * as React from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Layers, MoreHorizontal, Edit, Trash2, PlusCircle, GraduationCap, Home } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";

import { getStages, addStage, updateStage, deleteStage, type Tahap } from "@/lib/stageService";
import { getJalur, addJalur, updateJalur, deleteJalur, type Jalur } from "@/lib/pathwayService";
import { getSchools, updateSchool, type School } from "@/lib/schoolService";
import type { SchoolJenjang } from "@/lib/schoolService";
import { addressData } from "@/lib/addressData";


// Stage Management Component
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

function StageManagementView() {
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
            <div className="flex justify-end mb-4">
                 <Button onClick={() => handleOpenDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Tahap
                </Button>
            </div>
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


// Pathway Management Component
const pathwayFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3, { message: "Nama jalur minimal 3 karakter." }),
  tahapId: z.string().min(1, { message: "Tahap pendaftaran harus dipilih." }),
  allowedJenjang: z.array(z.enum(["SMP", "SMA", "SMK"])).min(1, { message: "Pilih setidaknya satu jenjang." }),
});

type PathwayFormValues = z.infer<typeof pathwayFormSchema>;
const jenjangOptions: SchoolJenjang[] = ["SMA", "SMK", "SMP"];

function PathwayManagementView() {
    const [pathways, setPathways] = React.useState<Jalur[]>([]);
    const [stages, setStages] = React.useState<Tahap[]>([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingPathway, setEditingPathway] = React.useState<Jalur | null>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [pathwayToDelete, setPathwayToDelete] = React.useState<Jalur | null>(null);
    const { toast } = useToast();

    const form = useForm<PathwayFormValues>({
        resolver: zodResolver(pathwayFormSchema),
        defaultValues: { name: '', tahapId: '', allowedJenjang: ["SMA", "SMK"] },
    });

    React.useEffect(() => {
        setPathways(getJalur());
        setStages(getStages());
    }, []);

    const stageMap = React.useMemo(() => {
      return new Map(stages.map(s => [s.id, s.name]));
    }, [stages]);

    const handleOpenDialog = (pathway: Jalur | null = null) => {
        setEditingPathway(pathway);
        if (pathway) {
            form.reset(pathway);
        } else {
            form.reset({
                id: undefined,
                name: '',
                tahapId: '',
                allowedJenjang: ["SMA", "SMK"],
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
            if (editingPathway) {
                updateJalur({ ...data, id: editingPathway.id });
                toast({ title: "Jalur Diperbarui", description: `Jalur "${data.name}" telah diperbarui.` });
            } else {
                addJalur(data);
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
            <div className="flex justify-end mb-4">
                 <Button onClick={() => handleOpenDialog()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Tambah Jalur
                </Button>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nama Jalur</TableHead>
                            <TableHead>Tahap</TableHead>
                            <TableHead>Jenjang</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {pathways.length > 0 ? (
                            pathways.map((pathway) => (
                                <TableRow key={pathway.id}>
                                    <TableCell className="font-medium">{pathway.name}</TableCell>
                                    <TableCell>{stageMap.get(pathway.tahapId) || 'Tidak diketahui'}</TableCell>
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
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Belum ada jalur pendaftaran yang ditambahkan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
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

                            <FormField control={form.control} name="tahapId" render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tahap Pendaftaran</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih tahap" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {stages.map(stage => (
                                            <SelectItem key={stage.id} value={stage.id}>{stage.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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

// Domicile Management Component
function DomicileManagementView() {
    const { toast } = useToast();
    const [schools, setSchools] = React.useState<School[]>([]);
    const [subdistrictMap, setSubdistrictMap] = React.useState<Record<string, string[]>>({});
    
    // Dialog state
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingSchool, setEditingSchool] = React.useState<School | null>(null);
    
    // State for inputs inside the dialog
    const [selectedVillages, setSelectedVillages] = React.useState<Set<string>>(new Set());
    const [priorityVillages, setPriorityVillages] = React.useState<Set<string>>(new Set());
    const [priorityRts, setPriorityRts] = React.useState<Record<string, string>>({});

    React.useEffect(() => {
        const smaSchools = getSchools().filter(s => s.jenjang === 'SMA');
        setSchools(smaSchools);

        const berauDistrict = addressData["Kalimantan Timur"]["Kabupaten Berau"];
        setSubdistrictMap(berauDistrict);
    }, []);

    const handleOpenDialog = (school: School) => {
        setEditingSchool(school);
        setSelectedVillages(new Set(school.allowedVillages || []));
        setPriorityVillages(new Set(school.priorityDomiciles?.map(p => p.village) || []));
        const initialRts = school.priorityDomiciles?.reduce((acc, domicile) => {
            if (domicile.rts.length > 0) {
                acc[domicile.village] = domicile.rts.join(', ');
            }
            return acc;
        }, {} as Record<string, string>) || {};
        setPriorityRts(initialRts);
        setIsDialogOpen(true);
    };

    const handleVillageToggle = (village: string, checked: boolean) => {
        setSelectedVillages(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(village);
            else newSet.delete(village);
            return newSet;
        });

        // If a village is disallowed, it cannot be a priority
        if (!checked) {
            handlePriorityVillageToggle(village, false);
        }
    };

    const handlePriorityVillageToggle = (village: string, checked: boolean) => {
        setPriorityVillages(prev => {
            const newSet = new Set(prev);
            if (checked) newSet.add(village);
            else newSet.delete(village);
            return newSet;
        });

        // If a village is no longer priority, clear its RTs
        if (!checked) {
            setPriorityRts(prev => {
                const newRts = { ...prev };
                delete newRts[village];
                return newRts;
            });
        }
    };

    const handleSave = () => {
        if (!editingSchool) return;
        
        const allowedVillagesArr = Array.from(selectedVillages);
        const priorityDomicilesArr = Array.from(priorityVillages)
            .filter(village => selectedVillages.has(village)) // Only save priority if it's also an allowed village
            .map(village => ({
                village: village,
                rts: (priorityRts[village] || '').split(',').map(rt => rt.trim()).filter(Boolean)
            }));

        const updatedSchoolData = {
            ...editingSchool,
            allowedVillages: allowedVillagesArr,
            priorityDomiciles: priorityDomicilesArr,
        };

        try {
            updateSchool(updatedSchoolData);
            setSchools(getSchools().filter(s => s.jenjang === 'SMA')); // refetch and filter
            toast({ title: "Domisili Diperbarui", description: `Aturan domisili untuk ${editingSchool.namaSekolah} telah disimpan.` });
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Menyimpan", description: error.message });
        }
    };
    
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Pengaturan Domisili Jalur Zonasi</CardTitle>
                    <CardDescription>Atur kelurahan mana saja yang dapat mendaftar ke sekolah tertentu melalui jalur domisili. Anda juga dapat memberikan prioritas pada kelurahan atau RT tertentu.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama Sekolah (SMA)</TableHead>
                                    <TableHead>Kelurahan Diizinkan</TableHead>
                                    <TableHead>Kelurahan Prioritas</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schools.map(school => (
                                    <TableRow key={school.id}>
                                        <TableCell className="font-medium">{school.namaSekolah}</TableCell>
                                        <TableCell>
                                            {school.allowedVillages && school.allowedVillages.length > 0
                                                ? <Badge>{school.allowedVillages.length} kelurahan</Badge>
                                                : <Badge variant="secondary">Semua di kecamatan</Badge>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            {school.priorityDomiciles && school.priorityDomiciles.length > 0
                                                ? <Badge variant="default">{school.priorityDomiciles.length} kelurahan</Badge>
                                                : <Badge variant="secondary">Tidak ada</Badge>
                                            }
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => handleOpenDialog(school)}>
                                                <Edit className="mr-2 h-3 w-3" /> Atur
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>Atur Domisili untuk {editingSchool?.namaSekolah}</DialogTitle>
                        <DialogDescription>
                            Pilih kelurahan yang diizinkan, lalu opsional tetapkan prioritas untuk kelurahan atau RT tertentu.
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="h-96 w-full rounded-md border p-4">
                        <div className="space-y-6">
                            {Object.entries(subdistrictMap).map(([kecamatan, villages]) => (
                                <div key={kecamatan}>
                                    <h4 className="font-semibold text-muted-foreground mb-3 border-b pb-2">{kecamatan}</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                                        {villages.map(village => (
                                            <div key={village} className="p-2 rounded-md border border-transparent hover:bg-muted/50">
                                                <div className="flex items-center space-x-3">
                                                    <Checkbox
                                                        id={`allow-${village}`}
                                                        checked={selectedVillages.has(village)}
                                                        onCheckedChange={(checked) => handleVillageToggle(village, !!checked)}
                                                    />
                                                    <Label htmlFor={`allow-${village}`} className="font-normal text-sm cursor-pointer flex-1">{village}</Label>
                                                </div>
                                                {selectedVillages.has(village) && (
                                                    <div className="pl-7 mt-2 space-y-2">
                                                        <div className="flex items-center space-x-3">
                                                            <Checkbox
                                                                id={`priority-${village}`}
                                                                checked={priorityVillages.has(village)}
                                                                onCheckedChange={(checked) => handlePriorityVillageToggle(village, !!checked)}
                                                            />
                                                            <Label htmlFor={`priority-${village}`} className="text-xs font-normal">Jadikan Prioritas</Label>
                                                        </div>
                                                        {priorityVillages.has(village) && (
                                                            <Input
                                                                id={`rt-${village}`}
                                                                placeholder="RT Prioritas (e.g., 1, 5, 12). Kosongkan jika seluruh kelurahan prioritas."
                                                                value={priorityRts[village] || ''}
                                                                onChange={(e) => setPriorityRts(prev => ({ ...prev, [village]: e.target.value }))}
                                                                className="h-8 text-xs"
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Batal</Button></DialogClose>
                        <Button type="button" onClick={handleSave}>Simpan Pengaturan</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// Main Page Component
export default function PendaftaranSettingsPage() {
    return (
      <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-7xl shadow-2xl">
          <CardHeader>
            <div className="flex items-center space-x-3">
               <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
                  <Layers size={28} />
               </div>
               <div>
                  <CardTitle className="text-2xl sm:text-3xl font-headline">Pengaturan Pendaftaran</CardTitle>
                  <CardDescription className="text-md mt-1">
                      Kelola tahap, jalur, dan aturan pendaftaran untuk sistem penerimaan murid baru.
                  </CardDescription>
               </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tahap" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tahap">
                  <Layers className="mr-2 h-4 w-4" />
                  Manajemen Tahap
                </TabsTrigger>
                <TabsTrigger value="jalur">
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Manajemen Jalur
                </TabsTrigger>
                <TabsTrigger value="domisili">
                  <Home className="mr-2 h-4 w-4" />
                  Manajemen Domisili
                </TabsTrigger>
              </TabsList>
              <TabsContent value="tahap" className="mt-6">
                <StageManagementView />
              </TabsContent>
              <TabsContent value="jalur" className="mt-6">
                <PathwayManagementView />
              </TabsContent>
              <TabsContent value="domisili" className="mt-6">
                <DomicileManagementView />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }
