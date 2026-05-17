import { z } from 'zod';

export const artboardSchema = z.object({
    width: z.number().positive(),
    height: z.number().positive(),
    safeArea: z.object({
        top: z.number().min(0),
        right: z.number().min(0),
        bottom: z.number().min(0),
        left: z.number().min(0),
    }).optional(),
});

export const canvasElementSchema = z
    .object({
        id: z.string().min(1),
        type: z.string().min(1),
        x: z.number(),
        y: z.number(),
        w: z.number().positive(),
        h: z.number().positive(),
        rotation: z.number().default(0),
        z: z.number(),
    })
    .passthrough();

export const canvasSchema = z.object({
    schemaVersion: z.literal(1),
    artboard: artboardSchema,
    background: z.record(z.string(), z.unknown()).optional(),
    elements: z.array(canvasElementSchema),
});

export type Canvas = z.infer<typeof canvasSchema>;
export type CanvasElement = z.infer<typeof canvasElementSchema>;
