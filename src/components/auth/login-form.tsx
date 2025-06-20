
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Added for redirection
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

const formSchema = z.object({
  role: z.enum(["applicant", "admin"], {
    required_error: "You need to select a role.",
  }),
  nisn: z.string().min(1, { message: "NISN is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters." }),
  rememberMe: z.boolean().default(false).optional(),
});

export function LoginForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nisn: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    // Simulate API call
    console.log("Form values:", values);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Mock success/error
    const isSuccess = Math.random() > 0.3; // Simulate success/failure

    if (isSuccess) {
        toast({
            title: "Login Successful",
            description: `Welcome, ${values.role}! (NISN: ${values.nisn})`,
        });
        
        // Redirect if applicant
        if (values.role === "applicant") {
          router.push('/registration/biodata');
        } else if (values.role === "admin") {
          // Placeholder for admin redirect if needed in the future
          // router.push('/admin/dashboard'); 
          console.log("Admin logged in, no specific redirect configured yet.");
        }
        // form.reset(); // Optionally reset form on success
    } else {
        toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid NISN or password. Please try again.",
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
        <CardTitle className="text-2xl font-headline">Admission Portal Access</CardTitle>
        <CardDescription>
          Please select your role and enter your credentials to continue.
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
                  <FormLabel>Select Your Role</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="applicant" id="applicant" />
                        </FormControl>
                        <FormLabel htmlFor="applicant" className="font-normal flex items-center">
                          <User className="mr-2 h-5 w-5 text-accent" />
                          Applicant
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
              name="nisn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="nisn">NISN (Nomor Induk Siswa Nasional)</FormLabel>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input id="nisn" placeholder="Enter your NISN" {...field} className="pl-10" />
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
                  <FormLabel htmlFor="password">Password</FormLabel>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <FormControl>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
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
                      aria-label={showPassword ? "Hide password" : "Show password"}
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
                      <FormLabel htmlFor="rememberMe" className="font-normal">Remember me</FormLabel>
                      <FormDescription>
                        Keep me logged in for 2 weeks.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing In..." : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" asChild className="text-sm">
          <Link href="/forgot-password">Forgot Password?</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
