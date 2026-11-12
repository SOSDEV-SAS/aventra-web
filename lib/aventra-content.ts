export type EditorialContent = {
  rodadasTitle: string; rodadasIntro: string;
  motoTitle: string; motoIntro: string;
  careTitle: string; careIntro: string;
  communityTitle: string; communityIntro: string;
  philosophyTitle: string; philosophyIntro: string;
  downloadTitle: string; downloadIntro: string;
};

export const approvedContent: EditorialContent = Object.freeze({
  rodadasTitle: 'El camino también se comparte.',
  rodadasIntro: 'Descubre próximas salidas, confirma tu cupo con tu moto o crea una rodada. Comparte el destino, las paradas y el plan con quienes van contigo.',
  motoTitle: 'Una moto. Una identidad.',
  motoIntro: 'Registra tu moto desde el catálogo o con sus datos manuales. Personaliza su perfil y reúne su kilometraje y sus cuidados.',
  careTitle: 'Que lo único pendiente sea el próximo destino.',
  careIntro: 'Consulta las fuentes oficiales, conserva tus registros y activa recordatorios de lo importante. Revisa la vigencia de la información antes de salir.',
  communityTitle: 'Lo que sabes puede ayudar a alguien.',
  communityIntro: 'Pregunta, comparte experiencias y encuentra respuestas en el Foro Aventra. Una comunidad con votos, reportes y moderación para aprender con respeto.',
  philosophyTitle: 'Confianza para seguir avanzando.',
  philosophyIntro: 'Tu moto es mucho más que un medio de transporte. Aventra reúne su historia y sus cuidados para acompañarte antes, durante y después de cada recorrido.',
  downloadTitle: 'El camino te espera. Lleva Aventra contigo.',
  downloadIntro: 'Conoce la versión preliminar para Android. Consulta aquí su disponibilidad antes de descargarla.',
});

export type ModuleInformation = {
  id: string; title: string; description: string; condition?: string;
};
export type ModuleGroup = {
  id: 'before' | 'during' | 'after'; title: string; description: string; items: ModuleInformation[];
};

export const moduleGroups: ModuleGroup[] = [
  {
    id: 'before', title: 'Antes de salir',
    description: 'Conoce tu moto y revisa lo que necesitas para tomar el camino.',
    items: [
      { id: 'motorcycle', title: 'Tu moto, con su propia identidad', description: 'Elige una moto del catálogo o registra sus datos manualmente. Personaliza su perfil y selecciona la moto que te acompaña.' },
      { id: 'obligations', title: 'Obligaciones y recordatorios', description: 'Consulta las fuentes oficiales, conserva tus registros y organiza avisos locales de sus fechas.', condition: 'Tus confirmaciones no equivalen a una verificación institucional automática. Los avisos locales requieren una app compatible y permiso de notificaciones.' },
      { id: 'circulation', title: 'Pico y placa, con contexto', description: 'Consulta la regla disponible para la jurisdicción de circulación que tú eliges.', condition: 'La información depende de la cobertura y vigencia de las fuentes; confirma la regla oficial antes de salir.' },
      { id: 'manuals', title: 'El manual de tu modelo', description: 'Consulta el manual oficial asociado a tu moto o envía un PDF, un enlace oficial o una solicitud para localizarlo.', condition: 'La solicitud se revisa antes de incorporarse. El catálogo puede asociar un manual a una familia de modelos; revisa diferencias de versión.' },
      { id: 'rides', title: 'Un plan para rodar en compañía', description: 'Crea una rodada con fecha, cupos, destino y paradas, o confirma tu lugar en una salida. Comparte el enlace o el código QR.', condition: 'El punto exacto de encuentro se muestra al organizador y a quienes confirman su participación.' },
    ],
  },
  {
    id: 'during', title: 'En el camino',
    description: 'Ten a mano el plan y registra los momentos que forman parte del recorrido.',
    items: [
      { id: 'route', title: 'Tu destino y tus paradas', description: 'Abre el recorrido de la rodada en Google Maps con el destino y las paradas del plan.', condition: 'Google Maps es una aplicación externa. Aventra no ofrece navegación propia ni seguimiento en vivo.' },
      { id: 'fuel', title: 'Cada carga también cuenta', description: 'Registra cargas y gastos de combustible. El consumo se estima con registros suficientes entre tanques llenos.' },
      { id: 'nfc', title: 'Un acceso directo al combustible', description: 'Configura una etiqueta NFC para abrir el registro de combustible de tu moto.', condition: 'Requiere un teléfono Android con NFC habilitado y la app compilada instalada; no está disponible en Expo Go.' },
    ],
  },
  {
    id: 'after', title: 'Después de cada kilómetro',
    description: 'Conserva su historia, aprende de otros y prepara lo que viene.',
    items: [
      { id: 'odometer', title: 'Los kilómetros, en su lugar', description: 'Añade lecturas de kilometraje y conserva su historial. Si necesitas corregir una lectura, su contexto sigue disponible.' },
      { id: 'maintenance', title: 'Una bitácora de cuidados', description: 'Registra los mantenimientos de tu moto y consulta los próximos hitos que has indicado.' },
      { id: 'forum', title: 'Aprender en comunidad', description: 'Haz preguntas, comparte respuestas y experiencias, vota contenido útil y reporta lo que necesite revisión.' },
      { id: 'assistant', title: 'Una ayuda para entender mejor', description: 'Consulta el asistente con el contexto de tu moto y las fuentes disponibles.', condition: 'Requiere el asistente habilitado en el entorno y un manual oficial asociado a una moto compatible del catálogo. Revisa las diferencias de versión; la IA orienta y no sustituye una revisión profesional.' },
      { id: 'account', title: 'Tu cuenta y tu acceso', description: 'Gestiona tu cuenta y utiliza el flujo de recuperación si olvidas tu contraseña.' },
      { id: 'feedback', title: 'Tu experiencia ayuda a mejorar', description: 'Envía comentarios sobre la versión preliminar y cuenta lo que necesitas para tu próximo recorrido.' },
    ],
  },
];

export const brandPrinciples = [
  { title: 'Confianza para seguir avanzando.', description: 'Queremos simplificar tu vida como motociclista para que disfrutes cada kilómetro con más organización y confianza.' },
  { title: 'Tu historia, bajo tu control.', description: 'Tu moto es el centro de la experiencia. La privacidad, el control de tus datos y la claridad van antes que la atención a cualquier precio.' },
  { title: 'Información que orienta.', description: 'Diferenciamos hechos, cálculos y recomendaciones. No convertimos una estimación ni una respuesta de IA en una garantía.' },
];
