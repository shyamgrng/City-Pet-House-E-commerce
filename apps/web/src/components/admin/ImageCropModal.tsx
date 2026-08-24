"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

const VIEWPORT = 320;
const OUTPUT_SIZE = 1000;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

export default function ImageCropModal({
  file,
  initialAlt,
  onCancel,
  onConfirm,
}: {
  file: File;
  initialAlt: string;
  onCancel: () => void;
  onConfirm: (dataUrl: string, alt: string) => void;
}) {
  const [imgUrl, setImgUrl] = useState("");
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [natural, setNatural] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [alt, setAlt] = useState(initialAlt);
  const dragRef = useRef<{ startX: number; startY: number; startOffset: { x: number; y: number } } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL.createObjectURL is a browser API side effect, not derivable from render
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const baseScale = natural.w && natural.h ? VIEWPORT / Math.min(natural.w, natural.h) : 1;
  const scale = baseScale * zoom;
  const displayW = natural.w * scale;
  const displayH = natural.h * scale;

  const clamp = (o: { x: number; y: number }) => ({
    x: Math.min(0, Math.max(VIEWPORT - displayW, o.x)),
    y: Math.min(0, Math.max(VIEWPORT - displayH, o.y)),
  });

  const onImgLoad = () => {
    const el = imgRef.current;
    if (!el) return;
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    setNatural({ w, h });
    const fitScale = VIEWPORT / Math.min(w, h);
    setOffset({ x: (VIEWPORT - w * fitScale) / 2, y: (VIEWPORT - h * fitScale) / 2 });
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, startOffset: offset };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset(clamp({ x: dragRef.current.startOffset.x + dx, y: dragRef.current.startOffset.y + dy }));
  };
  const onPointerUp = () => {
    dragRef.current = null;
  };

  const changeZoom = (z: number) => {
    setZoom(z);
    setOffset((o) => clamp(o));
  };

  const confirm = () => {
    const el = imgRef.current;
    if (!el || !natural.w) return;
    const cropX = -offset.x / scale;
    const cropY = -offset.y / scale;
    const cropSize = VIEWPORT / scale;
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(el, cropX, cropY, cropSize, cropSize, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    onConfirm(canvas.toDataURL("image/jpeg", 0.85), alt.trim());
  };

  return (
    <div onClick={onCancel} className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-5 w-[380px]">
        <div className="text-[15px] font-bold text-[#1A2027] mb-1">Crop Photo</div>
        <div className="text-[11px] text-[#8A96A3] mb-3.5">Drag to reposition, use the slider to zoom, then confirm.</div>

        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          className="relative mx-auto rounded-lg overflow-hidden bg-[#1A2027] cursor-move touch-none"
          style={{ width: VIEWPORT, height: VIEWPORT }}
        >
          {imgUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- object URL used purely as a crop-editing source, never persisted
            <img
              ref={imgRef}
              src={imgUrl}
              alt=""
              onLoad={onImgLoad}
              draggable={false}
              className="absolute select-none"
              style={{ left: offset.x, top: offset.y, width: displayW || undefined, height: displayH || undefined }}
            />
          )}
        </div>

        <div className="flex items-center gap-2.5 mt-3 mb-3.5">
          <span className="text-xs text-[#8A96A3]">🔍</span>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            onChange={(e) => changeZoom(Number(e.target.value))}
            className="flex-1"
          />
        </div>

        <div className="text-[11px] font-semibold text-[#3A4652] mb-1.5">Alt text (describes the photo)</div>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="e.g. Golden Retriever puppy sitting on grass"
          className="w-full px-3 py-2.5 rounded-lg border border-[#E4E9EC] text-[13px] mb-4 box-border"
        />

        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-[#5B6773] bg-[#F0F2F4] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={!natural.w}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-primary cursor-pointer disabled:opacity-50"
          >
            Use Photo
          </button>
        </div>
      </div>
    </div>
  );
}
