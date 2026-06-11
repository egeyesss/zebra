import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { getPuzzleById } from "@/lib/data/puzzles";
import { TRACKS, RESET_TIMEZONE } from "@/lib/config";
import type { Track } from "@/types/puzzle";

// Module-level cache — Fluid Compute reuses instances across requests.
let _fontRegular: Buffer | null = null;
let _fontBold: Buffer | null = null;

async function loadFonts(): Promise<[Buffer, Buffer]> {
  if (!_fontRegular || !_fontBold) {
    const dir = join(process.cwd(), "public", "fonts");
    [_fontRegular, _fontBold] = await Promise.all([
      readFile(join(dir, "JetBrainsMono-Regular.ttf")),
      readFile(join(dir, "JetBrainsMono-Bold.ttf")),
    ]);
  }
  return [_fontRegular, _fontBold];
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

const BG = "#1a1612";
const FG = "#e8e2d6";
const FG_MUTED = "#968d7e";
const ACCENT_RED = "#cf5454";
const ACCENT_GREEN = "#6dbf6d";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!getPuzzleById(id)) {
    return Response.json({ error: `unknown puzzle: ${id}` }, { status: 404 });
  }

  const url = new URL(request.url);
  const track = (url.searchParams.get("track") ?? "coffee") as Track;
  const elapsed = parseInt(url.searchParams.get("t") ?? "0", 10);
  const overwrites = parseInt(url.searchParams.get("ow") ?? "0", 10);
  const dnf = url.searchParams.get("dnf") === "1";
  const cells = parseInt(url.searchParams.get("cells") ?? "0", 10);
  const numParam = url.searchParams.get("num");

  const trackConfig = TRACKS[track] ?? TRACKS.coffee;
  const timeStr = formatTime(elapsed);

  const dateStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: RESET_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const heroText = dnf ? "DNF" : timeStr;
  const heroColor = dnf ? ACCENT_RED : FG;

  const subtitleText = dnf
    ? `at ${timeStr}  ·  ${cells} commit${cells !== 1 ? "s" : ""}`
    : overwrites === 0
      ? "flawless"
      : `${overwrites} overwrite${overwrites !== 1 ? "s" : ""}`;
  const subtitleColor =
    dnf ? ACCENT_RED : overwrites === 0 ? ACCENT_GREEN : FG_MUTED;

  const headerLine = [
    "z e b r a",
    numParam ? `#${String(numParam).padStart(3, "0")}` : null,
    `${trackConfig.emoji} ${trackConfig.label.toLowerCase()}`,
  ]
    .filter(Boolean)
    .join("  ");

  try {
    const [fontRegular, fontBold] = await loadFonts();

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            background: BG,
            padding: "88px 100px",
            fontFamily: '"JetBrains Mono"',
          }}
        >
          {/* Header */}
          <div
            style={{
              color: FG_MUTED,
              fontSize: 32,
              letterSpacing: "0.12em",
            }}
          >
            {headerLine}
          </div>

          {/* Hero — vertically centered in remaining space */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 28,
            }}
          >
            <div
              style={{
                fontSize: 160,
                fontWeight: 700,
                color: heroColor,
                lineHeight: 1,
                letterSpacing: "-0.01em",
              }}
            >
              {heroText}
            </div>
            <div
              style={{
                fontSize: 40,
                color: subtitleColor,
                letterSpacing: "0.04em",
              }}
            >
              {subtitleText}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: FG_MUTED,
              fontSize: 26,
              opacity: 0.5,
            }}
          >
            <span>zebra9.xyz</span>
            <span>{dateStr}</span>
          </div>
        </div>
      ),
      {
        width: 1080,
        height: 1080,
        emoji: "twemoji",
        fonts: [
          {
            name: "JetBrains Mono",
            data: fontRegular as unknown as ArrayBuffer,
            weight: 400,
            style: "normal",
          },
          {
            name: "JetBrains Mono",
            data: fontBold as unknown as ArrayBuffer,
            weight: 700,
            style: "normal",
          },
        ],
        headers: {
          "Content-Disposition": 'attachment; filename="zebra-result.png"',
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    console.error("[GET /api/share]", err);
    return new Response("Failed to generate share image", { status: 500 });
  }
}
