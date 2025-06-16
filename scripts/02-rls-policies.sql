-- Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles of organization members" ON public.profiles;
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organizations they belong to or own" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organizations they own" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organizations they are members of" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Organization owners can update their organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can view organization members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view organization members where they are members" ON public.organization_members;
DROP POLICY IF EXISTS "Organization admins can manage members" ON public.organization_members;
DROP POLICY IF EXISTS "Organization admins can update members" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners and admins can update members" ON public.organization_members;
DROP POLICY IF EXISTS "Organization admins can remove members" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners and admins can remove members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can join organizations when invited" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owner can add themselves as member" ON public.organization_members;
DROP POLICY IF EXISTS "Organization owners can add members" ON public.organization_members;
DROP POLICY IF EXISTS "Allow all select" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view projects they have access to" ON public.projects;
DROP POLICY IF EXISTS "Organization members can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project owners and admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view project members of accessible projects" ON public.project_members;
DROP POLICY IF EXISTS "Project admins can manage project members" ON public.project_members;
DROP POLICY IF EXISTS "Project admins can update project members" ON public.project_members;
DROP POLICY IF EXISTS "Project admins can remove project members" ON public.project_members;
DROP POLICY IF EXISTS "Users can be added to projects" ON public.project_members;
DROP POLICY IF EXISTS "Users can view tasks in accessible projects" ON public.tasks;
DROP POLICY IF EXISTS "Users with write access can create tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users with write access can update tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can view pages in accessible projects" ON public.pages;
DROP POLICY IF EXISTS "Users with write access can create pages" ON public.pages;
DROP POLICY IF EXISTS "Page authors and admins can update pages" ON public.pages;
DROP POLICY IF EXISTS "Users can view comments on accessible content" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments on accessible content" ON public.comments;
DROP POLICY IF EXISTS "Users can view commits for accessible projects" ON public.github_commits;
DROP POLICY IF EXISTS "Users can view activities for accessible projects" ON public.activities;
DROP POLICY IF EXISTS "System can insert activities" ON public.activities;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.github_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES POLICIES
-- =============================================
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =============================================
-- ORGANIZATIONS POLICIES (SIMPLE, NO RECURSION)
-- =============================================
CREATE POLICY "Users can view their own organizations" ON public.organizations
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can create organizations" ON public.organizations
    FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Organization owners can update their organizations" ON public.organizations
    FOR UPDATE USING (owner_id = auth.uid());

-- =============================================
-- ORGANIZATION_MEMBERS POLICIES (BREAK RECURSION)
-- =============================================
-- Simple policy: users can view all organization members (you can restrict this later)
CREATE POLICY "Allow view organization members" ON public.organization_members
    FOR SELECT USING (true);

