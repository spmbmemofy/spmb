
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, FileText, Settings, LogOut, Menu as MenuIcon, Home, ClipboardCheck } from 'lucide-react';
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

const LOCAL_STORAGE_LOGIN_KEY = "loginCredentials";
const LOCAL_STORAGE_REGISTRATION_KEY = "registrationProgress";


interface RegistrationLayoutProps {
  children: ReactNode;
}

export default function RegistrationLayout({ children }: RegistrationLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      href: '/registration/dashboard',
      label: 'BERANDA',
      icon: Home,
      activePaths: ['/registration/dashboard', '/registration/school'], 
    },
    {
      href: '/registration/biodata',
      label: 'DATA PENDAFTAR',
      icon: User,
      activePaths: ['/registration/biodata'],
    },
    {
      href: '/registration/documents',
      label: 'PILIH SEKOLAH', 
      icon: FileText,
      activePaths: ['/registration/documents', '/registration/document-upload'], 
    },
    {
      href: '/registration/selection',
      label: 'STATUS PENDAFTARAN',
      icon: ClipboardCheck,
      activePaths: ['/registration/selection'],
    },
  ];

  const handleLogout = () => {
    // Clear registration progress
    removeFromLocalStorage(LOCAL_STORAGE_REGISTRATION_KEY);

    // Check if login credentials should be cleared
    const savedCredentials = getFromLocalStorage<LoginCredentials | null>(LOCAL_STORAGE_LOGIN_KEY, null);
    if (!savedCredentials || !savedCredentials.rememberMe) {
      removeFromLocalStorage(LOCAL_STORAGE_LOGIN_KEY);
    }
    router.push('/');
  };

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
                  <span className="font-semibold group-data-[state=collapsed]:hidden">Portal</span>
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
            <div className="font-semibold text-lg">Portal Pendaftaran</div>
          </header>
          <div className="flex flex-1 flex-col">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
