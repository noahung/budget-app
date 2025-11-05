"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useDoc } from '@/firebase';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save, User } from 'lucide-react';
import Link from 'next/link';

interface ProfileData {
  householdSize?: number;
  location?: string;
  occupation?: string;
  currency?: string;
}

export default function ProfilePage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();

  const profileDocRef = useMemoFirebase(
    () => (user ? doc(firestore, 'users', user.uid, 'profile', 'data') : null),
    [firestore, user]
  );

  const { data: profileData, isLoading: isProfileLoading } = useDoc<ProfileData>(profileDocRef);

  const [householdSize, setHouseholdSize] = useState<number>(1);
  const [location, setLocation] = useState<string>('');
  const [occupation, setOccupation] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  useEffect(() => {
    if (profileData) {
      setHouseholdSize(profileData.householdSize || 1);
      setLocation(profileData.location || '');
      setOccupation(profileData.occupation || '');
      setCurrency(profileData.currency || 'USD');
    }
  }, [profileData]);

  const handleSave = async () => {
    if (!profileDocRef) return;

    setIsSaving(true);
    try {
      await setDocumentNonBlocking(
        profileDocRef,
        {
          householdSize,
          location,
          occupation,
          currency,
        },
        { merge: true }
      );
      toast({
        title: "Profile saved!",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error saving profile",
        description: "There was an error saving your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 md:p-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="shadow-neumorphic">
        <CardHeader>
          <div className="flex items-center gap-4">
            <User className="w-8 h-8 text-primary" />
            <div>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Manage your profile information for personalized AI recommendations
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="household-size">Number of People in Household</Label>
            <Input
              id="household-size"
              type="number"
              min="1"
              value={householdSize}
              onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 1)}
              className="shadow-neumorphic-inset border-none focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (City, State/Country)</Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="shadow-neumorphic-inset border-none focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation</Label>
            <Input
              id="occupation"
              type="text"
              placeholder="e.g., Software Engineer"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="shadow-neumorphic-inset border-none focus-visible:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger id="currency" className="shadow-neumorphic-inset border-none focus:ring-primary">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">🇺🇸 USD - US Dollar</SelectItem>
                <SelectItem value="EUR">🇪🇺 EUR - Euro</SelectItem>
                <SelectItem value="GBP">🇬🇧 GBP - British Pound</SelectItem>
                <SelectItem value="JPY">🇯🇵 JPY - Japanese Yen</SelectItem>
                <SelectItem value="CNY">🇨🇳 CNY - Chinese Yuan</SelectItem>
                <SelectItem value="INR">🇮🇳 INR - Indian Rupee</SelectItem>
                <SelectItem value="AUD">🇦🇺 AUD - Australian Dollar</SelectItem>
                <SelectItem value="CAD">🇨🇦 CAD - Canadian Dollar</SelectItem>
                <SelectItem value="SGD">🇸🇬 SGD - Singapore Dollar</SelectItem>
                <SelectItem value="CHF">🇨🇭 CHF - Swiss Franc</SelectItem>
                <SelectItem value="KRW">🇰🇷 KRW - South Korean Won</SelectItem>
                <SelectItem value="THB">🇹🇭 THB - Thai Baht</SelectItem>
                <SelectItem value="MYR">🇲🇾 MYR - Malaysian Ringgit</SelectItem>
                <SelectItem value="VND">🇻🇳 VND - Vietnamese Dong</SelectItem>
                <SelectItem value="IDR">🇮🇩 IDR - Indonesian Rupiah</SelectItem>
                <SelectItem value="PHP">🇵🇭 PHP - Philippine Peso</SelectItem>
                <SelectItem value="MMK">🇲🇲 MMK - Myanmar Kyat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full shadow-neumorphic active:shadow-neumorphic-inset"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
