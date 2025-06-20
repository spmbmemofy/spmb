
"use client";

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

interface RegistrationLayoutProps {
  children: ReactNode;
}

export default function RegistrationLayout({ children }: RegistrationLayoutProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      href: '/registration/dashboard',
      label: 'BERANDA',
      icon: Home,
      activePaths: ['/registration/dashboard', '/registration/school'], 
    },
    {
      href: '/registration/biodata',
      label: 'PROFIL',
      icon: User,
      activePaths: ['/registration/biodata'],
    },
    {
      href: '/registration/documents',
      label: 'PILIH SEKOLAH', // This will lead to document upload as well
      icon: FileText,
      activePaths: ['/registration/documents', '/registration/document-upload'], 
    },
    {
      href: '/registration/selection',
      label: 'SELEKSI',
      icon: ClipboardCheck,
      activePaths: ['/registration/selection'],
    },
  ];

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
                <SidebarMenuButton asChild tooltip={{ children: 'Keluar', side: 'right' }}>
                  <Link href="/">
                    <LogOut />
                    <span className="group-data-[state=collapsed]:hidden">Keluar</span>
                  </Link>
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
