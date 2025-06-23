
-- GENERATED ON: 2025-06-21 06:24:06
-- Clean and Optimized SQL Schema for GitHub Project Management App

-- Required Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- === PROFILES ===
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- === ORGANIZATIONS ===
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  owner_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('owner', 'admin', 'member', 'viewer')) DEFAULT 'member',
  invited_by UUID REFERENCES profiles(id),
  joined_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (organization_id, user_id)
);

-- Auto-add creator as org owner
CREATE OR REPLACE FUNCTION add_org_creator_as_owner()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO organization_members (organization_id, user_id, role, invited_by, joined_at)
  VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION add_org_creator_as_owner();

-- === PROJECTS ===
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  github_repo_url TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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

-- Auto-add project creator as admin
CREATE OR REPLACE FUNCTION add_project_creator_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO project_members (project_id, user_id, role, added_by)
  VALUES (NEW.id, NEW.created_by, 'admin', NEW.created_by);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_project_created
  AFTER INSERT ON projects
  FOR EACH ROW EXECUTE FUNCTION add_project_creator_as_admin();

-- === INVITATIONS ===
CREATE TABLE organization_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'member', 'viewer')) DEFAULT 'member',
  invited_by UUID REFERENCES profiles(id),
  token UUID NOT NULL DEFAULT uuid_generate_v4(),
  accepted BOOLEAN DEFAULT FALSE,
  declined BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE project_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  invited_email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'write', 'read')) DEFAULT 'read',
  invited_by UUID REFERENCES profiles(id),
  token UUID NOT NULL DEFAULT uuid_generate_v4(),
  accepted BOOLEAN DEFAULT FALSE,
  declined BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE
);

-- === RLS POLICIES ===
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id);

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
CREATE POLICY orgs_view ON organizations FOR SELECT USING (
  owner_id = auth.uid() OR id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid())
);
CREATE POLICY orgs_insert ON organizations FOR INSERT WITH CHECK (owner_id = auth.uid());

-- Organization Members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_members_view ON organization_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY org_members_insert ON organization_members FOR INSERT WITH CHECK (
  invited_by = auth.uid() OR EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = organization_members.organization_id
    AND user_id = auth.uid()
    AND role IN ('owner', 'admin')
  )
);

-- Projects
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY project_view ON projects FOR SELECT USING (
  id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
);
CREATE POLICY project_insert ON projects FOR INSERT WITH CHECK (created_by = auth.uid());

-- Project Members
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY proj_members_view ON project_members FOR SELECT USING (user_id = auth.uid());
CREATE POLICY proj_members_insert ON project_members FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM projects
    WHERE id = project_members.project_id AND created_by = auth.uid()
  )
);

-- Org Invitations
ALTER TABLE organization_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY org_invite_view ON organization_invitations FOR SELECT USING (
  invited_by = auth.uid() OR invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
);
CREATE POLICY org_invite_insert ON organization_invitations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = organization_invitations.organization_id
    AND user_id = auth.uid() AND role IN ('owner', 'admin')
  )
);

-- Project Invitations
ALTER TABLE project_invitations ENABLE ROW LEVEL SECURITY;
CREATE POLICY proj_invite_view ON project_invitations FOR SELECT USING (
  invited_by = auth.uid() OR invited_email = (SELECT email FROM profiles WHERE id = auth.uid())
);
CREATE POLICY proj_invite_insert ON project_invitations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = project_invitations.project_id
    AND user_id = auth.uid() AND role = 'admin'
  )
);
