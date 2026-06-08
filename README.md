# Devos
El objetivo de este proyecto es construir una red social vertical para desarrolladores que unifique la interacción visual (estilo Instagram), la resolución de dudas técnicas (estilo StackOverflow) y el intercambio de recursos educativos (estilo Studocu).

Para el MVP, el núcleo de la aplicación será un Feed Unificado donde conviven tres tipos de publicaciones (Visual, Duda y Recurso), simplificando la arquitectura pero validando la propuesta de valor.

## Producto Mínimo Viable

1. **Autenticación**
	1. Inicio de sesión mediante Google, Github o local
	2. JWT con refreshing
	3. Perfil de usuario básico
2. **Publicaciones**
	1. Visual: URL de la imagen, código o setup, y una descripción
	2. Duda: título, descripción, bloque de código (opcional, formateado) y etiquetas (tags)
	3. Recurso: título descripción o un enlace externo
3. **Interacción**
	1. Likes
	2. Comentarios
	3. Respuestas: para hilos de dudas, que el autor pueda marcar una como correcta
4. **Motor de búsqueda y filtros**
	1. Filtrar el feed por tipo de publicación
		1. _All_
		2. _Visual_
		3. _Question_
		4. _Resources_
	2. Filtrado básico de etiquetas
5. **Seguridad** con sistemas de reportes tanto a publicaciones como usuarios
6. **Sistema de notificaciones y mensajería** con Redis (pensado para el futuro)

## Arquitéctura y Stack tecnológico
1. **Backend**: NestJs
2. **Base de datos**: Prisma con PostgreSQL y Redis con ioredis
3. **Autenticación**: JWT + OAuth 2.0
4. **Seguridad**: CORS + Helmet
5. **Frontend**: ...