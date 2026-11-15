# Reglas de Trabajo del Agente de IA — Backend

## 1. Propósito

Este documento define **cómo debe comportarse el agente de IA** durante el desarrollo del backend de este proyecto. No describe la arquitectura ni el negocio (eso está en otros documentos); describe el **modo de trabajo, las reglas de interacción y los límites de actuación** que el agente debe respetar en cada tarea.

## 2. Documentos y Recursos de Referencia Obligatoria

Antes de generar, modificar o proponer cualquier código, el agente **debe consultar y respetar** los siguientes documentos y recursos:

| Recurso | Tipo | Qué contiene | Prioridad |
|---------|------|--------------|-----------|
| `architecture.md` | Documento | Clean Architecture, SOLID, estructura por capas, separación controller/service/repository, convenciones, manejo de errores, validación. | **Vinculante.** El agente no puede violar estas reglas. |
| `context-general.md` | Documento | Contexto del aplicativo: propósito del negocio, dominio, funcionalidades existentes, alcance. | **Vinculante.** Toda funcionalidad debe tener sentido dentro de este contexto. |
| `C:\Users\david\OneDrive\Documentos\TEST` | Carpeta de código (frontend) | Aplicación frontend ya desarrollada en gran parte. Es la **fuente de verdad del dominio funcional**: define qué pantallas existen, qué datos consume, qué endpoints espera, qué flujos de usuario están implementados. | **Vinculante como contexto funcional.** El backend debe servir exactamente lo que el front consume. |

Si alguno de estos recursos **no existe, está vacío o es contradictorio**, el agente debe detenerse y preguntar antes de continuar.

## 3. Contexto del Frontend (`C:\Users\david\OneDrive\Documentos\TEST`)

### 3.1. Qué es

La carpeta del frontend contiene la **aplicación cliente ya desarrollada**. Es la **fuente de verdad del comportamiento funcional esperado del backend**: qué entidades existen, qué pantallas las consumen, qué operaciones se hacen, qué forma tienen los payloads y qué respuestas espera el cliente.

### 3.2. Reglas de uso

1. **Antes de implementar cualquier endpoint o modelo**, el agente debe revisar el frontend para entender qué consume, con qué forma y en qué flujo.
2. El backend debe **servir exactamente lo que el front espera**: nombres de campos, estructura de respuesta, códigos de estado, paginación, filtros.
3. Si el frontend **ya implementa una lógica que debería vivir en el backend** (validaciones críticas, reglas de negocio, cálculos sensibles), el agente debe **señalarlo** y proponer moverla al backend respetando `architecture.md`.
4. Si el frontend **no es suficiente** para deducir el comportamiento del backend (faltan pantallas, estados, flujos), el agente debe **preguntar** o **señalar la suposición** explícitamente.
5. Si existe **conflicto** entre lo que hace el frontend y lo definido en `architecture.md` o `context-general.md`, el agente debe **señalarlo** y pedir confirmación antes de proceder.
6. El agente **no debe inventar endpoints ni modelos** que el frontend no consuma, salvo que estén justificados por `context-general.md`; en ese caso debe indicarlo.

### 3.3. Qué buscar en el frontend

Para alinear el backend con el front, el agente debe inspeccionar:

- **Llamadas HTTP** (fetch/axios/services): rutas, métodos, payloads, headers.
- **Modelos/tipos/interfaces** del front: campos, tipos, nulabilidad, relaciones.
- **Formularios y validaciones**: campos obligatorios, formatos, reglas visibles.
- **Estados de UI** (loading, error, vacío): qué códigos y formas de error espera manejar.
- **Rutas y pantallas**: qué entidades y operaciones respaldan cada pantalla.

### 3.4. Convención de referencia

Al proponer o crear un endpoint, el agente debe indicar en su respuesta **qué archivo del frontend lo consume** (ruta relativa dentro de `C:\Users\david\OneDrive\Documentos\TEST`), para dejar trazable la correspondencia front ↔ back.

## 4. Principios de respuesta

1. **Ir al grano.** Empezar por la respuesta o el resultado; el contexto y las explicaciones van después, y solo si aportan.
2. **Sin preámbulos ni cortesías.** No usar frases como "Claro, con gusto te ayudo", "Excelente pregunta", "Por supuesto", "Como mencioné anteriormente".
3. **Sin resúmenes redundantes.** No repetir en texto lo que ya se muestra en el código o en una tabla.
4. **Sin explicar lo obvio.** No describir línea por línea lo que el código hace si es autoexplicativo.
5. **Una idea por párrafo.** Párrafos cortos (1–3 líneas). Listas cuando haya más de dos ítems.
6. **Código completo y listo para usar**, sin fragmentos incompletos que obliguen a pedir "el resto".
7. **Trazabilidad front ↔ back.** Al proponer endpoints o modelos, indicar qué archivo del frontend los consume.

## 5. Decisiones confirmadas por el responsable

Estas decisiones prevalecen sobre cualquier supuesto anterior:

1. **Base de datos relacional:** PostgreSQL. Se descarta Excel como almacenamiento; el Excel solo describe el negocio.
2. **API REST:** los recursos se exponen bajo `/api` con JSON.
3. **Autenticación y autorización reales:** login con email/contraseña, JWT Bearer y hash con `bcryptjs`. Roles `JEFE` y `ANALISTA`. El mock `SesionService` del front se reemplazará por esta autenticación.
4. **Sin pruebas unitarias por ahora:** no crear ni proponer `npm test`, Vitest, Jest ni archivos de test. No gastar tokens en esa tarea.
5. **Datos iniciales con Prisma seed:** `prisma/seed.js` carga el equipo de `context-general.md` §6 y debe ser idempotente (`upsert`).
6. **Alcance actual:** solo la arquitectura base y autenticación. Los dominios de negocio se implementan después, uno por uno, siguiendo `architecture.md` §6.

Si una tarea choca con estas decisiones, detenerse y preguntar antes de escribir código.