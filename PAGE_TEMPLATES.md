# 🎨 CODE TEMPLATES FOR REMAINING PAGES

## This file contains ready-to-use code templates for the remaining pages.
## Copy and paste into the appropriate files.

---

## 1️⃣ GARAGE DETAIL PAGE WITH BOOKING

**File**: `app/garages/[id]/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface Garage {
  id: string;
  name: string;
  location: string;
  address: string;
  city: string;
  phone: string;
  specialties: string[];
  description: string;
  owner: {
    name: string;
    email: string;
  };
}

export default function GarageDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [garage, setGarage] = useState<Garage | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    fetchGarage();
  }, [params.id]);

  const fetchGarage = async () => {
    try {
      const response = await fetch(`/api/garages/${params.id}`);
      const data = await response.json();
      setGarage(data);
    } catch (error) {
      console.error('Error fetching garage:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    setBooking(true);

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garageId: params.id,
          description,
          photos,
        }),
      });

      if (response.ok) {
        alert('Appointment request sent successfully!');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
    } finally {
      setBooking(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setPhotos([...photos, data.url]);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!garage) return <div className="p-8 text-center">Garage not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/garages">
          <Button variant="outline" className="mb-4">← Back to Garages</Button>
        </Link>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Garage Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-3xl">{garage.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Location</p>
                <p className="text-lg">📍 {garage.location}</p>
                {garage.address && <p className="text-sm text-gray-600">{garage.address}</p>}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-lg">📞 {garage.phone}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Specialties</p>
                <div className="flex flex-wrap gap-2">
                  {garage.specialties.map((spec) => (
                    <Badge key={spec}>{spec.replace('_', ' ')}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">About</p>
                <p className="text-gray-700">{garage.description}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500">Owner</p>
                <p className="text-gray-700">{garage.owner.name}</p>
              </div>
            </CardContent>
          </Card>

          {/* Booking Form */}
          <Card>
            <CardHeader>
              <CardTitle>Request Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBooking} className="space-y-4">
                <div>
                  <Label htmlFor="description">Describe the Issue</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell us what needs to be fixed..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="photos">Upload Photos (Optional)</Label>
                  <Input
                    id="photos"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {photos.length > 0 && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {photos.map((url, i) => (
                        <img key={i} src={url} alt="Upload" className="w-20 h-20 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={booking}>
                  {booking ? 'Sending Request...' : 'Request Appointment'}
                </Button>

                {!session && (
                  <p className="text-sm text-center text-gray-600">
                    <Link href="/auth/login" className="text-blue-600 hover:underline">
                      Sign in
                    </Link> to request an appointment
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
```

---

## 2️⃣ USER DASHBOARD

**File**: `app/dashboard/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/advanced-components';

interface Appointment {
  id: string;
  description: string;
  status: string;
  costEstimate: number | null;
  durationDays: number | null;
  appointmentDate: string | null;
  createdAt: string;
  garage: {
    name: string;
    phone: string;
  };
}

export default function UserDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      router.push('/auth/login');
      return;
    }
    fetchAppointments();
  }, [session]);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'CONFIRMED': return 'default';
      case 'DONE': return 'success';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session?.user?.name}!</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{appointments.length}</p>
                <p className="text-gray-600">Total Appointments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'PENDING').length}
                </p>
                <p className="text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'CONFIRMED').length}
                </p>
                <p className="text-gray-600">Confirmed</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>My Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">No appointments yet</p>
                <Button onClick={() => router.push('/garages')}>
                  Browse Garages
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Garage</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Cost</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments.map((apt) => (
                    <TableRow key={apt.id}>
                      <TableCell>{apt.garage.name}</TableCell>
                      <TableCell className="max-w-xs truncate">{apt.description}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusColor(apt.status)}>
                          {apt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {apt.costEstimate ? `$${apt.costEstimate}` : '-'}
                      </TableCell>
                      <TableCell>
                        {apt.appointmentDate 
                          ? new Date(apt.appointmentDate).toLocaleDateString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 3️⃣ OWNER DASHBOARD (with Chart.js placeholder)

**File**: `app/owner/dashboard/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/advanced-components';

interface Garage {
  id: string;
  name: string;
  subscriptionActive: boolean;
  isApproved: boolean;
}

