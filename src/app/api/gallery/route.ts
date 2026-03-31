import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

export interface GalleryItem {
  id: string;
  createdAt: string;
  title: string;
  html: string;
  react: string;
  vue: string;
}

interface GalleryData {
  items: GalleryItem[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const GALLERY_FILE = path.join(DATA_DIR, "gallery.json");

function ensureDir() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
}

function readGallery(): GalleryData {
  ensureDir();
  if (!existsSync(GALLERY_FILE)) return { items: [] };
  try {
    return JSON.parse(readFileSync(GALLERY_FILE, "utf-8")) as GalleryData;
  } catch {
    return { items: [] };
  }
}

function writeGallery(data: GalleryData) {
  ensureDir();
  writeFileSync(GALLERY_FILE, JSON.stringify(data, null, 2));
}

export async function GET() {
  const data = readGallery();
  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json() as {
    title?: string;
    html: string;
    react: string;
    vue: string;
  };

  const id = crypto.randomUUID();
  const data = readGallery();
  const item: GalleryItem = {
    id,
    createdAt: new Date().toISOString(),
    title: body.title || `Component ${data.items.length + 1}`,
    html: body.html,
    react: body.react,
    vue: body.vue,
  };
  data.items.unshift(item);
  writeGallery(data);

  return Response.json({ id });
}

export async function DELETE(request: Request) {
  const { id } = await request.json() as { id: string };
  const data = readGallery();
  data.items = data.items.filter((i) => i.id !== id);
  writeGallery(data);
  return Response.json({ ok: true });
}
