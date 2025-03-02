const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

// Utility to load an HTMLImageElement from a data URL
const loadImage = (dataUrl: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = dataUrl;
  });
};

export const resizeImage = async (file: File): Promise<File> => {
  const dataUrl = await readFileAsDataURL(file);
  const image = await loadImage(dataUrl);

  const MAX_WIDTH = 512;
  const scale = MAX_WIDTH / image.width;
  const newWidth = MAX_WIDTH;
  const newHeight = image.height * scale;

  const canvas = document.createElement("canvas");
  canvas.width = newWidth;
  canvas.height = newHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not get canvas context");

  ctx.drawImage(image, 0, 0, newWidth, newHeight);

  // Convert the canvas to a Blob (jpeg @ 0.9 quality in this example)
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (!blob) reject(new Error("Canvas is empty."));
        else {
          const resizedFile = new File([blob], file.name, { type: blob.type });
          resolve(resizedFile);
        }
      },
      "image/jpeg",
      0.9,
    );
  });
};
