
"use client";

import { ReactNode, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Menu as MenuIcon, ClipboardCheck, Home, Database, Megaphone, School, UserCheck, User as UserIcon, FileUp, Shield, GraduationCap, Building, Users, Lock, Edit } from 'lucide-react';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { getFromLocalStorage, removeFromLocalStorage, type LoginCredentials, type RegistrationProgress } from "@/lib/localStorage";
import { useToast } from "@/hooks/use-toast";
import { initializeAllData } from '@/lib/initializeDatabase';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getUsers, type User } from '@/lib/userService';
import { roleDisplayNames } from '@/lib/userData';
import { getApplicants, type Applicant } from '@/lib/applicantService';


const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";
const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";

interface RegistrationLayoutProps {
  children: ReactNode;
}

export default function RegistrationLayout({ children }: RegistrationLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<LoginCredentials['role'] | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [applicant, setApplicant] = useState<Applicant | null>(null);

  useEffect(() => {
    initializeAllData();
  }, []);

  useEffect(() => {
    const savedCredentials = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    
    if (savedCredentials?.role && savedCredentials.username) {
      setUserRole(savedCredentials.role);
      const user = getUsers().find(u => u.username === savedCredentials.username);
      setCurrentUser(user || null);

      if (user?.role === 'applicant') {
        const foundApplicant = getApplicants().find(app => app.nisn === user.username);
        setApplicant(foundApplicant || null);
      }

    } else {
      toast({
        variant: "destructive",
        title: "Akses Ditolak",
        description: "Anda harus login untuk mengakses halaman ini.",
      });
      router.replace('/');
    }
  }, [router, toast, pathname]);

  const menuItems = useMemo(() => {
    const verifierMenu = [
      { href: '/registration/home', label: 'Beranda', icon: Home, activePaths: ['/registration/home'] },
      { href: '/registration/all-data', label: 'Semua Data', icon: Database, activePaths: ['/registration/all-data', '/registration/school', '/registration/origin-school'] },
      { href: '/registration/selection', label: 'Verifikasi', icon: UserCheck, activePaths: ['/registration/selection', '/registration/verify'] },
      { href: '/registration/announcement', label: 'Pengumuman', icon: Megaphone, activePaths: ['/registration/announcement'] },
    ];
    
    const adminMenu = [
      { href: '/registration/home', label: 'Beranda', icon: Home, activePaths: ['/registration/home'] },
      { href: '/registration/all-data', label: 'Semua Data', icon: Database, activePaths: ['/registration/all-data', '/registration/school', '/registration/origin-school'] },
      { href: '/registration/announcement', label: 'Pengumuman', icon: Megaphone, activePaths: ['/registration/announcement'] },
      { href: '/registration/school-management', label: 'Manajemen Sekolah', icon: Building, activePaths: ['/registration/school-management'] },
      { href: '/registration/superadmin', label: 'Manajemen Pengguna', icon: Shield, activePaths: ['/registration/superadmin'] }
    ];
    
    const superAdminMenu = [ ...adminMenu ];
    
    const headmasterMenu = [
        { href: '/registration/home', label: 'Beranda', icon: Home, activePaths: ['/registration/home'] },
        { href: '/registration/all-data', label: 'Lihat Data', icon: Database, activePaths: ['/registration/all-data', '/registration/school', '/registration/origin-school'] },
        { href: '/registration/school-settings', label: 'Kelola Sekolah', icon: Building, activePaths: ['/registration/school-settings'] },
        { href: '/registration/announcement', label: 'Pengumuman', icon: Megaphone, activePaths: ['/registration/announcement'] },
    ];
     const smpOperatorMenu = [
        { href: '/registration/home', label: 'Beranda', icon: Home, activePaths: ['/registration/home'] },
        { href: '/registration/origin-school-data', label: 'Data Sekolah', icon: Building, activePaths: ['/registration/origin-school-data'] },
        { href: '/registration/applicant-data', label: 'Data Pendaftar', icon: Users, activePaths: ['/registration/applicant-data'] },
    ];

    if (userRole === 'applicant') {
        const registrationProgress = getFromLocalStorage<RegistrationProgress | null>(LOCAL_STORAGE_REGISTRATION_KEY, {});
        const registrationCompleted = registrationProgress?.registrationCompleted || false;
        const needsCorrection = applicant?.statusVerifikasi === 'Berkas tidak sesuai';

        return [
            { href: '/registration/home', label: 'Beranda', icon: Home, activePaths: ['/registration/home'] },
            { href: '/registration/dashboard', label: 'Pendaftaran', icon: FileUp, activePaths: ['/registration/dashboard', '/registration/documents', '/registration/document-upload'] },
            { href: '/registration/correction', label: 'Perbaikan Data', icon: Edit, activePaths: ['/registration/correction'], hidden: !needsCorrection },
            { href: '/registration/status', label: 'Status Pendaftaran', icon: ClipboardCheck, activePaths: ['/registration/status'], disabled: !registrationCompleted },
            { href: '/registration/announcement', label: 'Pengumuman', icon: Megaphone, activePaths: ['/registration/announcement'] },
        ].filter(item => !item.hidden);
    }


    switch (userRole) {
        case 'verifikator': return verifierMenu;
        case 'admin': return adminMenu;
        case 'superadmin': return superAdminMenu;
        case 'headmaster': return headmasterMenu;
        case 'smp_operator': return smpOperatorMenu;
        default: return [];
    }
    
  }, [userRole, applicant]);

  const handleLogout = () => {
    const savedCredentials = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    if (userRole === 'applicant') {
      removeFromLocalStorage(LOCAL_STORAGE_REGISTRATION_KEY);
    }
    
    if (!savedCredentials || !savedCredentials.rememberMe) {
      removeFromLocalStorage(LOCAL_STORAGE_LOGIN_KEY);
    }
    router.push('/');
  };

  const homeLink = useMemo(() => {
    if (userRole && ['admin', 'verifikator', 'superadmin', 'headmaster', 'smp_operator', 'applicant'].includes(userRole)) {
        return '/registration/home';
    }
    return '/registration/dashboard';
  }, [userRole]);

  if (!userRole || !currentUser) {
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
               <Link href={homeLink} className="flex items-center gap-2">
                 <Image 
                    src="https://placehold.co/40x40.png"
                    alt="Ikon Aplikasi" 
                    width={32} 
                    height={32} 
                    className="h-8 w-8"
                    data-ai-hint="logo icon"
                  />
                  <span className="font-semibold group-data-[state=collapsed]:hidden">PMB 2026</span>
                </Link>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {menuItems.map((item: any) => (
                <SidebarMenuItem key={item.href + item.label}>
                   <SidebarMenuButton
                    asChild={!item.disabled}
                    isActive={item.activePaths.some((path: string) => pathname.startsWith(path))}
                    tooltip={{ children: item.label, side: 'right' }}
                    disabled={item.disabled}
                  >
                    {item.disabled ? (
                      <div className="flex items-center gap-2 cursor-not-allowed">
                        <item.icon />
                        <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                      </div>
                    ) : (
                      <Link href={item.href}>
                        <item.icon />
                        <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                      </Link>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
               <div className="group-data-[state=expanded]:px-2 group-data-[state=expanded]:pb-2">
                 <SidebarSeparator className="mb-2" />
                 <div className="flex items-center gap-3">
                     <Avatar className="size-8">
                        <AvatarFallback>
                           <UserIcon />
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col group-data-[state=collapsed]:hidden">
                        <span className="text-sm font-semibold text-sidebar-foreground truncate">{currentUser.fullName}</span>
                        <span className="text-xs text-sidebar-foreground/70">{roleDisplayNames[currentUser.role]}</span>
                    </div>
                 </div>
              </div>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: 'Ubah Kata Sandi', side: 'right' }}>
                    <Link href="/registration/change-password">
                        <Lock />
                        <span className="group-data-[state=collapsed]:hidden">Ubah Kata Sandi</span>
                    </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
            <div className="font-semibold text-lg">PMB 2026</div>
          </header>
          <div className="flex flex-1 flex-col">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
