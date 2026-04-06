CREATE TYPE user_role AS ENUM ('viewer', 'analyst', 'admin');

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role user_role DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE records (
  id SERIAL PRIMARY KEY,
  amount NUMERIC(12,2) NOT NULL,
  type VARCHAR(10) CHECK (type IN ('income','expense')) NOT NULL,
  category VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  created_by INTEGER REFERENCES users(id),
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);
