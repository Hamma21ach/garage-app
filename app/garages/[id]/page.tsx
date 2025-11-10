'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

type Garage = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  specialties: string[];
  photos: string[];
  isApproved: boolean;
  subscriptionActive: boolean;
  owner: {
    name: string;
    email: string;
  };
};

const specialtyLabels: Record<string, string> = {
  MECHANIC: 'Mechanic',
  ELECTRIC: 'Electric',
  BODY_REPAIR: 'Body Repair',
  ALL_SERVICES: 'All Services',
};

const specialtyIcons: Record<string, string> = {
  MECHANIC: '🔧',
  ELECTRIC: '⚡',
  BODY_REPAIR: '🛠️',
  ALL_SERVICES: '✨',
};

function GarageDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [garage, setGarage] = useState<Garage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    carModel: '',
    carYear: '',
    description: '',
    photos: [] as File[],
  });
  const [uploading, setUploading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    fetchGarage();
  }, [params.id]);

  const fetchGarage = async () => {
    try {
      const res = await fetch(`/api/garages/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setGarage(data);
      } else {
        router.push('/garages');
      }
    } catch (error) {
      console.error('Failed to fetch garage:', error);
      router.push('/garages');
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      router.push('/auth/login?redirect=/garages/' + params.id);
      return;
    }

    if (session.user.role !== 'USER') {
      alert('Only users can book appointments');
      return;
    }

    setUploading(true);

    try {
      // Upload photos if any
      let photoUrls: string[] = [];
      if (bookingForm.photos.length > 0) {
        const formData = new FormData();
        bookingForm.photos.forEach((photo) => {
          formData.append('files', photo);
        });

        const uploadRes = await fetch('/api/uploadthing?slug=appointmentImageUploader', {
          method: 'POST',
          body: formData,
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          photoUrls = uploadData.map((file: any) => file.url);
        }
      }

      // Create appointment
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          garageId: params.id,
          carModel: bookingForm.carModel,
          carYear: bookingForm.carYear,
          description: bookingForm.description,
          photos: photoUrls,
        }),
      });

      if (res.ok) {
        setBookingSuccess(true);
        setBookingForm({
          carModel: '',
          carYear: '',
          description: '',
          photos: [],
        });
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
          router.push('/dashboard');
        }, 2000);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to book appointment');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading garage details...</p>
        </div>
      </div>
    );
  }

  if (!garage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
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

            <div className="flex items-center space-x-4">
              <Link
                href="/garages"
                className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
              >
                ← Back to Garages
              </Link>
              {session?.user ? (
                <Link
                  href={
                    session.user.role === 'ADMIN'
                      ? '/admin/dashboard'
                      : session.user.role === 'OWNER'
                      ? '/owner/dashboard'
                      : '/dashboard'
                  }
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Garage Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Images Gallery */}
        {garage.photos && garage.photos.length > 0 && (
          <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {garage.photos.map((photo, index) => (
              <div key={index} className="relative h-64 rounded-xl overflow-hidden">
                <Image
                  src={photo}
                  alt={`${garage.name} - Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Premium Badge */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-gray-900">{garage.name}</h1>
                {garage.subscriptionActive && (
                  <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-bold rounded-full flex items-center gap-1">
                    ⭐ Premium
                  </span>
                )}
              </div>
              <p className="text-gray-600">Managed by {garage.owner.name}</p>
            </div>

            {/* Specialties */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
              <div className="flex flex-wrap gap-2">
                {garage.specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium flex items-center gap-2"
                  >
                    <span className="text-xl">{specialtyIcons[specialty]}</span>
                    {specialtyLabels[specialty]}
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            {garage.description && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {garage.description}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Contact & Booking */}
          <div className="space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
              
              <div className="space-y-4">
                {garage.address && (
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Address</p>
                      <p className="text-gray-600 text-sm">{garage.address}</p>
                    </div>
                  </div>
                )}

                {garage.phone && (
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">Phone</p>
                      <a href={`tel:${garage.phone}`} className="text-blue-600 hover:underline text-sm">
                        {garage.phone}
                      </a>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <a href={`mailto:${garage.owner.email}`} className="text-blue-600 hover:underline text-sm">
                      {garage.owner.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Button */}
            <button
              onClick={() => {
                if (!session?.user) {
                  router.push('/auth/login?redirect=/garages/' + params.id);
                } else if (session.user.role !== 'USER') {
                  alert('Only users can book appointments');
                } else {
                  setShowBookingModal(true);
                }
              }}
              className="w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              📅 Request Appointment
            </button>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full my-8 shadow-2xl relative">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Request Appointment</h2>
                <button
                  onClick={() => setShowBookingModal(false)}
                  className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white/20 rounded-lg"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-blue-100 mt-2">Fill in the details for your appointment request</p>
            </div>

            {bookingSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Appointment Requested!</h3>
                <p className="text-gray-600">The garage will review your request and get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="p-6 space-y-6">
                {/* Car Model */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Car Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Toyota Camry, Honda Civic"
                    value={bookingForm.carModel}
                    onChange={(e) => setBookingForm({ ...bookingForm, carModel: e.target.value })}
                    required
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                {/* Car Year */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Year <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 2020"
                    value={bookingForm.carYear}
                    onChange={(e) => setBookingForm({ ...bookingForm, carYear: e.target.value })}
                    required
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Problem Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Describe the issue with your car..."
                    value={bookingForm.description}
                    onChange={(e) => setBookingForm({ ...bookingForm, description: e.target.value })}
                    required
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100 text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                {/* Photos */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Photos (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setBookingForm({ ...bookingForm, photos: files });
                    }}
                    disabled={uploading}
                    className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:bg-gray-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">Upload photos of the issue (max 5 images)</p>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    disabled={uploading}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-semibold disabled:opacity-50"
                  >
                    {uploading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Request'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function GarageDetailsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <GarageDetailsContent />
    </Suspense>
  );
}
