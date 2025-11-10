import Link from 'next/link';
import { auth } from '@/lib/auth';

export default async function Home() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">GaragePro</h1>
            </div>
            <div className="flex gap-4">
              {session ? (
                <>
                  <span className="text-gray-700">Welcome, {session.user?.name}</span>
                  {session.user?.role === 'USER' && (
                    <Link href="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      My Dashboard
                    </Link>
                  )}
                  {session.user?.role === 'OWNER' && (
                    <Link href="/owner/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Owner Dashboard
                    </Link>
                  )}
                  {session.user?.role === 'ADMIN' && (
                    <Link href="/admin/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      Admin Dashboard
                    </Link>
                  )}
                  <form action="/api/auth/signout" method="POST">
                    <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                      Sign Out
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/auth/login" className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                    Sign In
                  </Link>
                  <Link href="/auth/register" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Find the Perfect Garage for Your Car
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Connect with professional garages for all your car repair needs. From mechanical work to bodywork, we've got you covered.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/garages"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg font-medium"
            >
              Browse Garages
            </Link>
            <Link
              href="/auth/register?role=owner"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-lg font-medium"
            >
              Register as Owner
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Our Services</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-2">Mechanical Repairs</h3>
            <p className="text-gray-600">
              Expert mechanical services for all makes and models
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Electrical Work</h3>
            <p className="text-gray-600">
              Professional electrical diagnostics and repairs
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Body Repair</h3>
            <p className="text-gray-600">
              Quality bodywork and paint services
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Find a Garage</h3>
              <p className="text-gray-600">
                Browse garages by specialty and location
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Request Appointment</h3>
              <p className="text-gray-600">
                Submit your repair request with photos
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Confirmed</h3>
              <p className="text-gray-600">
                Receive cost estimate and appointment details
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 GaragePro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
