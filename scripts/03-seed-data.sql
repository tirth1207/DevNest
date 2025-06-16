-- Insert sample data for development
-- Note: This assumes you have a user with the specified UUID
-- Replace with actual user IDs from your auth.users table

-- Sample profile (you'll need to replace with actual user ID)
INSERT INTO public.profiles (id, email, full_name, github_username) VALUES
('00000000-0000-0000-0000-000000000000', 'demo@devflow.com', 'Demo User', 'demouser')
ON CONFLICT (id) DO NOTHING;

-- Sample organization
INSERT INTO public.organizations (id, name, slug, description, owner_id) VALUES
('11111111-1111-1111-1111-111111111111', 'DevFlow Demo', 'devflow-demo', 'Demo organization for DevFlow', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (slug) DO NOTHING;

-- Add user to organization
INSERT INTO public.organization_members (organization_id, user_id, role, joined_at) VALUES
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'owner', NOW())
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Sample projects
INSERT INTO public.projects (id, organization_id, name, description, slug, status, owner_id) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'E-commerce Platform', 'Next.js storefront with Stripe integration', 'ecommerce-platform', 'active', '00000000-0000-0000-0000-000000000000'),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Mobile App Backend', 'Node.js API with PostgreSQL', 'mobile-app-backend', 'active', '00000000-0000-0000-0000-000000000000'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Analytics Dashboard', 'React dashboard with real-time data', 'analytics-dashboard', 'planning', '00000000-0000-0000-0000-000000000000')
ON CONFLICT (organization_id, slug) DO NOTHING;

-- Add user to projects
INSERT INTO public.project_members (project_id, user_id, role, added_at) VALUES
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'admin', NOW()),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'admin', NOW()),
('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'admin', NOW())
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Sample tasks
INSERT INTO public.tasks (project_id, title, description, status, priority, reporter_id) VALUES
('22222222-2222-2222-2222-222222222222', 'Implement user authentication', 'Set up NextAuth.js with GitHub provider', 'in_progress', 'high', '00000000-0000-0000-0000-000000000000'),
('22222222-2222-2222-2222-222222222222', 'Design product catalog', 'Create responsive product grid with filters', 'todo', 'medium', '00000000-0000-0000-0000-000000000000'),
('22222222-2222-2222-2222-222222222222', 'Integrate Stripe payments', 'Add checkout flow with Stripe Elements', 'todo', 'high', '00000000-0000-0000-0000-000000000000'),
('33333333-3333-3333-3333-333333333333', 'Set up database schema', 'Design and implement PostgreSQL schema', 'done', 'high', '00000000-0000-0000-0000-000000000000'),
('33333333-3333-3333-3333-333333333333', 'Create REST API endpoints', 'Implement CRUD operations for all entities', 'in_progress', 'medium', '00000000-0000-0000-0000-000000000000'),
('44444444-4444-4444-4444-444444444444', 'Research charting libraries', 'Evaluate Chart.js vs D3.js for data visualization', 'todo', 'low', '00000000-0000-0000-0000-000000000000');

-- Sample pages
INSERT INTO public.pages (project_id, title, content, slug, author_id, is_published) VALUES
('22222222-2222-2222-2222-222222222222', 'Project Overview', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"E-commerce Platform"}]},{"type":"paragraph","content":[{"type":"text","text":"This project aims to build a modern e-commerce platform using Next.js and Stripe."}]}]}', 'overview', '00000000-0000-0000-0000-000000000000', true),
('22222222-2222-2222-2222-222222222222', 'API Documentation', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"API Documentation"}]},{"type":"paragraph","content":[{"type":"text","text":"Documentation for all API endpoints and their usage."}]}]}', 'api-docs', '00000000-0000-0000-0000-000000000000', true),
('33333333-3333-3333-3333-333333333333', 'Database Schema', '{"type":"doc","content":[{"type":"heading","attrs":{"level":1},"content":[{"type":"text","text":"Database Schema"}]},{"type":"paragraph","content":[{"type":"text","text":"Complete database schema documentation with relationships."}]}]}', 'database-schema', '00000000-0000-0000-0000-000000000000', true)
ON CONFLICT (project_id, slug) DO NOTHING;
