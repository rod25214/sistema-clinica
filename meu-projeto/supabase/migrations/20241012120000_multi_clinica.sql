-- Perfil table (user profiles)
CREATE TABLE perfis (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    rg VARCHAR(20),
    telefone VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    tema VARCHAR(20) DEFAULT 'padrao sistema' CHECK (tema IN ('claro', 'escuro', 'padrao sistema')),
    cor_destaque VARCHAR(7) DEFAULT '#000000',
    data_login TIMESTAMP WITH TIME ZONE,
    status_perfil TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinics table
CREATE TABLE clinicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    ano_fundacao INTEGER,
    telefones TEXT, -- JSON array or comma-separated
    emails TEXT, -- JSON array or comma-separated
    endereco TEXT,
    criado_por UUID REFERENCES perfis(id),
    data_criacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status_clinica TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinic operating hours history
CREATE TABLE historico_horarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
    dias_semana TEXT, -- JSON array or comma-separated (e.g., ["segunda", "terca"])
    horario_inicio TIME, -- Opening time
    horario_fim TIME, -- Closing time
    alterado_por UUID REFERENCES perfis(id),
    data_alteracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Clinic users relationship table
CREATE TABLE clinica_usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clinica_id UUID REFERENCES clinicas(id) ON DELETE CASCADE,
    perfil_id UUID REFERENCES perfis(id) ON DELETE CASCADE,
    funcoes TEXT, -- JSON array or comma-separated functions
    areas_acesso TEXT, -- JSON array or comma-separated access areas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(clinica_id, perfil_id)
);

-- Enable real-time for all tables
alter publication supabase_realtime add table perfis;
alter publication supabase_realtime add table clinicas;
alter publication supabase_realtime add table historico_horarios;
alter publication supabase_realtime add table clinica_usuarios;

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_perfis_updated_at BEFORE UPDATE ON perfis FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clinicas_updated_at BEFORE UPDATE ON clinicas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_historico_horarios_updated_at BEFORE UPDATE ON historico_horarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_clinica_usuarios_updated_at BEFORE UPDATE ON clinica_usuarios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();