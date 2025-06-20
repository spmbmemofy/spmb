
"use client";

import * as React from "react";
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { UserCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Mock data
const biodataDetails = {
  fullName: "Ahmad Budi Santoso",
  nisn: "1234567890",
  placeOfBirth: "Jakarta",
  dateOfBirth: "2008-05-15",
  gender: "Male",
  religion: "Islam",
  address: "Jl. Merdeka No. 10, RT 05 RW 02, Kel. Cempaka Putih, Kec. Menteng, Jakarta Pusat, DKI Jakarta 10310",
  previousSchool: "SMP Negeri 1 Jakarta Pusat",
  fatherName: "Bambang Santoso",
  motherName: "Siti Aminah",
  guardianName: "-",
  contactNumber: "081234567890",
};

const reportCardGradesData = [
  { subject: "Mathematics", semester1: 85, semester2: 88, semester3: 90, semester4: 87, semester5: 92 },
  { subject: "Natural Sciences (IPA)", semester1: 88, semester2: 90, semester3: 85, semester4: 89, semester5: 91 },
  { subject: "Social Sciences (IPS)", semester1: 86, semester2: 84, semester3: 89, semester4: 85, semester5: 88 },
  { subject: "Indonesian Language", semester1: 90, semester2: 87, semester3: 88, semester4: 92, semester5: 89 },
  { subject: "English Language", semester1: 82, semester2: 85, semester3: 87, semester4: 88, semester5: 90 },
  { subject: "Civics (PKN)", semester1: 87, semester2: 88, semester3: 86, semester4: 90, semester5: 89 },
];

const calculateAverage = (grades: typeof reportCardGradesData[0]) => {
  const allGrades = [grades.semester1, grades.semester2, grades.semester3, grades.semester4, grades.semester5];
  const validGrades = allGrades.filter(grade => typeof grade === 'number');
  if (validGrades.length === 0) return "N/A";
  return (validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length).toFixed(2);
};

interface BiodataItemProps {
  label: string;
  value: string | number | undefined;
}

const BiodataItem: React.FC<BiodataItemProps> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-muted-foreground">{label}</p>
    <p className="text-md sm:text-lg">{value || "-"}</p>
  </div>
);

export default function BiodataPage() {
  const { toast } = useToast();
  const [isConfirmed, setIsConfirmed] = React.useState(false);

  const handleConfirm = () => {
    setIsConfirmed(true);
    toast({
      title: "Biodata Confirmed",
      description: "Your biodata and report card grades have been confirmed. Proceeding to the next step.",
    });
    // Here you would typically navigate to the next step, e.g.:
    // router.push('/registration/next-step');
    console.log("Biodata confirmed, ready for next step.");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <UserCircle size={40} />
          </div>
          <CardTitle className="text-3xl font-headline">Applicant Biodata & Grades</CardTitle>
          <CardDescription className="text-md">
            Please review your biodata and report card grades below. This information has been pre-filled by your previous school's administration.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-left">
              <BiodataItem label="Full Name" value={biodataDetails.fullName} />
              <BiodataItem label="NISN" value={biodataDetails.nisn} />
              <BiodataItem label="Place of Birth" value={biodataDetails.placeOfBirth} />
              <BiodataItem label="Date of Birth" value={biodataDetails.dateOfBirth} />
              <BiodataItem label="Gender" value={biodataDetails.gender} />
              <BiodataItem label="Religion" value={biodataDetails.religion} />
              <BiodataItem label="Full Address" value={biodataDetails.address} />
              <BiodataItem label="Previous School" value={biodataDetails.previousSchool} />
              <BiodataItem label="Father's Name" value={biodataDetails.fatherName} />
              <BiodataItem label="Mother's Name" value={biodataDetails.motherName} />
              <BiodataItem label="Guardian's Name (if any)" value={biodataDetails.guardianName} />
              <BiodataItem label="Contact Number (Student/Parent)" value={biodataDetails.contactNumber} />
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4 text-primary">Report Card Grades (SMP/MTs)</h2>
            <div className="overflow-x-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold">Subject</TableHead>
                    <TableHead className="text-center font-semibold">Sem 1</TableHead>
                    <TableHead className="text-center font-semibold">Sem 2</TableHead>
                    <TableHead className="text-center font-semibold">Sem 3</TableHead>
                    <TableHead className="text-center font-semibold">Sem 4</TableHead>
                    <TableHead className="text-center font-semibold">Sem 5</TableHead>
                    <TableHead className="text-right font-semibold">Average</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportCardGradesData.map((grade) => (
                    <TableRow key={grade.subject}>
                      <TableCell className="font-medium">{grade.subject}</TableCell>
                      <TableCell className="text-center">{grade.semester1 ?? '-'}</TableCell>
                      <TableCell className="text-center">{grade.semester2 ?? '-'}</TableCell>
                      <TableCell className="text-center">{grade.semester3 ?? '-'}</TableCell>
                      <TableCell className="text-center">{grade.semester4 ?? '-'}</TableCell>
                      <TableCell className="text-center">{grade.semester5 ?? '-'}</TableCell>
                      <TableCell className="text-right font-medium">{calculateAverage(grade)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Grades are on a scale of 0-100.</p>
          </section>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-6 gap-4">
            <Button variant="outline" asChild>
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Login / Logout
                </Link>
            </Button>
            <Button 
              size="lg" 
              onClick={handleConfirm} 
              disabled={isConfirmed}
              className="w-full sm:w-auto"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              {isConfirmed ? "Confirmed" : "Confirm and Continue"}
            </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
