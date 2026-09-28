import { config, fields, collection, singleton } from '@keystatic/core';

// CMS general del sitio: todo el contenido editable vive en src/content/*.yaml
// y en el singleton `sitio`. Keystatic lo edita localmente en /keystatic
// y en producción contra GitHub (ver MIGRACION_CMS.md para activar storage github).
//
// Para producción con edición en vivo, cambiar a:
//   storage: { kind: 'github', repo: 'TU_USUARIO/TU_REPO' }
// y configurar la GitHub App de Keystatic (ver doc).
export default config({
  storage: { kind: 'local' },

  singletons: {
    sitio: singleton({
      label: 'Datos generales del sitio',
      path: 'src/content/sitio',
      format: { data: 'json' },
      schema: {
        nombreLab: fields.text({
          label: 'Nombre del laboratorio',
          defaultValue: 'Laboratorio de Análisis Industriales y Especiales',
        }),
        marcaCorta: fields.text({ label: 'Marca corta (header)', defaultValue: 'Analítica IE' }),
        telefono: fields.text({ label: 'Teléfono', defaultValue: '000 000 0000 (provisional)' }),
        correo: fields.text({
          label: 'Correo de contacto',
          defaultValue: 'lab.analitica@ejemplo.mx',
        }),
        ubicacion: fields.text({
          label: 'Ubicación',
          multiline: true,
          defaultValue: 'Tercera planta. Mesas de trabajo, campanas e instrumentación.',
        }),
        heroTitulo: fields.text({
          label: 'Título principal (inicio)',
          multiline: true,
          defaultValue:
            'Espacio de aprendizaje práctico para la formación de ingenieros en análisis industrial.',
        }),
        heroSub: fields.text({
          label: 'Subtítulo principal',
          defaultValue: 'Excelencia académica, investigación y seguridad.',
        }),
        mision: fields.text({
          label: 'Misión',
          multiline: true,
          defaultValue:
            'Brindar un espacio seguro y equipado donde estudiantes de Ingeniería Química, Química, QFB, Biomédica y Alimentos-Biotecnología desarrollen competencias en métodos ópticos, electroquímicos, cromatográficos y bromatológicos.',
        }),
        vision: fields.text({
          label: 'Visión',
          multiline: true,
          defaultValue:
            'Apoyar tesis y proyectos integradores, dar servicio al laboratorio de análisis fisicoquímicos y a solicitantes externos, con estándares académicos y de seguridad.',
        }),
      },
    }),
  },

  collections: {
    cursos: collection({
      label: 'Cursos y materias',
      slugField: 'nombre',
      path: 'src/content/cursos/*',
      format: { data: 'yaml' },
      schema: {
        nombre: fields.slug({ name: { label: 'Nombre del curso' } }),
        area: fields.select({
          label: 'Área',
          options: [
            { label: 'Análisis instrumental', value: 'Análisis instrumental' },
            { label: 'Industrial', value: 'Industrial' },
            { label: 'Bromatología', value: 'Bromatología' },
            { label: 'Instrumentación', value: 'Instrumentación' },
          ],
          defaultValue: 'Análisis instrumental',
        }),
        semestre: fields.text({ label: 'Semestre / carreras', defaultValue: 'Semestre 5 · IQ / Química' }),
        descripcion: fields.text({ label: 'Descripción corta', multiline: true }),
        profesor: fields.text({ label: 'Profesor(a)', defaultValue: 'Por asignar' }),
        contacto: fields.text({ label: 'Contacto', defaultValue: 'lab.analitica@ejemplo.mx' }),
        programa: fields.array(fields.text({ label: 'Tema del programa' }), {
          label: 'Programa sintético',
          itemLabel: (props) => props.value ?? 'Tema',
        }),
        practicas: fields.array(fields.text({ label: 'Práctica' }), {
          label: 'Calendario de prácticas',
          itemLabel: (props) => props.value ?? 'Práctica',
        }),
      },
    }),

    personal: collection({
      label: 'Personal',
      slugField: 'nombre',
      path: 'src/content/personal/*',
      format: { data: 'yaml' },
      schema: {
        nombre: fields.slug({ name: { label: 'Nombre' } }),
        rol: fields.text({ label: 'Rol / puesto' }),
        grupo: fields.select({
          label: 'Grupo',
          options: [
            { label: 'Responsable', value: 'responsable' },
            { label: 'Profesores', value: 'profesores' },
            { label: 'Técnicos y auxiliares', value: 'tecnicos' },
          ],
          defaultValue: 'profesores',
        }),
        bio: fields.text({ label: 'Semblanza', multiline: true }),
        email: fields.text({ label: 'Correo (opcional)', defaultValue: '' }),
        iniciales: fields.text({ label: 'Iniciales (avatar)', defaultValue: '' }),
      },
    }),

    proyectos: collection({
      label: 'Proyectos',
      slugField: 'titulo',
      path: 'src/content/proyectos/*',
      format: { data: 'yaml' },
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        tipo: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Integrador de asignatura', value: 'integrador' },
            { label: 'Tesis / titulación', value: 'tesis' },
            { label: 'Club / divulgación', value: 'club' },
          ],
          defaultValue: 'integrador',
        }),
        badge: fields.text({ label: 'Etiqueta (ej. 2025 · Aguas)', defaultValue: '' }),
        descripcion: fields.text({ label: 'Descripción', multiline: true }),
        meta: fields.text({ label: 'Dato extra (asesor, materia…)', defaultValue: '' }),
      },
    }),

    equipos: collection({
      label: 'Equipos e infraestructura',
      slugField: 'nombre',
      path: 'src/content/equipos/*',
      format: { data: 'yaml' },
      schema: {
        nombre: fields.slug({ name: { label: 'Equipo' } }),
        cantidad: fields.text({ label: 'Cantidad', defaultValue: '1' }),
        uso: fields.text({ label: 'Uso típico' }),
        requisito: fields.select({
          label: 'Requisito de uso',
          options: [
            { label: 'Con asesoría', value: 'Con asesoría' },
            { label: 'Libre con registro', value: 'Libre con registro' },
            { label: 'Préstamo en ventanilla', value: 'Préstamo en ventanilla' },
          ],
          defaultValue: 'Con asesoría',
        }),
      },
    }),

    reglas: collection({
      label: 'Reglamento',
      slugField: 'texto',
      path: 'src/content/reglas/*',
      format: { data: 'yaml' },
      schema: {
        texto: fields.slug({ name: { label: 'Regla' } }),
        categoria: fields.select({
          label: 'Categoría',
          options: [
            { label: 'Norma de uso', value: 'norma' },
            { label: 'Seguridad / EPP', value: 'seguridad' },
            { label: 'Residuos', value: 'residuos' },
            { label: 'Emergencia', value: 'emergencia' },
          ],
          defaultValue: 'norma',
        }),
      },
    }),

    avisos: collection({
      label: 'Novedades (tablón)',
      slugField: 'titulo',
      path: 'src/content/avisos/*',
      format: { data: 'yaml' },
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        categoria: fields.text({ label: 'Categoría', defaultValue: 'Aviso general' }),
        descripcion: fields.text({ label: 'Descripción', multiline: true }),
        estilo: fields.select({
          label: 'Estilo',
          options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Advertencia', value: 'warn' },
            { label: 'Urgente', value: 'urgent' },
          ],
          defaultValue: 'normal',
        }),
      },
    }),
  },
});
