// // use-organizationsService.ts

// "use client"

// import { useState, useEffect } from "react"
// import { OrganizationsService } from "@/lib/database/organizations"
// import type { Organization, OrganizationMember } from "@/lib/supabase"

// export function useOrganizations() {
//   const [organizations, setOrganizations] = useState<Organization[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchOrganizations = async () => {
//     try {
//       setLoading(true)
//       const data = await OrganizationsService.getUserOrganizations()
//       setOrganizations(data)
//       setError(null)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch organizations")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchOrganizations()
//   }, [])

//   const createOrganization = async (orgData: Omit<Organization, "id" | "created_at" | "updated_at">) => {
//     const newOrg = await OrganizationsService.createOrganization(orgData)
//     if (newOrg) {
//       setOrganizations((prev) => [newOrg, ...prev])
//     }
//     return newOrg
//   }

//   const updateOrganization = async (id: string, updates: Partial<Organization>) => {
//     const updatedOrg = await OrganizationsService.updateOrganization(id, updates)
//     if (updatedOrg) {
//       setOrganizations((prev) => prev.map((org) => (org.id === id ? updatedOrg : org)))
//     }
//     return updatedOrg
//   }

//   const deleteOrganization = async (id: string) => {
//     const success = await OrganizationsService.deleteOrganization(id)
//     if (success) {
//       setOrganizations((prev) => prev.filter((org) => org.id !== id))
//     }
//     return success
//   }

//   return {
//     organizations,
//     loading,
//     error,
//     refetch: fetchOrganizations,
//     createOrganization,
//     updateOrganization,
//     deleteOrganization,
//   }
// }

// export function useOrganizationMembers(organizationId: string) {
//   const [members, setMembers] = useState<(OrganizationMember & { profile: any })[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchMembers = async () => {
//     if (!organizationId) return

//     try {
//       setLoading(true)
//       const data = await OrganizationsService.getOrganizationMembers(organizationId)
//       setMembers(data)
//       setError(null)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch members")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchMembers()
//   }, [organizationId])

//   const updateMemberRole = async (userId: string, role: OrganizationMember["role"]) => {
//     const success = await OrganizationsService.updateMemberRole(organizationId, userId, role)
//     if (success) {
//       setMembers((prev) => prev.map((member) => (member.user_id === userId ? { ...member, role } : member)))
//     }
//     return success
//   }

//   const removeMember = async (userId: string) => {
//     const success = await OrganizationsService.removeMember(organizationId, userId)
//     if (success) {
//       setMembers((prev) => prev.filter((member) => member.user_id !== userId))
//     }
//     return success
//   }

//   return {
//     members,
//     loading,
//     error,
//     refetch: fetchMembers,
//     updateMemberRole,
//     removeMember,
//   }
// }


// // use-project-members.ts
// "use client"

// import { useState, useEffect } from "react"
// import { ProjectsService } from "@/lib/database/projects"
// import type { ProjectMember } from "@/lib/supabase"

// export function useProjectMembers(projectId: string) {
//   const [members, setMembers] = useState<(ProjectMember & { profile: any })[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchMembers = async () => {
//     if (!projectId) return

//     try {
//       setLoading(true)
//       const data = await ProjectsService.getProjectMembers(projectId)
//       setMembers(data)
//       setError(null)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch project members")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchMembers()
//   }, [projectId])

//   return {
//     members,
//     loading,
//     error,
//     refetch: fetchMembers,
//   }
// }

// //use-projects.ts
// "use client"

// import { useState, useEffect } from "react"
// import { ProjectsService } from "@/lib/database/projects"
// import type { Project } from "@/lib/supabase"

// export function useProjects() {
//   const [projects, setProjects] = useState<Project[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchProjects = async () => {
//     try {
//       setLoading(true)
//       const data = await ProjectsService.getUserProjects()
//       setProjects(data)
//       setError(null)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch projects")
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchProjects()
//   }, [])

//   const createProject = async (projectData: Omit<Project, "id" | "created_at" | "updated_at">) => {
//     const newProject = await ProjectsService.createProject(projectData)
//     if (newProject) {
//       setProjects((prev) => [newProject, ...prev])
//     }
//     return newProject
//   }

