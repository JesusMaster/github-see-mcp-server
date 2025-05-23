# Changelog

All notable changes to the GitHub See MCP Server project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.0] - 2025-05-11

### Fixed

- Mejora en el manejo de payloads en el evio de peticiones HTTP.
- Corrección en la validación y transformación de payloads antes de enviar requiciones a la API de GitHub.- Mejora en la detección y codificación de contenidos Base64.- Optimización en el maneo de parámetros opcionales en las peticiones.

### Added
- Implementación del controlador de repositorios con todas las funcionalidades requeredas.

## [1.1.0] - 2025-05-09

### Added

- Pull Request management functionality with new controller
- Complete API for interacting with GitHub Pull Requests
- Modular project structure with improved code organization
- Path aliases in tsconfig.json for better imports

### Changed

- Refactored tools registration into dedicated files
- Moved GitHub API integration logic to separate modules
- Improved imports using path aliases

## [1.0.0] - 2025-05-09

### Added

- Initial release of GitHub See MCP Server
- Real-time webhook processing for GitHub events
- AI model communication via Model Context Protocol (MCP)
- Support for multiple model connections
- Context management system for handling repository data
- Event-driven architecture for processing repository actions
- Custom configuration for repository-to-model mapping
- Secure authentication with GitHub OAuth
- Docker deployment support
- Comprehensive logging and monitoring capabilities
- REST API for managing repositories, models, and contexts
- Health check endpoint for monitoring server status

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

### Fixed

- Resolved connection handling issues with certain model types
- Fixed webhook payload parsing for large events
- Improved error handling and logging
