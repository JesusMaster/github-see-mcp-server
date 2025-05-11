# GitHub See MCP Server

A server-side implementation for the GitHub See MCP (Model Context Protocol) project. This server handles the context processing and management between GitHub repositories and model interactions, enabling seamless integration of AI capabilities with your codebase.

## ✨ Features

- Real-time webhook processing for GitHub events
- AI model communication via Model Context Protocol (MCP)
- Event-driven architecture for handling repository actions
- Custom configuration for repository-to-model mapping
- Secure authentication with GitHub OAuth
- Detailed logging and monitoring capabilities

## 🛠️ Prerequisites

- Node.js (v16.x or higher)
- Valid GitHub OAuth application credentials
- Compatible AI model endpoints

## ⚙️ Installation

### Using Docker (Recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/JesusMaster/github-see-mcp-server.git
   cd github-see-mcp-server
   ```

2. Build the Docker image:
   ```bash
   docker build -t github-see-mcp-server .
   ```

## 🚀 Ejecution

To run the Docker container, use the following command:

```bash
docker run -d -p 3200:3200 -e GITHUB_TOKEN={YOUR_TOKEN_HERE} -e MCP_SSE_PORT=3200 --name github-see-mcp-server github-see-mcp-server
```

**Note:** Replace `{YOUR_TOKEN_HERE}` with your actual GitHub Personal Access Token.

## 📝 Configuration

The server can be configured using:

1.  Environment variables
2.  Docker environment variables

## 🗂️ Project Structure

```
├── main.ts                # Main entry point of the application
├── sse-server.ts          # SSE server setup for real-time events
├── controllers/           # REST API route handlers
│   ├── github.ts          # Logic for GitHub integration (webhooks, etc.)
│   ├── issues.ts          # Operations related to GitHub Issues
│   ├── pullRequest.ts     # Operations related to GitHub Pull Requests
│   └── repositories.ts    # Operations for managing GitHub repositories
├── tools/                 # Utility functions for interacting with the GitHub API
│   ├── issues.ts          # Tools to simplify API calls for Issues
│   ├── pullRequest.ts     # Tools to simplify API calls for Pull Requests
│   └── repositories.ts    # Tools to simplify API calls for Repositories
├── Dockerfile             # Configuration for building the Docker image
├── package.json           # Project metadata and dependencies (npm)
├── pnpm-lock.yaml         # Exact versions of dependencies (pnpm)
├── tsconfig.json          # TypeScript compiler configuration
├── .gitignore             # Files and directories ignored by Git
├── CHANGELOG.md           # Project change history
└── README.md              # Main project documentation
```

## 🤝 Contributing

1.  Fork the repository
2.  Create your feature branch (git checkout -b feature/amazing-feature)
3.  Commit your changes (git commit -m 'Add some amazing feature')
4.  Push to the branch (git push origin feature/amazing-feature)
5.  Open a Pull Request

## 📜 License

This project is licensed under the MIT License.

## 📞 Contact

Project Owner: JesusMaster

GitHub: [@JesusMaster](https://github.com/JesusMaster)

## 🙏 Acknowledgements

- [Model Context Protocol](https://example.com/mcp)
- [GitHub Webhooks API](https://docs.github.com/en/developers/webhooks-and-events/about-webhooks)
- [Node.js](https://nodejs.org/)
- All the amazing contributors who have helped shape this project

## 🇪🇸 GitHub See MCP Server

Implementación del lado del servidor para el proyecto GitHub See MCP (Protocolo de Contexto del Modelo). Este servidor gestiona el procesamiento y la gestión del contexto entre los repositorios de GitHub y las interacciones del modelo, lo que permite una integración perfecta de las capacidades de la IA con su base de código.

## ✨ Características

- Procesamiento de webhooks en tiempo real para eventos de GitHub
- Comunicación del modelo de IA a través del Protocolo de contexto del modelo (MCP)
- Arquitectura basada en eventos para gestionar las acciones del repositorio
- Configuración personalizada para la asignación de repositorio a modelo
- Autenticación segura con GitHub OAuth
- Capacidades detalladas de registro y supervisión

## 🛠️ Requisitos previos

- Node.js (v16.x o superior)
- Credenciales válidas de la aplicación GitHub OAuth
- Puntos finales de modelos de IA compatibles

## ⚙️ Instalación

### Usando Docker (Recomendado)

1.  Clona el repositorio:

    ```bash
    git clone https://github.com/JesusMaster/github-see-mcp-server.git
    cd github-see-mcp-server
    ```
2.  Crea la imagen de Docker:

    ```bash
    docker build -t github-see-mcp-server .
    ```

## 🚀 Ejecución

Para ejecutar el contenedor Docker, utiliza el siguiente comando:

```bash
docker run -d -p 3200:3200 -e GITHUB_TOKEN={YOUR_TOKEN_HERE} -e MCP_SSE_PORT=3200 --name github-see-mcp-server github-see-mcp-server
```

**Nota:** Reemplaza `{YOUR_TOKEN_HERE}` con tu token de acceso personal de GitHub.

## 📝 Configuración

El servidor se puede configurar utilizando:

1.  Variables de entorno
2.  Variables de entorno de Docker

## 🗂️ Estructura del Proyecto

```
├── main.ts                # Punto de entrada principal de la aplicación
├── sse-server.ts          # Configuración del servidor SSE para eventos en tiempo real
├── controllers/           # Manejadores de las rutas de la API REST
│   ├── github.ts          # Lógica para la integración con GitHub (webhooks, etc.)
│   ├── issues.ts          # Operaciones relacionadas con las Issues de GitHub
│   ├── pullRequest.ts     # Operaciones relacionadas con los Pull Requests de GitHub
│   └── repositories.ts    # Operaciones para gestionar repositorios de GitHub
├── tools/                 # Funciones de utilidad para interactuar con la API de GitHub
│   ├── issues.ts          # Herramientas para simplificar las llamadas a la API de Issues
│   ├── pullRequest.ts     # Herramientas para simplificar las llamadas a la API de Pull Requests
│   └── repositories.ts    # Herramientas para simplificar las llamadas a la API de Repositorios
├── Dockerfile             # Configuración para la creación de la imagen de Docker
├── package.json           # Metadatos del proyecto y dependencias (npm)
├── pnpm-lock.yaml         # Versiones exactas de las dependencias (pnpm)
├── tsconfig.json          # Configuración del compilador de TypeScript
├── .gitignore             # Archivos y directorios ignorados por Git
├── CHANGELOG.md           # Historial de cambios del proyecto
└── README.md              # Documentación principal del proyecto
```

## 🤝 Contribución

1.  Haz un fork del repositorio
2.  Crea tu rama de funcionalidades (git checkout -b feature/increible-funcionalidad)
3.  Commitea tus cambios (git commit -m 'Añade una increible funcionalidad')
4.  Sube los cambios a la rama (git push origin feature/increible-funcionalidad)
5.  Abre un Pull Request

## 📜 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## 📞 Contacto

Dueño del Proyecto: JesusMaster

GitHub: [@JesusMaster](https://github.com/JesusMaster)

## 🙏 Agradecimientos

- [Protocolo de Contexto del Modelo](https://example.com/mcp)
- [API de Webhooks de GitHub](https://docs.github.com/en/developers/webhooks-and-events/about-webhooks)
- [Node.js](https://nodejs.org/)
- A todos los increíbles contribuyentes que han ayudado a dar forma a este proyecto