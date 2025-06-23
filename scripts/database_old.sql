-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view public templates" ON project_templates;
DROP POLICY IF EXISTS "Users can view org templates" ON project_templates;
DROP POLICY IF EXISTS "Users can create templates in their orgs" ON project_templates;
DROP POLICY IF EXISTS "Users can update their org templates" ON project_templates;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can manage their own preferences" ON user_preferences;
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Org members can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view org members" ON organization_members;
DROP POLICY IF EXISTS "Org admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
DROP POLICY IF EXISTS "Org members can create projects" ON projects;
DROP POLICY IF EXISTS "Project admins can update projects" ON projects;
DROP POLICY IF EXISTS "Users can view tasks in accessible projects" ON tasks;
DROP POLICY IF EXISTS "Users with write access can manage tasks" ON tasks;
DROP POLICY IF EXISTS "Users can view time entries for their tasks" ON time_entries;
DROP POLICY IF EXISTS "Users can create time entries for their tasks" ON time_entries;
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view activities in their projects" ON activities;
DROP POLICY IF EXISTS "Users can view attachments in their projects" ON attachments;
DROP POLICY IF EXISTS "Users can upload attachments" ON attachments;

-- Drop triggers
DROP TRIGGER IF EXISTS task_status_change ON tasks;

-- Drop functions
DROP FUNCTION IF EXISTS update_project_analytics();
DROP FUNCTION IF EXISTS calculate_project_velocity(UUID, INTEGER);
DROP FUNCTION IF EXISTS create_project_from_template(UUID, TEXT, TEXT, UUID, UUID);

-- Drop tables in correct order (respecting foreign key dependencies)
DROP TABLE IF EXISTS attachments CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS github_commits CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS time_entries CASCADE;
DROP TABLE IF EXISTS task_milestones CASCADE;
DROP TABLE IF EXISTS task_dependencies CASCADE;
DROP TABLE IF EXISTS task_labels CASCADE;
DROP TABLE IF EXISTS labels CASCADE;
DROP TABLE IF EXISTS pages CASCADE;
DROP TABLE IF EXISTS project_analytics CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS project_members CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS project_templates CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop invitations tables if they exist
DROP TABLE IF EXISTS organization_invitations CASCADE;
DROP TABLE IF EXISTS project_invitations CASCADE;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Supabase Auth linked profile
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  github_username TEXT,
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  email_notifications JSONB DEFAULT '{"task_assignments": true, "comments": true, "mentions": true}',
  ui_preferences JSONB DEFAULT '{"sidebar_collapsed": false, "compact_view": false}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID REFERENCES profiles(id),
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  invited_by UUID REFERENCES profiles(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (organization_id, user_id)
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  goals TEXT,
  status TEXT CHECK (status IN ('active', 'paused', 'completed', 'archived')) DEFAULT 'active',
  visibility TEXT CHECK (visibility IN ('private', 'internal', 'public')) DEFAULT 'private',
  github_repo_url TEXT,
  github_repo_id BIGINT,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, slug)
);

CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'write', 'read')) DEFAULT 'read',
  added_by UUID REFERENCES profiles(id),
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (project_id, user_id)
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done', 'blocked')) DEFAULT 'todo',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'critical')) DEFAULT 'medium',
  assignee_id UUID REFERENCES profiles(id),
  reporter_id UUID REFERENCES profiles(id),
  due_date DATE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (project_id, name)
);

CREATE TABLE task_labels (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  label_id UUID REFERENCES labels(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (task_id, label_id)
);

CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  dependency_type TEXT CHECK (dependency_type IN ('blocks', 'blocked_by', 'relates_to')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (task_id, depends_on_task_id)
);

CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')) DEFAULT 'upcoming',
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE task_milestones (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (task_id, milestone_id)
);

CREATE TABLE time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_tasks INTEGER DEFAULT 0,
  completed_tasks INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (project_id, date)
);

CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  content_type TEXT DEFAULT 'markdown',
  parent_id UUID REFERENCES pages(id),
  order_index INTEGER DEFAULT 0,
  is_template BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id),
  updated_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, slug)
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  author_id UUID REFERENCES profiles(id),
  commentable_type TEXT CHECK (commentable_type IN ('task', 'page')),
  commentable_id UUID NOT NULL,
  parent_id UUID REFERENCES comments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filename TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES profiles(id),
  attachable_type TEXT CHECK (attachable_type IN ('task', 'page', 'comment')),
  attachable_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE github_commits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  sha TEXT NOT NULL,
  message TEXT,
  author_name TEXT,
  author_email TEXT,
  author_github_id BIGINT,
  committed_at TIMESTAMP WITH TIME ZONE,
  url TEXT,
  additions INTEGER DEFAULT 0,
  deletions INTEGER DEFAULT 0,
  files_changed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (project_id, sha)
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT,
  type TEXT DEFAULT 'info',
  read_at TIMESTAMP WITH TIME ZONE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE project_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  template_data JSONB NOT NULL, -- Stores project structure, default tasks, etc.
  created_by UUID REFERENCES profiles(id),
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to create project from template
CREATE OR REPLACE FUNCTION create_project_from_template(
  template_id UUID,
  new_project_name TEXT,
  new_project_slug TEXT,
  organization_id UUID,
  created_by UUID
) RETURNS UUID AS $$
DECLARE
  new_project_id UUID;
BEGIN
  -- Create new project
  INSERT INTO projects (
    organization_id,
    name,
    slug,
    created_by
  ) VALUES (
    organization_id,
    new_project_name,
    new_project_slug,
    created_by
  ) RETURNING id INTO new_project_id;

  -- Copy template data (tasks, labels, etc.)
  WITH template_data AS (
    SELECT template_data FROM project_templates WHERE id = template_id
  )
  INSERT INTO tasks (
    project_id,
    title,
    description,
    status,
    priority,
    reporter_id
  )
  SELECT
    new_project_id,
    (value->>'title')::TEXT,
    (value->>'description')::TEXT,
    COALESCE((value->>'status')::TEXT, 'todo'),
    COALESCE((value->>'priority')::TEXT, 'medium'),
    created_by
  FROM template_data,
  jsonb_array_elements(template_data->'tasks');

  RETURN new_project_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate project velocity
