/**
 * Adds a title and an optional credit text overlay to a base64 image.
 * This function uses the Canvas API to draw the image, a gradient for readability,
 * and then intelligently renders the text to avoid overlaps.
 *
 * @param base64ImageUrl The base64 data URL of the source image.
 * @param title The main title text to overlay on the image.
 * @param credit Optional text for a credit or watermark, placed in the bottom-right.
 * @returns A promise that resolves with the new base64 data URL of the composited image.
 */
export const addTitleToImage = (base64ImageUrl: string, title: string, credit?: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error('Could not get 2D canvas context. Your browser may not support it.'));
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // 1. Draw the original image and a readability gradient
      ctx.drawImage(img, 0, 0);
      const gradient = ctx.createLinearGradient(0, canvas.height * 0.4, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0.85)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const padding = canvas.width * 0.05;
      const fontFamily = `'Roboto', 'Helvetica Neue', Arial, sans-serif`;

      // --- 2. Prepare and measure credit text to reserve space ---
      let creditWidthWithPadding = 0;
      const creditText = credit?.trim();
      if (creditText) {
        const creditFontSize = Math.max(12, Math.round(canvas.width / 70));
        ctx.font = `400 ${creditFontSize}px ${fontFamily}`;
        creditWidthWithPadding = ctx.measureText(creditText).width + (padding / 2); // Reserve width + a small gap
      }

      // --- 3. Wrap title text intelligently ---
      const baseFontSize = Math.round(canvas.width / 24);
      const fontSize = Math.max(20, Math.min(baseFontSize, 80));
      ctx.font = `700 ${fontSize}px ${fontFamily}`;
      const lineHeight = fontSize * 1.15;
      
      const getWrappedLines = (context: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
          const words = text.split(' ');
          let currentLine = '';
          const lines: string[] = [];
          if (!text) return lines;

          for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word;
              if (context.measureText(testLine).width > maxWidth && currentLine !== '') {
                  lines.push(currentLine);
                  currentLine = word;
              } else {
                  currentLine = testLine;
              }
          }
          lines.push(currentLine);
          return lines;
      };

      const fullMaxWidth = canvas.width - (2 * padding);
      let titleLines = getWrappedLines(ctx, title, fullMaxWidth);

      // If credit exists, check if the last line of the title needs re-wrapping to avoid collision
      if (creditText && titleLines.length > 0) {
          const lastLine = titleLines.pop() || '';
          const lastLineMaxWidth = fullMaxWidth - creditWidthWithPadding;
          
          if (ctx.measureText(lastLine).width > lastLineMaxWidth) {
              const rewrappedLastLines = getWrappedLines(ctx, lastLine, lastLineMaxWidth);
              titleLines.push(...rewrappedLastLines);
          } else {
              titleLines.push(lastLine); // It fits, so put it back
          }
      }

      // --- 4. Draw all text elements ---
      const x = padding;
      const y = canvas.height - padding;

      // Draw title lines from the bottom up
      ctx.fillStyle = 'white';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.font = `700 ${fontSize}px ${fontFamily}`;

      for (let i = 0; i < titleLines.length; i++) {
          const lineToDraw = titleLines[titleLines.length - 1 - i];
          ctx.fillText(lineToDraw, x, y - (i * lineHeight));
      }

      // Draw credit text if it exists
      if (creditText) {
          const creditFontSize = Math.max(12, Math.round(canvas.width / 70));
          ctx.font = `400 ${creditFontSize}px ${fontFamily}`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          ctx.textAlign = 'right';
          // Use a more subtle shadow for the credit
          ctx.shadowBlur = 5;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
          
          const creditX = canvas.width - padding;
          ctx.fillText(creditText, creditX, y);
      }

      // 5. Export the final canvas content as a high-quality JPEG image
      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = () => {
      reject(new Error('Failed to load the generated image for processing. The image data might be corrupted.'));
    };

    img.src = base64ImageUrl;
  });
};