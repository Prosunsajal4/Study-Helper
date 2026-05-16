import Head from "next/head";
import Link from "next/link";
import { useState } from "react";

export default function Landing() {
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <Head>
        <title>Study Assistant - AI-Powered Learning Platform</title>
        <meta
          name="description"
          content="Transform your study materials into interactive learning experiences with AI-powered flashcards, questions, and highlights"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-primary">
        {/* Navbar */}
        <nav className="bg-white/10 backdrop-blur-sm py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-white">
                    📚 Study Assistant
                  </span>
                </div>
              </div>
              <div className="hidden md:flex-1 flex justify-center md:flex md:justify-end items-center">
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                  Log in
                </Link>
                {/* -- */}
                <Link
                  href="/signup"
                  className="ml-4 rounded-md px-3 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                >
                  Sign up
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative pt-20 pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-xl items-center gap-8 py-24 text-center sm:py-32 lg:grid-cols-2 lg:text-left">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                  Transform Your Study Materials
                  <br />
                  <span className="block text-gradient-primary">
                    Into Interactive Learning
                  </span>
                </h1>
                <p className="mt-6 text-lg leading-8 text-white/90">
                  Study Assistant uses AI to convert your PDFs, textbooks, and
                  notes into personalized flashcards, practice questions, and
                  study highlights. Learn smarter, not harder.
                </p>
                <div className="mt-10 flex justify-center sm:justify-start space-x-4">
                  <Link
                    href="/login"
                    className="rounded-md bg-white px-5 py-3 text-sm font-medium text-primary hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/signup"
                    className="rounded-md border border-white/20 px-5 py-3 text-sm font-medium text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                  >
                    Create Account
                  </Link>
                </div>
              </div>
              <div className="hidden sm:block sm:max-w-full">
                {/* Illustration placeholder */}
                <div className="h-96 w-full bg-gradient-primary-br-opacity rounded-xl flex items-center justify-center">
                  <div className="text-primary/50 text-6xl">📚</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section className="relative bg-white/5 backdrop-blur-sm py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-8">
                How It Works
              </h2>
              <p className="max-w-xl mx-auto text-lg leading-8 text-white/90">
                Simple steps to turn your study materials into interactive
                learning resources
              </p>
            </div>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1: Upload */}
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 mb-4 bg-primary/10 rounded-lg">
                  <span className="text-primary text-2xl">📤</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Upload Your Materials
                </h3>
                <p className="text-sm text-gray-600">
                  Upload PDFs, textbooks, or notes. Our AI processes your
                  content to extract key concepts and information.
                </p>
              </div>

              {/* Feature 2: Generate */}
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 mb-4 bg-primary/10 rounded-lg">
                  <span className="text-primary text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Get AI-Powered Resources
                </h3>
                <p className="text-sm text-gray-600">
                  Instantly generate flashcards, practice questions, and
                  highlights tailored to your content.
                </p>
              </div>

              {/* Feature 3: Learn */}
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 mb-4 bg-primary/10 rounded-lg">
                  <span className="text-primary text-2xl">🧠</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                  Study Smarter
                </h3>
                <p className="text-sm text-gray-600">
                  Review with spaced repetition, test yourself with generated
                  questions, and track your progress.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="relative pt-24 pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                Ready to transform your study routine?
              </h2>
              <p className="max-w-xl mx-auto text-lg leading-8 text-white/90 mb-8">
                Join thousands of students who are learning more efficiently
                with AI-powered study tools.
              </p>
              <div className="flex justify-center space-x-4">
                <Link
                  href="/login"
                  className="rounded-md bg-primary px-5 py-3 text-sm font-medium text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  className="ml-4 rounded-md border border-primary px-5 py-3 text-sm font-medium text-primary hover:bg-primary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Sign Up Free
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <div className="text-sm text-gray-500 mb-4 sm:mb-0">
                © 2026 Study Assistant. All rights reserved.
              </div>
              <div className="flex space-x-4 text-sm text-gray-500">
                <a
                  href="#"
                  className="hover:text-gray-700 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="ml-4 hover:text-gray-700 transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
