import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"
import fs from "fs";

function handleCount(label: string) {
  const line = JSON.stringify({ timestamp: new Date().toISOString(), type: label }) + "\n";

  fs.appendFile("./data.json", line, 'utf8', (err) => {
    if (err) console.error("Error appending to file:", err);
  });
}

function countApi(): Plugin {
  return {
    name: "count-api",
    configureServer(server) {
      server.middlewares.use("/api/count", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405
          return res.end()
        }

        let body = ""
        req.on("data", (chunk) => (body += chunk))
        req.on("end", () => {
          try {
            const { label } = JSON.parse(body)
            if (typeof label !== "string") throw new Error("missing label")
            handleCount(label)
            res.statusCode = 204
            res.end()
          } catch {
            res.statusCode = 400
            res.end()
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), countApi()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: [".trycloudflare.com", "peoplecounter.fishrlab.net"]
  }
})