CREATE OR REPLACE FUNCTION calculate_project_velocity(project_id UUID, days INTEGER DEFAULT 14)
RETURNS TABLE (
  average_completed_tasks_per_day NUMERIC,
  average_time_per_task NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(completed_tasks)::NUMERIC as average_completed_tasks_per_day,
    AVG(total_time_spent::NUMERIC / NULLIF(completed_tasks, 0)) as average_time_per_task
  FROM project_analytics
  WHERE project_id = $1
  AND date >= CURRENT_DATE - (days || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating project analytics
CREATE OR REPLACE FUNCTION update_project_analytics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update analytics when task status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    INSERT INTO project_analytics (
      project_id,
      date,
      total_tasks,
      completed_tasks,
      total_time_spent,
      active_members
    )
    SELECT
      NEW.project_id,
      CURRENT_DATE,
      COUNT(*) as total_tasks,
      COUNT(*) FILTER (WHERE status = 'done') as completed_tasks,
      COALESCE(SUM(actual_hours * 60), 0) as total_time_spent,
      COUNT(DISTINCT assignee_id) as active_members
    FROM tasks
    WHERE project_id = NEW.project_id
    ON CONFLICT (project_id, date) DO UPDATE
    SET
      total_tasks = EXCLUDED.total_tasks,
      completed_tasks = EXCLUDED.completed_tasks,
      total_time_spent = EXCLUDED.total_time_spent,
      active_members = EXCLUDED.active_members;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for task status changes
CREATE TRIGGER task_status_change
  AFTER UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_project_analytics();

-- Add indexes for performance
CREATE INDEX idx_project_templates_org_id ON project_templates(organization_id);
CREATE INDEX idx_project_templates_created_by ON project_templates(created_by);

-- Add additional indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_id ON profiles(id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_org ON organization_members(user_id, organization_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON project_members(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON organizations(owner_id);

-- Add RLS policies
ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public templates" ON project_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view org templates" ON project_templates
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates in their orgs" ON project_templates
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Users can update their org templates" ON project_templates
  FOR UPDATE USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_labels ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_commits ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- First, let's make sure the profiles table has proper policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

-- Create comprehensive profile policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (user_id = auth.uid());

-- Organizations policies
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;

-- Create a more comprehensive policy for viewing organizations
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    -- User is the owner
    owner_id = auth.uid()
    OR 
    -- User is a member of the organization
    id IN (
      SELECT organization_id 
      FROM organization_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Organization owners can update their organizations" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

-- Organization members policies
DROP POLICY IF EXISTS "Users can view org memberships" ON organization_members;

CREATE POLICY "Users can view org memberships" ON organization_members
  FOR SELECT USING (
    -- User can see their own membership
    user_id = auth.uid()
    OR 
    -- User is owner/admin of the organization
    organization_id IN (
      SELECT id FROM organizations 
      WHERE owner_id = auth.uid()
    )
    OR
    organization_id IN (
      SELECT organization_id FROM organization_members 
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
  );

CREATE POLICY "Org admins can manage members" ON organization_members
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      WHERE om.organization_id = organization_members.organization_id
      AND om.user_id = auth.uid()
      AND om.role IN ('owner', 'admin')
    )
  );

-- Projects policies
CREATE POLICY "Users can view accessible projects" ON projects
  FOR SELECT USING (
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    ) OR
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Org members can create projects" ON projects
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Project admins can update projects" ON projects
  FOR UPDATE USING (
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Tasks policies
CREATE POLICY "Users can view tasks in accessible projects" ON tasks
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users with write access can manage tasks" ON tasks
  FOR ALL USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid() AND role IN ('admin', 'write')
    )
  );

-- Time entries policies
CREATE POLICY "Users can view time entries for their tasks" ON time_entries
  FOR SELECT USING (
    task_id IN (
      SELECT id FROM tasks
      WHERE project_id IN (
        SELECT project_id FROM project_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create time entries for their tasks" ON time_entries
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    task_id IN (
      SELECT id FROM tasks
      WHERE project_id IN (
        SELECT project_id FROM project_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Activities policies
CREATE POLICY "Users can view activities in their projects" ON activities
  FOR SELECT USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

-- Attachments policies
CREATE POLICY "Users can view attachments in their projects" ON attachments
  FOR SELECT USING (
    attachable_id IN (
      SELECT id FROM tasks
      WHERE project_id IN (
        SELECT project_id FROM project_members
        WHERE user_id = auth.uid()
      )
    ) OR
    attachable_id IN (
      SELECT id FROM pages
      WHERE project_id IN (
        SELECT project_id FROM project_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can upload attachments" ON attachments
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    (
      attachable_id IN (
        SELECT id FROM tasks
        WHERE project_id IN (
          SELECT project_id FROM project_members
          WHERE user_id = auth.uid() AND role IN ('admin', 'write')
        )
      ) OR
      attachable_id IN (
        SELECT id FROM pages
        WHERE project_id IN (
          SELECT project_id FROM project_members
          WHERE user_id = auth.uid() AND role IN ('admin', 'write')
        )
      )
    )
  );

-- Fix project_members policies
DROP POLICY IF EXISTS "Users can view their project memberships" ON project_members;
CREATE POLICY "Users can view their project memberships" ON project_members
  FOR SELECT USING (
    user_id = auth.uid()
    OR 
    project_id IN (
      SELECT id FROM projects 
      WHERE organization_id IN (
        SELECT organization_id FROM organization_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
      )
    )
  );

-- Create a function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- First, disable RLS temporarily to clean up
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;
ALTER TABLE project_members DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies that might cause recursion
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Organization owners can update their organizations" ON organizations;
DROP POLICY IF EXISTS "Users can view org memberships" ON organization_members;
DROP POLICY IF EXISTS "Org admins can manage members" ON organization_members;
DROP POLICY IF EXISTS "Users can view accessible projects" ON projects;
DROP POLICY IF EXISTS "Org members can create projects" ON projects;
DROP POLICY IF EXISTS "Project admins can update projects" ON projects;
DROP POLICY IF EXISTS "Users can view their project memberships" ON project_members;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies

-- Profiles policies (simple and direct)
CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Organizations policies (direct ownership check)
DROP POLICY IF EXISTS "organizations_select" ON organizations;

CREATE POLICY "organizations_select" ON organizations
  FOR SELECT USING (
    owner_id = auth.uid()
    OR id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "organizations_insert" ON organizations
  FOR INSERT WITH CHECK (owner_id = auth.uid());

CREATE POLICY "organizations_update" ON organizations
  FOR UPDATE USING (owner_id = auth.uid());

-- Organization members policies (simple membership check)
CREATE POLICY "organization_members_select" ON organization_members
  FOR SELECT USING (
    user_id = auth.uid()
  );

DROP POLICY IF EXISTS "organization_members_insert" ON organization_members;

CREATE POLICY "organization_members_insert" ON organization_members
  FOR INSERT WITH CHECK (
    invited_by = auth.uid()
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR (
      user_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM organization_invitations
        WHERE organization_id = organization_members.organization_id
          AND invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
          AND accepted = TRUE
      )
    )
  );

CREATE POLICY "organization_members_update" ON organization_members
  FOR UPDATE USING (
    user_id = auth.uid()
  );

-- Projects policies
DROP POLICY IF EXISTS "projects_select" ON projects;
DROP POLICY IF EXISTS "projects_insert" ON projects;
DROP POLICY IF EXISTS "projects_update" ON projects;

-- Simplified project policies to avoid recursion
CREATE POLICY "projects_select" ON projects
  FOR SELECT USING (
    -- User is a project member
    id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
    -- Or user is a member of the org (and has accepted the invite)
    OR organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid() AND joined_at IS NOT NULL
    )
  );

CREATE POLICY "projects_insert" ON projects
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "projects_update" ON projects
  FOR UPDATE USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_id = projects.id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Project members policies
DROP POLICY IF EXISTS "project_members_select" ON project_members;
DROP POLICY IF EXISTS "project_members_insert" ON project_members;
DROP POLICY IF EXISTS "project_members_update" ON project_members;

-- Simplified project members policies
CREATE POLICY "project_members_select" ON project_members
  FOR SELECT USING (
    user_id = auth.uid()
  );

CREATE POLICY "project_members_insert" ON project_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND created_by = auth.uid()
    )
  );

CREATE POLICY "project_members_update" ON project_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE id = project_members.project_id
      AND created_by = auth.uid()
    )
  );

-- Add a trigger to automatically add project creator as admin
CREATE OR REPLACE FUNCTION add_project_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role, added_by)
  VALUES (NEW.id, NEW.created_by, 'admin', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_project_created ON projects;
CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW
  EXECUTE FUNCTION add_project_creator_as_admin();

-- Allow project members to insert analytics for their projects
CREATE POLICY "project_analytics_insert" ON project_analytics
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

-- Allow project members to update analytics for their projects
CREATE POLICY "project_analytics_update" ON project_analytics
  FOR UPDATE
  USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

-- Allow project members to select analytics for their projects
CREATE POLICY "project_analytics_select" ON project_analytics
  FOR SELECT
  USING (
    project_id IN (
      SELECT project_id FROM project_members
      WHERE user_id = auth.uid()
    )
  );

-- Allow all users to select any profile (for testing)
CREATE POLICY "Allow all select" ON profiles
  FOR SELECT USING (true);

-- Organization Invitations Table
CREATE TABLE organization_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  invited_by UUID REFERENCES profiles(id),
  accepted BOOLEAN DEFAULT FALSE,
  declined BOOLEAN DEFAULT FALSE,
  token UUID DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE project_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'write', 'read')) DEFAULT 'read',
  invited_by UUID REFERENCES profiles(id),
  accepted BOOLEAN DEFAULT FALSE,
  declined BOOLEAN DEFAULT FALSE,
  token UUID DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- Org Invitations: Only inviter or invited user (by email) can see or accept
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invite sender or recipient can view" ON organization_invitations
  FOR SELECT USING (
    invited_by = auth.uid()
    OR invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Only inviter can insert" ON organization_invitations
  FOR INSERT WITH CHECK (invited_by = auth.uid());

-- Project Invitations
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Invite sender or recipient can view" ON project_invitations
  FOR SELECT USING (
    invited_by = auth.uid()
    OR invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Only inviter can insert" ON project_invitations
  FOR INSERT WITH CHECK (invited_by = auth.uid());