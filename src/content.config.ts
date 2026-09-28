import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Cada colección lee los YAML que Keystatic edita en src/content/*.
// Añadir un archivo nuevo en esas carpetas (o desde /keystatic) = nuevo contenido.
const cursos = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/cursos' }),
  schema: z.object({
    nombre: z.string(),
    area: z.string(),
    semestre: z.string(),
    descripcion: z.string(),
    profesor: z.string(),
    contacto: z.string(),
    programa: z.array(z.string()).default([]),
    practicas: z.array(z.string()).default([]),
  }),
});

const personal = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/personal' }),
  schema: z.object({
    nombre: z.string(),
    rol: z.string(),
    grupo: z.enum(['responsable', 'profesores', 'tecnicos']),
    bio: z.string(),
    email: z.string().default(''),
    iniciales: z.string().default(''),
  }),
});

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/proyectos' }),
  schema: z.object({
    titulo: z.string(),
    tipo: z.enum(['integrador', 'tesis', 'club']),
    badge: z.string().default(''),
    descripcion: z.string(),
    meta: z.string().default(''),
  }),
});

const equipos = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/equipos' }),
  schema: z.object({
    nombre: z.string(),
    cantidad: z.string(),
    uso: z.string(),
    requisito: z.string(),
  }),
});

const reglas = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/reglas' }),
  schema: z.object({
    texto: z.string(),
    categoria: z.string(),
  }),
});

const avisos = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/avisos' }),
  schema: z.object({
    titulo: z.string(),
    categoria: z.string(),
    descripcion: z.string(),
    estilo: z.enum(['normal', 'warn', 'urgent']).default('normal'),
  }),
});

export const collections = { cursos, personal, proyectos, equipos, reglas, avisos };
