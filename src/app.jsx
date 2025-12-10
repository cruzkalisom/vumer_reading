import React, { useEffect, useRef, useState } from "react";
import Tesseract from "tesseract.js";

export default function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const readingRef = useRef(false);
  const lastTextRef = useRef("");

  useEffect(() => {
    // ouvir botões do index.html
    window.addEventListener("ayla-start-reading", () => startCursorReading());
    window.addEventListener("ayla-stop-reading", () => stopReading());

    startCapture(); // inicia captura de tela invisível
  }, []);

  async function startCapture() {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
  }

  function stopReading() {
    readingRef.current = false;
  }

  function startCursorReading() {
    readingRef.current = true;

    const interval = setInterval(async () => {
      if (!readingRef.current) {
        clearInterval(interval);
        return;
      }

      await readAreaUnderCursor();
    }, 1200);
  }

  async function readAreaUnderCursor() {
    const pos = await window.electronAPI.getCursorPos();

    const area = 300;

    const ctx = canvasRef.current.getContext("2d");

    canvasRef.current.width = area;
    canvasRef.current.height = area;

    ctx.drawImage(
      videoRef.current,
      pos.x - area / 2,
      pos.y - area / 2,
      area,
      area,
      0,
      0,
      area,
      area
    );

    const dataURL = canvasRef.current.toDataURL("image/png");

    const { data: { text } } = await Tesseract.recognize(dataURL, "por");

    const cleaned = text.trim();

    if (cleaned && cleaned !== lastTextRef.current) {
      lastTextRef.current = cleaned;
      speak(cleaned);
    }
  }

  function speak(text) {
    speechSynthesis.cancel();
    const ut = new SpeechSynthesisUtterance(text);
    ut.lang = "pt-BR";
    ut.rate = 1;
    speechSynthesis.speak(ut);
  }

  return (
    <>
      <video ref={videoRef} style={{ display: "none" }}></video>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </>
  );
}
