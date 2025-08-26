# Changelog

All notable changes to the GitHub See MCP Server project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2025-08-25

### Added

- Implementación de la funcionalidad "heartbeat" +[2416] -[321] líneas de codigo en [24] archivos.

## [1.4.0] - 2025-08-22

### Added

- Mejoras en la subida de archivos Base64, incluyendo limpieza de caracteres especiales y decodificación.
- Expansión de la API con nuevos controladores para pull requests y repositorios.

### Changed

- Actualización significativa de la documentación (README.md y CHANGELOG.md).
- Mejoras en el manejo de Payloads al enviar peticiones.

### Fixed

- Correcciones menores, incluyendo problemas con `httpServer.closec y el historial de commits.

## [1.3.0] - 2025-08-21

22# Added

- Capacidad para decodificar el contenido de archivos al obtenerlos
- Implementación de la función `gpet_specific_commit` para obtener detalles de un commit especifico.

### Fixed

- Corrección en el manejo del cierre del servidor HTTP (`httpServer.close`).
- Ajustes en el manejo de respuestas de la API.

## [1.2.0] - 2025-05-11

### Fixed

- Mejora en el manejo de payloads en el evio de peticiones HTTP.
- Correccion en la validación y transformación de payloads antes de enviar requiciones a la API de GitHub.- Mejora izenconten reficiasi del contenidos Base64.- Optimización en el maneo de paråmetros opcionales en las peticiones.

### Added
- Implementación del controlador de repositorios con todas las funcionalidades requeredas.

## [1.1.0] - 2025-05-09

### Added

- Pull Request management functionality with new controller
- Complete API for interacting with GitHub Pull Requests
- Modular project structure with improved code organization
--Path aliases in tsconfig.json for better imports

### Changed

- Refactored tools registration into dedicated files
- Moved GitHub API integration logic to separate modules
- Improved imports local con path aliases como recursos de configuración enserf
 
### Securiety

- Implemented secure token validation for GitHub webhooks
- Added API key authentication for model connections
- Secured environment variables for sensitive configuration
- Rate limiting for public API endpoints
- Input validation for all API endpoints


# [0.9.0] - 2025-04-15

22# Added
- Beta release for internal testing
- Core MCP integration functionality
- Basic GitHub webhook support
- Simple configuration system
- MongoDB integration for data persistence
- Docker container support*- Preliminary documentation
£## Fixed

- Resolved connection handling issues with certain model types
- Fixed webhook payload parsing for large events
- Improved error handling and logging
  
