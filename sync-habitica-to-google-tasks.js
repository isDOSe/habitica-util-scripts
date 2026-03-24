// --- CONFIGURACIÓN ---
const HABITICA_USER_ID = 'TU_HABITICA_USER_ID';
const HABITICA_API_TOKEN = 'TU_API_TOKEN';
const GOOGLE_TASKS_LIST_ID = 'TU_GOOGLE_TASKS_LIST_ID';
// ---------------------

function syncHabiticaToGoogleTasks() {
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

  Logger.log("\n--- TAREAS DE HABITICA CON FECHA ---");
  tasksWithDate.forEach(task => {
    Logger.log(`- "${task.text}" | Fecha: ${new Date(task.date).toLocaleDateString()}`);
  });

  const taskList = Tasks.Tasklists.get(GOOGLE_TASKS_LIST_ID);
  const existingTasks = Tasks.Tasks.list(GOOGLE_TASKS_LIST_ID).items || [];

  Logger.log(`\n--- TAREAS EN GOOGLE TASKS ("${taskList.title}") ---`);
  Logger.log(`Cantidad de tareas existentes: ${existingTasks.length}`);
  
  existingTasks.forEach(task => {
    Logger.log(`- "${task.title}" | Completada: ${task.status === 'completed'}`);
  });

  const existingTitles = existingTasks.map(task => task.title);

  let createdCount = 0;

  Logger.log("\n--- INICIANDO COMPARACIÓN ---");
  tasksWithDate.forEach(task => {
    const taskTitle = "✅ Habitica: " + task.text;
    const taskDate = new Date(task.date);
    
    Logger.log(`\nProcesando: "${task.text}"`);
    Logger.log(`  Fecha: ${taskDate.toLocaleDateString()}`);
    Logger.log(`  Título a crear: "${taskTitle}"`);

    if (existingTitles.includes(taskTitle)) {
      Logger.log(`  Estado: YA EXISTE - No se crea duplicado`);
    } else {
      const dueDate = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate(), 12, 0, 0);
      const googleTask = {
        title: taskTitle,
        due: dueDate.toISOString()
      };

      if (task.notes) {
        googleTask.notes = task.notes;
      }

      Tasks.Tasks.insert(googleTask, GOOGLE_TASKS_LIST_ID);
      createdCount++;
      Logger.log(`  Estado: CREADA EXITOSAMENTE`);
    }
  });

  Logger.log("\n=== FIN DE SINCRONIZACIÓN ===");
  Logger.log(`Tareas creadas: ${createdCount}`);
  
  if (createdCount > 0) {
    Logger.log(`Se crearon ${createdCount} nueva(s) tarea(s) en Google Tasks`);
  } else {
    Logger.log("No se crearon tareas nuevas. Todo está sincronizado.");
  }
}
