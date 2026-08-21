import { useEffect } from "react";
import {
  CanvasTexture,
  RepeatWrapping,
  SRGBColorSpace,
  type Texture,
} from "three";
import { mat } from "./kit";

function paintedTexture(
  width: number,
  height: number,
  paint: (context: CanvasRenderingContext2D) => void,
  repeat?: [number, number],
): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("2D canvas unavailable");
  }
  paint(context);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  texture.anisotropy = 4;
  if (repeat) {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(repeat[0], repeat[1]);
  }
  return texture;
}

function noise(context: CanvasRenderingContext2D, count: number, color: string) {
  context.fillStyle = color;
  for (let i = 0; i < count; i += 1) {
    const x = (i * 47 + (i % 7) * 13) % context.canvas.width;
    const y = (i * 29 + (i % 11) * 17) % context.canvas.height;
    context.globalAlpha = 0.08 + (i % 5) * 0.025;
    context.fillRect(x, y, 1 + (i % 3), 1 + ((i + 1) % 3));
  }
  context.globalAlpha = 1;
}

/** Small procedural paint maps keep the scene cohesive without loading model assets. */
export function DetailTextures() {
  useEffect(() => {
    const textures: Texture[] = [];
    const wood = paintedTexture(96, 96, (context) => {
      context.fillStyle = "#a56f45";
      context.fillRect(0, 0, 96, 96);
      for (let i = 0; i < 12; i += 1) {
        context.strokeStyle = i % 3 === 0 ? "#3d2415" : "#98603a";
        context.globalAlpha = 0.22;
        context.lineWidth = 1 + (i % 2);
        context.beginPath();
        context.moveTo(i * 9 - 4, 0);
        context.bezierCurveTo(i * 8 + 6, 26, i * 10 - 7, 64, i * 9 + 2, 96);
        context.stroke();
      }
      noise(context, 130, "#e0ad6a");
    }, [2, 2]);
    textures.push(wood);

    const stone = paintedTexture(128, 128, (context) => {
      context.fillStyle = "#d5bc90";
      context.fillRect(0, 0, 128, 128);
      context.strokeStyle = "#6b5841";
      context.globalAlpha = 0.34;
      context.lineWidth = 3;
      for (let y = 0; y < 128; y += 32) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(128, y + ((y / 32) % 2) * 3);
        context.stroke();
        for (let x = (y / 32) % 2 === 0 ? 30 : 4; x < 128; x += 50) {
          context.beginPath();
          context.moveTo(x, y);
          context.lineTo(x - 4, y + 32);
          context.stroke();
        }
      }
      noise(context, 220, "#4b3b2a");
    }, [2.5, 12]);
    textures.push(stone);

    const meadow = paintedTexture(96, 96, (context) => {
      context.fillStyle = "#9aad83";
      context.fillRect(0, 0, 96, 96);
      noise(context, 300, "#315b42");
      context.strokeStyle = "#213f30";
      context.globalAlpha = 0.18;
      for (let i = 0; i < 24; i += 1) {
        const x = (i * 31) % 96;
        const y = (i * 53) % 96;
        context.beginPath();
        context.moveTo(x, y + 5);
        context.lineTo(x + (i % 3) - 1, y);
        context.stroke();
      }
    }, [9, 14]);
    textures.push(meadow);

    const parchment = paintedTexture(128, 128, (context) => {
      context.fillStyle = "#e8d9b8";
      context.fillRect(0, 0, 128, 128);
      noise(context, 280, "#8a6840");
      context.strokeStyle = "#755a35";
      context.globalAlpha = 0.2;
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(8, 20);
      context.quadraticCurveTo(62, 10, 120, 23);
      context.moveTo(14, 92);
      context.quadraticCurveTo(64, 108, 114, 91);
      context.stroke();
    });
    textures.push(parchment);

    const cover = paintedTexture(128, 128, (context) => {
      context.fillStyle = "#182742";
      context.fillRect(0, 0, 128, 128);
      context.strokeStyle = "#b9853f";
      context.lineWidth = 5;
      context.strokeRect(10, 10, 108, 108);
      context.strokeStyle = "#58d6e8";
      context.lineWidth = 4;
      context.translate(64, 63);
      context.rotate(Math.PI / 4);
      context.strokeRect(-20, -20, 40, 40);
      context.beginPath();
      context.moveTo(-30, 0);
      context.lineTo(30, 0);
      context.moveTo(0, -30);
      context.lineTo(0, 30);
      context.stroke();
    });
    textures.push(cover);

    const banner = paintedTexture(128, 96, (context) => {
      context.fillStyle = "#182747";
      context.fillRect(0, 0, 128, 96);
      context.strokeStyle = "#c28d43";
      context.globalAlpha = 0.75;
      context.lineWidth = 3;
      context.strokeRect(6, 6, 116, 84);
      context.strokeStyle = "#56d7e8";
      context.globalAlpha = 0.9;
      context.lineWidth = 4;
      for (let i = 0; i < 5; i += 1) {
        const x = 20 + i * 22;
        context.beginPath();
        context.moveTo(x, 65);
        context.lineTo(x + 7, 46 - (i % 2) * 12);
        context.lineTo(x + 13, 65);
        context.moveTo(x + 3, 57);
        context.lineTo(x + 10, 57);
        context.stroke();
      }
    });
    textures.push(banner);

    mat.wood.map = wood;
    mat.path.map = stone;
    mat.paver.map = stone;
    mat.slab.map = stone;
    mat.stone.map = stone;
    mat.meadow.map = meadow;
    mat.meadowDeep.map = meadow;
    mat.paper.map = parchment;
    mat.vellum.map = parchment;
    mat.parchment.map = parchment;
    mat.cover.map = cover;
    mat.bannerCloth.map = banner;
    mat.wagonArt.map = cover;
    [
      mat.wood,
      mat.path,
      mat.paver,
      mat.slab,
      mat.stone,
      mat.meadow,
      mat.meadowDeep,
      mat.paper,
      mat.vellum,
      mat.parchment,
      mat.cover,
      mat.bannerCloth,
      mat.wagonArt,
    ].forEach((material) => {
      material.needsUpdate = true;
    });
    return () => textures.forEach((texture) => texture.dispose());
  }, []);
  return null;
}
