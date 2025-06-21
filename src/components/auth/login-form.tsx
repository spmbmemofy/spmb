
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, Hash, Lock, User, UserCog } from "lucide-react";

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
import { getFromLocalStorage, saveToLocalStorage, removeFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";

const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";

const formSchema = z.object({
  role: z.enum(["applicant", "admin"], {
    required_error: "Anda harus memilih peran.",
  }),
  username: z.string().min(1, { message: "NISN atau nama pengguna wajib diisi." }),
  password: z
    .string()
    .min(6, { message: "Kata sandi minimal 6 karakter." }),
  rememberMe: z.boolean().default(false).optional(),
});

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

  const role = form.watch("role");

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
    console.log("Form values:", values);

    // Always save credentials for the current session
    saveToLocalStorage<LoginCredentials>(LOCAL_STORAGE_LOGIN_KEY, {
      username: values.username,
      role: values.role,
      rememberMe: values.rememberMe,
    });
    
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const isSuccess = Math.random() > 0.3; 

    if (isSuccess) {
        toast({
            title: "Login Berhasil",
            description: `Selamat datang, ${values.role === 'applicant' ? 'Pendaftar' : 'Admin'}!`,
        });

        if (values.role === "applicant" || values.role === "admin") {
          router.push('/registration/dashboard');
        }
    } else {
        toast({
            variant: "destructive",
            title: "Login Gagal",
            description: "Kredensial tidak valid. Silakan coba lagi.",
        });
    }
    setIsSubmitting(false);
  }

  return (
    <Card className="w-full max-w-md shadow-2xl">
      <CardHeader className="text-center">
        <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
          <Lock size={32} />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-headline">Akses Portal Pendaftaran</CardTitle>
        <CardDescription>
          Silakan pilih peran Anda dan masukkan kredensial untuk melanjutkan.
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
                      value={field.value} // ensure value is controlled
                      className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="applicant" id="applicant" />
                        </FormControl>
                        <FormLabel htmlFor="applicant" className="font-normal flex items-center">
                          <User className="mr-2 h-5 w-5 text-accent" />
                          Pendaftar
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="admin" id="admin" />
                        </FormControl>
                        <FormLabel htmlFor="admin" className="font-normal flex items-center">
                          <UserCog className="mr-2 h-5 w-5 text-accent" />
                          Admin
                        </FormLabel>
                      </FormItem>
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
                  <FormLabel htmlFor="username">{role === 'admin' ? 'Nama Pengguna' : 'NISN (Nomor Induk Siswa Nasional)'}</FormLabel>
                  <div className="relative">
                    {role === 'admin' ? (
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    ) : (
                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    )}
                    <FormControl>
                      <Input id="username" placeholder={role === 'admin' ? 'Masukkan nama pengguna' : 'Masukkan NISN Anda'} {...field} className="pl-10" />
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
                      <FormDescription>
                        Biarkan saya tetap masuk selama 2 minggu.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
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
