-- GitHub Project Management Database Schema - FINAL FIX
-- This version completely eliminates infinite recursion by using security definer functions
-- and avoiding self-referential policies

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables and policies for clean setup
DROP TABLE IF EXISTS project_invitations CASCADE;
DROP TABLE IF EXISTS organization_invitations CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- User profiles linked to Supabase Auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  github_username TEXT,
  github_id BIGINT UNIQUE,
  bio TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'system')),
  email_notifications JSONB DEFAULT '{"invitations": true, "task_assignments": true, "mentions": true}',
  ui_preferences JSONB DEFAULT '{"sidebar_collapsed": false, "compact_view": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  github_org_name TEXT,
  settings JSONB DEFAULT '{"visibility": "private", "allow_member_invites": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_slug CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' AND length(slug) >= 3)
);

-- Organization members with roles
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE (organization_id, user_id)
);

-- Organization invitations
CREATE TABLE organization_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'member', 'viewer')),
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitation_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE (organization_id, invited_email, status) DEFERRABLE INITIALLY DEFERRED
);

-- Projects within organizations
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  readme TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'internal', 'public')),
  github_repo_url TEXT,
  github_repo_id BIGINT,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  settings JSONB DEFAULT '{"features": {"issues": true, "wiki": true, "discussions": true}}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE (organization_id, slug),
  CONSTRAINT valid_project_slug CHECK (slug ~ '^[a-z0-9][a-z0-9-]*[a-z0-9]$' AND length(slug) >= 3)
);

-- Project members with specific roles
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'read' CHECK (role IN ('admin', 'write', 'read')),
  added_by UUID NOT NULL REFERENCES profiles(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE (project_id, user_id)
);

-- Project invitations
CREATE TABLE project_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'read' CHECK (role IN ('admin', 'write', 'read')),
  invited_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  invitation_token UUID UNIQUE DEFAULT uuid_generate_v4(),
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE (project_id, invited_email, status) DEFERRABLE INITIALLY DEFERRED
);

-- Tasks/Issues
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  number SERIAL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'blocked')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  type TEXT DEFAULT 'task' CHECK (type IN ('task', 'bug', 'feature', 'epic')),
  assignee_id UUID REFERENCES profiles(id),
  reporter_id UUID NOT NULL REFERENCES profiles(id),
  due_date TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  labels TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE (project_id, number)
);

-- Task assignments (for multiple assignees)
CREATE TABLE task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES profiles(id),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE (task_id, user_id)
);

