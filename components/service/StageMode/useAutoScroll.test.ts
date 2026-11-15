import { describe, expect, it } from "vitest";
import {
  computeScrollStep,
  findSongIndex,
  formatScrollSpeedMultiplier,
  multiplierToPxPerSecond,
  nextStopPosition,
  stepScrollSpeed,
} from "./useAutoScroll";

describe("computeScrollStep", () => {
  it("arredonda pra baixo e carrega o resto fracionário", () => {
    // 60px/s, 16ms (~1 frame a 60fps) = 0.96px — arredonda pra 0, carrega 0.96
    const first = computeScrollStep(60, 16, 0);
    expect(first.pixels).toBe(0);
    expect(first.carry).toBeCloseTo(0.96);

    // Próximo frame: 0.96 + 0.96 = 1.92 — agora rola 1px, carrega 0.92
    const second = computeScrollStep(60, 16, first.carry);
    expect(second.pixels).toBe(1);
    expect(second.carry).toBeCloseTo(0.92);
  });

  it("em velocidade baixa, acumula até completar 1px em vez de travar pra sempre", () => {
    let carry = 0;
    let totalPixels = 0;
    // 20px/s por 2 segundos (em passos de 16ms) deve somar ~40px, nunca 0.
    for (let i = 0; i < 125; i++) {
      const step = computeScrollStep(20, 16, carry);
      carry = step.carry;
      totalPixels += step.pixels;
    }
    expect(totalPixels).toBeGreaterThan(35);
    expect(totalPixels).toBeLessThan(45);
  });

  it("não rola nada com velocidade zero", () => {
    const step = computeScrollStep(0, 1000, 0);
    expect(step.pixels).toBe(0);
    expect(step.carry).toBe(0);
  });
});

describe("multiplierToPxPerSecond", () => {
  it("1x é a velocidade base", () => {
    expect(multiplierToPxPerSecond(1)).toBeGreaterThan(0);
  });

  it("é proporcional ao múltiplo", () => {
    const base = multiplierToPxPerSecond(1);
    expect(multiplierToPxPerSecond(0.25)).toBeCloseTo(base * 0.25);
    expect(multiplierToPxPerSecond(0.5)).toBeCloseTo(base * 0.5);
  });
});

describe("stepScrollSpeed", () => {
  it("anda um passo na escala 0.25x → 0.5x → 0.75x → 1x", () => {
    expect(stepScrollSpeed(0.25, 1)).toBe(0.5);
    expect(stepScrollSpeed(0.5, 1)).toBe(0.75);
    expect(stepScrollSpeed(0.75, -1)).toBe(0.5);
  });

  it("fica preso nos extremos, sem dar a volta", () => {
    expect(stepScrollSpeed(1, 1)).toBe(1);
    expect(stepScrollSpeed(0.15, -1)).toBe(0.15);
  });

  it("0.15x é o novo mínimo, abaixo do 0.25x original", () => {
    expect(stepScrollSpeed(0.25, -1)).toBe(0.15);
  });

  it("valor fora da escala (salvo por versão anterior) parte da velocidade padrão", () => {
    expect(stepScrollSpeed(1.5, 1)).toBe(0.75);
    expect(stepScrollSpeed(2, -1)).toBe(0.25);
  });
});

describe("findSongIndex", () => {
  const starts = [0, 1000, 2500];

  it("acha a música em que o scroll está", () => {
    expect(findSongIndex(starts, 0)).toBe(0);
    expect(findSongIndex(starts, 998)).toBe(0);
    expect(findSongIndex(starts, 1500)).toBe(1);
    expect(findSongIndex(starts, 9999)).toBe(2);
  });

  it("parado exatamente no início (com 1px de arredondamento) já conta como a próxima", () => {
    expect(findSongIndex(starts, 1000)).toBe(1);
    expect(findSongIndex(starts, 999.5)).toBe(1);
  });
});

describe("nextStopPosition", () => {
  const starts = [0, 1000, 2500];

  it("para no início da próxima música", () => {
    expect(nextStopPosition(starts, 200, 4000)).toBe(1000);
    expect(nextStopPosition(starts, 1200, 4000)).toBe(2500);
  });

  it("retomando do ponto de pausa, segue até a música seguinte", () => {
    expect(nextStopPosition(starts, 1000, 4000)).toBe(2500);
  });

  it("na última música, para no fim do conteúdo", () => {
    expect(nextStopPosition(starts, 3000, 4000)).toBe(4000);
  });

  it("nunca passa do fim do conteúdo", () => {
    expect(nextStopPosition(starts, 200, 800)).toBe(800);
  });
});

describe("formatScrollSpeedMultiplier", () => {
  it("formata como múltiplo com 'x'", () => {
    expect(formatScrollSpeedMultiplier(0.25)).toBe("0.25x");
    expect(formatScrollSpeedMultiplier(1)).toBe("1x");
  });
});
