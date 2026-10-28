/**
 * ============================================================
 * Upload de imagem para o Storage
 *
 * Usado por produtos, pacientes e funcionários. O bucket e
 * sempre PRIVADO: o arquivo fica guardado e só é servido
 * pela rota /serve, que valida a clinica de quem pede.
 *
 * O caminho no storage segue o padrao:
 *   clinic_id/<pasta>/<id>-<timestamp>.<ext>
 * O primeiro segmento (clinic_id) e o que a policy de
 * storage usa para bloquear acesso cruzado.
 * ============================================================
 */

import { NextResponse } from "next/server"

import { requireClinic } from "@/lib/api/context"

/** Tipos aceitos, casados com allowed_mime_types do bucket. */
const MIME_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
}

const MAX_BYTES = 5 * 1024 * 1024

/**
 * Monta o caminho no storage.
 */
export function buildStoragePath(
  clinicId: string,
  folder: string,
  id: string,
  ext: string,
) {
  const stamp = Date.now()

  return `${clinicId}/${folder}/${id}-${stamp}.${ext}`
}

/**
 * ============================================================
 * POST /api/upload
 *
 * body: FormData com "file" e os campos "folder" e "id".
 * ============================================================
 */
export async function POST(
  request: Request,
) {
  try {
    const ctx = await requireClinic(request)

    if (ctx instanceof NextResponse) {
      return ctx
    }

    const { supabase, clinicId, userId } =
      ctx

    const form = await request.formData()
    const file = form.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Envie um arquivo no campo 'file'.",
        },
        { status: 400 },
      )
    }

    // Valida o tipo pelo MIME e pela extensao real.
    const ext = MIME_EXT[file.type]

    if (!ext) {
      return NextResponse.json(
        {
          error:
            "Formato inválido. Use JPG, PNG, WEBP ou GIF.",
        },
        { status: 400 },
      )
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        {
          error:
            "Arquivo muito grande. Máximo 5 MB.",
        },
        { status: 400 },
      )
    }

    if (file.size === 0) {
      return NextResponse.json(
        {
          error: "Arquivo vazio.",
        },
        { status: 400 },
      )
    }

    const folder = String(
      form.get("folder") || "uploads",
    )

    const id = String(
      form.get("id") || userId,
    )

    const path = buildStoragePath(
      clinicId,
      folder,
      id,
      ext,
    )

    const buffer = Buffer.from(
      await file.arrayBuffer(),
    )

    const { error } = await supabase.storage
      .from(folder)
      .upload(path, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) {
      console.error(
        "[upload] Erro no storage:",
        error,
      )

      return NextResponse.json(
        {
          error:
            "Não foi possível enviar o arquivo.",
        },
        { status: 500 },
      )
    }

    return NextResponse.json(
      {
        path,
        bucket: folder,
        url: `/api/files/${folder}/${encodeURIComponent(path)}`,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error(
      "[upload] Erro interno:",
      error,
    )

    return NextResponse.json(
      {
        error: "Erro interno no upload.",
      },
      { status: 500 },
    )
  }
}
