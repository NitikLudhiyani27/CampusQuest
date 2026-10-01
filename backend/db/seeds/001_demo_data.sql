-- Development seed: one demo game, two teams, four territories, a few riddles.
-- Idempotent: running it again adds nothing. No users, resonators or attacks are created.
-- Run AFTER migrations. The coordinates are placeholders; replace them with real campus locations.
BEGIN;

-- Game
INSERT INTO game_sessions (name, status)
SELECT 'CampusQuest Demo', 'scheduled'
WHERE NOT EXISTS (SELECT 1 FROM game_sessions WHERE name = 'CampusQuest Demo');

-- Teams
INSERT INTO teams (game_id, name, color)
SELECT g.id, t.name, t.color
FROM game_sessions g
CROSS JOIN (VALUES ('Red', '#EF4444'), ('Blue', '#2563EB')) AS t(name, color)
WHERE g.name = 'CampusQuest Demo'
ON CONFLICT (game_id, name) DO NOTHING;

-- Territories (fake coordinates, radius in metres)
INSERT INTO territories (game_id, name, description, latitude, longitude, radius)
SELECT g.id, t.name, t.description, t.latitude, t.longitude, t.radius
FROM game_sessions g
CROSS JOIN (VALUES
  ('Central Library', 'The main library building.',        10.000000, 20.000000, 30),
  ('Main Gate',       'The campus entrance.',               10.001000, 20.000000, 30),
  ('Science Block',   'Labs and lecture halls.',            10.000000, 20.001000, 40),
  ('Cafeteria',       'The student cafeteria and seating.', 10.001000, 20.001000, 35)
) AS t(name, description, latitude, longitude, radius)
WHERE g.name = 'CampusQuest Demo'
  AND NOT EXISTS (
    SELECT 1 FROM territories x WHERE x.game_id = g.id AND x.name = t.name
  );

-- Riddles. answer_hash = SHA-256 (hex) of the answer, trimmed and lower-cased.
-- The game engine must normalise and hash submitted answers exactly the same way.
-- (The demo answers appear in this file only so the seed can hash them; real
--  riddles should be loaded without keeping plaintext answers around.)
INSERT INTO riddles (territory_id, question, answer_hash, difficulty)
SELECT tr.id,
       r.question,
       encode(sha256(convert_to(lower(btrim(r.answer)), 'UTF8')), 'hex'),
       r.difficulty
FROM (VALUES
  ('Central Library', 'I have a spine but no bones, and leaves but I am not a tree. What am I?', 'book',      'easy'),
  ('Central Library', 'What has to be broken before you can use it?',                            'egg',       'medium'),
  ('Main Gate',       'I am always in front of you, but you can never see me. What am I?',       'future',    'medium'),
  ('Main Gate',       'What can travel around the world while staying in a corner?',             'stamp',     'hard'),
  ('Science Block',   'I am not alive, but I grow. I have no lungs, but I need air. What am I?', 'fire',      'easy'),
  ('Cafeteria',       'The more you take, the more you leave behind. What am I?',                'footsteps', 'medium')
) AS r(territory_name, question, answer, difficulty)
JOIN game_sessions g ON g.name = 'CampusQuest Demo'
JOIN territories tr  ON tr.game_id = g.id AND tr.name = r.territory_name
WHERE NOT EXISTS (
  SELECT 1 FROM riddles x WHERE x.territory_id = tr.id AND x.question = r.question
);

COMMIT;
