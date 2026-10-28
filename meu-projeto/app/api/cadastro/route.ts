
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function responder(
  mensagem: string,
  status: number,
  dadosExtras: Record<string, unknown> = {}
) {
  return NextResponse.json(
    { error: status >= 400 ? mensagem : undefined, message: status < 400 ? mensagem : undefined, ...dadosExtras },
    { status }
  );
}

export async function POST(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error("Variáveis de ambiente do Supabase não configuradas.");
      return responder("Configuração do servidor incompleta.", 500);
    }

    let body: Record<string, unknown>;

    try {
      body = await request.json();
    } catch {
      return responder("Os dados enviados são inválidos.", 400);
    }

    const nome_completo =
      typeof body.nome_completo === "string"
        ? body.nome_completo.trim()
        : "";

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const cpf =
      typeof body.cpf === "string"
        ? body.cpf.replace(/\D/g, "")
        : "";

    const rg =
      typeof body.rg === "string" ? body.rg.trim() : "";

    const telefone =
      typeof body.telefone === "string"
        ? body.telefone.trim()
        : "";

    const password =
      typeof body.password === "string" ? body.password : "";

    // Validações básicas
    if (!nome_completo) {
      return responder("Nome completo é obrigatório.", 400);
    }

    if (nome_completo.length > 150) {
      return responder("O nome completo é muito longo.", 400);
    }

    if (!email) {
      return responder("E-mail é obrigatório.", 400);
    }

    if (
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return responder("Informe um e-mail válido.", 400);
    }

    if (!/^\d{11}$/.test(cpf)) {
      return responder(
        "O CPF deve conter 11 números.",
        400
      );
    }

    if (rg.length > 30) {
      return responder("O RG informado é muito longo.", 400);
    }

    if (telefone.length > 30) {
      return responder(
        "O telefone informado é muito longo.",
        400
      );
    }

    if (!password) {
      return responder("Senha é obrigatória.", 400);
    }

    if (password.length < 8) {
      return responder(
        "A senha deve ter pelo menos 8 caracteres.",
        400
      );
    }

    if (password.length > 128) {
      return responder("A senha é muito longa.", 400);
    }

    // Cliente público: não utiliza a chave secreta de administrador.
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Cria o usuário no Supabase Auth.
    // O gatilho SQL cria automaticamente a linha em public.perfis.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nome_completo,
          cpf,
          rg: rg || null,
          telefone: telefone || null,
        },
      },
    });

    if (error) {
      const mensagem = error.message.toLowerCase();

      if (
        mensagem.includes("duplicate key") &&
        mensagem.includes("cpf")
      ) {
        return responder(
          "Este CPF já está cadastrado.",
          409
        );
      }

      if (
        mensagem.includes("already registered") ||
        mensagem.includes("already been registered") ||
        mensagem.includes("user already exists")
      ) {
        return responder(
          "Este e-mail já possui uma conta cadastrada.",
          409
        );
      }

      if (
        mensagem.includes("password") &&
        (mensagem.includes("weak") ||
          mensagem.includes("least"))
      ) {
        return responder(
          "A senha não atende aos requisitos de segurança.",
          400
        );
      }

      // Detalhes técnicos ficam apenas no servidor.
      console.error("Erro no cadastro Supabase:", error.message);

      return responder(
        "Não foi possível criar a conta. Verifique os dados e tente novamente.",
        400
      );
    }

    if (!data.user) {
      return responder(
        "Não foi possível confirmar a criação da conta.",
        500
      );
    }

    return responder(
      data.session
        ? "Conta criada com sucesso."
        : "Conta criada. Verifique seu e-mail para confirmar o cadastro.",
      201,
      {
        success: true,
        confirmationRequired: !data.session,
      }
    );
  } catch (error) {
    console.error("Erro inesperado na rota de cadastro:", error);

    return responder(
      "Erro interno ao processar o cadastro.",
      500
    );
  }
}
