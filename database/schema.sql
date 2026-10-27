BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS citext;

DO $$
BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'collaborator', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE nicaragua_region AS ENUM ('Pacífico', 'Norte', 'Atlántico', 'Central');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE site_category AS ENUM ('turistico', 'historico', 'colonial');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE stream_status AS ENUM ('scheduled', 'live', 'ended', 'offline');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS departments (
  id TEXT PRIMARY KEY
    CHECK (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  name VARCHAR(120) NOT NULL UNIQUE,
  capital VARCHAR(120) NOT NULL,
  region nicaragua_region NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  map_x NUMERIC(8, 2),
  map_y NUMERIC(8, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tourist_sites (
  id TEXT PRIMARY KEY
    CHECK (id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  department_id TEXT NOT NULL
    REFERENCES departments (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  name VARCHAR(180) NOT NULL,
  category site_category NOT NULL DEFAULT 'turistico',
  description TEXT NOT NULL DEFAULT '',
  history TEXT NOT NULL DEFAULT '',
  cover_image_url TEXT,
  thumbnail_image_url TEXT,
  video_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT tourist_sites_department_name_unique UNIQUE (department_id, name)
);

CREATE TABLE IF NOT EXISTS mipymes (
  id TEXT PRIMARY KEY,
  site_id TEXT NOT NULL REFERENCES tourist_sites (id) ON UPDATE CASCADE ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  type VARCHAR(30) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  distance VARCHAR(60) NOT NULL DEFAULT '',
  rating NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  price_range TEXT NOT NULL CHECK (price_range IN ('$', '$$', '$$$')),
  phone VARCHAR(40) NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS mipymes_site_idx ON mipymes (site_id);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email CITEXT NOT NULL UNIQUE,
  password_hash TEXT,
  firebase_uid TEXT,
  full_name VARCHAR(120) NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  avatar_url TEXT,
  bio TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ant_media_stream_id UUID NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  stream_key_ciphertext TEXT,
  stream_key_iv TEXT,
  stream_key_tag TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_stream_key_complete CHECK (
    (stream_key_ciphertext IS NULL AND stream_key_iv IS NULL AND stream_key_tag IS NULL)
    OR
    (stream_key_ciphertext IS NOT NULL AND stream_key_iv IS NOT NULL AND stream_key_tag IS NOT NULL)
  )
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid TEXT;
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS users_firebase_uid_key ON users (firebase_uid);

CREATE TABLE IF NOT EXISTS streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collaborator_id UUID NOT NULL
    REFERENCES users (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  department_id TEXT
    REFERENCES departments (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  tourist_site_id TEXT
    REFERENCES tourist_sites (id) ON UPDATE CASCADE ON DELETE RESTRICT,
  title VARCHAR(180) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status stream_status NOT NULL DEFAULT 'scheduled',
  ant_media_stream_id UUID NOT NULL,
  playback_hls_url TEXT,
  playback_webrtc_url TEXT,
  thumbnail_url TEXT,
  viewer_count INTEGER NOT NULL DEFAULT 0 CHECK (viewer_count >= 0),
  scheduled_for TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT streams_single_target CHECK (
    NUM_NONNULLS(department_id, tourist_site_id) = 1
  ),
  CONSTRAINT streams_valid_dates CHECK (
    (ended_at IS NULL OR started_at IS NULL OR ended_at >= started_at)
    AND (scheduled_for IS NULL OR started_at IS NULL OR scheduled_for <= started_at)
  )
);

CREATE TABLE IF NOT EXISTS resenas (
  id SERIAL PRIMARY KEY,
  autor VARCHAR(120) NOT NULL,
  calificacion SMALLINT NOT NULL CHECK (calificacion BETWEEN 1 AND 5),
  comentario TEXT NOT NULL,
  destino_id TEXT NOT NULL DEFAULT '',
  destino_nombre VARCHAR(180) NOT NULL,
  departamento VARCHAR(120) NOT NULL,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS destinos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(180) NOT NULL,
  departamento VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL DEFAULT '',
  imagen_url TEXT NOT NULL DEFAULT '',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS departments_region_idx
  ON departments (region);

CREATE INDEX IF NOT EXISTS tourist_sites_department_active_idx
  ON tourist_sites (department_id, is_active);

CREATE INDEX IF NOT EXISTS tourist_sites_category_idx
  ON tourist_sites (category)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS tourist_sites_tags_gin_idx
  ON tourist_sites USING GIN (tags);

CREATE INDEX IF NOT EXISTS users_role_active_idx
  ON users (role, is_active);

CREATE INDEX IF NOT EXISTS users_created_at_idx
  ON users (created_at DESC);

CREATE INDEX IF NOT EXISTS streams_status_started_idx
  ON streams (status, started_at DESC);

CREATE INDEX IF NOT EXISTS streams_collaborator_status_idx
  ON streams (collaborator_id, status);

CREATE INDEX IF NOT EXISTS streams_department_status_idx
  ON streams (department_id, status)
  WHERE department_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS streams_site_status_idx
  ON streams (tourist_site_id, status)
  WHERE tourist_site_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS streams_ant_media_id_idx
  ON streams (ant_media_stream_id);

CREATE UNIQUE INDEX IF NOT EXISTS streams_one_live_per_collaborator_idx
  ON streams (collaborator_id)
  WHERE status = 'live';

CREATE INDEX IF NOT EXISTS resenas_creado_en_idx
  ON resenas (creado_en DESC);

CREATE INDEX IF NOT EXISTS destinos_creado_en_idx
  ON destinos (creado_en DESC);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS departments_set_updated_at ON departments;
CREATE TRIGGER departments_set_updated_at
BEFORE UPDATE ON departments
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS tourist_sites_set_updated_at ON tourist_sites;
CREATE TRIGGER tourist_sites_set_updated_at
BEFORE UPDATE ON tourist_sites
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS streams_set_updated_at ON streams;
CREATE TRIGGER streams_set_updated_at
BEFORE UPDATE ON streams
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE VIEW public_live_streams AS
SELECT
  s.id,
  s.title,
  s.description,
  s.status,
  s.ant_media_stream_id,
  s.playback_hls_url,
  s.playback_webrtc_url,
  s.thumbnail_url,
  s.viewer_count,
  s.scheduled_for,
  s.started_at,
  s.ended_at,
  s.department_id,
  COALESCE(d.name, target_department.name) AS department_name,
  s.tourist_site_id,
  ts.name AS tourist_site_name,
  u.id AS collaborator_id,
  u.full_name AS collaborator_name,
  u.avatar_url AS collaborator_avatar_url
FROM streams s
JOIN users u ON u.id = s.collaborator_id
LEFT JOIN departments d ON d.id = s.department_id
LEFT JOIN tourist_sites ts ON ts.id = s.tourist_site_id
LEFT JOIN departments target_department ON target_department.id = ts.department_id
WHERE s.status IN ('scheduled', 'live');

COMMIT;
