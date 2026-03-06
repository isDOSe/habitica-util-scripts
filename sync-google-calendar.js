function scheduleJoinQuest() {
  const HABITICA_USER_ID = 'TU_HABITICA_USER_ID';
  const HABITICA_API_TOKEN = 'TU_HABITICA_API_TOKEN';
  
  const headers = {
    "x-api-user": HABITICA_USER_ID,
    "x-api-key": HABITICA_API_TOKEN,
    "x-client": HABITICA_USER_ID + "-GoogleAppsScript"
  };

  // 1. Consultar el estado de la Party
  const response = UrlFetchApp.fetch("https://habitica.com/api/v3/groups/party", {
    "method": "get",
    "headers": headers,
    "muteHttpExceptions": true
  });
  
  const resJson = JSON.parse(response.getContentText());
  const quest = resJson.data.quest;

  // LOGS DE CONTROL (Revisa esto en Ejecuciones)
  Logger.log("¿Hay Quest activa en data?: " + (quest && quest.key ? "Sí: " + quest.key : "No"));
  
  if (quest && quest.key) {
    // Verificamos si ya aceptaste (si tu ID está en la lista de miembros con valor true)
    const yaAcepto = quest.members && quest.members[HABITICA_USER_ID] === true;
    Logger.log("¿Ya aceptaste anteriormente?: " + yaAcepto);

    // Si NO has aceptado, intentamos unirnos
    if (!yaAcepto) {
      Logger.log("Intentando aceptar la misión...");
      
      const acceptResponse = UrlFetchApp.fetch("https://habitica.com/api/v3/groups/party/quests/accept", {
        "method": "post", // Obligatorio para realizar acciones
        "headers": headers,
        "muteHttpExceptions": true
      });
      
      Logger.log("Respuesta de Habitica: " + acceptResponse.getContentText());
    } else {
      Logger.log("Ya estás dentro de la misión, no hace falta hacer nada.");
    }
  } else {
    Logger.log("No se detectó ninguna invitación de misión en este momento.");
  }
}