-- Indexes for performance
CREATE INDEX idx_profiles_github_id ON profiles(github_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_organizations_owner_id ON organizations(owner_id);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX idx_organization_invitations_token ON organization_invitations(invitation_token);
CREATE INDEX idx_organization_invitations_email ON organization_invitations(invited_email);
CREATE INDEX idx_projects_org_id ON projects(organization_id);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_invitations_token ON project_invitations(invitation_token);
CREATE INDEX idx_project_invitations_email ON project_invitations(invited_email);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_reporter_id ON tasks(reporter_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_task_assignments_user_id ON task_assignments(user_id);
CREATE INDEX idx_task_assignments_task_id ON task_assignments(task_id);

-- SECURITY DEFINER functions that bypass RLS to avoid recursion
DROP FUNCTION IF EXISTS check_user_org_membership(UUID, UUID);
CREATE OR REPLACE FUNCTION check_user_org_membership(p_org_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organization_members 
    WHERE organization_id = p_org_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS check_user_project_membership(UUID, UUID);
CREATE OR REPLACE FUNCTION check_user_project_membership(p_proj_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM project_members 
    WHERE project_id = p_proj_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS get_user_org_role(UUID, UUID);
CREATE OR REPLACE FUNCTION get_user_org_role(p_org_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM organization_members
  WHERE organization_id = p_org_id AND user_id = p_user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP FUNCTION IF EXISTS get_user_project_role(UUID, UUID);
CREATE OR REPLACE FUNCTION get_user_project_role(p_proj_id UUID, p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM project_members
  WHERE project_id = p_proj_id AND user_id = p_user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- This function creates a public profile for a new user from their auth data.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, github_username, github_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'user_name',
    (NEW.raw_user_meta_data->>'provider_id')::bigint
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    github_username = EXCLUDED.github_username,
    github_id = EXCLUDED.github_id,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up.
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- This function automatically adds the creator of an organization as its 'owner'.
CREATE OR REPLACE FUNCTION add_organization_owner_as_member()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO organization_members (organization_id, user_id, role, invited_by, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new organization
DROP TRIGGER IF EXISTS on_organization_created ON organizations;
CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION add_organization_owner_as_member();

-- Function to automatically add project owner as admin
CREATE OR REPLACE FUNCTION add_project_owner_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role, added_by)
  VALUES (NEW.id, NEW.owner_id, 'admin', NEW.owner_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new project
DROP TRIGGER IF EXISTS on_project_created ON projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION add_project_owner_as_admin();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "Users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Organization members can see each other's profiles" ON profiles;
CREATE POLICY "Authenticated users can see all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage own preferences" 
  ON user_preferences FOR ALL 
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for organizations - NO RECURSION
CREATE POLICY "Users can see organizations they own"
  ON organizations FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can see organizations they are members of"
  ON organizations FOR SELECT
  TO authenticated
  USING (check_user_org_membership(id, auth.uid()));

CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their organization"
  ON organizations FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their organization"
  ON organizations FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);

-- RLS Policies for organization_members - NO RECURSION
CREATE POLICY "Users can see their own membership"
  ON organization_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Organization owners can see all members"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_id AND o.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can see organization members"
  ON organization_members FOR SELECT
  TO authenticated
  USING (
    get_user_org_role(organization_id, auth.uid()) IN ('admin', 'owner')
  );

CREATE POLICY "System can insert organization members for triggers"
  ON organization_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow the organization owner to be added (for trigger)
    EXISTS (
      SELECT 1 FROM organizations o
      WHERE o.id = organization_id AND o.owner_id = auth.uid()
    )
    OR
    -- Allow existing admins/owners to add members
    get_user_org_role(organization_id, auth.uid()) IN ('admin', 'owner')
  );

CREATE POLICY "Admins can update member roles"
  ON organization_members FOR UPDATE
  TO authenticated
  USING (get_user_org_role(organization_id, auth.uid()) IN ('admin', 'owner'));

CREATE POLICY "Admins can remove members"
  ON organization_members FOR DELETE
  TO authenticated
  USING (
    get_user_org_role(organization_id, auth.uid()) IN ('admin', 'owner')
    AND user_id != auth.uid() -- Can't remove yourself
  );

-- RLS Policies for organization_invitations
CREATE POLICY "Admins can create invitations"
  ON organization_invitations FOR INSERT
  TO authenticated
  WITH CHECK (get_user_org_role(organization_id, auth.uid()) IN ('admin', 'owner'));

CREATE POLICY "Users can see relevant invitations"
  ON organization_invitations FOR SELECT
  TO authenticated
  USING (
    get_user_org_role(organization_id, auth.uid()) IN ('admin', 'owner')
    OR invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Admins can delete pending invitations"
  ON organization_invitations FOR DELETE
  TO authenticated
  USING (
    get_user_org_role(organization_id, auth.uid()) IN ('admin', 'owner')
    AND status = 'pending'
  );

CREATE POLICY "Users can update invitations sent to them"
  ON organization_invitations FOR UPDATE
  TO authenticated
  USING (invited_email = (SELECT email FROM profiles WHERE id = auth.uid()));

-- RLS Policies for projects - NO RECURSION
CREATE POLICY "Users can see projects they own"
  ON projects FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can see projects they are members of"
  ON projects FOR SELECT
  TO authenticated
  USING (check_user_project_membership(id, auth.uid()));

CREATE POLICY "Users can see projects in their organizations"
  ON projects FOR SELECT
  TO authenticated
  USING (check_user_org_membership(organization_id, auth.uid()));

CREATE POLICY "Organization members can create projects"
  ON projects FOR INSERT
  WITH CHECK (
    check_user_org_membership(organization_id, auth.uid())
    AND auth.uid() = owner_id
  );

DROP POLICY IF EXISTS "Project admins can update projects" ON projects;
CREATE POLICY "Admins can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (
    get_user_project_role(id, auth.uid()) = 'admin'
    OR
    get_user_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  );

DROP POLICY IF EXISTS "Project admins can delete projects" ON projects;
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (
    get_user_project_role(id, auth.uid()) = 'admin'
    OR
    get_user_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
  );

-- RLS Policies for project_members - NO RECURSION
CREATE POLICY "Users can see their own project membership"
  ON project_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Project owners can see all members"
  ON project_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can see members"
  ON project_members FOR SELECT
  TO authenticated
  USING (get_user_project_role(project_id, auth.uid()) = 'admin');

CREATE POLICY "System can insert project members for triggers"
  ON project_members FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Allow the project owner to be added (for trigger)
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_id AND p.owner_id = auth.uid()
    )
    OR
    -- Allow project admins to add members
    get_user_project_role(project_id, auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can update member roles in project"
  ON project_members FOR UPDATE
  TO authenticated
  USING (get_user_project_role(project_id, auth.uid()) = 'admin');

CREATE POLICY "Admins can remove members from project"
  ON project_members FOR DELETE
  TO authenticated
  USING (
    get_user_project_role(project_id, auth.uid()) = 'admin'
    AND user_id != auth.uid() -- Can't remove yourself
  );

-- RLS Policies for project_invitations
CREATE POLICY "Users can view relevant project invitations" 
  ON project_invitations FOR SELECT 
  TO authenticated
  USING (
    invited_by = auth.uid() OR 
    invited_email = (SELECT email FROM profiles WHERE id = auth.uid()) OR
    get_user_project_role(project_id, auth.uid()) = 'admin'
  );

CREATE POLICY "Project admins can create invitations" 
  ON project_invitations FOR INSERT 
  TO authenticated
  WITH CHECK (get_user_project_role(project_id, auth.uid()) = 'admin');

CREATE POLICY "Users can update own project invitations" 
  ON project_invitations FOR UPDATE 
  TO authenticated
  USING (
    invited_email = (SELECT email FROM profiles WHERE id = auth.uid()) OR
    invited_by = auth.uid() OR
    get_user_project_role(project_id, auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete project invitations"
  ON project_invitations FOR DELETE
  TO authenticated
  USING (get_user_project_role(project_id, auth.uid()) = 'admin');

-- RLS Policies for tasks
DROP POLICY IF EXISTS "Members can see tasks in their project" ON tasks;
CREATE POLICY "Organization members can see tasks in their projects"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = tasks.project_id AND check_user_org_membership(p.organization_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "Writers can create tasks" ON tasks;
CREATE POLICY "Contributing members can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    get_user_project_role(project_id, auth.uid()) IN ('write', 'admin')
    OR
    get_user_org_role((SELECT organization_id FROM projects WHERE id = project_id), auth.uid()) IN ('owner', 'admin', 'member')
  );

DROP POLICY IF EXISTS "Writers can update tasks" ON tasks;
CREATE POLICY "Contributing members can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    get_user_project_role(project_id, auth.uid()) IN ('write', 'admin') OR
    get_user_org_role((SELECT organization_id FROM projects WHERE id = project_id), auth.uid()) IN ('owner', 'admin', 'member')
  );

DROP POLICY IF EXISTS "Writers can delete tasks" ON tasks;
CREATE POLICY "Contributing members can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    get_user_project_role(project_id, auth.uid()) IN ('write', 'admin') OR
    get_user_org_role((SELECT organization_id FROM projects WHERE id = project_id), auth.uid()) IN ('owner', 'admin', 'member')
  );

-- RLS Policies for task_assignments
DROP POLICY IF EXISTS "Users can view task assignments" ON task_assignments;
CREATE POLICY "Organization members can see task assignments"
  ON task_assignments FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM tasks t
      JOIN projects p ON t.project_id = p.id
      WHERE t.id = task_assignments.task_id
      AND check_user_org_membership(p.organization_id, auth.uid())
    )
  );

DROP POLICY IF EXISTS "Writers can manage assignments" ON task_assignments;
CREATE POLICY "Contributing members can manage assignments"
  ON task_assignments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_assignments.task_id AND (
        get_user_project_role(t.project_id, auth.uid()) IN ('admin', 'write') OR
        get_user_org_role((SELECT organization_id FROM projects WHERE id = t.project_id), auth.uid()) IN ('owner', 'admin', 'member')
      )
    )
  );

DROP POLICY IF EXISTS "Writers can update assignments" ON task_assignments;
CREATE POLICY "Contributing members can update assignments"
  ON task_assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_assignments.task_id AND (
        get_user_project_role(t.project_id, auth.uid()) IN ('admin', 'write') OR
        get_user_org_role((SELECT organization_id FROM projects WHERE id = t.project_id), auth.uid()) IN ('owner', 'admin', 'member')
      )
    )
  );

