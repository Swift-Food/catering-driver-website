"use client";

import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-app-bg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-surface rounded-2xl p-8 shadow-lg">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Welcome, {user?.firstName || user?.email || "Driver"}
              </h1>
              <p className="text-text-muted">SwiftFoods Driver Console</p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-surface-variant hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl text-sm font-medium transition-colors"
            >
              Sign Out
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-surface-variant rounded-xl p-6">
              <div className="w-12 h-12 bg-status-blue/10 rounded-xl flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-status-blue"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Active Routes
              </h3>
              <p className="text-2xl font-bold text-status-blue">0</p>
            </div>

            <div className="bg-surface-variant rounded-xl p-6">
              <div className="w-12 h-12 bg-status-green/10 rounded-xl flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-status-green"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Completed Today
              </h3>
              <p className="text-2xl font-bold text-status-green">0</p>
            </div>

            <div className="bg-surface-variant rounded-xl p-6">
              <div className="w-12 h-12 bg-status-amber/10 rounded-xl flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-status-amber"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                Pending
              </h3>
              <p className="text-2xl font-bold text-status-amber">0</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-surface-variant rounded-xl text-center">
            <p className="text-text-muted">
              No active deliveries at the moment. Check back later for new routes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
