"use client"

import { useState, useEffect } from "react"
import { ProjectsService } from "@/lib/database/projects"
import type { Project } from "@/lib/supabase"

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const data = await ProjectsService.getUserProjects()
      setProjects(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [])

  const createProject = async (projectData: Omit<Project, "id" | "created_at" | "updated_at">) => {
    const newProject = await ProjectsService.createProject(projectData)
    if (newProject) {
      setProjects((prev) => [newProject, ...prev])
    }
    return newProject
  }

  const updateProject = async (id: string, updates: Partial<Project>) => {
    const updatedProject = await ProjectsService.updateProject(id, updates)
    if (updatedProject) {
      setProjects((prev) => prev.map((project) => (project.id === id ? updatedProject : project)))
    }
    return updatedProject
  }

  const deleteProject = async (id: string) => {
    const success = await ProjectsService.deleteProject(id)
    if (success) {
      setProjects((prev) => prev.filter((project) => project.id !== id))
    }
    return success
  }

  return {
    projects,
    loading,
    error,
    refetch: fetchProjects,
    createProject,
    updateProject,
    deleteProject,
  }
}

export function useProject(id: string) {
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return

      try {
        setLoading(true)
        const data = await ProjectsService.getProjectById(id)
        setProject(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch project")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [id])

  return { project, loading, error }
}
