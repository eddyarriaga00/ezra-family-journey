import type { Language } from './types'

const copy = {
  en: {
    home: 'Home', growth: 'Growth', care: 'Care', moments: 'Moments', english: 'English', spanish: 'Español',
    heroTitle: 'Our little fighter', heroCopy: 'Every day with Ezra is worth remembering.', born: 'Born March 19, 2026 · 31 weeks', stronger: 'Growing stronger', addMoment: 'Add a moment', latestMoments: 'Latest moments', welcomeHome: 'Welcome home, Ezra', feedingWell: 'Today’s feeding went well.', today: 'Today',
    careTitle: 'Care, when it’s helpful', careCopy: 'There’s no schedule to keep. Add an update whenever your family has one.', addCare: 'Add a care update', weight: 'Weight', feeding: 'Feeding', medication: 'Medication', milestone: 'Milestone', recentCare: 'Recent care', bottleWell: 'Bottle went well', welcomeShort: 'Welcome home', caughtUp: 'Nothing else to catch up on.',
    growthTitle: 'Growing in his own time', growthCopy: 'A gentle view of the measurements your family chooses to save.', currentWeight: 'Current weight', birthWeight: 'Birth weight', weightJourney: 'Weight journey', addWeight: 'Add a weight', noPressure: 'Record a weight whenever you receive a new one. Gaps are completely okay.',
    momentsTitle: 'Ezra’s moments', momentsCopy: 'The little things we never want to forget.', gripTitle: 'Those bright eyes', gripCopy: 'Taking in the world around him.', firstBottle: 'First bottle', add: 'Add', sweetSmile: 'A sweet little smile', braveBoy: 'Our brave boy', restingPeacefully: 'Resting peacefully', growingEveryDay: 'Growing every day', tinyMighty: 'Tiny but mighty', june2026: 'June 2026',
    entryQuestion: 'What would you like to save?', save: 'Save update', cancel: 'Cancel', date: 'Date', time: 'Time', title: 'Title', amount: 'Amount / dose', method: 'Method', optionalNotes: 'A few words (optional)', bottle: 'Bottle', breastMilk: 'Breast milk',
    welcomeTitle: 'Welcome to Ezra’s story', welcomeHelp: 'Choose your language. You can switch at any time.', continueEnglish: 'Continue in English', continueSpanish: 'Continuar en español', language: 'Language',
    familyFooter: 'Made with love for Ezra and his family.', disclaimer: 'For family organization only — not medical advice.', entries: 'updates', delete: 'Delete update', export: 'Export data', latest: 'Latest', noEntries: 'No updates saved yet.', pounds: 'lb', ounces: 'oz', asDirected: 'As directed', dailyVitamin: 'Daily vitamin'
  },
  es: {
    home: 'Inicio', growth: 'Crecimiento', care: 'Cuidado', moments: 'Momentos', english: 'English', spanish: 'Español',
    heroTitle: 'Nuestro pequeño luchador', heroCopy: 'Cada día con Ezra merece ser recordado.', born: 'Nació el 19 de marzo de 2026 · 31 semanas', stronger: 'Crece más fuerte', addMoment: 'Agregar un momento', latestMoments: 'Momentos recientes', welcomeHome: 'Bienvenido a casa, Ezra', feedingWell: 'La alimentación de hoy salió bien.', today: 'Hoy',
    careTitle: 'Cuidado, cuando sea útil', careCopy: 'No hay un horario que cumplir. Agrega una actualización cuando tu familia tenga una.', addCare: 'Agregar cuidado', weight: 'Peso', feeding: 'Alimentación', medication: 'Medicamento', milestone: 'Logro', recentCare: 'Cuidado reciente', bottleWell: 'El biberón salió bien', welcomeShort: 'Bienvenido a casa', caughtUp: 'No hay nada más que completar.',
    growthTitle: 'Creciendo a su propio ritmo', growthCopy: 'Una vista tranquila de las medidas que tu familia decida guardar.', currentWeight: 'Peso actual', birthWeight: 'Peso al nacer', weightJourney: 'Progreso de peso', addWeight: 'Agregar peso', noPressure: 'Registra un peso cuando recibas uno nuevo. Está bien si hay espacios.',
    momentsTitle: 'Los momentos de Ezra', momentsCopy: 'Las pequeñas cosas que nunca queremos olvidar.', gripTitle: 'Esos ojitos brillantes', gripCopy: 'Descubriendo el mundo a su alrededor.', firstBottle: 'Primer biberón', add: 'Agregar', sweetSmile: 'Una dulce sonrisa', braveBoy: 'Nuestro niño valiente', restingPeacefully: 'Descansando tranquilo', growingEveryDay: 'Creciendo cada día', tinyMighty: 'Pequeño pero poderoso', june2026: 'Junio de 2026',
    entryQuestion: '¿Qué deseas guardar?', save: 'Guardar actualización', cancel: 'Cancelar', date: 'Fecha', time: 'Hora', title: 'Título', amount: 'Cantidad / dosis', method: 'Método', optionalNotes: 'Unas palabras (opcional)', bottle: 'Biberón', breastMilk: 'Leche materna',
    welcomeTitle: 'Bienvenidos a la historia de Ezra', welcomeHelp: 'Elige tu idioma. Puedes cambiarlo cuando quieras.', continueEnglish: 'Continue in English', continueSpanish: 'Continuar en español', language: 'Idioma',
    familyFooter: 'Hecho con amor para Ezra y su familia.', disclaimer: 'Solo para organización familiar; no es consejo médico.', entries: 'actualizaciones', delete: 'Eliminar actualización', export: 'Exportar datos', latest: 'Reciente', noEntries: 'Todavía no hay actualizaciones.', pounds: 'lb', ounces: 'oz', asDirected: 'Según las indicaciones', dailyVitamin: 'Vitamina diaria'
  }
} as const

export function useCopy(language: Language) { return copy[language] }
