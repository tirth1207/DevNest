-- Additional test data for comprehensive testing

-- Insert more sample users (these would normally come from auth.users)
INSERT INTO public.profiles (id, email, full_name, github_username) VALUES
('11111111-1111-1111-1111-111111111111', 'alice@devflow.com', 'Alice Johnson', 'alicej'),
('22222222-2222-2222-2222-222222222222', 'bob@devflow.com', 'Bob Smith', 'bobsmith'),
('33333333-3333-3333-3333-333333333333', 'carol@devflow.com', 'Carol Davis', 'carold')
ON CONFLICT (id) DO NOTHING;

-- Add more organization members
INSERT INTO public.organization_members (organization_id, user_id, role, joined_at) VALUES
('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'admin', NOW()),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'member', NOW()),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'member', NOW())
ON CONFLICT (organization_id, user_id) DO NOTHING;

-- Add project members
INSERT INTO public.project_members (project_id, user_id, role, added_at) VALUES
('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'write', NOW()),
('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'read', NOW()),
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'write', NOW()),
('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'read', NOW())
ON CONFLICT (project_id, user_id) DO NOTHING;

-- Add more diverse tasks
INSERT INTO public.tasks (project_id, title, description, status, priority, assignee_id, reporter_id, tags, due_date) VALUES
('22222222-2222-2222-2222-222222222222', 'Setup CI/CD Pipeline', 'Configure GitHub Actions for automated testing and deployment', 'todo', 'high', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', ARRAY['devops', 'automation'], NOW() + INTERVAL '7 days'),
('22222222-2222-2222-2222-222222222222', 'Add unit tests', 'Write comprehensive unit tests for core components', 'in_progress', 'medium', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', ARRAY['testing', 'quality'], NOW() + INTERVAL '5 days'),
('22222222-2222-2222-2222-222222222222', 'Performance optimization', 'Optimize database queries and API responses', 'review', 'low', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', ARRAY['performance', 'backend'], NOW() + INTERVAL '10 days'),
('33333333-3333-3333-3333-333333333333', 'API rate limiting', 'Implement rate limiting for API endpoints', 'todo', 'urgent', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', ARRAY['security', 'api'], NOW() + INTERVAL '3 days'),
('33333333-3333-3333-3333-333333333333', 'Database backup strategy', 'Design and implement automated backup system', 'done', 'high', '11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', ARRAY['database', 'backup'], NOW() - INTERVAL '2 days');

-- Add sample notifications
INSERT INTO public.notifications (user_id, title, message, type, entity_type, entity_id) VALUES
('00000000-0000-0000-0000-000000000000', 'New task assigned', 'You have been assigned to "Setup CI/CD Pipeline"', 'task_assigned', 'task', (SELECT id FROM public.tasks WHERE title = 'Setup CI/CD Pipeline' LIMIT 1)),
('11111111-1111-1111-1111-111111111111', 'Task completed', 'Database backup strategy has been marked as done', 'task_completed', 'task', (SELECT id FROM public.tasks WHERE title = 'Database backup strategy' LIMIT 1)),
('22222222-2222-2222-2222-222222222222', 'Project invitation', 'You have been invited to join E-commerce Platform', 'project_invitation', 'project', '22222222-2222-2222-2222-222222222222');

-- Add sample GitHub commits
INSERT INTO public.github_commits (project_id, sha, message, author_name, author_email, committed_at, additions, deletions, files_changed) VALUES
('22222222-2222-2222-2222-222222222222', 'abc123def456', 'feat: add user authentication with NextAuth', 'Demo User', 'demo@devflow.com', NOW() - INTERVAL '2 hours', 45, 12, 8),
('22222222-2222-2222-2222-222222222222', 'def456ghi789', 'fix: resolve login redirect issue', 'Alice Johnson', 'alice@devflow.com', NOW() - INTERVAL '4 hours', 15, 8, 3),
('22222222-2222-2222-2222-222222222222', 'ghi789jkl012', 'docs: update API documentation', 'Bob Smith', 'bob@devflow.com', NOW() - INTERVAL '1 day', 25, 5, 4),
('33333333-3333-3333-3333-333333333333', 'jkl012mno345', 'feat: implement rate limiting middleware', 'Carol Davis', 'carol@devflow.com', NOW() - INTERVAL '6 hours', 35, 0, 5),
('33333333-3333-3333-3333-333333333333', 'mno345pqr678', 'test: add integration tests for API endpoints', 'Demo User', 'demo@devflow.com', NOW() - INTERVAL '8 hours', 120, 10, 12);

-- Add sample activities
INSERT INTO public.activities (organization_id, project_id, actor_id, activity_type, entity_type, entity_id, metadata) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'task_created', 'task', (SELECT id FROM public.tasks WHERE title = 'Setup CI/CD Pipeline' LIMIT 1), '{"task_title": "Setup CI/CD Pipeline", "task_priority": "high"}'),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'task_assigned', 'task', (SELECT id FROM public.tasks WHERE title = 'Setup CI/CD Pipeline' LIMIT 1), '{"task_title": "Setup CI/CD Pipeline", "assignee": "Alice Johnson"}'),
('11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'commits_synced', 'project', '33333333-3333-3333-3333-333333333333', '{"commits_count": 2, "repository": "mobile-app-backend"}'),
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'member_added', 'project', '22222222-2222-2222-2222-222222222222', '{"member_name": "Bob Smith", "role": "read"}');
