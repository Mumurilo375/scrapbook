import { z } from 'zod';

export const artboardSchema = z.object({
    width: z.number().finite().positive(),
    height: z.number().finite().positive(),
    unit: z.literal('px').optional(),
    background: z.record(z.string(), z.unknown()).optional(),
    safeArea: z.object({
        top: z.number().finite().min(0),
        right: z.number().finite().min(0),
        bottom: z.number().finite().min(0),
        left: z.number().finite().min(0),
    }).optional(),
});

export const canvasElementSchema = z
    .object({
        id: z.string().min(1),
        type: z.string().min(1),
        name: z.string().max(80).optional(),
        x: z.number().finite(),
        y: z.number().finite(),
        w: z.number().finite().positive(),
        h: z.number().finite().positive(),
        rotation: z.number().finite().default(0),
        z: z.number().finite(),
        locked: z.boolean().default(false),
        hidden: z.boolean().default(false),
    })
    .passthrough();

export const canvasSchema = z.object({
    schemaVersion: z.literal(1),
    version: z.literal(1).optional(),
    artboard: artboardSchema,
    background: z.record(z.string(), z.unknown()).optional(),
    elements: z.array(canvasElementSchema),
});

export type Canvas = z.infer<typeof canvasSchema>;
export type CanvasElement = z.infer<typeof canvasElementSchema>;
