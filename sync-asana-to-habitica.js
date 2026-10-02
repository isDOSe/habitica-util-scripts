// --- CONFIGURACIÓN ---
const ASANA_HABITICA_USER_ID = 'TU_HABITICA_USER_ID';
const ASANA_HABITICA_API_TOKEN = 'TU_HABITICA_API_TOKEN';
const ASANA_PERSONAL_ACCESS_TOKEN = 'TU_ASANA_PAT';
const ASANA_PROJECT_ID = 'TU_ASANA_PROJECT_ID';
const HABITICA_REQUIRED_TAG_NAME = '🏯 Terrenos del Gremio';
const HABITICA_DEFAULT_DIFFICULTY = 1.5; // 1.5 = Media en Habitica
// ---------------------

function syncAsanaToHabitica() {
  Logger.log('=== INICIO DE SINCRONIZACIÓN DE ASANA A HABITICA ===');

  const asanaTasks = getAsanaProjectTasks();
  const tasksWithDate = asanaTasks.filter(task => task.due_on && !task.completed);
  Logger.log(`Tareas del proyecto de Asana: ${asanaTasks.length}`);
  Logger.log(`Tareas abiertas con fecha: ${tasksWithDate.length}`);

  if (tasksWithDate.length === 0) {
    Logger.log('No hay tareas abiertas con fecha para importar.');
    return;
  }

  const habiticaTags = getHabiticaTags();
  const requiredTag = habiticaTags.find(tag => tag.name === HABITICA_REQUIRED_TAG_NAME);
  if (!requiredTag) {
    throw new Error(`No existe el tag "${HABITICA_REQUIRED_TAG_NAME}" en Habitica.`);
  }

  const existingTasks = getHabiticaTodos();
  const importedAsanaIds = {};
  existingTasks.forEach(task => {
    const match = (task.notes || '').match(/Asana task GID: ([^\r\n]+)/);
    if (match) {
      importedAsanaIds[match[1]] = true;
    }
  });

  let createdCount = 0;
  tasksWithDate.forEach(task => {
    if (importedAsanaIds[task.gid]) {
      Logger.log(`Ya existe en Habitica: "${task.name}" (${task.gid}).`);
      return;
    }

    const notes = [task.notes || '', `Asana task GID: ${task.gid}`]
      .filter(Boolean)
      .join('\n\n');
    const newTask = {
      text: task.name,
      type: 'todo',
      date: task.due_on,
      priority: HABITICA_DEFAULT_DIFFICULTY,
      tags: [requiredTag.id],
      notes: notes
    };

    createHabiticaTodo(newTask);
    importedAsanaIds[task.gid] = true;
    createdCount++;
    Logger.log(`Creada en Habitica: "${task.name}" | Fecha: ${task.due_on}`);
  });

  Logger.log(`=== FIN: ${createdCount} tarea(s) creada(s) en Habitica ===`);
}

function getAsanaProjectTasks() {
  const url = `https://app.asana.com/api/1.0/projects/${encodeURIComponent(ASANA_PROJECT_ID)}/tasks?limit=100&opt_fields=gid,name,due_on,notes,completed`;
  return getAllAsanaPages(url);
}

function getAllAsanaPages(initialUrl) {
  let url = initialUrl;
  let tasks = [];

  while (url) {
    const response = asanaRequest('get', url);
    tasks = tasks.concat(response.data || []);
    url = response.next_page && response.next_page.uri
      ? response.next_page.uri
      : null;
  }

  return tasks;
}

function createHabiticaTodo(task) {
  return habiticaRequest('post', 'https://habitica.com/api/v3/tasks/user', task);
}

function getHabiticaTodos() {
  const response = habiticaRequest('get', 'https://habitica.com/api/v3/tasks/user?type=todos');
  return response.data || [];
}

function getHabiticaTags() {
  const response = habiticaRequest('get', 'https://habitica.com/api/v3/tags');
  return response.data || [];
}

function habiticaRequest(method, url, payload) {
  const options = {
    method: method,
    headers: {
      'x-api-user': ASANA_HABITICA_USER_ID,
      'x-api-key': ASANA_HABITICA_API_TOKEN,
      'x-client': `${ASANA_HABITICA_USER_ID}-GoogleAppsScript`
    },
    muteHttpExceptions: true
  };

  if (payload) {
    options.contentType = 'application/json';
    options.payload = JSON.stringify(payload);
  }

  const response = UrlFetchApp.fetch(url, options);
  const responseText = response.getContentText();
  const responseData = JSON.parse(responseText);
  if (!responseData.success) {
    throw new Error(`Error de Habitica (${response.getResponseCode()}): ${responseData.message || responseText}`);
  }
  return responseData;
}

function asanaRequest(method, url) {
  const response = UrlFetchApp.fetch(url, {
    method: method,
    headers: {
      Authorization: `Bearer ${ASANA_PERSONAL_ACCESS_TOKEN}`,
      Accept: 'application/json'
    },
    muteHttpExceptions: true
  });

  const statusCode = response.getResponseCode();
  const responseText = response.getContentText();
  let responseData;
  try {
    responseData = JSON.parse(responseText);
  } catch (error) {
    throw new Error(`Respuesta no válida de Asana (${statusCode}): ${responseText}`);
  }

  if (statusCode < 200 || statusCode >= 300 || responseData.errors) {
    const message = responseData.errors
      ? responseData.errors.map(error => error.message).join('; ')
      : responseText;
    throw new Error(`Error de Asana (${statusCode}): ${message}`);
  }
  return responseData;
}
