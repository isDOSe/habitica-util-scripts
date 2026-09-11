// --- CONFIGURACIÓN ---
const HABITICA_USER_ID = 'TU_HABITICA_USER_ID';
const HABITICA_API_TOKEN = 'TU_API_TOKEN';
const GOOGLE_CALENDAR_ID = 'TU_GOOGLE_CALENDAR_ID'; // 'primary' o el ID de un calendario específico
// ---------------------

function syncHabiticaToGoogleCalendarAllDay() {
  Logger.log("=== INICIO DE SINCRONIZACIÓN ===");

  const url = "https://habitica.com/api/v3/tasks/user?type=todos";
  const params = {
    "method": "get",
    "headers": {
      "x-api-user": HABITICA_USER_ID,
      "x-api-key": HABITICA_API_TOKEN,
      "x-client": HABITICA_USER_ID + "-GoogleAppsScript"
    },
    "muteHttpExceptions": true
  };

  Logger.log("Obteniendo tareas de Habitica...");
  const response = UrlFetchApp.fetch(url, params);
  const responseData = JSON.parse(response.getContentText());

  if (!responseData.success) {
    Logger.log("Error de Habitica: " + responseData.message);
    return;
  }

  const habiticaTasks = responseData.data;
  const tasksWithDate = habiticaTasks.filter(task => task.date);
  
  Logger.log(`Tareas totales en Habitica: ${habiticaTasks.length}`);
  Logger.log(`Tareas con fecha: ${tasksWithDate.length}`);

  // Obtener todos los tags disponibles
  Logger.log("\nObteniendo tags de Habitica...");
  const tagsUrl = "https://habitica.com/api/v3/tags";
  const tagsResponse = UrlFetchApp.fetch(tagsUrl, params);
  const tagsData = JSON.parse(tagsResponse.getContentText());
  const tagsMap = {};
  
  if (tagsData.success) {
    tagsData.data.forEach(tag => {
      tagsMap[tag.id] = tag.name;
    });
    Logger.log(`Tags obtenidos: ${Object.keys(tagsMap).length}`);
  }

  Logger.log("\n--- TAREAS DE HABITICA CON FECHA ---");
  tasksWithDate.forEach(task => {
    const taskTags = task.tags ? task.tags.map(tagId => tagsMap[tagId]).filter(Boolean).join(', ') : 'Sin tags';
    Logger.log(`- "${task.text}" | Fecha: ${new Date(task.date).toLocaleDateString()} | Tags: ${taskTags}`);
  });

  const calendar = CalendarApp.getCalendarById(GOOGLE_CALENDAR_ID);
  const existingEvents = calendar.getEvents(new Date(2000, 0, 1), new Date(2100, 0, 1));

  Logger.log(`\n--- EVENTOS EN GOOGLE CALENDAR ("${calendar.getName()}") ---`);
  Logger.log(`Cantidad de eventos existentes: ${existingEvents.length}`);
  
  existingEvents.forEach(event => {
    const eventDate = event.getAllDayStartDate();
    Logger.log(`- "${event.getTitle()}" | Fecha: ${eventDate ? eventDate.toLocaleDateString() : 'N/A'} | All day: ${event.isAllDayEvent()}`);
  });

  const existingTitles = existingEvents.map(event => event.getTitle());

  let createdCount = 0;

  Logger.log("\n--- INICIANDO COMPARACIÓN ---");
  tasksWithDate.forEach(task => {
    // Obtener nombres de tags si existen
    const taskTags = task.tags ? task.tags.map(tagId => tagsMap[tagId]).filter(Boolean) : [];
    const tagsString = taskTags.length > 0 ? ` [${taskTags.join(', ')}]` : '';
    
    const eventTitle = "✅ Habitica: " + task.text + tagsString;
    const taskDate = new Date(task.date);
    
    Logger.log(`\nProcesando: "${task.text}"`);
    Logger.log(`  Fecha: ${taskDate.toLocaleDateString()}`);
    Logger.log(`  Tags: ${taskTags.join(', ') || 'Ninguno'}`);
    Logger.log(`  Título a crear: "${eventTitle}"`);

    if (existingTitles.includes(eventTitle)) {
      Logger.log(`  Estado: YA EXISTE - No se crea duplicado`);
    } else {
      const eventDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());
      const newEvent = calendar.createAllDayEvent(eventTitle, eventDate);

      if (task.notes) {
        newEvent.setDescription(task.notes);
      }

      createdCount++;
      Logger.log(`  Estado: CREADO EXITOSAMENTE`);
    }
  });

  Logger.log("\n=== FIN DE SINCRONIZACIÓN ===");
  Logger.log(`Eventos creados: ${createdCount}`);
  
  if (createdCount > 0) {
    Logger.log(`Se crearon ${createdCount} nuevo(s) evento(s) all day en Google Calendar`);
  } else {
    Logger.log("No se crearon eventos nuevos. Todo está sincronizado.");
  }
}
