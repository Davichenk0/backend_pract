# **INFORME FUNCIONAL** 

## **Aplicación para la Mesa de Servicios SICOV CI2** 

_Control de turnos, rotación semanal y gestión de novedades_ 

|**Área**|Mesa de Servicios SICOV CI2|
|---|---|
|**Equipo**|Cinco analistas|
|**Responsable del documento**|David Gonzalo Cajamarca Torres|



## **1. Introducción** 

La Mesa de Servicios SICOV CI2 requiere una herramienta centralizada para consultar la programación semanal de los analistas, controlar la rotación de turnos y registrar las novedades que obliguen a reorganizar los horarios. La solución propuesta utiliza una base estructurada en Excel y una aplicación de consulta y registro para mantener la información actualizada y accesible. 

## **2. Objetivo general** 

Diseñar una aplicación para administrar la rotación semanal de cinco analistas de la Mesa de Servicios SICOV CI2, conectada con una base de Excel que refleje los cambios realizados en la programación y conserve la trazabilidad de las novedades y aprobaciones. 

## **3. Objetivos específicos** 

- Centralizar la programación semanal de los analistas. 

- Automatizar la rotación cíclica entre los cinco turnos. 

- Registrar novedades, ausencias, cambios y coberturas. 

- Documentar la aprobación del jefe inmediato antes de formalizar una reorganización. 

- Facilitar la consulta del turno vigente y de las semanas siguientes. 

- Generar una base histórica para informes y seguimiento. 

## **4. Organización de turnos** 

|**Turno**|**Horario o condición**|**Descripción**|
|---|---|---|
|Turno 1|06:00 - 14:00|Jornada operativa de la mañana.|
|Turno 2|14:00 - 22:00|Jornada operativa de la tarde.|
|Turno 3|22:00 - 06:00|Jornada operativa nocturna.|
|Turno 4|Semana de descanso<br>i|Periodo semanal de descanso del<br>analista.<br>i|
|Turno 5|Horario de oficina|Jornada administrativa de oficina.|



Mesa de Servicios SICOV CI2 | Informe funcional de control de turnos 

## **5. Regla de rotación semanal** 

Cada analista avanza un turno por semana siguiendo una secuencia cíclica: Turno 1, Turno 2, Turno 3, Turno 4 y Turno 5. Al finalizar el Turno 5, el analista regresa al Turno 1. De esta forma, los cinco integrantes cubren progresivamente las jornadas operativas, el descanso y el horario de oficina. 

## **6. Equipo de analistas** 

|**Analista**|**Asignación inicial de referencia**|
|---|---|
|David Gonzalo Cajamarca Torres|Turno 1|
|Ingelyn Samantha Gamboa Ruiz|Turno 2|
|Emanuel Salazar Bernal|Turno 3|
|Johan Felipe Londoño Lemus|Turno 4|
|Evelyn Ruiz Torres|Turno 5|



Nota: la asignación inicial puede modificarse en la hoja de parámetros antes de poner la solución en producción. 

## **7. Gestión de novedades** 

Cuando se presente una novedad que afecte la cobertura, el cambio debe notificarse al jefe inmediato. La reorganización debe quedar registrada para conservar la trazabilidad de la decisión y de la persona que cubre el turno. 

|**Dato**|**Finalidad**<br>i|
|---|---|
|Fecha del reporte|Identificar cuándo se informó la novedad.|
|Semana|Relacionar el cambio con la programación<br>correspondiente.<br>i|
|Analista afectado|Identificar a lapersona cuyo turno cambia.|
|Turno original|Conservar la asignaciónprevista.|
|Tipoydetalle de la novedad|Explicar la causa del ajuste.|
|Analistaque cubre|Registrarquiéngarantiza la continuidad.|
|Turno reorganizado|Mostrar la nueva asignación.|
|Aprobación deljefe inmediato|Controlar la autorización del cambio.|
|Observaciones|Conservar información complementaria.|



## **8. Flujo funcional propuesto** 

1. La aplicación consulta la programación almacenada en la base. 

2. El analista selecciona la semana que desea consultar. 

