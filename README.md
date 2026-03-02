# Habitica Utility Scripts 🛡️

Este repositorio contiene una colección de scripts útiles para automatizar y mejorar tu experiencia en [Habitica](https://habitica.com/). Estos scripts están diseñados para ser ejecutados en **Google Apps Script**, lo que permite que se ejecuten automáticamente en la nube sin necesidad de tener tu ordenador encendido.

## 🚀 Scripts Incluidos

### 1. Auto-Join Quest (`auto-join-quest.js`)
Este script comprueba automáticamente si tu equipo (Party) ha iniciado una nueva misión (Quest). Si hay una misión disponible y aún no te has unido, el script te unirá automáticamente. ¡Nunca más te quedarás fuera de una misión por olvido!

### 2. Sync Habitica to Google Calendar (`sync-google-calendar.js`)
Sincroniza tus tareas pendientes ("To-Dos") de Habitica que tengan una fecha de vencimiento directamente con tu **Google Calendar**.
- Crea eventos de día completo.
- Evita duplicados buscando eventos existentes con el mismo nombre.
- Incluye las notas de la tarea en la descripción del evento de Google.

---

## 🛠️ Cómo Usarlos

Para usar estos scripts, sigue estos pasos:

1. Ve a [Google Apps Script](https://script.google.com/).
2. Haz clic en **Nuevo proyecto**.
3. Copia el contenido de uno de los archivos `.js` de este repositorio y pégalo en el editor de Google Apps Script.
4. **Configuración**: Busca las constantes al principio del script y reemplaza los valores con tu propia información:
   - `HABITICA_USER_ID`: Tu ID de usuario de Habitica.
   - `HABITICA_API_TOKEN`: Tu Token de API de Habitica.
   - `CALENDAR_ID` (en el script de calendario): Tu ID de calendario (puedes usar `'primary'` para tu calendario principal).
5. Guarda el proyecto.
6. **Automatización**: Haz clic en el icono del reloj (Activadores) en la barra lateral izquierda y añade un nuevo activador para que la función se ejecute automáticamente (por ejemplo, cada hora o una vez al día).

## 🔑 Dónde encontrar tus credenciales
Puedes encontrar tu **User ID** y **API Token** en la configuración de Habitica:
`Usuario > Configuración > API`

---

## ✒️ Créditos
Creado por: **dose**

---

*Nota: Estos scripts son herramientas de terceros y no están oficialmente afiliados a Habitica.*
