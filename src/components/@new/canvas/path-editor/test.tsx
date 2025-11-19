import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import * as opentype from "opentype.js";

/** Mini App: ClipPath Studio
 * - Upload de fonte
 * - Digitar texto
 * - Gerar clip-path
 * - Visualizar preview
 * - Baixar SVG
 */
export default function ClipPathStudio() {
    const [fontFile, setFontFile] = useState<File | null>(null);
    const [text, setText] = useState("A");
    const [fontSize, setFontSize] = useState(200);
    const [resultCss, setResultCss] = useState("");
    const [svgPath, setSvgPath] = useState("");
    const [loading, setLoading] = useState(false);
    const svgIdRef = useRef(`clip-${Math.random().toString(36).slice(2, 9)}`);

    const handleFontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setFontFile(file);
        setResultCss("");
        setSvgPath("");
    };

    async function convert() {
        if (!fontFile) return alert("Envie uma fonte antes");
        if (!text.trim()) return alert("Digite um texto");

        setLoading(true);
        try {
            const arrayBuffer = await fontFile.arrayBuffer();
            const font = opentype.parse(arrayBuffer);
            const path = font.getPath(text, 0, fontSize, fontSize);
            const d = path.toPathData(2);

            const safeD = d.replace(/"/g, "'");
            setResultCss(`clip-path: path("${safeD}");`);
            setSvgPath(d);
        } catch (err) {
            console.error(err);
            alert("Erro ao converter a fonte.");
        } finally {
            setLoading(false);
        }
    }

    function downloadSVG() {
        if (!svgPath) return;

        const width = 800;
        const height = 400;
        const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'>\n  <g transform='translate(0 ${height / 2}) scale(1 -1)'>\n    <path d='${svgPath}' />\n  </g>\n</svg>`;

        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.href = url;
        a.download = `clippath-${text}.svg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    }

    return (
        <div className="w-full  bg-gray-50 p-6 flex flex-col items-center gap-6">
            <h1 className="text-3xl font-bold text-center">ClipPath Studio</h1>
            <p className="text-gray-600 text-center max-w-xl">
                Gere clip-paths a partir de qualquer fonte usando OpenType.js
            </p>

            <Card className="w-full max-w-2xl p-4 shadow-xl rounded-2xl">
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Fonte (.ttf / .otf)</label>
                        <input type="file" accept=".ttf,.otf" onChange={handleFontUpload} />
                    </div>

                    <div className="flex gap-3 items-center">
                        <div className="flex-1 flex flex-col gap-1">
                            <label className="text-sm font-medium">Texto</label>
                            <input
                                className="border p-2 rounded-xl flex-1"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-1 w-28">
                            <label className="text-sm font-medium">Tamanho</label>
                            <input
                                type="number"
                                className="border p-2 rounded-xl"
                                value={fontSize}
                                min={16}
                                max={1000}
                                onChange={(e) => setFontSize(Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                        <Button onClick={convert} disabled={loading}>
                            {loading ? "Convertendo..." : "Gerar clip-path"}
                        </Button>

                        <Button onClick={downloadSVG} disabled={!svgPath}>
                            Baixar SVG
                        </Button>
                    </div>

                    {/* {resultCss && (
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-sm font-medium">CSS Gerado</label>
              <pre className="bg-gray-100 p-4 rounded-xl text-sm whitespace-pre-wrap break-all border">
                {resultCss}
              </pre>
            </div>
          )} */}

                    <div className="mt-4">
                        <label className="text-sm font-medium">Preview</label>
                        <div className="mt-2 border rounded-xl p-2 bg-white flex items-center justify-center" style={{ minHeight: 200 }}>
                            <svg width={600} height={200} viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <clipPath id={svgIdRef.current} clipPathUnits="userSpaceOnUse">
                                        <g transform={`scale(1 -1) translate(0 -${fontSize})`}>
                                            <path d={svgPath} />
                                        </g>
                                    </clipPath>
                                </defs>

                                <rect width="100%" height="100%" fill="#e5e7eb" />

                                <g clipPath={`url(#${svgIdRef.current})`}>
                                    <rect width="100%" height="100%" fill="#d1d5db" />
                                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" fontSize="26">
                                        Recorte aplicado
                                    </text>
                                </g>

                                <g>
                                    <path d={svgPath} stroke="#111827" strokeWidth={1} fill="none" />
                                </g>
                            </svg>
                        </div>
                    </div>
                    {console.log(svgPath)}

                    {/* Preview como MÁSCARA real em uma DIV */}
                    {svgPath && (
                        <div className="mt-6 flex flex-col gap-2">
                            <label className="text-sm font-medium">Máscara aplicada em uma DIV colorida</label>

                            <div
                                className="w-full h-100 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white flex items-center justify-center font-bold text-2xl"
                                style={{
                                    WebkitClipPath: `path('${svgPath.replace(/"/g, "'")}')`,
                                    clipPath: `path('${svgPath.replace(/"/g, "'")}')`,
                                }}
                            >
                            </div>
                        </div>
                    )}

                </CardContent>
            </Card>
        </div>
    );
}