3. La aplicación muestra el turno asignado a cada integrante. 

4. Si existe una novedad, se crea un registro con el turno original y la cobertura propuesta. 

5. El cambio queda en estado pendiente hasta contar con la aprobación del jefe inmediato. 

6. Una vez aprobado, la programación reorganizada queda visible y el registro permanece en el histórico. 

Mesa de Servicios SICOV CI2 | Informe funcional de control de turnos 

## **9. Módulos de la aplicación** 

|**Módulo**|**Funciónprincipal**|
|---|---|
|Inicio|Mostrar la semana actual, los turnos vigentes y<br>alertas de novedades.|
|Programación|Consultar la rotación semanal y próximas<br>asignaciones.|
|Novedades|Crearyconsultar cambios,ausenciasycoberturas.|
|Aprobaciones|Controlar los estados Sin novedad, Pendiente de<br>aprobaciónyAprobada.|
|Histórico|Consultar reorganizaciones anteriores y sus<br>observaciones.|
|Informes|Presentar indicadores y permitir la exportación de<br>información.|



## **10. Estructura de la base de Excel** 

La plantilla preparada contiene cuatro hojas: 

- 

- 

- 

- 

- Parámetros: catálogo de turnos, horarios, estados y analistas. 

- Rotación semanal: programación de las semanas y turno asignado a cada integrante. 

- Novedades: registro de los cambios, cobertura, aprobación y observaciones. 

- Informe: resumen funcional e indicadores generales. 

## **11. Alternativas de implementación** 

Primera versión: utilizar Excel como fuente de datos central de la aplicación. Para trabajo compartido, el archivo debe mantenerse en una ubicación corporativa controlada. 

Versión recomendada para operación multiusuario: utilizar Power Apps como interfaz, Microsoft Lists o SharePoint como fuente central y Power Automate para notificaciones y aprobaciones. Excel puede conservarse como medio de exportación, consulta o respaldo. Esta es una recomendación de diseño para mejorar el control de edición simultánea y la trazabilidad. 

## **12. Reglas de control** 

- No aplicar una reorganización sin registrar la novedad. 

- No eliminar el turno original del histórico. 

- Identificar siempre al analista que realiza la cobertura. 

- Registrar el estado de aprobación del jefe inmediato. 

- Limitar la edición de parámetros a usuarios autorizados. 

- Conservar observaciones claras y verificables. 

## **13. Beneficios esperados** 

- Consulta rápida de la programación semanal. 

- Reducción de errores en la asignación de turnos. 

- Mayor claridad sobre quién cubre cada jornada. 

- Trazabilidad de novedades y aprobaciones. 

Mesa de Servicios SICOV CI2 | Informe funcional de control de turnos 

- Disponibilidad de información histórica para seguimiento. 

- Base preparada para indicadores y automatizaciones futuras. 

## **14. Conclusión** 

La solución propuesta organiza la rotación semanal de los cinco analistas y establece un mecanismo formal para registrar las novedades que afecten la cobertura. La base de Excel permite iniciar el control de manera estructurada, mientras que una implementación posterior con Power Apps, Microsoft Lists o SharePoint y Power Automate permitiría fortalecer la colaboración, las aprobaciones y la trazabilidad. 

## **15. Anexo: archivo Excel asociado** 

Nombre del archivo: Informe_Aplicacion_Turnos_SICOV_CI2.xlsx 

El archivo contiene la configuración de turnos, la programación inicial de doce semanas, el registro de novedades y el resumen funcional. 

Mesa de Servicios SICOV CI2 | Informe funcional de control de turnos 

## **16. Nota técnica de implementación** 

La implementación del backend usa PostgreSQL relacional como fuente de datos (el Excel de este informe es el origen funcional, no el almacenamiento). La API es REST, con autenticación JWT y roles `JEFE` (aprobaciones y parámetros) y `ANALISTA` (consulta y registro). Los datos iniciales del equipo se cargan con un seed de Prisma. No se contemplan pruebas unitarias por ahora. El detalle técnico vinculante está en `architecture.md`.

