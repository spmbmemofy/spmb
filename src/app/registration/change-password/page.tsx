
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Lock, Eye, EyeOff, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { getFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { getUsers, updateUser } from "@/lib/userService";
import type { User } from "@/lib/userData";

const formSchema = z.object({
    currentPassword: z.string().min(1, { message: "Kata sandi saat ini wajib diisi." }),
    newPassword: z.string().min(6, { message: "Kata sandi baru minimal 6 karakter." }),
    confirmPassword: z.string().min(6, { message: "Konfirmasi kata sandi minimal 6 karakter." }),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "Kata sandi baru dan konfirmasi tidak cocok.",
    path: ["confirmPassword"],
});

export default function ChangePasswordPage() {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState<User | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
    const [showNewPassword, setShowNewPassword] = React.useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
    
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    React.useEffect(() => {
        const credentials = getFromLocalStorage<LoginCredentials | null>("loginCredentials", null);
        if (credentials?.username) {
            const user = getUsers().find(u => u.username === credentials.username);
            setCurrentUser(user || null);
        } else {
            toast({ variant: "destructive", title: "Akses Ditolak", description: "Anda harus login untuk mengakses halaman ini." });
            router.replace("/");
        }
    }, [router, toast]);

    const onSubmit = (values: z.infer<typeof formSchema>) => {
        setIsSubmitting(true);

        if (!currentUser) {
            toast({ variant: "destructive", title: "Gagal", description: "Sesi pengguna tidak ditemukan." });
            setIsSubmitting(false);
            return;
        }

        if (currentUser.password !== values.currentPassword) {
            form.setError("currentPassword", { type: "manual", message: "Kata sandi saat ini tidak benar." });
            setIsSubmitting(false);
            return;
        }

        try {
            updateUser({ ...currentUser, password: values.newPassword });
            toast({ title: "Berhasil", description: "Kata sandi Anda telah berhasil diperbarui." });
            
            // Redirect based on role
            const homePath = currentUser.role === 'applicant' ? '/registration/dashboard' : '/registration/home';
            router.push(homePath);

        } catch (error: any) {
            toast({ variant: "destructive", title: "Gagal Memperbarui", description: error.message });
        } finally {
            setIsSubmitting(false);
        }
    };

    const PasswordInput = ({ name, label, show, toggleShow }: { name: "currentPassword" | "newPassword" | "confirmPassword", label: string, show: boolean, toggleShow: () => void }) => (
        <FormField
            control={form.control}
            name={name}
            render={({ field }) => (
                <FormItem>
                    <FormLabel>{label}</FormLabel>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <FormControl>
                            <Input
                                type={show ? "text" : "password"}
                                placeholder="Masukkan kata sandi"
                                {...field}
                                className="pl-10 pr-10"
                            />
                        </FormControl>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground"
                            onClick={toggleShow}
                        >
                            <span className="sr-only">{show ? "Sembunyikan" : "Tampilkan"} kata sandi</span>
                            {show ? <EyeOff size={18} /> : <Eye size={18} />}
                        </Button>
                    </div>
                    <FormMessage />
                </FormItem>
            )}
        />
    );

    return (
        <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
                        <Lock size={32} />
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-headline">Ubah Kata Sandi</CardTitle>
                    <CardDescription>
                        Perbarui kata sandi Anda secara berkala untuk menjaga keamanan akun.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <PasswordInput name="currentPassword" label="Kata Sandi Saat Ini" show={showCurrentPassword} toggleShow={() => setShowCurrentPassword(!showCurrentPassword)} />
                            <PasswordInput name="newPassword" label="Kata Sandi Baru" show={showNewPassword} toggleShow={() => setShowNewPassword(!showNewPassword)} />
                            <PasswordInput name="confirmPassword" label="Konfirmasi Kata Sandi Baru" show={showConfirmPassword} toggleShow={() => setShowConfirmPassword(!showConfirmPassword)} />
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                <Save className="mr-2 h-4 w-4" />
                                {isSubmitting ? "Menyimpan..." : "Simpan Kata Sandi Baru"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
