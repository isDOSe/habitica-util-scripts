// --- CONFIGURACIÓN ---
const HABITICA_USER_ID = 'TU_HABITICA_USER_ID';
const HABITICA_API_TOKEN = 'TU_API_TOKEN';
const CALENDAR_ID = 'TU_CALENDAR_ID'; // 'primary' usa tu calendario principal
// ---------------------

function syncHabiticaToCalendar() {
 const url = "https://habitica.com/api/v3/tasks/user?type=todos";

 // Hemos añadido 'x-client' a los headers para que Habitica no rechace la conexión
 const params = {
  "method": "get",
  "headers": {
   "x-api-user": HABITICA_USER_ID,
   "x-api-key": HABITICA_API_TOKEN,
   "x-client": HABITICA_USER_ID + "-GoogleAppsScript" // Identificador requerido
  },
  "muteHttpExceptions": true
 };

 const response = UrlFetchApp.fetch(url, params);
 const responseData = JSON.parse(response.getContentText());

 // Verificación de seguridad por si hay otro error
 if (!responseData.success) {
  Logger.log("Error de Habitica: " + responseData.message);
  return;
 }

 const tasks = responseData.data;
 const calendar = CalendarApp.getCalendarById(CALENDAR_ID);

 tasks.forEach(task => {
  // Solo sincroniza si la tarea tiene una fecha (due date)
  if (task.date) {
   const taskDate = new Date(task.date);
   // Ajuste para evitar problemas de zona horaria en eventos de todo el día
   taskDate.setMinutes(taskDate.getMinutes() + taskDate.getTimezoneOffset());

   const taskTitle = "⚔️ Habitica: " + task.text;

   // Busca si ya existe para no duplicar
   const events = calendar.getEventsForDay(taskDate, { search: taskTitle });

   if (events.length === 0) {
    calendar.createAllDayEvent(taskTitle, taskDate, {
     description: task.notes || "Tarea de Habitica"
    });
    Logger.log("Evento creado: " + taskTitle);
   }
  }
 });
}