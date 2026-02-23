import express, { Request, Response } from "express";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import jwt from "jsonwebtoken";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, "data.json");
const PORT = 3000;

// Initialize data.json if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  const initialMessages = [
    {
      id: "1",
      title: "ஞாயிறு ஆராதனை - விசுவாசத்தின் மேன்மை",
      date: "2024-05-12",
      duration: "45:20",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      thumbnail: "https://picsum.photos/seed/church1/400/400",
      subMessages: [
        {
          id: "1-1",
          title: "பகுதி 1: விசுவாசம் என்றால் என்ன?",
          date: "2024-05-12",
          duration: "22:10",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
          thumbnail: "https://picsum.photos/seed/part1/400/400",
        },
        {
          id: "1-2",
          title: "பகுதி 2: விசுவாசத்தின் கிரியைகள்",
          date: "2024-05-12",
          duration: "23:10",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
          thumbnail: "https://picsum.photos/seed/part2/400/400",
        }
      ]
    },
    {
      id: "2",
      title: "குடும்பக் கூட்டம் - அன்பின் முக்கியத்துவம்",
      date: "2024-05-10",
      duration: "38:15",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      thumbnail: "https://picsum.photos/seed/church2/400/400",
    },
    {
      id: "3",
      title: "வேதாகம படிப்பு - பவுலின் கடிதங்கள்",
      subtitle: "ரோமர் நிருபம் ஆழமான ஆய்வு",
      date: "2024-05-08",
      duration: "52:40",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      thumbnail: "https://picsum.photos/seed/church3/400/400",
      subMessages: [
        {
          id: "3-1",
          title: "அதிகாரம் 1: அறிமுகம்",
          date: "2024-05-08",
          duration: "26:20",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
          thumbnail: "https://picsum.photos/seed/romans1/400/400",
        }
      ]
    }
  ];
  fs.writeFileSync(DATA_FILE, JSON.stringify({ messages: initialMessages }, null, 2));
}

const app = express();
app.use(express.json());
app.use(cors());

interface MessageData {
  id: string;
  title: string;
  subtitle?: string;
  date: string;
  duration: string;
  audioUrl: string;
  thumbnail: string;
  subMessages?: MessageData[];
}

interface AppData {
  messages: MessageData[];
}

// Helper to read/write data
const getData = (): AppData => JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
const saveData = (data: AppData) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// Admin Auth Middleware
const authenticateAdmin = (req: Request, res: Response, next: () => void) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
    (req as Request & { admin?: string | jwt.JwtPayload }).admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

// API Routes
app.post("/api/login", async (req, res) => {
  const { password } = req.body;
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (password === adminPassword) {
    const token = jwt.sign({ role: "admin" }, process.env.JWT_SECRET || "fallback_secret", { expiresIn: "7d" });
    return res.json({ token });
  }

  res.status(401).json({ error: "Invalid password" });
});

app.get("/api/messages", (_req, res) => {
  const data = getData();
  res.json(data.messages);
});

app.post("/api/messages", authenticateAdmin, (req, res) => {
  const data = getData();
  const newMessage: MessageData = { ...req.body, id: Date.now().toString() };
  data.messages.unshift(newMessage);
  saveData(data);
  res.json(newMessage);
});

app.put("/api/messages/:id", authenticateAdmin, (req, res) => {
  const data = getData();
  const index = data.messages.findIndex((m) => m.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: "Not found" });

  data.messages[index] = { ...data.messages[index], ...req.body };
  saveData(data);
  res.json(data.messages[index]);
});

app.delete("/api/messages/:id", authenticateAdmin, (req, res) => {
  const data = getData();
  data.messages = data.messages.filter((m) => m.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
