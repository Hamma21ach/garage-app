'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { Suspense } from 'react';

type Garage = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  specialties: string[];
  isApproved: boolean;
  subscriptionActive: boolean;
  images: string[];
  _count: {
    appointments: number;
  };
};

type Appointment = {
  id: string;
  carModel: string;
  description: string;
  status: 'PENDING' | 'CONFIRMED' | 'DONE' | 'CANCELLED';
  costEstimate: number | null;
  durationDays: number | null;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
};

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CONFIRMED: 'bg-blue-100 text-blue-800 border-blue-200',
  DONE: 'bg-green-100 text-green-800 border-green-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
};

function OwnerDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [garages, setGarages] = useState<Garage[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments'>('overview');
  const [editingAppointment, setEditingAppointment] = useState<string | null>(null);
  const [estimateForm, setEstimateForm] = useState({ costEstimate: 0, durationDays: 0 });
  const [appointmentFilter, setAppointmentFilter] = useState<'ALL' | 'PENDING' | 'CONFIRMED' | 'DONE'>('ALL');

  // Handle subscription success from Stripe
  useEffect(() => {
    const subscriptionSuccess = searchParams.get('subscription');
    const garageId = searchParams.get('garageId');
    const plan = searchParams.get('plan');

    if (subscriptionSuccess === 'success' && garageId && plan) {
      activateSubscription(garageId, plan);
    }
  }, [searchParams]);

  const activateSubscription = async (garageId: string, plan: string) => {
    try {
      const res = await fetch('/api/stripe/activate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ garageId, plan }),
      });

      if (res.ok) {
        // Refresh data to show updated subscription status
        fetchData();
        // Clean URL
        router.replace('/owner/dashboard');
      }
    } catch (error) {
      console.error('Failed to activate subscription:', error);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.role !== 'OWNER') {
      router.push('/');
    } else if (status === 'authenticated') {
      fetchData();
    }
  }, [status, session, router]);

  const fetchData = async () => {
    try {
      const [garagesRes, appointmentsRes] = await Promise.all([
        fetch('/api/garages'),
        fetch('/api/appointments'),
      ]);

      const garagesData = await garagesRes.json();
      const appointmentsData = await appointmentsRes.json();

      setGarages(Array.isArray(garagesData) ? garagesData : []);
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      setGarages([]);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppointment = async (id: string, updates: any) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to update appointment:', error);
    }
  };

  const stats = {
    totalGarages: garages.length,
    approvedGarages: garages.filter((g) => g.isApproved).length,
    activeSubscriptions: garages.filter((g) => g.subscriptionActive).length,
    totalAppointments: Array.isArray(appointments) ? appointments.length : 0,
    pendingAppointments: Array.isArray(appointments) ? appointments.filter((a) => a.status === 'PENDING').length : 0,
    confirmedAppointments: Array.isArray(appointments) ? appointments.filter((a) => a.status === 'CONFIRMED').length : 0,
    completedAppointments: Array.isArray(appointments) ? appointments.filter((a) => a.status === 'DONE').length : 0,
    totalRevenue: Array.isArray(appointments)
      ? appointments
          .filter((a) => a.status === 'DONE' && a.costEstimate)
          .reduce((sum, a) => sum + (a.costEstimate || 0), 0)
      : 0,
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">G</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                GaragePro
              </span>
            </Link>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden lg:block text-sm text-gray-600">Owner Portal</span>
              <div className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg border border-blue-200">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                  {session?.user?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">{session?.user?.name}</span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="px-3 sm:px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Exit</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">Owner Dashboard</h1>
              <p className="text-blue-100 text-base sm:text-lg">Manage your garages and appointments</p>
            </div>
            <Link
              href="/owner/garage"
              className="sm:hidden md:flex px-4 sm:px-6 py-2 sm:py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-lg text-center text-sm sm:text-base"
            >
              + Add New Garage
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Quick Actions - Mobile Only */}
        <div className="md:hidden mb-4">
          <Link
            href="/owner/garage"
            className="flex items-center justify-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all font-semibold shadow-lg border border-blue-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Garage
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Garages</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalGarages}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🏢</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Approved</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{stats.approvedGarages}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Active Subs</p>
                <p className="text-3xl font-bold text-purple-600 mt-1">{stats.activeSubscriptions}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-blue-600 mt-1">${stats.totalRevenue.toFixed(0)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
            <p className="text-gray-600 text-sm font-medium mb-2">Total Appointments</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
            <p className="text-yellow-700 text-sm font-medium mb-2">Pending</p>
            <p className="text-2xl font-bold text-yellow-800">{stats.pendingAppointments}</p>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
            <p className="text-blue-700 text-sm font-medium mb-2">Confirmed</p>
            <p className="text-2xl font-bold text-blue-800">{stats.confirmedAppointments}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
            <p className="text-green-700 text-sm font-medium mb-2">Completed</p>
            <p className="text-2xl font-bold text-green-800">{stats.completedAppointments}</p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-2 sm:gap-4 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            My Garages
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 sm:px-6 py-3 font-semibold transition-all whitespace-nowrap text-sm sm:text-base ${
              activeTab === 'appointments'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="hidden sm:inline">Appointments</span>
            <span className="sm:hidden">Appts</span> ({stats.pendingAppointments} pending)
          </button>
        </div>

        {/* Garages Tab */}
        {activeTab === 'overview' && (
          <div>
            {garages.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl">🏢</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Garages Yet</h3>
                <p className="text-gray-600 mb-6">Get started by adding your first garage to the platform</p>
                <Link
                  href="/owner/garage"
                  className="inline-flex px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold shadow-lg"
                >
                  + Add Your Garage
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {garages.map((garage) => (
                  <div
                    key={garage.id}
                    className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-blue-100 to-indigo-100">
                      {garage.images && garage.images.length > 0 ? (
                        <img src={garage.images[0]} alt={garage.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl opacity-30">🔧</span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-2">
                        {garage.isApproved ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            ✓ Approved
                          </span>
                        ) : (
                          <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            ⏳ Pending Approval
                          </span>
                        )}
                        {garage.subscriptionActive && (
                          <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            ⭐ Premium
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{garage.name}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{garage.description || 'No description'}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {garage.specialties.map((specialty) => (
                          <span
                            key={specialty}
                            className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200"
                          >
                            {specialty.replace('_', ' ')}
                          </span>
                        ))}
                      </div>

                      <div className="space-y-2 mb-4">
                        {garage.address && (
                          <div className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            {garage.address}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {garage._count.appointments} appointments
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/owner/garage?id=${garage.id}`}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center justify-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                        {!garage.subscriptionActive && (
                          <Link
                            href={`/owner/subscription?garageId=${garage.id}`}
                            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-medium flex items-center"
                            title="Upgrade to Premium"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appointments Tab */}
        {activeTab === 'appointments' && (
          <div>
            {/* Appointment Filters */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
              {['ALL', 'PENDING', 'CONFIRMED', 'DONE'].map((status) => (
                <button
                  key={status}
                  onClick={() => setAppointmentFilter(status as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                    appointmentFilter === status
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-blue-300'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
                  {status !== 'ALL' && ` (${appointments.filter((a) => a.status === status).length})`}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {appointments.filter((a) => appointmentFilter === 'ALL' || a.status === appointmentFilter).length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-4xl">📅</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {appointmentFilter === 'ALL' ? 'No Appointments' : `No ${appointmentFilter} Appointments`}
                  </h3>
                  <p className="text-gray-600">
                    {appointmentFilter === 'ALL' 
                      ? 'Appointments from customers will appear here'
                      : `You don't have any ${appointmentFilter.toLowerCase()} appointments`}
                  </p>
                </div>
              ) : (
                appointments
                  .filter((a) => appointmentFilter === 'ALL' || a.status === appointmentFilter)
                  .map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
                >
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{appointment.carModel}</h3>
                          <p className="text-sm text-gray-600">Customer: {appointment.user.name}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusColors[appointment.status]}`}>
                          {appointment.status}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-4">{appointment.description}</p>

                      <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          {appointment.user.email}
                        </div>
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(appointment.createdAt).toLocaleDateString()}
                        </div>
                        {appointment.costEstimate && (
                          <div className="flex items-center text-green-600 font-medium">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            ${appointment.costEstimate.toFixed(2)}
                          </div>
                        )}
                        {appointment.durationDays && (
                          <div className="flex items-center text-blue-600 font-medium">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {appointment.durationDays} days
                          </div>
                        )}
                      </div>

                      {/* Estimate Form for Pending Appointments */}
                      {appointment.status === 'PENDING' && editingAppointment === appointment.id && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                          <h4 className="font-semibold text-blue-900 mb-3">Set Estimate & Duration</h4>
                          <div className="grid md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cost Estimate ($)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={estimateForm.costEstimate}
                                onChange={(e) => setEstimateForm({ ...estimateForm, costEstimate: parseFloat(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="100.00"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Duration (days)
                              </label>
                              <input
                                type="number"
                                min="1"
                                value={estimateForm.durationDays}
                                onChange={(e) => setEstimateForm({ ...estimateForm, durationDays: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="3"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex lg:flex-col gap-2">
                      {appointment.status === 'PENDING' && (
                        <>
                          {editingAppointment === appointment.id ? (
                            <>
                              <button
                                onClick={() => {
                                  handleUpdateAppointment(appointment.id, {
                                    status: 'CONFIRMED',
                                    costEstimate: estimateForm.costEstimate,
                                    durationDays: estimateForm.durationDays,
                                  });
                                  setEditingAppointment(null);
                                  setEstimateForm({ costEstimate: 0, durationDays: 0 });
                                }}
                                disabled={estimateForm.costEstimate <= 0 || estimateForm.durationDays <= 0}
                                className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
                              >
                                Confirm with Estimate
                              </button>
                              <button
                                onClick={() => {
                                  setEditingAppointment(null);
                                  setEstimateForm({ costEstimate: 0, durationDays: 0 });
                                }}
                                className="flex-1 lg:flex-none px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingAppointment(appointment.id);
                                  setEstimateForm({
                                    costEstimate: appointment.costEstimate || 0,
                                    durationDays: appointment.durationDays || 0,
                                  });
                                }}
                                className="flex-1 lg:flex-none px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                              >
                                Set Estimate
                              </button>
                              <button
                                onClick={() => handleUpdateAppointment(appointment.id, { status: 'CANCELLED' })}
                                className="flex-1 lg:flex-none px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </>
                      )}
                      {appointment.status === 'CONFIRMED' && (
                        <button
                          onClick={() => handleUpdateAppointment(appointment.id, { status: 'DONE' })}
                          className="flex-1 lg:flex-none px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function OwnerDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    }>
      <OwnerDashboard />
    </Suspense>
  );
}

export default OwnerDashboardPage;
