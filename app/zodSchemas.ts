import { z } from "zod";

export const algorithmSchema = z.object({
  id: z.string(),
  algoID: z.string().optional(),
  code: z.string(),
  userId: z.string(),
  createdAt: z.string(),
  description: z.string(),
  title: z.string(),
  isGodMode: z.boolean().default(false),
  type: z.string().default("visualizer"),
  language: z.string().default("javascript"),
  // user: z.object({
  //   id: z.string(),
  // }),
});

export const presetSchema = z.object({
  id: z.string(),
  type: z.string(),
  code: z.string().optional(),
  name: z.string(),
  createdAt: z.date(),
  circles: z.any(),
  lines: z.any(),
  validatorLens: z.any().default("[]"),
  zoomAmount: z.number(),
  startNode: z.string().optional(),
});
