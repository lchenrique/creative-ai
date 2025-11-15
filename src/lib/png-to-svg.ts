const VECTORIZE_API_URL =
  import.meta.env.VITE_VECTORIZE_API_URL || "http://localhost:3001";

/**
 * Converte uma imagem PNG para SVG usando a API de vectorização
 * @param imageUrl URL da imagem PNG
 * @returns SVG como string
 */
export async function convertPNGtoSVG(imageUrl: string): Promise<string> {
  try {
    const response = await fetch(`${VECTORIZE_API_URL}/convert`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl,
        options: {
          turnPolicy: "minority",
          turdSize: 2,
          optCurve: true,
          alphaMax: 1,
          optTolerance: 0.2,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Falha ao converter imagem");
    }

    const data = await response.json();

    if (!data.success || !data.svg) {
      throw new Error("Resposta inválida da API de conversão");
    }

    return data.svg;
  } catch (error) {
    console.error("Erro ao converter PNG para SVG:", error);
    throw error;
  }
}
