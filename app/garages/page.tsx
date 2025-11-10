'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

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
  owner: {
    name: string;
  };
};

type Specialty = 'ALL' | 'MECHANIC' | 'ELECTRIC' | 'BODY_REPAIR' | 'ALL_SERVICES';

const specialtyLabels: Record<Specialty, string> = {
  ALL: 'All Services',
  MECHANIC: 'Mechanical',
  ELECTRIC: 'Electrical',
  BODY_REPAIR: 'Body Repair',
  ALL_SERVICES: 'All Services',
};

const specialtyIcons: Record<Specialty, string> = {
  ALL: '🔧',
  MECHANIC: '🔧',
  ELECTRIC: '⚡',
  BODY_REPAIR: '🎨',
  ALL_SERVICES: '✨',
};

const specialtyColors: Record<Specialty, string> = {
  ALL: 'bg-gray-100 text-gray-700 border-gray-200',
  MECHANIC: 'bg-blue-100 text-blue-700 border-blue-200',
  ELECTRIC: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  BODY_REPAIR: 'bg-purple-100 text-purple-700 border-purple-200',
  ALL_SERVICES: 'bg-green-100 text-green-700 border-green-200',
};

export default function GaragesPage() {
  const { data: session } = useSession();
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Specialty>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchGarages();
  }, [filter]);

  const fetchGarages = async () => {
    setLoading(true);
    try {
      const url = filter === 'ALL' ? '/api/garages' : `/api/garages?specialty=${filter}`;
      const res = await fetch(url);
      const data = await res.json();
      setGarages(data);
    } catch (error) {
      console.error('Failed to fetch garages:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredGarages = garages.filter(garage =>
    searchQuery === '' || 
    garage.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    garage.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              {session ? (
                <>
                  <Link
                    href={
                      session.user.role === 'ADMIN'
                        ? '/admin/dashboard'
                        : session.user.role === 'OWNER'
                        ? '/owner/dashboard'
                        : '/dashboard'
                    }
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {session.user.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{session.user.name}</span>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Find Your Perfect Garage</h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Browse through our verified garages and find the perfect match for your car repair needs
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by garage name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pl-12 rounded-xl text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none shadow-lg"
              />
              <svg
                className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filter by Specialty</h2>
            <div className="text-sm text-gray-600">
              {filteredGarages.length} garage{filteredGarages.length !== 1 ? 's' : ''} found
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {(Object.keys(specialtyLabels) as Specialty[]).map((specialty) => (
              <button
                key={specialty}
                onClick={() => setFilter(specialty)}
                className={`px-4 py-2 rounded-lg font-medium transition-all border ${
                  filter === specialty
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-blue-600 hover:text-blue-600'
                }`}
              >
                <span className="mr-2">{specialtyIcons[specialty]}</span>
                {specialtyLabels[specialty]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Garages Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <svg
                  className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-gray-600">Loading garages...</p>
              </div>
            </div>
          ) : filteredGarages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No Garages Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery
                  ? `No garages match "${searchQuery}". Try adjusting your search.`
                  : `No garages available for ${specialtyLabels[filter]}. Try a different specialty.`}
              </p>
              <button
                onClick={() => {
                  setFilter('ALL');
                  setSearchQuery('');
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGarages.map((garage) => (
                <div
                  key={garage.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow border border-gray-100 overflow-hidden group"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                    {garage.images && garage.images.length > 0 ? (
                      <img
                        src={garage.images[0]}
                        alt={garage.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-30">🔧</span>
                      </div>
                    )}
                    {garage.subscriptionActive && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center shadow-lg">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Verified
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {garage.name}
                      </h3>
                    </div>

                    {garage.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{garage.description}</p>
                    )}

                    {/* Info */}
                    <div className="space-y-2 mb-4">
                      {garage.address && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate">{garage.address}</span>
                        </div>
                      )}
                      {garage.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {garage.phone}
                        </div>
                      )}
                      <div className="flex items-center text-sm text-gray-600">
                        <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Owner: {garage.owner.name}
                      </div>
                    </div>

                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {garage.specialties.map((specialty) => (
                        <span
                          key={specialty}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            specialtyColors[specialty as Specialty]
                          }`}
                        >
                          <span className="mr-1">{specialtyIcons[specialty as Specialty]}</span>
                          {specialtyLabels[specialty as Specialty]}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link
                        href={`/garages/${garage.id}`}
                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-medium shadow-md hover:shadow-lg"
                      >
                        View Details
                      </Link>
                      <a
                        href={`tel:${garage.phone}`}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">G</span>
            </div>
            <span className="text-xl font-bold text-white">GaragePro</span>
          </div>
          <p className="text-sm text-gray-400">© 2025 GaragePro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
