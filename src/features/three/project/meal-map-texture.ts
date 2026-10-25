import { CanvasTexture, SRGBColorSpace } from "three";

function paint(
  width: number,
  height: number,
  draw: (ctx: CanvasRenderingContext2D) => void,
) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  draw(ctx);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

export function createMealMapTexture() {
  return paint(1536, 1024, (ctx) => {
    ctx.fillStyle = "#e6e1ce";
    ctx.fillRect(0, 0, 1536, 1024);
    ctx.fillStyle = "#c3ceb1";
    for (const [x, y, w, h] of [
      [110, 180, 280, 240],
      [860, 120, 240, 280],
      [690, 640, 370, 270],
      [1190, 490, 230, 370],
    ]) {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 35);
      ctx.fill();
    }
    ctx.strokeStyle = "#aec8c2";
    ctx.lineWidth = 65;
    ctx.beginPath();
    ctx.moveTo(-60, 760);
    ctx.bezierCurveTo(480, 300, 820, 950, 1590, 130);
    ctx.stroke();
    ctx.strokeStyle = "#f9f5e9";
    ctx.lineWidth = 21;
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.moveTo(i * 320 - 150, 0);
      ctx.lineTo(i * 320 + 250, 1024);
      ctx.stroke();
    }
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 240 + 70);
      ctx.lineTo(1536, i * 240 - 90);
      ctx.stroke();
    }
    ctx.strokeStyle = "#92ab8f";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(230, 810);
    ctx.lineTo(660, 760);
    ctx.lineTo(870, 300);
    ctx.lineTo(1270, 260);
    ctx.stroke();
    ctx.fillStyle = "#2e6147";
    for (const [x, y] of [
      [660, 760],
      [870, 300],
      [1270, 260],
    ]) {
      ctx.beginPath();
      ctx.arc(x, y, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}
