
"use client";

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { getApplicants, type ApplicantStatus } from '@/lib/applicantService';
import { CardDescription } from '@/components/ui/card';

export function StatusCheckForm() {
  const [nisnCheck, setNisnCheck] = React.useState('');
  const [checkResult, setCheckResult] = React.useState<React.ReactNode>(null);
  const [isChecking, setIsChecking] = React.useState(false);

  const getStatusBadgeVariant = (status: ApplicantStatus): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "Terverifikasi": return "default";
      case "Menunggu Verifikasi": return "secondary";
      case "Berkas tidak sesuai": return "destructive";
      case "Dibatalkan": return "destructive";
      default: return "secondary";
    }
  };

  const handleStatusCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nisnCheck) {
        setCheckResult(<p className="text-destructive">Harap masukkan NISN.</p>);
        return;
    }
    
    setIsChecking(true);
    setCheckResult(null);

    // Using setTimeout to simulate network delay, but can be removed.
    // In a real app, this would be an async call.
    setTimeout(() => {
        const applicant = getApplicants().find(app => app.nisn === nisnCheck.trim());
        if (applicant) {
            setCheckResult(
                <>
                    <p className="font-medium">Status untuk: {applicant.fullName}</p>
                    <Badge variant={getStatusBadgeVariant(applicant.statusVerifikasi)} className="mt-2 text-base px-4 py-1">
                        {applicant.statusVerifikasi}
                    </Badge>
                    {applicant.statusVerifikasi === 'Berkas tidak sesuai' && (
                        <p className="text-sm text-destructive mt-2 italic">"{applicant.rejectionReason || 'Ada berkas yang tidak valid. Silakan login untuk perbaikan.'}"</p>
                    )}
                </>
            );
        } else {
            setCheckResult(<p className="text-destructive">Pendaftar dengan NISN tersebut tidak ditemukan.</p>);
        }
        setIsChecking(false);
    }, 500);
  };

  return (
    <>
      <CardDescription className="text-center mb-6">Masukkan NISN Anda untuk melihat status verifikasi dan hasil seleksi.</CardDescription>
      <form onSubmit={handleStatusCheck} className="flex w-full items-start space-x-2">
        <Input 
          type="text" 
          placeholder="Masukkan NISN Anda..."
          value={nisnCheck}
          onChange={(e) => setNisnCheck(e.target.value)}
          disabled={isChecking}
        />
        <Button type="submit" disabled={isChecking || !nisnCheck}>
          {isChecking ? 'Mencari...' : <><Search className="mr-2 h-4 w-4" /> Cek</>}
        </Button>
      </form>
      {checkResult && (
        <div className="mt-6 text-center border-t pt-6">
          {checkResult}
        </div>
      )}
    </>
  );
}
