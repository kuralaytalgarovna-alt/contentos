import { useEffect, useRef, useState } from "react";
import { getBrandKit } from "../api/brandKit";
import { listMedia } from "../api/media";
import { useProjectStore } from "../store/projectStore";
import type { BrandKit, MediaAsset } from "../types";

interface Template {
  key: string;
  label: string;
  width: number;
  height: number;
}

const TEMPLATES: Template[] = [
  { key: "post", label: "Пост 1:1", width: 1080, height: 1080 },
  { key: "story", label: "Сторис 9:16", width: 1080, height: 1920 },
  { key: "cover", label: "Обложка 16:9", width: 1200, height: 630 },
];

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const attempt = current ? `${current} ${word}` : word;
    if (ctx.measureText(attempt).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = attempt;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export function Constructor() {
  const projectId = useProjectStore((s) => s.currentProjectId);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [title, setTitle] = useState("Заголовок поста");
  const [subtitle, setSubtitle] = useState("Короткое пояснение под заголовком");
  const [backgroundAssetId, setBackgroundAssetId] = useState<string>("");
  const [backgroundImage, setBackgroundImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!projectId) return;
    void getBrandKit(projectId).then(setBrandKit);
    void listMedia(projectId).then(setAssets);
  }, [projectId]);

  useEffect(() => {
    const asset = assets.find((a) => a.id === backgroundAssetId);
    if (!asset || !asset.content_type.startsWith("image")) {
      setBackgroundImage(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setBackgroundImage(img);
    img.src = asset.url;
  }, [backgroundAssetId, assets]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !brandKit) return;
    canvas.width = template.width;
    canvas.height = template.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = brandKit.color_secondary;
    ctx.fillRect(0, 0, template.width, template.height);

    if (backgroundImage) {
      const scale = Math.max(template.width / backgroundImage.width, template.height / backgroundImage.height);
      const w = backgroundImage.width * scale;
      const h = backgroundImage.height * scale;
      ctx.drawImage(backgroundImage, (template.width - w) / 2, (template.height - h) / 2, w, h);
    }

    const overlayHeight = template.height * 0.32;
    const gradient = ctx.createLinearGradient(0, template.height - overlayHeight, 0, template.height);
    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.65)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, template.height - overlayHeight, template.width, overlayHeight);

    const padding = template.width * 0.06;
    const maxTextWidth = template.width - padding * 2;

    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "alphabetic";
    const titleSize = Math.round(template.width * 0.055);
    ctx.font = `700 ${titleSize}px ${brandKit.font_heading}, sans-serif`;
    const titleLines = wrapText(ctx, title, maxTextWidth).slice(0, 3);

    const subtitleSize = Math.round(template.width * 0.03);
    ctx.font = `400 ${subtitleSize}px ${brandKit.font_body}, sans-serif`;
    const subtitleLines = wrapText(ctx, subtitle, maxTextWidth).slice(0, 2);

    let y = template.height - padding - subtitleLines.length * (subtitleSize * 1.3);
    ctx.font = `400 ${subtitleSize}px ${brandKit.font_body}, sans-serif`;
    for (const line of subtitleLines) {
      ctx.fillText(line, padding, y);
      y += subtitleSize * 1.3;
    }

    let titleY = template.height - padding - subtitleLines.length * (subtitleSize * 1.3) - titleLines.length * (titleSize * 1.2) - 10;
    ctx.font = `700 ${titleSize}px ${brandKit.font_heading}, sans-serif`;
    for (const line of titleLines) {
      ctx.fillText(line, padding, titleY);
      titleY += titleSize * 1.2;
    }

    ctx.fillStyle = brandKit.color_accent;
    ctx.fillRect(padding, padding, template.width * 0.12, template.height * 0.01);
  }, [template, title, subtitle, backgroundImage, brandKit]);

  if (!projectId) {
    return <p className="muted">Сначала создайте проект.</p>;
  }

  function handleDownload() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `contentos-${template.key}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  return (
    <div>
      <div className="page-header">
        <h1>Конструктор</h1>
        <button className="btn" onClick={handleDownload}>
          Скачать PNG
        </button>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "minmax(180px, 220px) minmax(320px, 1fr) minmax(220px, 260px)",
          gap: 16,
          alignItems: "start",
          overflowX: "auto",
        }}
      >
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <strong>Шаблоны</strong>
          {TEMPLATES.map((t) => (
            <button
              key={t.key}
              className={template.key === t.key ? "btn" : "btn secondary"}
              onClick={() => setTemplate(t)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="card" style={{ display: "flex", justifyContent: "center" }}>
          <canvas
            ref={canvasRef}
            style={{
              maxWidth: "100%",
              maxHeight: 560,
              width: "auto",
              height: "auto",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
            }}
          />
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <strong>Свойства</strong>
          <div className="form-row">
            <label>Заголовок</label>
            <textarea rows={2} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Подзаголовок</label>
            <textarea rows={2} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
          </div>
          <div className="form-row">
            <label>Фон (из медиатеки)</label>
            <select value={backgroundAssetId} onChange={(e) => setBackgroundAssetId(e.target.value)}>
              <option value="">Без изображения</option>
              {assets
                .filter((a) => a.content_type.startsWith("image"))
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.filename}
                  </option>
                ))}
            </select>
          </div>
          {brandKit && (
            <p className="muted">
              Цвета и шрифты берутся из брендбука проекта — их можно изменить на странице «Медиатека».
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
