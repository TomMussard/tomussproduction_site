-- ═══════════════════════════════════════════════════
-- TOMUSS PRODUCTION — Tables contenu page Projets
-- À coller dans Supabase > SQL Editor > Run
-- ═══════════════════════════════════════════════════

-- 1. VIDÉOS MONTAGE
CREATE TABLE IF NOT EXISTS site_videos (
  id          SERIAL PRIMARY KEY,
  youtube_id  TEXT NOT NULL,
  title       TEXT NOT NULL,
  creator     TEXT NOT NULL DEFAULT '',
  views_label TEXT NOT NULL DEFAULT '—',
  date_label  TEXT NOT NULL DEFAULT '',
  thumbnail   TEXT NOT NULL DEFAULT '',
  avatar      TEXT NOT NULL DEFAULT '',
  tag         TEXT NOT NULL DEFAULT 'Montage',
  sort_order  INT  NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SHORTS & REELS
CREATE TABLE IF NOT EXISTS site_shorts (
  id          SERIAL PRIMARY KEY,
  youtube_id  TEXT,
  src         TEXT,
  title       TEXT NOT NULL,
  creator     TEXT NOT NULL DEFAULT '',
  date_label  TEXT NOT NULL DEFAULT '',
  thumbnail   TEXT NOT NULL DEFAULT '',
  tag         TEXT NOT NULL DEFAULT 'Reel',
  sort_order  INT  NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ÉVÉNEMENTS PHOTO
CREATE TABLE IF NOT EXISTS site_events (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  year        INT,
  slug        TEXT UNIQUE NOT NULL,
  status      TEXT NOT NULL DEFAULT 'published',  -- published | soon
  sort_order  INT  NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PHOTOS
CREATE TABLE IF NOT EXISTS site_photos (
  id          SERIAL PRIMARY KEY,
  event_id    INT REFERENCES site_events(id) ON DELETE CASCADE,
  src         TEXT NOT NULL,
  caption     TEXT NOT NULL DEFAULT '',
  sort_order  INT  NOT NULL DEFAULT 0,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── RLS (lecture publique, écriture libre pour le dashboard) ──
ALTER TABLE site_videos  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_shorts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_events  ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_photos  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read videos"  ON site_videos  FOR SELECT USING (true);
CREATE POLICY "public read shorts"  ON site_shorts  FOR SELECT USING (true);
CREATE POLICY "public read events"  ON site_events  FOR SELECT USING (true);
CREATE POLICY "public read photos"  ON site_photos  FOR SELECT USING (true);

CREATE POLICY "anon write videos"  ON site_videos  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon write shorts"  ON site_shorts  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon write events"  ON site_events  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "anon write photos"  ON site_photos  FOR ALL USING (true) WITH CHECK (true);

-- ── DONNÉES INITIALES ──

-- Vidéos montage (tes 6 vidéos actuelles)
INSERT INTO site_videos (youtube_id, title, creator, views_label, date_label, thumbnail, avatar, tag, sort_order) VALUES
('r0zvh0ElcnM', 'QUI EST LE JOUEUR PRO ?! (ft. Gradur & Redouane Bougheraba)', 'Pitch Addict',  '552 k', 'Mai 2026',   'uploads/miniadvlp.jpg',           'uploads/channels4_profile.png',      'Storytelling', 1),
('UqYMpBAAEA8', 'LE MEILLEUR BARBER D''INTERNET ! (ft Inoxtag Joyca Nico & Cocotte)',  'Hairtist',      '552 k', 'Août 2025',  'uploads/maxresdefault (1).jpg',    'uploads/unnamed.jpg',                'Multicam',     2),
('-YiWp9Usmr0', 'J''ai acheté 10 VALISES PERDUES (c''est trop RENTABLE)',              'Camille LV',    '766 k', 'Févr. 2024', 'uploads/maxresdefault (2).jpg',    'uploads/channels4_profile (2).jpg',  'Storytelling', 3),
('Tnw8BUV8Y8s', 'On goûte les 20 aliments préférés des français',                     'Pierre Croce',  '135 k', 'Nov. 2025',  'uploads/maxresdefault (3).jpg',    'uploads/channels4_profile (3).jpg',  'Facecam',      4),
('F77U_yuUb5s', 'CACHE CACHE DANS UNE BIBLIOTHÈQUE (MAIS fais pas de bruit)',          'Guizzi',        '532 k', 'Sept. 2024', 'uploads/maxresdefault (4).jpg',    'uploads/channels4_profile (4).jpg',  'Multicam',     5),
('es62U2hFlA4', 'MATHIS DUMAS ME DÉVOILE LES SECRETS DE L''EVEREST AVEC INOXTAG !',   'Hairtist',      '610 k', 'Sept. 2024', 'uploads/maxresdefault (5).jpg',    'uploads/unnamed.jpg',                'Interview',    6);

-- Événements photo
INSERT INTO site_events (name, year, slug, status, sort_order) VALUES
('24H du Mans',     2025, '24h-2025',  'published', 1),
('24H du Mans',     2026, '24h-2026',  'soon',       2),
('Route du Rhum',   2026, 'rhum-2026', 'soon',       3);

-- Photos 24H 2025 (reliées à l'event id=1)
INSERT INTO site_photos (event_id, src, caption, sort_order)
SELECT e.id, v.src, v.caption, v.sort_order
FROM site_events e,
(VALUES
  ('uploads/PHOTO/DSC03270.jpg',    '24H du Mans 2025',  1),
  ('uploads/PHOTO/DSC04947.jpeg',   '24H du Mans 2025',  2),
  ('uploads/PHOTO/DSC05020.jpeg',   '24H du Mans 2025',  3),
  ('uploads/PHOTO/DSC05054.jpeg',   '24H du Mans 2025',  4),
  ('uploads/PHOTO/DSC05080.jpeg',   '24H du Mans 2025',  5),
  ('uploads/PHOTO/DSC05088.jpeg',   '24H du Mans 2025',  6),
  ('uploads/PHOTO/DSC05115.jpeg',   '24H du Mans 2025',  7),
  ('uploads/PHOTO/DSC05399.jpeg',   '24H du Mans 2025',  8),
  ('uploads/PHOTO/DSC07198.jpeg',   '24H du Mans 2025',  9),
  ('uploads/PHOTO/DSC07207.jpeg',   '24H du Mans 2025', 10),
  ('uploads/PHOTO/DSC07222.jpeg',   '24H du Mans 2025', 11),
  ('uploads/PHOTO/DSC07248.jpeg',   '24H du Mans 2025', 12),
  ('uploads/PHOTO/IMG_1746.jpeg',   '24H du Mans 2025', 13),
  ('uploads/PHOTO/IMG_1753.jpeg',   '24H du Mans 2025', 14),
  ('uploads/PHOTO/IMG_1760.jpeg',   '24H du Mans 2025', 15),
  ('uploads/PHOTO/IMG_1761.jpeg',   '24H du Mans 2025', 16),
  ('uploads/PHOTO/IMG_1763.jpeg',   '24H du Mans 2025', 17),
  ('uploads/PHOTO/IMG_1769 2.jpeg', '24H du Mans 2025', 18)
) AS v(src, caption, sort_order)
WHERE e.slug = '24h-2025';
