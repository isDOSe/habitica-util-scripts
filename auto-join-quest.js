function autoJoinQuest() {
 const HABITICA_USER_ID = 'TU_HABITICA_USER_ID';
 const HABITICA_API_TOKEN = 'TU_API_TOKEN';

 const paramsTemplate = {
  "method": "get",
  "headers": {
   "x-api-user": HABITICA_USER_ID,
   "x-api-key": HABITICA_API_TOKEN,
   "x-client": HABITICA_USER_ID + "-GoogleAppsScript" // Identificador requerido
  },
  "muteHttpExceptions": true
 };

 var response = UrlFetchApp.fetch("https://habitica.com/api/v3/groups/party", paramsTemplate);
 var party = JSON.parse(response);

 if ((party.data.quest.key != undefined) && (party.data.quest.active != true) && (party.data.quest.members[HABITICA_USER_ID] == undefined)) {
  const paramsTemplate = {
   "method": "get",
   "headers": {
    "x-api-user": HABITICA_USER_ID,
    "x-api-key": HABITICA_API_TOKEN,
    "x-client": HABITICA_USER_ID + "-GoogleAppsScript" // Identificador requerido
   },
   "muteHttpExceptions": true
  };

  var response = UrlFetchApp.fetch("https://habitica.com/api/v3/groups/party/quests/accept", paramsTemplate);
  var party = JSON.parse(response);
 }
}