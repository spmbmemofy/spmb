
"use client";

import * as React from "react";
import { users as allUsers, type User, type UserRole } from "@/lib/userData";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Shield, UserPlus, MoreHorizontal, Edit, Trash2, Search as SearchIcon } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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


export default function SuperadminPage() {
    const [users, setUsers] = React.useState<User[]>(allUsers);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [roleFilter, setRoleFilter] = React.useState<UserRole | "all">("all");

    const filteredUsers = React.useMemo(() => {
        return users.filter(user => {
            const searchMatch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                user.username.toLowerCase().includes(searchTerm.toLowerCase());
            const roleMatch = roleFilter === "all" || user.role === roleFilter;
            return searchMatch && roleMatch;
        });
    }, [users, searchTerm, roleFilter]);


    const handleAddUser = () => {
        // Placeholder for adding a user
        alert("Fungsionalitas 'Tambah Pengguna' belum diimplementasikan.");
    };

    const handleEditUser = (userId: string) => {
        // Placeholder for editing a user
        alert(`Fungsionalitas 'Edit Pengguna' untuk user ID ${userId} belum diimplementasikan.`);
    };

    const handleDeleteUser = (userId: string) => {
        // Placeholder for deleting a user
        if (confirm(`Apakah Anda yakin ingin menghapus pengguna dengan ID ${userId}?`)) {
            alert(`Fungsionalitas 'Hapus Pengguna' untuk user ID ${userId} belum diimplementasikan.`);
        }
    };

    return (
        <div className="flex flex-1 flex-col items-center p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-5xl shadow-2xl">
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
                         <Button onClick={handleAddUser}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Tambah Pengguna
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 py-4">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Cari berdasarkan nama atau username..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as UserRole | "all")}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter berdasarkan peran" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Peran</SelectItem>
                                {Object.entries(roleDisplayNames).map(([role, name]) => (
                                    <SelectItem key={role} value={role}>{name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px] text-center">No.</TableHead>
                                    <TableHead>Nama Lengkap</TableHead>
                                    <TableHead>Username</TableHead>
                                    <TableHead>Peran</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user, index) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="text-center">{index + 1}</TableCell>
                                            <TableCell className="font-medium">{user.fullName}</TableCell>
                                            <TableCell>{user.username}</TableCell>
                                            <TableCell>
                                                <Badge variant={roleBadgeVariants[user.role]}>
                                                    {roleDisplayNames[user.role]}
                                                </Badge>
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
                                                        <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            <span>Edit</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleDeleteUser(user.id)} className="text-destructive focus:text-destructive">
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
                                        <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                            Tidak ada pengguna yang cocok dengan kriteria.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