DROP POLICY IF EXISTS "Writers can delete assignments" ON task_assignments;
CREATE POLICY "Contributing members can delete assignments"
  ON task_assignments FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      WHERE t.id = task_assignments.task_id AND (
        get_user_project_role(t.project_id, auth.uid()) IN ('admin', 'write') OR
        get_user_org_role((SELECT organization_id FROM projects WHERE id = t.project_id), auth.uid()) IN ('owner', 'admin', 'member')
      )
    )
  );

-- Allow public access to basic organization info for invite pages
-- This policy allows anyone to see basic organization information
CREATE POLICY "Public can see basic organization info for invites"
  ON organizations FOR SELECT
  TO anon, authenticated
  USING (true);

-- Update the existing policies to be more specific
DROP POLICY IF EXISTS "Users can see organizations they own" ON organizations;
DROP POLICY IF EXISTS "Users can see organizations they are members of" ON organizations;

-- Recreate with more specific names to avoid conflicts
CREATE POLICY "Authenticated users can see organizations they own"
  ON organizations FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can see organizations they are members of"
  ON organizations FOR SELECT
  TO authenticated
  USING (check_user_org_membership(id, auth.uid()));

-- Allow authenticated users to insert themselves as members (for invite acceptance)
CREATE POLICY "Users can join organizations via invite"
  ON organization_members FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Allow users to add themselves as project members
CREATE POLICY "Allow self-join to project"
  ON project_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public can read projects for invites"
  ON projects
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE OR REPLACE FUNCTION add_org_members_to_new_project()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role, added_by)
  SELECT NEW.id, om.user_id, 'read', NEW.owner_id
  FROM organization_members om
  WHERE om.organization_id = NEW.organization_id
    AND om.user_id <> NEW.owner_id; -- skip owner, already added as admin by your other trigger
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_project_created_add_org_members ON projects;
CREATE TRIGGER on_project_created_add_org_members
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION add_org_members_to_new_project();
