import { ChangeEvent, useEffect, useState } from "react";
import { getBrandKit, updateBrandKit } from "../api/brandKit";
import { deleteMedia, listMedia, updateMediaTags, uploadMedia } from "../api/media";
import { useProjectStore } from "../store/projectStore";
import type { BrandKit, MediaAsset } from "../types";

export function MediaLibrary() {
  const projectId = useProjectStore((s) => s.currentProjectId);
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [brandKit, setBrandKit] = useState<BrandKit | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    void listMedia(projectId).then(setAssets);
    void getBrandKit(projectId).then(setBrandKit);
  }, [projectId]);

  if (!projectId) {
    return <p className="muted">Сначала создайте проект.</p>;
  }

  async function handleUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const asset = await uploadMedia(projectId!, file);
      setAssets((prev) => [asset, ...prev]);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleTagsChange(asset: MediaAsset, tags: string) {
    const updated = await updateMediaTags(projectId!, asset.id, tags);
    setAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  }

  async function handleDelete(asset: MediaAsset) {
    await deleteMedia(projectId!, asset.id);
    setAssets((prev) => prev.filter((a) => a.id !== asset.id));
  }

  async function handleBrandKitChange(field: keyof BrandKit, value: string) {
    const updated = await updateBrandKit(projectId!, { [field]: value });
    setBrandKit(updated);
  }

  return (
    <div>
      <div className="page-header">
        <h1>Медиатека</h1>
        <label className="btn">
          {uploading ? "Загружаем…" : "+ Загрузить файл"}
          <input type="file" accept="image/*,video/mp4" onChange={handleUpload} style={{ display: "none" }} />
        </label>
      </div>

      {brandKit && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ marginTop: 0 }}>Брендбук</h3>
          <div className="grid cols-3">
            <div className="form-row">
              <label>Основной цвет</label>
              <input
                type="color"
                value={brandKit.color_primary}
                onChange={(e) => handleBrandKitChange("color_primary", e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Дополнительный цвет</label>
              <input
                type="color"
                value={brandKit.color_secondary}
                onChange={(e) => handleBrandKitChange("color_secondary", e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Акцентный цвет</label>
              <input
                type="color"
                value={brandKit.color_accent}
                onChange={(e) => handleBrandKitChange("color_accent", e.target.value)}
              />
            </div>
          </div>
          <div className="grid cols-2" style={{ marginTop: 8 }}>
            <div className="form-row">
              <label>Шрифт заголовков</label>
              <input
                value={brandKit.font_heading}
                onChange={(e) => handleBrandKitChange("font_heading", e.target.value)}
              />
            </div>
            <div className="form-row">
              <label>Шрифт текста</label>
              <input value={brandKit.font_body} onChange={(e) => handleBrandKitChange("font_body", e.target.value)} />
            </div>
          </div>
        </div>
      )}

      {assets.length === 0 ? (
        <p className="muted">Файлов пока нет — загрузите первый.</p>
      ) : (
        <div className="grid cols-4">
          {assets.map((asset) => (
            <div key={asset.id} className="card" style={{ padding: 8 }}>
              {asset.content_type.startsWith("video") ? (
                <video src={asset.url} style={{ width: "100%", borderRadius: 6 }} controls />
              ) : (
                <img src={asset.url} alt={asset.filename} style={{ width: "100%", borderRadius: 6, objectFit: "cover", aspectRatio: "1 / 1" }} />
              )}
              <input
                placeholder="теги через запятую"
                defaultValue={asset.tags}
                onBlur={(e) => handleTagsChange(asset, e.target.value)}
                style={{ width: "100%", marginTop: 6, fontSize: 12 }}
              />
              <button
                className="btn secondary"
                style={{ width: "100%", marginTop: 6, fontSize: 12 }}
                onClick={() => handleDelete(asset)}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
