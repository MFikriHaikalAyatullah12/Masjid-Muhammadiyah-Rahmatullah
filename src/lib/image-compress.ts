// Kompresi gambar di browser: resize + turunkan kualitas sampai di bawah target.
const MAX_SIDE = 1280;
const TARGET_BYTES = 250 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Gambar tidak dapat dibaca')); };
    img.src = url;
  });
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('Gagal mengompres gambar'))), 'image/jpeg', quality);
  });
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca gambar'));
    reader.readAsDataURL(blob);
  });
}

export interface CompressedImage {
  dataUrl: string;
  size: number;
  width: number;
  height: number;
  originalSize: number;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  let width = Math.round(img.width * scale);
  let height = Math.round(img.height * scale);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Browser tidak mendukung kompresi gambar');

  const draw = () => {
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = '#fff'; // PNG transparan -> latar putih
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
  };

  draw();
  let quality = 0.72;
  let blob = await toBlob(canvas, quality);
  while (blob.size > TARGET_BYTES && quality > 0.4) {
    quality -= 0.08;
    blob = await toBlob(canvas, quality);
  }
  // Masih besar: kecilkan dimensi
  while (blob.size > TARGET_BYTES && Math.max(width, height) > 640) {
    width = Math.round(width * 0.8);
    height = Math.round(height * 0.8);
    draw();
    blob = await toBlob(canvas, quality);
  }

  return { dataUrl: await blobToDataUrl(blob), size: blob.size, width, height, originalSize: file.size };
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
