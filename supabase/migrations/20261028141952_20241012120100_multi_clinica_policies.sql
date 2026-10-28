/*
# Multi-clinic schema (part 2: grants + RLS policies)

## Overview
Adds grants and row-level security policies to all tables created in part 1.
This is a sign-in app (Supabase email/password), so all policies target the
`authenticated` role using `auth.uid()` for ownership/membership checks.

## Grants
- authenticated: CRUD on all tables except clinicas (no DELETE needed yet).
- service_role: full access on tables server routes/edge functions touch.
- funcoes: SELECT only to authenticated (role catalog is read-only for users).

## Policies (all TO authenticated)
- perfis: owner can SELECT/UPDATE own row.
- clinicas: members can SELECT; creator can INSERT; members can UPDATE.
- clinica_usuarios: self or same-clinic active members can CRUD.
- clinica_usuario_funcoes: same-clinic active members can CRUD.
- funcoes: SELECT for all authenticated.
- historico_horarios, pacientes, consultas, transacoes: clinic-membership-scoped CRUD.

## Important Notes
1. Membership check pattern: EXISTS (SELECT 1 FROM clinica_usuarios cu
   WHERE cu.clinica_id = <table>.clinica_id AND cu.perfil_id = auth.uid()
   AND cu.status = 'ativo').
2. No anon policies — this app requires sign-in.
3. Policies use DROP POLICY IF EXISTS first for idempotency.
*/

-- ============================================================
-- Grants
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON perfis TO authenticated;
GRANT SELECT, INSERT, UPDATE ON perfis TO service_role;

GRANT SELECT, INSERT, UPDATE ON clinicas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clinicas TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON historico_horarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON historico_horarios TO service_role;

GRANT SELECT ON funcoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON funcoes TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON clinica_usuarios TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clinica_usuarios TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON clinica_usuario_funcoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON clinica_usuario_funcoes TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON pacientes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON pacientes TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON consultas TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON consultas TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON transacoes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transacoes TO service_role;

-- ============================================================
-- perfis policies (owner-scoped)
-- ============================================================
DROP POLICY IF EXISTS "perfis_select_own" ON perfis;
CREATE POLICY "perfis_select_own" ON perfis FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "perfis_update_own" ON perfis;
CREATE POLICY "perfis_update_own" ON perfis FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- clinicas policies (membership-scoped)
-- ============================================================
DROP POLICY IF EXISTS "clinicas_select_member" ON clinicas;
CREATE POLICY "clinicas_select_member" ON clinicas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = clinicas.id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "clinicas_insert_own" ON clinicas;
CREATE POLICY "clinicas_insert_own" ON clinicas FOR INSERT
  TO authenticated
  WITH CHECK (criado_por = auth.uid() OR criado_por IS NULL);

DROP POLICY IF EXISTS "clinicas_update_member" ON clinicas;
CREATE POLICY "clinicas_update_member" ON clinicas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = clinicas.id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = clinicas.id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

-- ============================================================
-- historico_horarios policies (membership-scoped CRUD)
-- ============================================================
DROP POLICY IF EXISTS "historico_horarios_select_member" ON historico_horarios;
CREATE POLICY "historico_horarios_select_member" ON historico_horarios FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = historico_horarios.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "historico_horarios_insert_member" ON historico_horarios;
CREATE POLICY "historico_horarios_insert_member" ON historico_horarios FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = historico_horarios.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "historico_horarios_update_member" ON historico_horarios;
CREATE POLICY "historico_horarios_update_member" ON historico_horarios FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = historico_horarios.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = historico_horarios.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "historico_horarios_delete_member" ON historico_horarios;
CREATE POLICY "historico_horarios_delete_member" ON historico_horarios FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = historico_horarios.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

-- ============================================================
-- funcoes policies (read-only catalog)
-- ============================================================
DROP POLICY IF EXISTS "funcoes_select_all" ON funcoes;
CREATE POLICY "funcoes_select_all" ON funcoes FOR SELECT
  TO authenticated USING (true);

-- ============================================================
-- clinica_usuarios policies
-- ============================================================
DROP POLICY IF EXISTS "clinica_usuarios_select_own" ON clinica_usuarios;
CREATE POLICY "clinica_usuarios_select_own" ON clinica_usuarios FOR SELECT
  TO authenticated
  USING (
    perfil_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM clinica_usuarios cu2
      WHERE cu2.clinica_id = clinica_usuarios.clinica_id
        AND cu2.perfil_id = auth.uid()
        AND cu2.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "clinica_usuarios_insert_own" ON clinica_usuarios;
CREATE POLICY "clinica_usuarios_insert_own" ON clinica_usuarios FOR INSERT
  TO authenticated
  WITH CHECK (
    perfil_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM clinica_usuarios cu2
      WHERE cu2.clinica_id = clinica_usuarios.clinica_id
        AND cu2.perfil_id = auth.uid()
        AND cu2.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "clinica_usuarios_update_own" ON clinica_usuarios;
CREATE POLICY "clinica_usuarios_update_own" ON clinica_usuarios FOR UPDATE
  TO authenticated
  USING (
    perfil_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM clinica_usuarios cu2
      WHERE cu2.clinica_id = clinica_usuarios.clinica_id
        AND cu2.perfil_id = auth.uid()
        AND cu2.status = 'ativo'
    )
  )
  WITH CHECK (
    perfil_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM clinica_usuarios cu2
      WHERE cu2.clinica_id = clinica_usuarios.clinica_id
        AND cu2.perfil_id = auth.uid()
        AND cu2.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "clinica_usuarios_delete_own" ON clinica_usuarios;
CREATE POLICY "clinica_usuarios_delete_own" ON clinica_usuarios FOR DELETE
  TO authenticated
  USING (
    perfil_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM clinica_usuarios cu2
      WHERE cu2.clinica_id = clinica_usuarios.clinica_id
        AND cu2.perfil_id = auth.uid()
        AND cu2.status = 'ativo'
    )
  );

-- ============================================================
-- clinica_usuario_funcoes policies
-- ============================================================
DROP POLICY IF EXISTS "clinica_usuario_funcoes_select_member" ON clinica_usuario_funcoes;
CREATE POLICY "clinica_usuario_funcoes_select_member" ON clinica_usuario_funcoes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.id = clinica_usuario_funcoes.clinica_usuario_id
        AND (
          cu.perfil_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM clinica_usuarios cu2
            WHERE cu2.clinica_id = cu.clinica_id
              AND cu2.perfil_id = auth.uid()
              AND cu2.status = 'ativo'
          )
        )
    )
  );

