
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Building, Eye, EyeOff, GraduationCap, Hash, Lock, Shield, User, UserCog, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getFromLocalStorage, saveToLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { findUserByUsername } from "@/lib/userData";
import type { UserRole } from "@/lib/userData";

const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";

const formSchema = z.object({
  role: z.enum(["applicant", "admin", "verifikator", "smp_operator", "superadmin", "headmaster"], {
    required_error: "Anda harus memilih peran.",
  }),
  username: z.string().min(1, { message: "Nama pengguna atau NISN wajib diisi." }),
  password: z
    .string()
    .min(6, { message: "Kata sandi minimal 6 karakter." }),
  rememberMe: z.boolean().default(false).optional(),
});

type RoleInfo = {
    value: UserRole;
    label: string;
    icon: React.ElementType;
}

const roles: RoleInfo[] = [
    { value: "applicant", label: "Pendaftar", icon: User },
    { value: "verifikator", label: "Verifikator", icon: UserCheck },
    { value: "smp_operator", label: "Operator SMP", icon: Building },
    { value: "headmaster", label: "Kepala Sekolah", icon: GraduationCap },
    { value: "admin", label: "Admin", icon: UserCog },
    { value: "superadmin", label: "Superadmin", icon: Shield },
];

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const selectedRole = form.watch("role");

  React.useEffect(() => {
    const savedCredentials = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    if (savedCredentials?.rememberMe && savedCredentials.username && savedCredentials.role) {
      form.reset({
        username: savedCredentials.username,
        role: savedCredentials.role,
        password: "", // Password is not saved for security
        rememberMe: savedCredentials.rememberMe,
      });
    }
  }, [form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const user = findUserByUsername(values.username);

    if (user && user.role === values.role && user.password === values.password) {
      saveToLocalStorage<LoginCredentials>(LOCAL_STORAGE_LOGIN_KEY, {
        username: values.username,
        role: values.role,
        rememberMe: values.rememberMe,
      });

      toast({
          title: "Login Berhasil",
          description: `Selamat datang, ${user.fullName}!`,
      });

      router.push('/registration/dashboard');
    } else {
      toast({
          variant: "destructive",
          title: "Login Gagal",
          description: "Kombinasi peran, nama pengguna, atau kata sandi tidak valid.",
      });
    }
    setIsSubmitting(false);
  }

  const getUsernameLabel = () => {
    if (selectedRole === 'applicant') return "NISN (Nomor Induk Siswa Nasional)";
    return "Nama Pengguna";
  }
  
  const getUsernamePlaceholder = () => {
    if (selectedRole === 'applicant') return "Masukkan NISN Anda";
    return "Masukkan nama pengguna";
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
          <Lock size={32} />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-headline">SPMB 2026</CardTitle>
        <CardDescription>
          Seleksi Penerimaan Mahasiswa Baru - Tahun 2026
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Pilih Peran Anda</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 sm:grid-cols-3 gap-x-2 gap-y-4"
                    >
                      {roles.map((roleInfo) => (
                        <FormItem key={roleInfo.value} className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={roleInfo.value} id={roleInfo.value} />
                          </FormControl>
                          <FormLabel htmlFor={roleInfo.value} className="font-normal flex items-center gap-2 cursor-pointer">
                            <roleInfo.icon className="h-5 w-5 text-accent" />
                            {roleInfo.label}
                          </FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="username">{getUsernameLabel()}</FormLabel>
                  <div className="relative">
                     {selectedRole === 'applicant' ? (
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    ) : (
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    )}
                    <FormControl>
                      <Input id="username" placeholder={getUsernamePlaceholder()} {...field} className="pl-10" />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="password">Kata Sandi</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Masukkan kata sandi Anda"
                        {...field}
                        className="pl-10 pr-10"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </Button>
                  </div>
                   <FormDescription>
                       Untuk demo, gunakan: password123
                    </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        id="rememberMe"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel htmlFor="rememberMe" className="font-normal">Ingat saya</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting || !selectedRole}>
              {isSubmitting ? "Sedang Masuk..." : "Masuk"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" asChild className="text-sm">
          <Link href="/forgot-password">Lupa Kata Sandi?</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