//   const updateProject = async (id: string, updates: Partial<Project>) => {
//     const updatedProject = await ProjectsService.updateProject(id, updates)
//     if (updatedProject) {
//       setProjects((prev) => prev.map((project) => (project.id === id ? updatedProject : project)))
//     }
//     return updatedProject
//   }

//   const deleteProject = async (id: string) => {
//     const success = await ProjectsService.deleteProject(id)
//     if (success) {
//       setProjects((prev) => prev.filter((project) => project.id !== id))
//     }
//     return success
//   }

//   return {
//     projects,
//     loading,
//     error,
//     refetch: fetchProjects,
//     createProject,
//     updateProject,
//     deleteProject,
//   }
// }

// export function useProject(id: string) {
//   const [project, setProject] = useState<Project | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchProject = async () => {
//       if (!id) return

//       try {
//         setLoading(true)
//         const data = await ProjectsService.getProjectById(id)
//         setProject(data)
//         setError(null)
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to fetch project")
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchProject()
//   }, [id])

//   return { project, loading, error }
// }

// //use-sidebar-data.ts
// "use client"

// import { useState, useEffect } from "react"
// import { ProfilesService } from "@/lib/database/profiles"
// import { OrganizationsService } from "@/lib/database/organizations"
// import { ProjectsService } from "@/lib/database/projects"
// import { supabase } from "@/lib/supabase"
// import type { Profile, Organization, Project } from "@/lib/supabase"

// interface SidebarData {
//   user: Profile | null
//   organizations: Organization[]
//   projects: Project[]
//   currentOrg: Organization | null
//   loading: boolean
//   error: string | null
// }

// export function useSidebarData() {
//   const [data, setData] = useState<SidebarData>({
//     user: null,
//     organizations: [],
//     projects: [],
//     currentOrg: null,
//     loading: true,
//     error: null,
//   })

//   const fetchData = async () => {
//     try {
//       setData((prev) => ({ ...prev, loading: true, error: null }))

//       // Check if user is authenticated
//       const {
//         data: { user: authUser },
//       } = await supabase.auth.getUser()

//       if (!authUser) {
//         setData((prev) => ({ ...prev, loading: false }))
//         return
//       }

//       // Fetch all data in parallel
//       const [profile, userOrgs, userProjects] = await Promise.all([
//         ProfilesService.getCurrentProfile(),
//         OrganizationsService.getUserOrganizations(),
//         ProjectsService.getUserProjects(),
//       ])

//       // Get current organization from localStorage or use first one
//       const savedOrgId = localStorage.getItem("currentOrganizationId")
//       let currentOrg = null

//       if (savedOrgId && userOrgs.length > 0) {
//         currentOrg = userOrgs.find((org) => org.id === savedOrgId) || userOrgs[0]
//       } else if (userOrgs.length > 0) {
//         currentOrg = userOrgs[0]
//       }

//       // Save current org to localStorage
//       if (currentOrg) {
//         localStorage.setItem("currentOrganizationId", currentOrg.id)
//       }

//       setData({
//         user: profile,
//         organizations: userOrgs,
//         projects: userProjects,
//         currentOrg,
//         loading: false,
//         error: null,
//       })
//     } catch (error) {
//       console.error("Error fetching sidebar data:", error)
//       setData((prev) => ({
//         ...prev,
//         loading: false,
//         error: error instanceof Error ? error.message : "Failed to fetch data",
//       }))
//     }
//   }

//   const switchOrganization = (orgId: string) => {
//     const org = data.organizations.find((o) => o.id === orgId)
//     if (org) {
//       setData((prev) => ({ ...prev, currentOrg: org }))
//       localStorage.setItem("currentOrganizationId", orgId)
//     }
//   }

//   const refreshData = () => {
//     fetchData()
//   }

//   useEffect(() => {
//     fetchData()

//     // Set up real-time subscriptions for data changes
//     const profileSubscription = supabase
//       .channel("profile_changes")
//       .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
//         refreshData()
//       })
//       .subscribe()

