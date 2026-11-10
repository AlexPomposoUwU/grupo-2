import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Standard ESM relative paths fallback (safe for both CommonJS and ESM)
const _filename = typeof import.meta !== "undefined" && import.meta.url ? fileURLToPath(import.meta.url) : "";
const _dirname = _filename ? path.dirname(_filename) : "";

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry User-Agent
let ai: GoogleGenAI | null = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("System: Gemini SDK initialized successfully.");
  } else {
    console.warn("System WARNING: GEMINI_API_KEY is not defined. AI matching will be unavailable.");
  }
} catch (err) {
  console.error("System ERROR: Failed to initialize Gemini SDK:", err);
}

// REST route for matching natural user input with defined triggers
app.post("/api/gemini/analyze", async (req, res): Promise<any> => {
  const { input, triggers } = req.body;

  if (!input || typeof input !== "string") {
    return res.status(400).json({ error: "O campo 'input' é obrigatório e deve ser texto." });
  }

  // Fallback direct matching if Gemini API is not working or not configured yet
  const normalizedInput = input.trim().toLowerCase();
  
  if (!ai) {
    // If AI is offline, do a fuzzy direct fallback match
    console.log("System: Gemini API is offline. Performing fallback local keyword match.");
    
    // Find trigger that is contained in the input, or matches closely
    const matched = triggers?.find((t: any) => {
      const phrase = t.phrase?.trim().toLowerCase();
      return phrase && (normalizedInput.includes(phrase) || phrase.includes(normalizedInput));
    });

    return res.json({
      matchedTriggerId: matched ? matched.id : null,
      confidence: matched ? 1.0 : 0.0,
      response: matched 
        ? `[Modo de Contingência local] Conexão Neural estabelecida. Parâmetro "${matched.phrase}" acionado localmente.`
        : "O canal neural de IA está indisponível ou sem chave API. Digite ou fale exatamente uma frase programada para abrir o portal de vídeo correspondente."
    });
  }

  try {
    // Stringify triggers list with their IDs and trigger phrases
    const triggerScenarios = triggers?.map((t: any) => `ID: "${t.id}" | Frase de ativação: "${t.phrase}" | Descrição do Canal: "${t.description || 'Nenhuma'}"`).join("\n") || "Nenhum trigger configurado.";

    const systemInstruction = `Você é o "Guardião Neural da EcoSphere".
Sua única e exclusiva tarefa é classificar a fala/texto do usuário comparando-a de forma semântica com os gatilhos pré-configurados ("triggers").
Você não deve inventar comandos ou bater papo sobre outros assuntos alheios. Se o usuário disser algo que não se assemelhe a nenhum gatilho, você deve obrigatoriamente classificar como matchedTriggerId: null.

Triggers configurados pelo usuário na central (você só pode retornar o ID de um destes listados abaixo se a correspondência for muito clara e forte, ou null se não for):
${triggerScenarios}

INSTRUÇÕES E REGRAS:
1. Examine a fala/texto do usuário. Compare a intenção com os gatilhos cadastrados. Atribua o matchedTriggerId correspondente apenas se a confiança / similaridade semântica for de pelo menos 0.75.
2. Se a similaridade for menor que 0.75 ou o assunto for totalmente diferente das perguntas configuradas, retorne obrigatoriamente matchedTriggerId como null e confiança de 0.0.
3. Elabore uma mensagem clara e concisa em português para "response". Se um trigger foi ativado, comente brevemente sobre a ativação do canal. Se NÃO houver correspondência (matchedTriggerId is null), explique brevemente que o comando não foi reconhecido e indique que o usuário deve pronunciar precisamente uma das perguntas configuradas. Evite responder a perguntas gerais alheias aos vídeos.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Mensagem ou comando recebido do usuário: "${input}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matchedTriggerId: {
              type: Type.STRING,
              description: "O ID do trigger semântica correspondente. Caso nenhuma se assemelhe na intenção com pontuação acima de 0.65, retorne null."
            },
            confidence: {
              type: Type.NUMBER,
              description: "Pontuação flutuante de confiança do casamento de intenção de 0.0 a 1.0."
            },
            response: {
              type: Type.STRING,
              description: "Mensagem poética e futurista em português do Guardião Neural reagindo à fala do usuário e à floresta."
            }
          },
          required: ["matchedTriggerId", "confidence", "response"]
        }
      }
    });

    const data = JSON.parse(response.text?.trim() || "{}");
    return res.json({
      matchedTriggerId: data.matchedTriggerId || null,
      confidence: data.confidence || 0,
      response: data.response || "As frequências miceliais oscilaram, mas a resposta se dispersou na névoa de dados. Tente falar novamente."
    });

  } catch (err: any) {
    console.error("System ERROR inside /api/gemini/analyze:", err);
    return res.status(500).json({
      matchedTriggerId: null,
      confidence: 0,
      response: "A ressonância de IA falhou devido a uma interferência no uplink solar. Comutando para sensores locais.",
      details: err.message
    });
  }
});

// Dedicated REST route for the interactive speaking robot assistant "Eva-Flora"
app.post("/api/gemini/assistant", async (req, res): Promise<any> => {
  const { question } = req.body;

  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "O campo 'question' é obrigatório." });
  }

  if (!ai) {
    return res.json({
      answer: "Olá! Meu downlink com as redes centrais de IA está offline no momento, mas posso operar em modo ecológico local. Faça-me mais perguntas sobre a preservação e monitoramento da nossa floresta cibernética!"
    });
  }

  try {
    const systemInstruction = `Você é "Eva-Flora", uma assistente robô humanoide biomímica ultra avançada encarregada de interagir com os operadores da EcoSphere-2250.
Você possui um corpo físico biomecatrônico decorado com trepadeiras sintéticas e fibra de carbono bioluminescente.
Instruções de resposta:
1. Responda à pergunta do usuário de forma útil, interessante, com um tom cibernético, robótico, amigável e focado em tecnologia sustentável, bio-engenharia ou no funcionamento da EcoSphere.
2. Seja conciso (máximo de 3 frases) para que sua fala sintetizada não fique exaustiva.
3. Use palavras que destaquem sua natureza robótica e mecânica (ex: "Meus servo-motores indicam...", "Processando dados em meu bloco neural...", "Minhas diretrizes robóticas...").`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Pergunta do operador humano: "${question}"`,
      config: {
        systemInstruction,
        maxOutputTokens: 250,
      }
    });

    const answerText = response.text?.trim() || "Análise computacional incompleta. Por favor, reinicie meu transmissor neural.";
    return res.json({
      answer: answerText
    });

  } catch (err: any) {
    console.error("System ERROR inside /api/gemini/assistant:", err);
    return res.status(500).json({
      answer: "Interferência eletromagnética detectada em meus circuitos analógicos de conversação. Repita a pergunta, por favor.",
      details: err.message
    });
  }
});