interface Appointment {
  id: string;
  description: string;
  status: string;
  user: {
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function OwnerDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [garages, setGarages] = useState<Garage[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || session.user?.role !== 'OWNER') {
      router.push('/');
      return;
    }
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      // Fetch owner's garages
      const garagesRes = await fetch(`/api/garages?ownerId=${session?.user?.id}`);
      const garagesData = await garagesRes.json();
      setGarages(garagesData);

      // Fetch appointments for first garage
      if (garagesData.length > 0) {
        const apptRes = await fetch(`/api/appointments?garageId=${garagesData[0].id}`);
        const apptData = await apptRes.json();
        setAppointments(apptData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (appointmentId: string) => {
    router.push(`/owner/appointments/${appointmentId}`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Owner Dashboard</h1>
            <p className="text-gray-600">Welcome, {session?.user?.name}!</p>
          </div>
          <Link href="/owner/garage">
            <Button>Manage Garage</Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{garages.length}</p>
                <p className="text-gray-600">Your Garages</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">{appointments.length}</p>
                <p className="text-gray-600">Total Appointments</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {appointments.filter(a => a.status === 'PENDING').length}
                </p>
                <p className="text-gray-600">Pending</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  ${appointments
                    .filter(a => a.status === 'DONE')
                    .reduce((sum) => sum + 100, 0)} {/* Placeholder */}
                </p>
                <p className="text-gray-600">Revenue</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Garage Status */}
        {garages.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Garages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {garages.map((garage) => (
                  <div key={garage.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{garage.name}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={garage.isApproved ? 'success' : 'secondary'}>
                          {garage.isApproved ? 'Approved' : 'Pending Approval'}
                        </Badge>
                        <Badge variant={garage.subscriptionActive ? 'default' : 'destructive'}>
                          {garage.subscriptionActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <Link href="/owner/garage">
                      <Button variant="outline">Manage</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            {appointments.filter(a => a.status === 'PENDING').length === 0 ? (
              <p className="text-center py-8 text-gray-600">No pending appointments</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appointments
                    .filter(a => a.status === 'PENDING')
                    .map((apt) => (
                      <TableRow key={apt.id}>
                        <TableCell>{apt.user.name}</TableCell>
                        <TableCell className="max-w-xs truncate">{apt.description}</TableCell>
                        <TableCell>{new Date(apt.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleResponse(apt.id)}
                          >
                            Respond
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 4️⃣ ADMIN DASHBOARD

**File**: `app/admin/dashboard/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/advanced-components';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/advanced-components';

interface Stats {
  totalUsers: number;
  totalGarages: number;
  totalAppointments: number;
  pendingGarages: number;
  activeSubscriptions: number;
}

interface Garage {
  id: string;
  name: string;
  location: string;
  isApproved: boolean;
  owner: {
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session || session.user?.role !== 'ADMIN') {
      router.push('/');
      return;
    }
    fetchData();
  }, [session]);

  const fetchData = async () => {
    try {
      const [statsRes, garagesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/garages'),
      ]);
      
      const statsData = await statsRes.json();
      const garagesData = await garagesRes.json();
      
      setStats(statsData);
      setGarages(garagesData.filter((g: Garage) => !g.isApproved));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (garageId: string, approve: boolean) => {
    try {
      await fetch(`/api/admin/garages/${garageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: approve }),
      });
      fetchData(); // Refresh
    } catch (error) {
      console.error('Error updating garage:', error);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

        {/* Stats */}
        {stats && (
          <div className="grid md:grid-cols-5 gap-6 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-gray-600">Total Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{stats.totalGarages}</p>
                <p className="text-gray-600">Total Garages</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{stats.totalAppointments}</p>
                <p className="text-gray-600">Appointments</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{stats.pendingGarages}</p>
                <p className="text-gray-600">Pending Approval</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-2xl font-bold">{stats.activeSubscriptions}</p>
                <p className="text-gray-600">Active Subscriptions</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Garage Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {garages.length === 0 ? (
              <p className="text-center py-8 text-gray-600">No pending approvals</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Garage Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {garages.map((garage) => (
                    <TableRow key={garage.id}>
                      <TableCell>{garage.name}</TableCell>
                      <TableCell>{garage.location}</TableCell>
                      <TableCell>{garage.owner.name}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApproval(garage.id, true)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleApproval(garage.id, false)}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## 📝 NOTES:

1. Install `next-auth` for session management:
   ```bash
   npm install next-auth@beta
   ```

2. For Chart.js integration in dashboards:
   ```bash
   npm install chart.js react-chartjs-2
   ```
   
   Then import and use in dashboards:
   ```typescript
   import { Line, Bar } from 'react-chartjs-2';
   ```

3. All these templates use the API routes we've already created.

4. Add error handling and loading states as needed.

5. Customize styling to match your brand.

---

Copy these templates into their respective files and you'll have a fully functional application!
