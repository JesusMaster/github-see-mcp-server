# Changelog

All notable changes to the GitHub See MCP Server project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- Corrección en la validación y transformación de payloads antes de enviar requiciones a la API de GitHub.- Mejora en la detección y codificación de contenidos Base64.- Optimización en el maneo de parámetros opcionales en las peticiones.

### Added
- Implementación del controlador de repositorios con todas las funcionalidades requeredas.

## [1.1.0] - 2025-05-09

### Added

- P{p©T\]Y\ÝX[YÙ[Y[[Ý[ۘ[]HÚ]]ÈÛ۝Û\HÛÛ\]HTH܈[\XÝ[ÈÚ]Ú]X[\]Y\ÝH[Ù[\ڙXÝÝXÝ\HÚ][\ݙYÛÙHܙØ[^][ۂH][X\Ù\È[ØÛۙY˚Ûۈ܈]\[\ܝÈÈÈÚ[ÙYHYXÝܙYÛÛÈYÚ\Ý][ۈ[ÈYXØ]Y[\H[ݙYÚ]XTH[Yܘ][ۈÙÚXÈÈÙ\\]H[Ù[\H[\ݙY[\ܝÈ\Ú[È][X\Ù\ÈÈÌKHHKL
KLBÈÈÈYYH[]X[[X\ÙHوÚ]XÙYHPÔÙ\\HX[][YHÙXÛÚÈØÙ\ÜÚ[È܈Ú]X][HRH[Ù[ÛÛ[][XØ][ۈXH[Ù[Û۝^ÝØÛÛ
PÔ
BHÝ\ܝ܈][\H[Ù[ÛۛXÝ[ۜHÛ۝^X[YÙ[Y[Þ\Ý[H܈[[È\ÜÚ]ܞH]BH][Y][\Ú]XÝ\H܈ØÙ\ÜÚ[È\ÜÚ]ܞHXÝ[ۜHÝ\ÝÛHÛۙYÝ\][ۈ܈\ÜÚ]ܞK]Ë[[Ù[X\[ËHÙXÝ\H]][XØ][ۈÚ]Ú]XÐ]]HØÚÙ\\Þ[Y[Ý\ܝHÛÛ\Z[Ú]HÙÙÚ[È[[ۚ]ܚ[ÈØ\X[]Y\HTÕTH܈X[YÚ[È\ÜÚ]ܚY\Ë[Ù[Ë[Û۝^HX[ÚXÚÈ[Ú[܈[ۚ]ܚ[ÈÙ\\,´atus

### Security

- Implemented secure token validation for GitHub webhooks
- Added API key authentication for model connections
- Secured environment variables for sensitive configuration
- Rate limiting for public API endpoints
- Input validation for all API endpoints

## [0.9.0] - 2025-04-15

### Added
- Beta release for internal testing
- Core MCP integration functionality
- Basic GitHub webhook support
- Simple configuration system
- MongoDB integration for data persistence
- Docker container support
- Preliminary documentation
£## Fixed

- Resolved connection handling issues with certain model types
- Fixed webhook payload parsing for large events
- Improved error handling and logging
  