// Proxy to stream Google Drive files (supporting both OAuth authenticated and public files)
app.get("/api/drive/stream", async (req, res): Promise<any> => {
  const fileId = req.query.fileId;
  const token = req.query.token;

  if (!fileId || typeof fileId !== "string") {
    return res.status(400).send("Parâmetro 'fileId' é obrigatório.");
  }

  try {
    let response: Response;
    if (token && typeof token === "string") {
      const driveUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      response = await fetch(driveUrl, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      // Public Google Drive streaming without requiring OAuth token
      response = await fetch(`https://drive.usercontent.google.com/download?id=${fileId}&export=download&confirm=t`);
      if (!response.ok) {
        response = await fetch(`https://drive.google.com/uc?export=download&id=${fileId}`);
      }
    }

    if (!response.ok) {
      console.error(`Google Drive stream failed: ${response.status} ${response.statusText}`);
      return res.status(response.status).send(`Erro ao requisitar arquivo do Google Drive: ${response.statusText}`);
    }

    // Set matching stream headers
    const contentType = response.headers.get("content-type");
    if (contentType) {
      res.setHeader("Content-Type", contentType);
    }
    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      res.setHeader("Content-Length", contentLength);
    }

    // Stream the web body directly back to the video tag
    if (response.body) {
      const { Readable } = await import("stream");
      const nodeStream = Readable.fromWeb(response.body as any);
      nodeStream.pipe(res);
    } else {
      res.status(500).send("Response body from Google Drive API is empty.");
    }
  } catch (err: any) {
    console.error("System ERROR inside /api/drive/stream proxy:", err);
    res.status(500).send(`Erro interno ao fazer streaming: ${err.message}`);
  }
});

// Configure Vite middleware in development, or Static Files serving in Production
async function bootstrap() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("System: Vite Middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("System: Serving production static assets from: " + distPath);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`System: EcoSphere Server running on http://localhost:${PORT}`);
  });
}

bootstrap();