DROP POLICY IF EXISTS "clinica_usuario_funcoes_insert_member" ON clinica_usuario_funcoes;
CREATE POLICY "clinica_usuario_funcoes_insert_member" ON clinica_usuario_funcoes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.id = clinica_usuario_funcoes.clinica_usuario_id
        AND EXISTS (
          SELECT 1 FROM clinica_usuarios cu2
          WHERE cu2.clinica_id = cu.clinica_id
            AND cu2.perfil_id = auth.uid()
            AND cu2.status = 'ativo'
        )
    )
  );

DROP POLICY IF EXISTS "clinica_usuario_funcoes_update_member" ON clinica_usuario_funcoes;
CREATE POLICY "clinica_usuario_funcoes_update_member" ON clinica_usuario_funcoes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.id = clinica_usuario_funcoes.clinica_usuario_id
        AND EXISTS (
          SELECT 1 FROM clinica_usuarios cu2
          WHERE cu2.clinica_id = cu.clinica_id
            AND cu2.perfil_id = auth.uid()
            AND cu2.status = 'ativo'
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.id = clinica_usuario_funcoes.clinica_usuario_id
        AND EXISTS (
          SELECT 1 FROM clinica_usuarios cu2
            WHERE cu2.clinica_id = cu.clinica_id
            AND cu2.perfil_id = auth.uid()
            AND cu2.status = 'ativo'
        )
    )
  );

DROP POLICY IF EXISTS "clinica_usuario_funcoes_delete_member" ON clinica_usuario_funcoes;
CREATE POLICY "clinica_usuario_funcoes_delete_member" ON clinica_usuario_funcoes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.id = clinica_usuario_funcoes.clinica_usuario_id
        AND EXISTS (
          SELECT 1 FROM clinica_usuarios cu2
          WHERE cu2.clinica_id = cu.clinica_id
            AND cu2.perfil_id = auth.uid()
            AND cu2.status = 'ativo'
        )
    )
  );

-- ============================================================
-- pacientes policies (membership-scoped CRUD)
-- ============================================================
DROP POLICY IF EXISTS "pacientes_select_member" ON pacientes;
CREATE POLICY "pacientes_select_member" ON pacientes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = pacientes.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "pacientes_insert_member" ON pacientes;
CREATE POLICY "pacientes_insert_member" ON pacientes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = pacientes.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "pacientes_update_member" ON pacientes;
CREATE POLICY "pacientes_update_member" ON pacientes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = pacientes.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = pacientes.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "pacientes_delete_member" ON pacientes;
CREATE POLICY "pacientes_delete_member" ON pacientes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = pacientes.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

-- ============================================================
-- consultas policies (membership-scoped CRUD)
-- ============================================================
DROP POLICY IF EXISTS "consultas_select_member" ON consultas;
CREATE POLICY "consultas_select_member" ON consultas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = consultas.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "consultas_insert_member" ON consultas;
CREATE POLICY "consultas_insert_member" ON consultas FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = consultas.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "consultas_update_member" ON consultas;
CREATE POLICY "consultas_update_member" ON consultas FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = consultas.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = consultas.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "consultas_delete_member" ON consultas;
CREATE POLICY "consultas_delete_member" ON consultas FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = consultas.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

-- ============================================================
-- transacoes policies (membership-scoped CRUD)
-- ============================================================
DROP POLICY IF EXISTS "transacoes_select_member" ON transacoes;
CREATE POLICY "transacoes_select_member" ON transacoes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = transacoes.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "transacoes_insert_member" ON transacoes;
CREATE POLICY "transacoes_insert_member" ON transacoes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = transacoes.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "transacoes_update_member" ON transacoes;
CREATE POLICY "transacoes_update_member" ON transacoes FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = transacoes.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = transacoes.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );

DROP POLICY IF EXISTS "transacoes_delete_member" ON transacoes;
CREATE POLICY "transacoes_delete_member" ON transacoes FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM clinica_usuarios cu
      WHERE cu.clinica_id = transacoes.clinica_id
        AND cu.perfil_id = auth.uid()
        AND cu.status = 'ativo'
    )
  );