//     const orgSubscription = supabase
//       .channel("org_changes")
//       .on("postgres_changes", { event: "*", schema: "public", table: "organizations" }, () => {
//         refreshData()
//       })
//       .on("postgres_changes", { event: "*", schema: "public", table: "organization_members" }, () => {
//         refreshData()
//       })
//       .subscribe()

//     const projectSubscription = supabase
//       .channel("project_changes")
//       .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
//         refreshData()
//       })
//       .on("postgres_changes", { event: "*", schema: "public", table: "project_members" }, () => {
//         refreshData()
//       })
//       .subscribe()

//     return () => {
//       profileSubscription.unsubscribe()
//       orgSubscription.unsubscribe()
//       projectSubscription.unsubscribe()
//     }
//   }, [])

//   return {
//     ...data,
//     switchOrganization,
//     refreshData,
//   }
// }

// //use-tasks.ts
// "use client"

// import { useState, useEffect } from "react"
// import { TasksService } from "@/lib/database/tasks"
// import type { Task, TaskWithRelations } from "@/lib/supabase"

// export function useTasks(
//   projectId: string,
//   filters?: {
//     status?: Task["status"]
//     priority?: Task["priority"]
//     assignee_id?: string
//     search?: string
//   },
// ) {
//   const [tasks, setTasks] = useState<TaskWithRelations[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchTasks = async () => {
//     if (!projectId) {
//       setLoading(false)
//       return
//     }

//     try {
//       setLoading(true)
//       setError(null)
//       console.log("Fetching tasks for project:", projectId, "with filters:", filters)
      
//       const data = await TasksService.getProjectTasks(projectId, filters)
//       console.log("Fetched tasks:", data)
      
//       setTasks(data)
//     } catch (err) {
//       console.error("Error in useTasks:", err)
//       setError(err instanceof Error ? err.message : "Failed to fetch tasks")
//       setTasks([]) // Set empty array on error
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchTasks()
//   }, [projectId, JSON.stringify(filters)]) // Use JSON.stringify for deep comparison

//   const createTask = async (taskData: Omit<Task, "id" | "number" | "created_at" | "updated_at">) => {
//     try {
//       console.log("Creating task:", taskData)
//       const newTask = await TasksService.createTask(taskData)
//       console.log("Created task:", newTask)
      
//       if (newTask) {
//         setTasks((prev) => [newTask, ...prev])
//       }
//       return newTask
//     } catch (err) {
//       console.error("Error creating task:", err)
//       return null
//     }
//   }

//   const updateTask = async (id: string, updates: Partial<Task>) => {
//     try {
//       console.log("Updating task:", id, updates)
//       const updatedTask = await TasksService.updateTask(id, updates)
//       console.log("Updated task:", updatedTask)
      
//       if (updatedTask) {
//         setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
//       }
//       return updatedTask
//     } catch (err) {
//       console.error("Error updating task:", err)
//       return null
//     }
//   }

//   const deleteTask = async (id: string) => {
//     try {
//       console.log("Deleting task:", id)
//       const success = await TasksService.deleteTask(id)
//       console.log("Delete result:", success)
      
//       if (success) {
//         setTasks((prev) => prev.filter((task) => task.id !== id))
//       }
//       return success
//     } catch (err) {
//       console.error("Error deleting task:", err)
//       return false
//     }
//   }

//   return {
//     tasks,
//     loading,
//     error,
//     refetch: fetchTasks,
//     createTask,
//     updateTask,
//     deleteTask,
//   }
// }

// export function useTask(id: string) {
//   const [task, setTask] = useState<TaskWithRelations | null>(null)
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   useEffect(() => {
//     const fetchTask = async () => {
//       if (!id) {
//         setLoading(false)
//         return
//       }

//       try {
//         setLoading(true)
//         setError(null)
//         console.log("Fetching task:", id)
        
//         const data = await TasksService.getTaskById(id)
//         console.log("Fetched task:", data)
        
//         setTask(data)
//       } catch (err) {
//         console.error("Error fetching task:", err)
//         setError(err instanceof Error ? err.message : "Failed to fetch task")
//         setTask(null)
//       } finally {
//         setLoading(false)
//       }
//     }

//     fetchTask()
//   }, [id])

//   return { task, loading, error }
// }
