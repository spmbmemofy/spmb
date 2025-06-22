
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Shield, UserPlus, MoreHorizontal, Edit, Trash2, Search as SearchIcon, Eye, EyeOff } from 'lucide-react';

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
import { getUsers, addUser, updateUser, deleteUser } from "@/lib/userService";
import { type User, type UserRole } from "@/lib/userData";
import { getSchools, type School } from "@/lib/schoolService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const roleDisplayNames: Record<UserRole, string> = {
  applicant: "Pendaftar",
  verifikator: "Verifikator",
  smp_operator: "Operator SMP",
  headmaster: "Kepala Sekolah",
  admin: "Admin",
  superadmin: "Superadmin",
};

const roleBadgeVariants: Record<UserRole, "default" | "secondary" | "destructive" | "outline"> = {
    superadmin: "destructive",
    admin: "default",
    verifikator: "secondary",
    headmaster: "outline",
    smp_operator: "outline",
    applicant: "outline",
};

const userFormSchema = z.object({
  id: z.string().optional(),
  fullName: z.string().min(3, { message: "Nama lengkap minimal 3 karakter." }),
  username: z.string().min(3, { message: "Username minimal 3 karakter." }),
  role: z.enum(["applicant", "admin", "verifikator", "smp_operator", "superadmin", "headmaster"], { required_error: "Peran wajib dipilih."}),
  password: z.string().min(6, { message: "Kata sandi minimal 6 karakter." }).optional().or(z.literal('')),
  npsn: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

export default function SuperadminPage() {
    const [users, setUsers] = React.useState<User[]>([]);
    const [allSchools, setAllSchools] = React.useState<School[]>([]);
    const [systemSearchTerm, setSystemSearchTerm] = React.useState("");
    const [applicantSearchTerm, setApplicantSearchTerm] = React.useState("");
    const [roleFilter, setRoleFilter] = React.useState<UserRole | "all">("all");
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<User | null>(null);
    const [isAlertOpen, setIsAlertOpen] = React.useState(false);
    const [userToDeleteId, setUserToDeleteId] = React.useState<string | null>(null);
    const { toast } = useToast();
    const [visiblePasswordId, setVisiblePasswordId] = React.useState<string | null>(null);

    const form = useForm<UserFormValues>({
        resolver: zodResolver(userFormSchema),
        defaultValues: { id: '', fullName: '', username: '', role: 'applicant', password: '', npsn: '' },
    });
    
    const selectedFormRole = form.watch("role");

    React.useEffect(() => {
        setUsers(getUsers());
        setAllSchools(getSchools());
    }, []);

    const filteredSystemUsers = React.useMemo(() => {
        return users.filter(user => {
            if (user.role === 'applicant') return false;
            const searchMatch = user.fullName.toLowerCase().includes(systemSearchTerm.toLowerCase()) ||
                                user.username.toLowerCase().includes(systemSearchTerm.toLowerCase());
            const roleMatch = roleFilter === "all" || user.role === roleFilter;
            return searchMatch && roleMatch;
        });
    }, [users, systemSearchTerm, roleFilter]);

    const filteredApplicantUsers = React.useMemo(() => {
        return users.filter(user => {
            if (user.role !== 'applicant') return false;
            return user.fullName.toLowerCase().includes(applicantSearchTerm.toLowerCase()) ||
                   user.username.toLowerCase().includes(applicantSearchTerm.toLowerCase());
        });
    }, [users, applicantSearchTerm]);

    const handleOpenDialog = (user: User | null = null) => {
        setEditingUser(user);
        if (user) {
            form.reset({ ...user, password: '' });
        } else {
            form.reset({ id: undefined, fullName: '', username: '', role: 'applicant', password: '', npsn: '' });
        }
        setIsDialogOpen(true);
    };

    const handleDeleteClick = (userId: string) => {
        setUserToDeleteId(userId);
        setIsAlertOpen(true);
    };

    const handleConfirmDelete = () => {
        if (userToDeleteId) {
            deleteUser(userToDeleteId);
            setUsers(getUsers());
            toast({ title: "Pengguna Dihapus", description: "Pengguna telah berhasil dihapus dari sistem." });
        }
        setIsAlertOpen(false);
        setUserToDeleteId(null);
    };

    const processForm = (data: UserFormValues) => {
        if (editingUser) { // Update
            if (!data.password) {
              delete data.password; // Keep old password if field is empty
            }
            updateUser({ ...editingUser, ...data });
            toast({ title: "Pengguna Diperbarui", description: `Data untuk ${data.fullName} telah diperbarui.` });
        } else { // Create
            if (!data.password) {
                form.setError("password", { type: "manual", message: "Kata sandi wajib diisi untuk pengguna baru." });
                return;
            }
            addUser(data);
            toast({ title: "Pengguna Ditambahkan", description: `${data.fullName} telah ditambahkan ke sistem.` });
        }
        setUsers(getUsers());
        setIsDialogOpen(false);
    };

    const renderUserTable = (userList: User[]) => (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[50px] text-center">No.</TableHead>
                        <TableHead>Nama Lengkap</TableHead>
                        <TableHead>Username/NISN</TableHead>
                        <TableHead>Peran</TableHead>
                        <TableHead>Kata Sandi</TableHead>
                        <TableHead>NPSN</TableHead>
                        <TableHead>Nama Sekolah</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {userList.length > 0 ? (
                        userList.map((user, index) => {
                            const schoolName = user.npsn
                                ? allSchools.find(s => s.npsn === user.npsn)?.namaSekolah || "Sekolah tidak ditemukan"
                                : "-";
                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="text-center">{index + 1}</TableCell>
                                    <TableCell className="font-medium">{user.fullName}</TableCell>
                                    <TableCell>{user.username}</TableCell>
                                    <TableCell>
                                        <Badge variant={roleBadgeVariants[user.role]}>
                                            {roleDisplayNames[user.role]}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono">
                                                {visiblePasswordId === user.id ? user.password : '********'}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => setVisiblePasswordId(visiblePasswordId === user.id ? null : user.id)}
                                            >
                                                <span className="sr-only">Toggle password visibility</span>
                                                {visiblePasswordId === user.id ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                    <TableCell>{user.npsn || '-'}</TableCell>
                                    <TableCell>{schoolName}</TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Buka menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(user)}>
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    <span>Edit</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDeleteClick(user.id)} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Hapus</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                        })
                    ) : (
                        <TableRow>
                            <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                Tidak ada pengguna yang cocok dengan kriteria.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
    
    const relevantSchools = React.useMemo(() => {
        if (selectedFormRole === "smp_operator") {
            return allSchools.filter(s => s.jenjang === "SMP");
        }
        if (selectedFormRole === "verifikator" || selectedFormRole === "headmaster") {
            return allSchools.filter(s => s.jenjang === "SMA" || s.jenjang === "SMK");
        }
        return [];
    }, [selectedFormRole, allSchools]);

    return (
        <>
            <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
                <Card className="w-full max-w-7xl shadow-2xl">
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0 bg-primary text-primary-foreground rounded-full p-3 w-fit">
                                    <Shield size={28} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl sm:text-3xl font-headline">Manajemen Pengguna</CardTitle>
                                    <CardDescription className="text-md mt-1">
                                        Kelola semua akun pengguna dalam sistem.
                                    </CardDescription>
                                </div>
                            </div>
                            <Button onClick={() => handleOpenDialog()}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                Tambah Pengguna
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="system-users" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="system-users">Pengguna Sistem</TabsTrigger>
                                <TabsTrigger value="pendaftar">Pendaftar</TabsTrigger>
                            </TabsList>
                            <TabsContent value="system-users" className="mt-4">
                                <div className="flex items-center gap-4 py-4">
                                    <div className="relative flex-1">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cari berdasarkan nama atau username..."
                                            value={systemSearchTerm}
                                            onChange={(e) => setSystemSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "all")}>
                                        <SelectTrigger className="w-full sm:w-[200px]">
                                            <SelectValue placeholder="Filter berdasarkan peran" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Semua Peran Sistem</SelectItem>
                                            {Object.entries(roleDisplayNames)
                                                .filter(([role]) => role !== 'applicant')
                                                .map(([role, name]) => (
                                                    <SelectItem key={role} value={role}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {renderUserTable(filteredSystemUsers)}
                            </TabsContent>
                            <TabsContent value="pendaftar" className="mt-4">
                                <div className="flex items-center gap-4 py-4">
                                    <div className="relative flex-1">
                                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Cari berdasarkan nama atau NISN..."
                                            value={applicantSearchTerm}
                                            onChange={(e) => setApplicantSearchTerm(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                </div>
                                {renderUserTable(filteredApplicantUsers)}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}</DialogTitle>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(processForm)} className="space-y-4 py-4">
                            <FormField control={form.control} name="fullName" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nama Lengkap</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="username" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="password" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kata Sandi</FormLabel>
                                    <FormControl><Input type="password" {...field} /></FormControl>
                                    {editingUser && <p className="text-xs text-muted-foreground">Kosongkan jika tidak ingin mengubah kata sandi.</p>}
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField control={form.control} name="role" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Peran</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {Object.entries(roleDisplayNames).map(([role, name]) => (
                                                <SelectItem key={role} value={role}>{name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            {['verifikator', 'smp_operator', 'headmaster'].includes(selectedFormRole) && (
                                <FormField
                                    control={form.control}
                                    name="npsn"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Sekolah Terkait</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger><SelectValue placeholder="Pilih sekolah terkait" /></SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {relevantSchools.map(school => (
                                                        <SelectItem key={school.npsn} value={school.npsn}>
                                                            {school.namaSekolah} ({school.npsn})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
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
                            Tindakan ini tidak dapat diurungkan. Pengguna akan dihapus secara permanen dari sistem.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive hover:bg-destructive/90">
                            Ya, Hapus Pengguna
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
