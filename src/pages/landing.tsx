import React from 'react';
import { Link } from 'react-router-dom';
import { FileStack, CheckCircle, ArrowRight, Mail, Shield, BarChart } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <FileStack className="h-8 w-8 text-purple-600" />
            <span className="text-2xl font-bold">betasys.ai</span>
            <span className="ml-2 rounded-md bg-purple-100 px-2 py-1 text-sm text-purple-700 dark:bg-purple-900 dark:text-purple-100">
              PO Assistant
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-purple-600 dark:text-gray-300">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
              Intelligent Purchase Order Processing
            </h1>
            <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
              Transform your purchase orders into actionable insights with AI-powered analysis, 
              automated data extraction, and intelligent processing.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/register"
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700"
              >
                Start Free Trial <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#features"
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
              >
                Learn More
              </a>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="bg-white py-20 dark:bg-gray-900">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="mb-12 text-center text-3xl font-bold">Key Features</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="rounded-lg border p-6 dark:border-gray-700">
                <CheckCircle className="mb-4 h-8 w-8 text-purple-600" />
                <h3 className="mb-2 text-xl font-semibold">Smart Data Extraction</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Automatically extract and structure data from PDF purchase orders with high accuracy.
                </p>
              </div>
              <div className="rounded-lg border p-6 dark:border-gray-700">
                <BarChart className="mb-4 h-8 w-8 text-purple-600" />
                <h3 className="mb-2 text-xl font-semibold">Analytics & Reporting</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Generate comprehensive reports and gain insights from your purchase order data.
                </p>
              </div>
              <div className="rounded-lg border p-6 dark:border-gray-700">
                <Shield className="mb-4 h-8 w-8 text-purple-600" />
                <h3 className="mb-2 text-xl font-semibold">Secure Processing</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Enterprise-grade security ensures your sensitive data remains protected.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}