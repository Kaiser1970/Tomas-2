# MediControl (Android, 100% local)

App para enfermeros y doctores que cuidan a uno o más pacientes al día. Registra pacientes, recetas y
tomas de medicamentos, y **avisa a la hora de cada dosis aunque la app esté cerrada y sin internet**.

- Todos los datos se guardan **solo en el celular** (no hay servidor ni base de datos en línea).
- Los recordatorios usan las notificaciones locales de Android (alarmas del sistema), con un tono distinto por paciente.
- Catálogo precargado de **100 medicamentos** de uso frecuente del Cuadro Básico y Catálogo de Medicamentos del Sector Salud (IMSS).
- Recordatorio mensual de pago con botón de WhatsApp. **Nunca bloquea ni desactiva la app.**
- Respaldo: se exporta a un archivo `.json` y se puede compartir (WhatsApp, correo, Drive) e importar en otro celular.

## Configuración antes de compilar

Edita `src/config.ts`:

| Valor | Para qué sirve |
| --- | --- |
| `OWNER_WHATSAPP` | Número que recibe los avisos de renovación (con código de país, sin `+`). |
| `SUBSCRIPTION_PERIOD_DAYS` | Días de cada mensualidad (por defecto 30). |
| `PAYMENT_REMINDER_DAYS_BEFORE` | Cuántos días antes empieza a mostrarse el aviso (por defecto 5). |

## Obtener el APK sin instalar nada (GitHub Actions)

1. Sube este proyecto a GitHub (rama `android-local` o `main`).
2. **Muy importante (una sola vez):** crea la llave de firma con `bash tools/crear-keystore.sh` y guarda los
   4 valores como *Secrets* del repositorio (el script te dice cuáles). Sin esa llave fija, cada compilación
   sale firmada distinto y **para actualizar la app habría que desinstalarla, y al desinstalar se pierden los datos**.
3. En GitHub: pestaña **Actions** → *Compilar APK de Android* → **Run workflow**.
4. Al terminar, descarga el artefacto **MediControl-APK** y pásalo al celular (WhatsApp, cable o tu hosting).
5. En el celular abre el `.apk` y permite "instalar apps de origen desconocido" cuando lo pida.

## Compilar en tu computadora

Requisitos: Node 22, Java 21 y Android Studio (o el SDK de Android).

```bash
npm ci
npm run android:debug     # genera android/app/build/outputs/apk/debug/app-debug.apk
npm run android:open      # abre el proyecto en Android Studio
```

## Primer uso en un celular (para que los avisos no se pierdan)

Abre **Configuración** (engrane) → *Recordatorios de dosis* y verifica los tres puntos:

1. Permiso de notificaciones: activado.
2. Alarmas a la hora exacta: permitido.
3. Sin restricción de batería: en Xiaomi, Huawei, Samsung y otras marcas, además hay que permitir el
   "inicio automático" o la "actividad en segundo plano" de MediControl.

Usa **Enviar aviso de prueba**, cierra la app y confirma que suena.

## Cómo funcionan los recordatorios

La app programa en el sistema las próximas dosis pendientes (hasta 120 avisos por adelantado, más un aviso de
refuerzo 10 minutos después si la dosis sigue sin confirmarse) y los reprograma cada vez que cambian los datos
o se abre la app. Si se acaba la ventana programada, llega un aviso para volver a abrir la app. Por eso conviene
abrirla al menos una vez al día. Al marcar una dosis como tomada u omitida, sus avisos pendientes se cancelan solos.

## Catálogo de medicamentos

`src/data/imssCatalog.ts` tiene 100 medicamentos con su clave del cuadro básico, concentración, forma
farmacéutica y grupo terapéutico. Las claves se tomaron de los PDF publicados por el IMSS en
https://www.imss.gob.mx/profesionales-salud/cuadros-basicos/medicamentos. **Cuatro medicamentos
(metformina, levotiroxina, trimetoprima/sulfametoxazol y metronidazol) tienen la clave vacía** porque no se pudo
verificar; se muestran como "Clave por verificar". Antes de usar el catálogo con pacientes reales, conviene que
un profesional de la salud lo revise contra el cuadro básico vigente.

## Notas

- La app es informativa y no sustituye el criterio médico. El resumen de adherencia se genera en el dispositivo.
- Se quitó el servidor (Express) y la conexión con Gemini de la versión de AI Studio.
- Si sigues editando el proyecto en AI Studio con la sincronización de GitHub activa, esos cambios pueden
  chocar con los de este proyecto. Trabaja en una rama aparte (`android-local`).
- Para publicar en Google Play habría que justificar el permiso de alarmas exactas; instalando el APK directo no hace falta.
