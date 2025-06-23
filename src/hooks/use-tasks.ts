"use client"

import { useState, useEffect } from "react"
import { TasksService } from "@/lib/database/tasks"
import type { Task, TaskWithRelations } from "@/lib/supabase"

export function useTasks(
  projectId: string,
  filters?: {
    status?: Task["status"]
    priority?: Task["priority"]
    assignee_id?: string
    search?: string
  },
) {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    if (!projectId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log("Fetching tasks for project:", projectId, "with filters:", filters)
      
      const data = await TasksService.getProjectTasks(projectId, filters)
      console.log("Fetched tasks:", data)
      
      setTasks(data)
    } catch (err) {
      console.error("Error in useTasks:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
      setTasks([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [projectId, JSON.stringify(filters)]) // Use JSON.stringify for deep comparison

  const createTask = async (taskData: Omit<Task, "id" | "number" | "created_at" | "updated_at">) => {
    try {
      console.log("Creating task:", taskData)
      const newTask = await TasksService.createTask(taskData)
      console.log("Created task:", newTask)
      
      if (newTask) {
        setTasks((prev) => [newTask, ...prev])
      }
      return newTask
    } catch (err) {
      console.error("Error creating task:", err)
      return null
    }
  }

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      console.log("Updating task:", id, updates)
      const updatedTask = await TasksService.updateTask(id, updates)
      console.log("Updated task:", updatedTask)
      
      if (updatedTask) {
        setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
      }
      return updatedTask
    } catch (err) {
      console.error("Error updating task:", err)
      return null
    }
  }

  const deleteTask = async (id: string) => {
    try {
      console.log("Deleting task:", id)
      const success = await TasksService.deleteTask(id)
      console.log("Delete result:", success)
      
      if (success) {
        setTasks((prev) => prev.filter((task) => task.id !== id))
      }
      return success
    } catch (err) {
      console.error("Error deleting task:", err)
      return false
    }
  }

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  }
}

export function useTask(id: string) {
  const [task, setTask] = useState<TaskWithRelations | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTask = async () => {
      if (!id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        console.log("Fetching task:", id)
        
        const data = await TasksService.getTaskById(id)
        console.log("Fetched task:", data)
        
        setTask(data)
      } catch (err) {
        console.error("Error fetching task:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch task")
        setTask(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTask()
  }, [id])

  return { task, loading, error }
}

export function useUserTasks() {
  const [tasks, setTasks] = useState<TaskWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await TasksService.getUserTasks()
      setTasks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  }
}
