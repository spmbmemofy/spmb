
"use client";

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu as MenuIcon, ClipboardCheck, Home, Database, Megaphone, User, School, FileText, UserCircle } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { getFromLocalStorage, removeFromLocalStorage, type LoginCredentials } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";
const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";

interface RegistrationLayoutProps {
  children: ReactNode;
}

export default function RegistrationLayout({ children }: RegistrationLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const savedCredentials = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    
    if (savedCredentials?.role === 'applicant' || savedCredentials?.role === 'admin' || savedCredentials?.role === 'verifikator') {
      setIsAuthorized(true);
    } else {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Anda harus login untuk mengakses halaman ini.",
      });
      router.replace('/');
    }
  }, [router, toast]);

  const menuItems = [
    {
      href: '/registration/dashboard',
      label: 'Beranda',
      icon: Home,
      activePaths: ['/registration/dashboard'],
    },
    {
      href: '/registration/documents',
      label: 'Pilihan Sekolah',
      icon: School,
      activePaths: ['/registration/documents'],
    },
     {
      href: '/registration/document-upload',
      label: 'Unggah Berkas',
      icon: FileText,
      activePaths: ['/registration/document-upload'],
    },
    {
      href: '/registration/status',
      label: 'Status Pendaftaran',
      icon: ClipboardCheck,
      activePaths: ['/registration/status'],
    },
    {
      href: '/registration/all-data',
      label: 'Semua Data',
      icon: Database,
      activePaths: ['/registration/all-data', '/registration/school', '/registration/origin-school'],
    },
    {
      href: '/registration/selection',
      label: 'Verifikasi',
      icon: UserCheck,
      activePaths: ['/registration/selection', '/registration/verify'],
    },
    {
      href: '/registration/announcement',
      label: 'Pengumuman',
      icon: Megaphone,
      activePaths: ['/registration/announcement'],
    },
  ];

  const handleLogout = () => {
    removeFromLocalStorage(LOCAL_STORAGE_REGISTRATION_KEY);
    const savedCredentials = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    if (!savedCredentials || !savedCredentials.rememberMe) {
      removeFromLocalStorage(LOCAL_STORAGE_LOGIN_KEY);
    }
    router.push('/');
  };

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <p>Memverifikasi akses...</p>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar collapsible="icon" className="border-r">
          <SidebarHeader>
            <div className="flex h-14 items-center justify-center p-2 group-data-[state=expanded]:border-b">
               <Link href="/registration/dashboard" className="flex items-center gap-2">
                 <Image 
                    src="https://placehold.co/40x40.png"
                    alt="Ikon Aplikasi" 
                    width={32} 
                    height={32} 
                    className="h-8 w-8"
                    data-ai-hint="logo icon"
                  />
                  <span className="font-semibold group-data-[state=collapsed]:hidden">SPMB 2026</span>
                </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={item.activePaths.some(path => pathname.startsWith(path))}
                    tooltip={{ children: item.label, side: 'right' }}
                  >
                    <Link href={item.href}>
                      <item.icon />
                      <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout} tooltip={{ children: 'Keluar', side: 'right' }}>
                    <LogOut />
                    <span className="group-data-[state=collapsed]:hidden">Keluar</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        
        <SidebarInset>
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 md:hidden">
            <SidebarTrigger asChild>
              <Button size="icon" variant="outline" className="sm:hidden">
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SidebarTrigger>
            <div className="font-semibold text-lg">SPMB 2026</div>
          </header>
          <div className="flex flex-1 flex-col">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
