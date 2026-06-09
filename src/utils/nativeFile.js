import { Capacitor } from '@capacitor/core';

const isNative = () => Capacitor.isNativePlatform();

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result || '';
      const idx = result.indexOf('base64,');
      resolve(idx >= 0 ? result.substring(idx + 7) : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const sanitizeFileName = (name) => {
  if (!name) return `documento-${Date.now()}`;
  return name.replace(/[\\/:*?"<>|]/g, '_').slice(0, 120);
};

const ensureExtension = (name, contentType) => {
  if (/\.[a-z0-9]{2,5}$/i.test(name || '')) return name;
  const map = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx'
  };
  const ext = map[(contentType || '').toLowerCase()] || 'bin';
  return `${name || 'documento'}.${ext}`;
};

export const openBlobInNativeApp = async ({ blob, fileName, contentType }) => {
  if (!isNative()) {
    throw new Error('openBlobInNativeApp solo disponible en plataforma nativa');
  }

  const { Filesystem, Directory } = await import('@capacitor/filesystem');
  const { FileOpener } = await import('@capacitor-community/file-opener');

  const base64 = await blobToBase64(blob);
  const safeName = ensureExtension(sanitizeFileName(fileName), contentType);

  const writeResult = await Filesystem.writeFile({
    path: safeName,
    data: base64,
    directory: Directory.Cache,
    recursive: true
  });

  await FileOpener.open({
    filePath: writeResult.uri,
    contentType: contentType || 'application/octet-stream'
  });

  return writeResult.uri;
};

export const downloadBlobWeb = ({ blob, fileName }) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName || 'documento';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const isNativePlatform = isNative;
