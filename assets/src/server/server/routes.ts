/*
 * Persona: Tough love meets soul care.
 * Module: routes
 * Intent: Handle functionality for routes
 * Provenance-ID: d42e5564-06b1-4077-ab19-69bcce4591e0
 * Last-Reviewed: 2025-08-28T00:00:00Z
 */

// Source: SalleCompanion-1/server/routes.ts (migrated 2025-08-27)

import { Express } from "express";
import { createServer, Server } from "http";
import { WebSocketServer } from "ws";
import { MemStorage } from "./storage";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const storage = new MemStorage();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { z } from "zod";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { insertUserSchema, insertConversationSchema, insertTaskSchema, insertMemorySchema, insertPersonaStateSchema } from "../sallie/shared/src/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
  // WebSocket client connected

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());

        if (data.type === 'chat_message') {
          // Broadcast to all connected clients
          wss.clients.forEach(client => {
            if (client.readyState === ws.OPEN) {
              client.send(JSON.stringify({
                type: 'chat_message',
                data: data.payload
              }));
            }
          });
        }
      } catch (error) {
  // WebSocket message error: ${error}
        console.log('WebSocket error:', error);
      }
    });

    ws.on('close', () => {
  // WebSocket client disconnected
    });
  });

  // ...existing code for user, conversation, task, memory, persona state routes...

  return httpServer;
}
