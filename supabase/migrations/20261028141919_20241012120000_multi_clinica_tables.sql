/*
# Multi-clinic dental management schema (part 1: tables)

## Overview
Creates all tables for a multi-clinic dental/medical management system.

## New Tables
1. perfis — user profile, 1:1 with auth.users
2. clinicas — a clinic
3. historico_horarios — operating-hours change history
4. funcoes — role catalog (seeded with 6 roles)
5. clinica_usuarios — membership linking perfil <-> clinic
6. clinica_usuario_funcoes — many-to-many roles per membership
7. pacientes — patients scoped to a clinic
8. consultas — appointments
9. transacoes — financial entries

## Security
- RLS enabled on every table (policies added in part 2).
- Grants added in part 2.
- handle_new_user trigger auto-creates perfis row on signup.

## Important Notes
1. Tables created here without policies; part 2 adds all grants + policies.
2. funcoes seeded with: administrador, medico, recepcionista, auxiliar, financeiro, funcionario.
3. updated_at triggers keep timestamps current.
*/

-- ============================================================
-- perfis (user profiles, 1:1 with auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS perfis (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo varchar(255) NOT NULL,
  cpf varchar(14) UNIQUE,
  rg varchar(20),
  telefone varchar(20),
  email varchar(255) UNIQUE,
  tema varchar(20) DEFAULT 'padrao sistema' CHECK (tema IN ('claro', 'escuro', 'padrao sistema')),
  cor_destaque varchar(7) DEFAULT '#000000',
  data_login timestamptz,
  status_perfil text DEFAULT 'ativo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- clinicas
-- ============================================================
CREATE TABLE IF NOT EXISTS clinicas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_fantasia varchar(255) NOT NULL,
  cnpj varchar(18) UNIQUE,
  ano_fundacao integer,
  telefones text,
  emails text,
  endereco text,
  criado_por uuid REFERENCES perfis(id),
  data_criacao timestamptz DEFAULT now(),
  status_clinica text DEFAULT 'ativo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clinicas ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- historico_horarios (operating-hours history)
-- ============================================================
CREATE TABLE IF NOT EXISTS historico_horarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  dias_semana text,
  horario_inicio time,
  horario_fim time,
  alterado_por uuid REFERENCES perfis(id),
  data_alteracao timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE historico_horarios ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- funcoes (role catalog)
-- ============================================================
CREATE TABLE IF NOT EXISTS funcoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text UNIQUE NOT NULL,
  nome text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE funcoes ENABLE ROW LEVEL SECURITY;

INSERT INTO funcoes (codigo, nome)
VALUES
  ('administrador', 'Administrador'),
  ('medico', 'Médico'),
  ('recepcionista', 'Recepcionista'),
  ('auxiliar', 'Auxiliar'),
  ('financeiro', 'Financeiro'),
  ('funcionario', 'Funcionário')
ON CONFLICT (codigo) DO NOTHING;

-- ============================================================
-- clinica_usuarios (membership)
-- ============================================================
CREATE TABLE IF NOT EXISTS clinica_usuarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  perfil_id uuid REFERENCES perfis(id) ON DELETE CASCADE,
  status text DEFAULT 'ativo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(clinica_id, perfil_id)
);

ALTER TABLE clinica_usuarios ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- clinica_usuario_funcoes (membership <-> role join)
-- ============================================================
CREATE TABLE IF NOT EXISTS clinica_usuario_funcoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_usuario_id uuid REFERENCES clinica_usuarios(id) ON DELETE CASCADE,
  funcao_id uuid REFERENCES funcoes(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(clinica_usuario_id, funcao_id)
);

ALTER TABLE clinica_usuario_funcoes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- pacientes (patients scoped to a clinic)
-- ============================================================
CREATE TABLE IF NOT EXISTS pacientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  nome varchar(255) NOT NULL,
  cpf varchar(14),
  telefone varchar(20),
  email varchar(255),
  data_nascimento date,
  endereco text,
  observacoes text,
  created_by uuid REFERENCES perfis(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- consultas (appointments)
-- ============================================================
CREATE TABLE IF NOT EXISTS consultas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE CASCADE,
  dentista_id uuid REFERENCES perfis(id),
  data_hora timestamptz NOT NULL,
  duracao_minutos integer DEFAULT 30,
  procedimento varchar(255),
  status varchar(30) DEFAULT 'agendado',
  observacoes text,
  created_by uuid REFERENCES perfis(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE consultas ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- transacoes (financial entries)
-- ============================================================
CREATE TABLE IF NOT EXISTS transacoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinica_id uuid REFERENCES clinicas(id) ON DELETE CASCADE,
  paciente_id uuid REFERENCES pacientes(id) ON DELETE SET NULL,
  tipo varchar(20) NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  valor numeric(12,2) NOT NULL,
  descricao text,
  data_vencimento date,
  data_pagamento date,
  status varchar(30) DEFAULT 'pendente',
  created_by uuid REFERENCES perfis(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE transacoes ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- updated_at trigger function (idempotent)
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_perfis_updated_at ON perfis;
CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON perfis FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinicas_updated_at ON clinicas;
CREATE TRIGGER update_clinicas_updated_at BEFORE UPDATE ON clinicas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_historico_horarios_updated_at ON historico_horarios;
CREATE TRIGGER update_historico_horarios_updated_at BEFORE UPDATE ON historico_horarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_clinica_usuarios_updated_at ON clinica_usuarios;
CREATE TRIGGER update_clinica_usuarios_updated_at BEFORE UPDATE ON clinica_usuarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_pacientes_updated_at ON pacientes;
CREATE TRIGGER update_pacientes_updated_at BEFORE UPDATE ON pacientes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_consultas_updated_at ON consultas;
CREATE TRIGGER update_consultas_updated_at BEFORE UPDATE ON consultas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_transacoes_updated_at ON transacoes;
CREATE TRIGGER update_transacoes_updated_at BEFORE UPDATE ON transacoes FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- ============================================================
-- Auto-create perfis row on auth.users signup (SECURITY DEFINER)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.perfis (id, nome_completo, cpf, rg, telefone, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'rg',
    NEW.raw_user_meta_data->>'telefone',
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO authenticated;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- Realtime
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE perfis;
ALTER PUBLICATION supabase_realtime ADD TABLE clinicas;
ALTER PUBLICATION supabase_realtime ADD TABLE historico_horarios;
ALTER PUBLICATION supabase_realtime ADD TABLE clinica_usuarios;
ALTER PUBLICATION supabase_realtime ADD TABLE clinica_usuario_funcoes;
ALTER PUBLICATION supabase_realtime ADD TABLE pacientes;
ALTER PUBLICATION supabase_realtime ADD TABLE consultas;
ALTER PUBLICATION supabase_realtime ADD TABLE transacoes;

-- ============================================================
-- Indexes for frequently-queried columns
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clinica_usuarios_perfil ON clinica_usuarios(perfil_id);
CREATE INDEX IF NOT EXISTS idx_clinica_usuarios_clinica ON clinica_usuarios(clinica_id);
CREATE INDEX IF NOT EXISTS idx_clinica_usuarios_status ON clinica_usuarios(status);
CREATE INDEX IF NOT EXISTS idx_clinica_usuario_funcoes_cu ON clinica_usuario_funcoes(clinica_usuario_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_clinica ON pacientes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_consultas_clinica ON consultas(clinica_id);
CREATE INDEX IF NOT EXISTS idx_consultas_paciente ON consultas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_consultas_data_hora ON consultas(data_hora);
CREATE INDEX IF NOT EXISTS idx_transacoes_clinica ON transacoes(clinica_id);
CREATE INDEX IF NOT EXISTS idx_historico_horarios_clinica ON historico_horarios(clinica_id);
