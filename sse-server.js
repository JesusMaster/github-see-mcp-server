"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSseServer = createSseServer;
var express_1 = require("express");
var http_1 = require("http");
var streamableHttp_js_1 = require("@modelcontextprotocol/sdk/server/streamableHttp.js");
var sse_js_1 = require("@modelcontextprotocol/sdk/server/sse.js");
var crypto_1 = require("crypto");
var sseTransports = {};
function createSseServer(mcpServer, port) {
    var _this = this;
    if (port === void 0) { port = 8080; }
    var app = (0, express_1.default)();
    app.use(express_1.default.json({ limit: '100mb' }));
    // --- Configuración para StreamableHTTPServerTransport ---
    var streamableTransportOptions = {
        sessionIdGenerator: function () { return (0, crypto_1.randomUUID)(); },
        // Opcional: callback para cuando se inicializa una sesión
        onsessioninitialized: function (sessionId) {
            console.log("Streamable HTTP session initialized: ".concat(sessionId));
        },
    };
    var mcpStreamableTransport = new streamableHttp_js_1.StreamableHTTPServerTransport(streamableTransportOptions);
    // Conectamos el McpServer al transporte Streamable una vez.
    // Esto permite al McpServer enviar mensajes a través de este transporte.
    mcpServer.connect(mcpStreamableTransport).catch(function (error) {
        console.error("Failed to connect McpServer to StreamableHTTPServerTransport:", error);
    });
    // Endpoint moderno para Streamable HTTP
    app.all('/mcp', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("New Streamable HTTP request: ".concat(req.method, " ").concat(req.url));
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // req.body es parseado por express.json() si el Content-Type es application/json.
                    return [4 /*yield*/, mcpStreamableTransport.handleRequest(req, res, req.body)];
                case 2:
                    // req.body es parseado por express.json() si el Content-Type es application/json.
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("Error handling Streamable HTTP request for ".concat(req.url, ":"), error_1);
                    if (!res.writableEnded) {
                        res.status(500).send('Error processing Streamable HTTP request');
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // --- Configuración para SSEServerTransport (legado) ---
    // Endpoint SSE legado para clientes antiguos (establecer conexión)
    app.get('/sse', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var transport, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('New SSE connection request');
                    transport = new sse_js_1.SSEServerTransport('/messages', res);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    // Para SSE, conectamos el McpServer a cada transporte individual cuando se establece.
                    return [4 /*yield*/, mcpServer.connect(transport)];
                case 2:
                    // Para SSE, conectamos el McpServer a cada transporte individual cuando se establece.
                    _a.sent();
                    sseTransports[transport.sessionId] = transport;
                    console.log("SSE connection established: ".concat(transport.sessionId));
                    return [3 /*break*/, 4];
                case 3:
                    error_2 = _a.sent();
                    console.error("Error connecting MCP Server for SSE: ".concat(error_2));
                    if (!res.writableEnded) {
                        // Para SSE con http nativo, res.writeHead().end() es común.
                        // Con Express, podemos usar res.status().end() o res.status().send().
                        res.status(500).send('MCP Server connection error for SSE');
                    }
                    return [2 /*return*/]; // Importante retornar aquí para no ejecutar código posterior en error.
                case 4:
                    req.on('close', function () {
                        console.log("SSE connection closed: ".concat(transport.sessionId));
                        delete sseTransports[transport.sessionId];
                    });
                    return [2 /*return*/];
            }
        });
    }); });
    // Endpoint de mensajes legado para clientes antiguos (enviar mensajes al servidor vía SSE)
    app.post('/messages', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
        var sessionId, transport, bodyContent, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sessionId = req.query.sessionId;
                    if (!sessionId) {
                        console.error('POST /messages error: Missing sessionId parameter');
                        res.status(400).send('Missing sessionId parameter');
                        return [2 /*return*/];
                    }
                    transport = sseTransports[sessionId];
                    if (!transport) {
                        console.error("POST /messages error: Session not found for ID ".concat(sessionId));
                        res.status(404).send('Session not found');
                        return [2 /*return*/];
                    }
                    if (typeof req.body === 'string') {
                        bodyContent = req.body;
                    }
                    else if (Buffer.isBuffer(req.body)) {
                        bodyContent = req.body.toString('utf-8');
                    }
                    else if (typeof req.body === 'object' && req.body !== null) {
                        // express.json() ya parseó el cuerpo si era JSON.
                        // SSEServerTransport.handlePostMessage espera el cuerpo como string.
                        bodyContent = JSON.stringify(req.body);
                    }
                    else {
                        console.warn("POST /messages for session ".concat(sessionId, ": req.body is not a string, buffer, or parsable object. Type: ").concat(typeof req.body));
                        bodyContent = '';
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, transport.handlePostMessage(req, res, bodyContent)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error("Error in transport.handlePostMessage for session ".concat(sessionId, ":"), error_3);
                    if (!res.writableEnded) {
                        res.status(500).send('Internal server error handling SSE message');
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Middleware para manejar rutas no encontradas (404)
    app.use(function (req, res) {
        console.log("Unhandled request: ".concat(req.method, " ").concat(req.url));
        res.status(404).send('Not found');
    });
    var httpServer = http_1.default.createServer(app);
    httpServer.listen(port, function () {
        console.log("MCP Server (Express with SSE & Streamable HTTP) listening on port ".concat(port));
    });
    httpServer.on('error', function (error) {
        console.error('HTTP Server error:', error);
    });
    return httpServer;
}
