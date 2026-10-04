import fs from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { toDashboardData } from "./src/data/runtimeConditions.js";

const DEBUG_SNAPSHOT_PATH = path.resolve("public", "conditions.json");

function readRequestBody(request, maximumBytes = 2 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalBytes = 0;

    request.on("data", (chunk) => {
      totalBytes += chunk.length;
      if (totalBytes > maximumBytes) {
        reject(new Error("Snapshot payload exceeds the size limit"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    request.on("error", reject);
  });
}

function validateSnapshot(snapshot) {
  return (
    snapshot?.schemaVersion === 1 &&
    typeof snapshot.locationKey === "string" &&
    typeof snapshot.snapshotAt === "string" &&
    typeof snapshot.location?.name === "string" &&
    Number.isFinite(snapshot.location?.lat) &&
    Number.isFinite(snapshot.location?.lon) &&
    typeof snapshot.location?.timezone === "string" &&
    snapshot.data &&
    typeof snapshot.data === "object" &&
    !Array.isArray(snapshot.data) &&
    ["current", "history", "forecast", "tides", "astronomy"].every(
      (key) => Object.hasOwn(snapshot.data, key),
    ) &&
    Array.isArray(snapshot.data.history) &&
    Array.isArray(snapshot.data.forecast) &&
    Array.isArray(snapshot.data.tides) &&
    Array.isArray(snapshot.data.astronomy)
  );
}

function runtimeDevEndpointsPlugin(command) {
  return {
    name: "runtime-data-dev-endpoints",
    configureServer(server) {
      server.middlewares.use("/__debug/conditions-snapshot", async (request, response, next) => {
        if (request.method !== "POST") {
          response.statusCode = 405;
          response.end();
          return;
        }

        const requestOrigin = request.headers.origin;
        let originHost = null;
        try {
          originHost = requestOrigin ? new URL(requestOrigin).host : null;
        } catch {
          response.statusCode = 403;
          response.end("Invalid request origin");
          return;
        }
        if (requestOrigin && originHost !== request.headers.host) {
          response.statusCode = 403;
          response.end("Cross-origin snapshot writes are not allowed");
          return;
        }

        try {
          const body = await readRequestBody(request);
          const snapshot = JSON.parse(body);
          if (!validateSnapshot(snapshot)) {
            response.statusCode = 400;
            response.end("Invalid conditions snapshot");
            return;
          }

          const dashboardData = toDashboardData(
            {
              locationKey: snapshot.locationKey,
              location: snapshot.location,
              current: snapshot.data.current,
              history: snapshot.data.history,
              forecast: snapshot.data.forecast,
              tides: snapshot.data.tides,
              astronomy: snapshot.data.astronomy,
              refresh: snapshot.data.refresh ?? [],
              errors: {},
            },
            snapshot.location,
          );
          snapshot.days = dashboardData.days;
          fs.writeFileSync(DEBUG_SNAPSHOT_PATH, JSON.stringify(snapshot, null, 2));
          response.setHeader("Content-Type", "application/json");
          response.end(JSON.stringify({ saved: true }));
        } catch (error) {
          if (response.headersSent) return;
          response.statusCode = error instanceof SyntaxError ? 400 : 500;
          response.end(error.message ?? "Unable to save conditions snapshot");
          if (!response.writableEnded) next(error);
        }
      });

    },
    closeBundle() {
      if (command === "build") {
        fs.rmSync(path.resolve("dist", "conditions.json"), { force: true });
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  return {
    plugins: [react(), runtimeDevEndpointsPlugin(command)],
    server: {
      host: true,
      headers: {
        "Cache-Control": "no-store",
      },
    },
    preview: {
      headers: {
        "Cache-Control": "no-store",
      },
    },
    esbuild: {
      jsx: "automatic",
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.js"],
    },
  };
});
