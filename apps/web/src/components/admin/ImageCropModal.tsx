"use client";

import { useEffect, useRef, useState } from "react";
import ReactCrop, { centerCrop, convertToPixelCrop, cropToCanvas, makeAspectCrop, type Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

const PREVIEW_WIDTH = 380;
const PANE_HEIGHT = 340;
const OUTPUT_SIZE = 1000;
const MIN_ZOOM = 1;
const MAX_ZOOM = 4;

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
  const [crop, setCrop] = useState<Crop>();
  const [zoom, setZoom] = useState(1);
  const [alt, setAlt] = useState(initialAlt);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL.createObjectURL is a browser API side effect, not derivable from render
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onImgLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerCrop(makeAspectCrop({ unit: "%", width: 90 }, 1, width, height), width, height));
    setReady(true);
  };

  const confirm = async () => {
    const img = imgRef.current;
    if (!img || !crop) return;
    const pixelCrop = convertToPixelCrop(crop, img.width, img.height);
    const canvas = document.createElement("canvas");
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const tmp = document.createElement("canvas");
    await cropToCanvas(img, tmp, pixelCrop);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(tmp, 0, 0, tmp.width, tmp.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
    onConfirm(canvas.toDataURL("image/jpeg", 0.85), alt.trim());
  };

  return (
    <div onClick={onCancel} className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4">
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl p-5 w-[440px]">
        <div className="text-[15px] font-bold text-[#1A2027] mb-1">Crop Photo</div>
        <div className="text-[11px] text-[#8A96A3] mb-3.5">
          Drag the corners to crop manually, use the slider to zoom in for finer detail, and scroll/drag inside the frame to slide around when
          zoomed in.
        </div>

        <style>{`
          .cph-crop-pane .ReactCrop { max-width: none; }
          .cph-crop-pane .ReactCrop__child-wrapper { overflow: visible; max-height: none; }
          .cph-crop-pane .ReactCrop__child-wrapper > img { max-width: none; max-height: none; }
        `}</style>
        <div
          className="cph-crop-pane mx-auto rounded-lg bg-[#1A2027] overflow-auto"
          style={{ width: PREVIEW_WIDTH, height: PANE_HEIGHT }}
        >
          {imgUrl && (
            <ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)} aspect={1} minWidth={40} minHeight={40}>
              {/* eslint-disable-next-line @next/next/no-img-element -- object URL used purely as a crop-editing source, never persisted */}
              <img
                ref={imgRef}
                src={imgUrl}
                alt=""
                onLoad={onImgLoad}
                draggable={false}
                style={{ width: PREVIEW_WIDTH * zoom, height: "auto", display: "block" }}
              />
            </ReactCrop>
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
            onChange={(e) => setZoom(Number(e.target.value))}
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
            disabled={!ready}
            className="flex-1 py-2.5 rounded-lg text-[13px] font-semibold text-white bg-primary cursor-pointer disabled:opacity-50"
          >
            Use Photo
          </button>
        </div>
      </div>
    </div>
  );
}
