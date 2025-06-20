
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, UserCircle } from 'lucide-react';

export default function BiodataPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto bg-primary text-primary-foreground rounded-full p-3 w-fit mb-4">
            <UserCircle size={32} />
          </div>
          <CardTitle className="text-2xl font-headline">Registration Biodata</CardTitle>
          <CardDescription>
            Please fill in your biodata to complete the registration process.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            This is where the biodata form will be. For now, it's a placeholder.
          </p>
          {/* Placeholder for biodata form elements */}
          <div className="space-y-4 my-8">
            <div className="h-10 w-full bg-muted rounded-md animate-pulse"></div>
            <div className="h-10 w-full bg-muted rounded-md animate-pulse delay-75"></div>
            <div className="h-20 w-full bg-muted rounded-md animate-pulse delay-150"></div>
          </div>
          <Button asChild variant="outline">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
