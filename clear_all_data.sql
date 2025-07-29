-- Clear all data script for Home Champion
-- This will remove all data from all tables while preserving the structure

-- Clear junction tables first (due to foreign key constraints)
DELETE FROM member_chore;
DELETE FROM member_reward;
DELETE FROM points_deduction;

-- Clear main entity tables
DELETE FROM members;
DELETE FROM chore;
DELETE FROM reward;

-- Optional: Clear users table if you want to remove all users
-- DELETE FROM users;

-- Reset sequences to start from 1 again
ALTER SEQUENCE members_id_seq RESTART WITH 1;
ALTER SEQUENCE chore_id_seq RESTART WITH 1;
ALTER SEQUENCE reward_id_seq RESTART WITH 1;
ALTER SEQUENCE member_chore_id_seq RESTART WITH 1;
ALTER SEQUENCE member_reward_id_seq RESTART WITH 1;
ALTER SEQUENCE points_deduction_id_seq RESTART WITH 1;
