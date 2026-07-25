// Utilidad para preparar vouchers/imagenes antes de subirlos.
//
// Objetivos:
// 1. NO imponer ninguna restriccion de peso al adjuntar fotos: las fotos
//    grandes de camara se redimensionan/recomprimen en el cliente para que
//    el upload sea liviano, en vez de rechazarlas.
// 2. Normalizar el resultado a un File image/jpeg con nombre valido. Esto
//    evita el bug del WebView/CapacitorHttp en el APK donde la camara o el
//    selector de archivos entrega un File con `type` vacio o sin nombre,
//    que luego rompe el multipart o el filtro MIME del backend.
//
// Si el archivo es PDF (u otro no-imagen), se devuelve tal cual.
// Ante cualquier fallo de compresion, se devuelve el archivo original para
// NUNCA bloquear el adjunto.

const DEFAULT_MAX_DIMENSION = 1600; // px (lado mayor)
const DEFAULT_QUALITY = 0.8;        // calidad JPEG

const isPdf = (file) =>
  file.type === 'application/pdf' || /\.pdf$/i.test(file.name || '');

// Heuristica para decidir si tratamos el archivo como imagen.
// En Android la camara/selector a veces entrega type vacio o
// application/octet-stream; en ese caso intentamos tratarlo como imagen.
const looksLikeImage = (file) => {
  if (file.type && file.type.startsWith('image/')) return true;
  if (!file.type || file.type === 'application/octet-stream') {
    return !/\.(pdf|mp4|mov|avi|mkv|webm|mp3|wav|zip|rar|docx?|xlsx?)$/i.test(file.name || '');
  }
  return false;
};

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob((blob) => resolve(blob), type, quality);
    } else {
      // Fallback para WebViews antiguos sin toBlob
      try {
        const dataUrl = canvas.toDataURL(type, quality);
        const byteString = atob(dataUrl.split(',')[1]);
        const arr = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) arr[i] = byteString.charCodeAt(i);
        resolve(new Blob([arr], { type }));
      } catch {
        resolve(null);
      }
    }
  });

/**
 * Prepara un archivo de voucher para subir.
 * @param {File} file
 * @param {{ maxDimension?: number, quality?: number }} [options]
 * @returns {Promise<File>} archivo listo (comprimido si era imagen)
 */
export async function prepareVoucherFile(file, options = {}) {
  if (!file) return file;

  // Los PDF (u otros) se suben sin tocar.
  if (isPdf(file) || !looksLikeImage(file)) return file;

  const maxDimension = options.maxDimension || DEFAULT_MAX_DIMENSION;
  const quality = options.quality || DEFAULT_QUALITY;

  let objectUrl = null;
  try {
    objectUrl = URL.createObjectURL(file);
    const img = await loadImage(objectUrl);

    const { width, height } = img;
    if (!width || !height) return file; // no se pudo decodificar, subir original

    const scale = Math.min(1, maxDimension / Math.max(width, height));
    const targetW = Math.max(1, Math.round(width * scale));
    const targetH = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const blob = await canvasToBlob(canvas, 'image/jpeg', quality);
    if (!blob) return file;

    const baseName = (file.name || 'voucher').replace(/\.[^/.]+$/, '');
    return new File([blob], `${baseName}.jpg`, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
  } catch {
    // Cualquier error => subir el archivo original sin bloquear al usuario
    return file;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

export default prepareVoucherFile;
