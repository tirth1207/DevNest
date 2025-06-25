"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Github, Users, FolderOpen, CheckCircle } from "lucide-react";

async function signInWithGithub() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: `https://dev-nest-6t4w.vercel.app/dashboard`,
    },
  })
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <section className="w-full max-w-3xl text-center py-16">
        <div className="flex flex-col items-center gap-6">
          <Image src="/globe.svg" alt="DevNest Logo" width={80} height={80} className="mb-2" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-2">Welcome to DevNest</h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-6">
            The all-in-one platform to manage your projects, teams, and tasks. Collaborate, track progress, and grow your organization—all in one beautiful workspace.
          </p>
          <Button onClick={signInWithGithub} size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
            <Github className="w-5 h-5" />
            Sign in with GitHub
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
          <Users className="h-8 w-8 text-indigo-600 mb-2" />
          <h3 className="font-semibold text-lg mb-1 text-primary">Team Collaboration</h3>
          <p className="text-gray-500 text-sm">Invite your team, assign roles, and work together in real time.</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
          <FolderOpen className="h-8 w-8 text-indigo-600 mb-2" />
          <h3 className="font-semibold text-lg mb-1 text-primary">Project Management</h3>
          <p className="text-gray-500 text-sm">Organize projects, track tasks, and keep everything in one place.</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center">
          <CheckCircle className="h-8 w-8 text-indigo-600 mb-2" />
          <h3 className="font-semibold text-lg mb-1 text-primary">Task Tracking</h3>
          <p className="text-gray-500 text-sm">Create, assign, and complete tasks with ease. Stay productive!</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-gray-400 text-xs text-center">
        &copy; {new Date().getFullYear()} DevNest. All rights reserved.
      </footer>
    </main>
  );
}
