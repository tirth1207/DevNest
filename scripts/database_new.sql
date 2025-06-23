-- GitHub Project Management Database Schema
-- Features: Organizations, Projects, Tasks, Invitations, GitHub Auth

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

-- Functions for invitation handling
CREATE OR REPLACE FUNCTION accept_organization_invitation(invitation_token UUID)
RETURNS JSONB AS $$
DECLARE
  invitation_record organization_invitations%ROWTYPE;
  user_email TEXT;
  result JSONB;
BEGIN
  -- Get current user email
  SELECT email INTO user_email FROM profiles WHERE id = auth.uid();
  
  -- Get invitation
  SELECT * INTO invitation_record 
  FROM organization_invitations 
  WHERE invitation_token = $1 
    AND invited_email = user_email 
    AND status = 'pending' 
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Add user to organization
  INSERT INTO organization_members (organization_id, user_id, role, invited_by, joined_at)
  VALUES (invitation_record.organization_id, auth.uid(), invitation_record.role, invitation_record.invited_by, NOW())
  ON CONFLICT (organization_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    joined_at = NOW();
  
  -- Update invitation status
  UPDATE organization_invitations 
  SET status = 'accepted', responded_at = NOW()
  WHERE id = invitation_record.id;
  
  RETURN jsonb_build_object('success', true, 'organization_id', invitation_record.organization_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION accept_project_invitation(invitation_token UUID)
RETURNS JSONB AS $$
DECLARE
  invitation_record project_invitations%ROWTYPE;
  user_email TEXT;
  result JSONB;
BEGIN
  -- Get current user email
  SELECT email INTO user_email FROM profiles WHERE id = auth.uid();
  
  -- Get invitation
  SELECT * INTO invitation_record 
  FROM project_invitations 
  WHERE invitation_token = $1 
    AND invited_email = user_email 
    AND status = 'pending' 
    AND expires_at > NOW();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Add user to project
  INSERT INTO project_members (project_id, user_id, role, added_by)
  VALUES (invitation_record.project_id, auth.uid(), invitation_record.role, invitation_record.invited_by)
  ON CONFLICT (project_id, user_id) DO UPDATE SET
    role = EXCLUDED.role;
  
  -- Update invitation status
  UPDATE project_invitations 
  SET status = 'accepted', responded_at = NOW()
  WHERE id = invitation_record.id;
  
  RETURN jsonb_build_object('success', true, 'project_id', invitation_record.project_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get a user's role in an organization.
-- SECURITY DEFINER is used to bypass RLS policies and prevent infinite recursion.
CREATE OR REPLACE FUNCTION get_user_role_in_org(organization_id UUID, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.organization_members
  WHERE organization_members.organization_id = $1
    AND organization_members.user_id = $2;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get a user's role in a project.
-- SECURITY DEFINER is used to bypass RLS policies and prevent infinite recursion.
CREATE OR REPLACE FUNCTION get_user_role_in_project(project_id UUID, user_id UUID)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.project_members
  WHERE project_members.project_id = $1
    AND project_members.user_id = $2;
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
    NEW.raw_user_meta_data->>'user_name', -- often 'user_name' for github
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users; -- Drop old trigger if exists
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

-- Grant all permissions to anon and authenticated roles (will be restricted by RLS)
-- This simplifies policy definitions, as we don't need to grant specific permissions in each policy.
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON user_preferences TO anon, authenticated;
GRANT ALL ON organizations TO anon, authenticated;
GRANT ALL ON organization_members TO anon, authenticated;
GRANT ALL ON organization_invitations TO anon, authenticated;
GRANT ALL ON projects TO anon, authenticated;
GRANT ALL ON project_members TO anon, authenticated;
GRANT ALL ON project_invitations TO anon, authenticated;
GRANT ALL ON tasks TO anon, authenticated;
GRANT ALL ON task_assignments TO anon, authenticated;

-- RLS Policies for profiles
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for organizations
CREATE POLICY "Users can see organizations they are members of"
  ON organizations FOR SELECT
  USING (
    id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid()
    )
  );

-- Allow organization owners to update their organization
CREATE POLICY "Owners can update their own organization"
  ON organizations FOR UPDATE
  USING (
    id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  )
  WITH CHECK (
    id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

CREATE POLICY "Authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Allow organization owners to delete their organization
CREATE POLICY "Owners can delete their own organization"
  ON organizations FOR DELETE
  USING (
    id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role = 'owner'
    )
  );

-- RLS Policies for organization_members
-- These policies use a SECURITY DEFINER function to avoid infinite recursion.
DROP POLICY IF EXISTS "Members can see other members in their organization" ON organization_members;
CREATE POLICY "Members can see other members in their organization"
  ON organization_members FOR SELECT
  USING (get_user_role_in_org(organization_id, auth.uid()) IS NOT NULL);
  
DROP POLICY IF EXISTS "Admins can add members to their organization" ON organization_members;
CREATE POLICY "Admins can add members to their organization"
  ON organization_members FOR INSERT
  WITH CHECK (get_user_role_in_org(organization_id, auth.uid()) IN ('admin', 'owner'));

DROP POLICY IF EXISTS "Admins can update member roles in their organization" ON organization_members;
CREATE POLICY "Admins can update member roles in their organization"
  ON organization_members FOR UPDATE
  USING (get_user_role_in_org(organization_id, auth.uid()) IN ('admin', 'owner'))
  WITH CHECK (get_user_role_in_org(organization_id, auth.uid()) IN ('admin', 'owner'));

DROP POLICY IF EXISTS "Admins can remove members from their organization" ON organization_members;
CREATE POLICY "Admins can remove members from their organization"
  ON organization_members FOR DELETE
  USING (get_user_role_in_org(organization_id, auth.uid()) IN ('admin', 'owner') AND user_id != auth.uid());

-- RLS Policies for organization_invitations
DROP POLICY IF EXISTS "Admins can create invitations" ON organization_invitations;
CREATE POLICY "Admins can create invitations"
  ON organization_invitations FOR INSERT
  WITH CHECK (
    organization_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Allow admins/owners to see invitations for their organization
CREATE POLICY "Admins can see invitations for their organization"
  ON organization_invitations FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Allow admins/owners to delete pending invitations
CREATE POLICY "Admins can delete pending invitations"
  ON organization_invitations FOR DELETE
  USING (
    organization_id IN (
      SELECT organization_id FROM organization_members WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    ) AND status = 'pending'
  );

-- RLS Policies for projects
CREATE POLICY "Members can see their projects"
  ON projects FOR SELECT
  USING (
    id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );
  
-- Allow project admins/owners to update their projects
DROP POLICY IF EXISTS "Admins can update their projects" ON projects;
CREATE POLICY "Admins can update their projects"
  ON projects FOR UPDATE
  USING (get_user_role_in_project(id, auth.uid()) IN ('admin', 'owner'));

-- RLS Policies for project_members
-- These policies use a SECURITY DEFINER function to avoid infinite recursion.
DROP POLICY IF EXISTS "Members can see other members in their project" ON project_members;
CREATE POLICY "Members can see other members in their project"
  ON project_members FOR SELECT
  USING (get_user_role_in_project(project_id, auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Admins can add members to their project" ON project_members;
CREATE POLICY "Admins can add members to their project"
  ON project_members FOR INSERT
  WITH CHECK (get_user_role_in_project(project_id, auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can update member roles in their project" ON project_members;
CREATE POLICY "Admins can update member roles in their project"
  ON project_members FOR UPDATE
  USING (get_user_role_in_project(project_id, auth.uid()) = 'admin')
  WITH CHECK (get_user_role_in_project(project_id, auth.uid()) = 'admin');

DROP POLICY IF EXISTS "Admins can remove members from their project" ON project_members;
CREATE POLICY "Admins can remove members from their project"
  ON project_members FOR DELETE
  USING (get_user_role_in_project(project_id, auth.uid()) = 'admin' AND user_id != auth.uid());

-- RLS Policies for project_invitations
DROP POLICY IF EXISTS "Users can view relevant project invitations" ON project_invitations;
CREATE POLICY "Users can view relevant project invitations" ON project_invitations 
FOR SELECT USING (
  invited_by = auth.uid() OR 
  invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
);

CREATE POLICY "Project admins can create invitations" ON project_invitations 
FOR INSERT WITH CHECK (
  project_id IN (
    SELECT project_id FROM project_members 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "Users can update own project invitations" ON project_invitations 
FOR UPDATE USING (
  invited_email = (SELECT email FROM profiles WHERE id = auth.uid()) OR
  invited_by = auth.uid()
);

-- RLS Policies for tasks
CREATE POLICY "Members can see tasks in their project"
  ON tasks FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  );
  
-- Allow project members with write access to create tasks
CREATE POLICY "Writers can create tasks"
  ON tasks FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('write', 'admin', 'owner')
    )
  );
  
-- Allow project members with write access to update tasks
CREATE POLICY "Writers can update tasks"
  ON tasks FOR UPDATE
  USING (
    project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid() AND role IN ('write', 'admin', 'owner')
    )
  );

-- RLS Policies for task_assignments
CREATE POLICY "Users can view task assignments" ON task_assignments 
FOR SELECT USING (
  task_id IN (
    SELECT id FROM tasks WHERE project_id IN (
      SELECT project_id FROM project_members WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users with write access can manage assignments" ON task_assignments 
FOR ALL USING (
  task_id IN (
    SELECT id FROM tasks WHERE project_id IN (
      SELECT project_id FROM project_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'write')
    )
  )
);