-- Users can insert themselves as members (for invitations)
CREATE POLICY "Users can join organizations" ON public.organization_members
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Organization owners can manage all members (using direct organization ownership)
CREATE POLICY "Organization owners can manage members" ON public.organization_members
    FOR ALL USING (
        organization_id IN (
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    );

-- =============================================
-- PROJECTS POLICIES
-- =============================================
CREATE POLICY "Users can view projects they own" ON public.projects
    FOR SELECT USING (owner_id = auth.uid());

CREATE POLICY "Users can view projects in their organizations" ON public.projects
    FOR SELECT USING (
        organization_id IN (
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Users can create projects in their organizations" ON public.projects
    FOR INSERT WITH CHECK (
        owner_id = auth.uid() 
        AND organization_id IN (
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "Project owners can update their projects" ON public.projects
    FOR UPDATE USING (owner_id = auth.uid());

-- =============================================
-- PROJECT_MEMBERS POLICIES
-- =============================================
CREATE POLICY "Allow view project members" ON public.project_members
    FOR SELECT USING (true);

CREATE POLICY "Users can be added to projects" ON public.project_members
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Project owners can manage project members" ON public.project_members
    FOR ALL USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
    );

-- =============================================
-- TASKS POLICIES
-- =============================================
CREATE POLICY "Users can view tasks in their projects" ON public.tasks
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
        OR project_id IN (
            SELECT pm.project_id 
            FROM public.project_members pm 
            WHERE pm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create tasks in accessible projects" ON public.tasks
    FOR INSERT WITH CHECK (
        reporter_id = auth.uid()
        AND (
            project_id IN (
                SELECT id FROM public.projects WHERE owner_id = auth.uid()
            )
            OR project_id IN (
                SELECT pm.project_id 
                FROM public.project_members pm 
                WHERE pm.user_id = auth.uid() AND pm.role IN ('admin', 'write')
            )
        )
    );

CREATE POLICY "Users can update tasks they can access" ON public.tasks
    FOR UPDATE USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
        OR project_id IN (
            SELECT pm.project_id 
            FROM public.project_members pm 
            WHERE pm.user_id = auth.uid() AND pm.role IN ('admin', 'write')
        )
        OR assignee_id = auth.uid()
    );

-- =============================================
-- PAGES POLICIES
-- =============================================
CREATE POLICY "Users can view pages in accessible projects" ON public.pages
    FOR SELECT USING (
        (project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
        OR project_id IN (
            SELECT pm.project_id 
            FROM public.project_members pm 
            WHERE pm.user_id = auth.uid()
        ))
        AND (is_published = true OR author_id = auth.uid())
    );

CREATE POLICY "Users can create pages in accessible projects" ON public.pages
    FOR INSERT WITH CHECK (
        author_id = auth.uid()
        AND (
            project_id IN (
                SELECT id FROM public.projects WHERE owner_id = auth.uid()
            )
            OR project_id IN (
                SELECT pm.project_id 
                FROM public.project_members pm 
                WHERE pm.user_id = auth.uid() AND pm.role IN ('admin', 'write')
            )
        )
    );

CREATE POLICY "Page authors and project owners can update pages" ON public.pages
    FOR UPDATE USING (
        author_id = auth.uid()
        OR project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
        OR project_id IN (
            SELECT pm.project_id 
            FROM public.project_members pm 
            WHERE pm.user_id = auth.uid() AND pm.role = 'admin'
        )
    );

-- =============================================
-- COMMENTS POLICIES
-- =============================================
CREATE POLICY "Users can view comments on accessible content" ON public.comments
    FOR SELECT USING (
        (commentable_type = 'task' AND commentable_id IN (
            SELECT t.id FROM public.tasks t
            WHERE t.project_id IN (
                SELECT id FROM public.projects WHERE owner_id = auth.uid()
            )
            OR t.project_id IN (
                SELECT pm.project_id 
                FROM public.project_members pm 
                WHERE pm.user_id = auth.uid()
            )
        ))
        OR
        (commentable_type = 'page' AND commentable_id IN (
            SELECT p.id FROM public.pages p
            WHERE p.project_id IN (
                SELECT id FROM public.projects WHERE owner_id = auth.uid()
            )
            OR p.project_id IN (
                SELECT pm.project_id 
                FROM public.project_members pm 
                WHERE pm.user_id = auth.uid()
            )
        ))
    );

CREATE POLICY "Users can create comments on accessible content" ON public.comments
    FOR INSERT WITH CHECK (
        author_id = auth.uid()
        AND (
            (commentable_type = 'task' AND commentable_id IN (
                SELECT t.id FROM public.tasks t
                WHERE t.project_id IN (
                    SELECT id FROM public.projects WHERE owner_id = auth.uid()
                )
                OR t.project_id IN (
                    SELECT pm.project_id 
                    FROM public.project_members pm 
                    WHERE pm.user_id = auth.uid()
                )
            ))
            OR
            (commentable_type = 'page' AND commentable_id IN (
                SELECT p.id FROM public.pages p
                WHERE p.project_id IN (
                    SELECT id FROM public.projects WHERE owner_id = auth.uid()
                )
                OR p.project_id IN (
                    SELECT pm.project_id 
                    FROM public.project_members pm 
                    WHERE pm.user_id = auth.uid()
                )
            ))
        )
    );

-- =============================================
-- GITHUB COMMITS POLICIES
-- =============================================
CREATE POLICY "Users can view commits for accessible projects" ON public.github_commits
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
        OR project_id IN (
            SELECT pm.project_id 
            FROM public.project_members pm 
            WHERE pm.user_id = auth.uid()
        )
    );

-- =============================================
-- ACTIVITIES POLICIES
-- =============================================
CREATE POLICY "Users can view activities for their organizations and projects" ON public.activities
    FOR SELECT USING (
        project_id IN (
            SELECT id FROM public.projects WHERE owner_id = auth.uid()
        )
        OR project_id IN (
            SELECT pm.project_id 
            FROM public.project_members pm 
            WHERE pm.user_id = auth.uid()
        )
        OR organization_id IN (
            SELECT id FROM public.organizations WHERE owner_id = auth.uid()
        )
    );

CREATE POLICY "System can insert activities" ON public.activities
    FOR INSERT WITH CHECK (true);

-- =============================================
-- NOTIFICATIONS POLICIES
-- =============================================
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can create notifications" ON public.notifications
    FOR INSERT WITH CHECK (true);