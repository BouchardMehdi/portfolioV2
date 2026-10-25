import { createMealMapTexture } from "./meal-map-texture";
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

export function createRiverTextures() {
  const marquee = paint(1024, 200, (ctx) => {
    ctx.fillStyle = "#11171e";
    ctx.fillRect(0, 0, 1024, 200);
    ctx.fillStyle = "#f4dfbc";
    ctx.font = "600 86px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("THE RIVER", 512, 115);
    ctx.fillStyle = "#ffbd87";
    ctx.font = "600 28px sans-serif";
    ctx.fillText("MULTIJOUEUR   /   TEMPS RÉEL   /   PROGRESSION", 512, 163);
  });
  const cards = ["A", "K", "Q", "J", "10"].map((rank, index) =>
    paint(256, 360, (ctx) => {
      ctx.fillStyle = "#efe9da";
      ctx.fillRect(0, 0, 256, 360);
      ctx.strokeStyle = "#d2c7b4";
      ctx.lineWidth = 3;
      ctx.strokeRect(9, 9, 238, 342);
      ctx.fillStyle = index % 2 === 0 ? "#b54c29" : "#23313d";
      ctx.font = "600 50px Georgia";
      ctx.fillText(rank, 22, 63);
      ctx.save();
      ctx.translate(256, 360);
      ctx.rotate(Math.PI);
      ctx.fillText(rank, 22, 63);
      ctx.restore();
      ctx.font = "126px Georgia";
      ctx.textAlign = "center";
      ctx.fillText(index % 2 === 0 ? "♦" : "♠", 128, 225);
    }),
  );
  const symbols = ["♦", "♠", "7"].map((symbol) =>
    paint(128, 128, (ctx) => {
      ctx.fillStyle = symbol === "♠" ? "#26313b" : "#b6512c";
      ctx.textAlign = "center";
      ctx.font = "bold 104px Georgia";
      ctx.fillText(symbol, 64, 99);
    }),
  );
  const map = createMealMapTexture();
  return { marquee, cards, symbols, map };
}

export type RiverTextures = ReturnType<typeof createRiverTextures>;
