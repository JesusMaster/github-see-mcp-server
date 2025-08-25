# ---- Build Stage ----
    FROM node:latest AS builder

    WORKDIR /app
    
    # Install pnpm globally
    RUN npm install -g pnpm
    
    # Copy package definition and lock file
    COPY package.json pnpm-lock.yaml ./
    
    # Install ALL dependencies (including devDependencies)
    RUN pnpm install
    
    # Copy the rest of the application source code
    COPY . ./
    
    # Build the TypeScript code
    RUN pnpm run build
    
    # Prune dev dependencies after build (optional but good practice for copying node_modules later if needed)
    # RUN pnpm prune --prod
    # Note: We will reinstall prod deps cleanly in the final stage instead of copying node_modules
    
    # ---- Production Stage ----
    FROM node:latest
    
    WORKDIR /app
    
    # Install pnpm globally (needed again in this stage if using pnpm commands)
    RUN npm install -g pnpm
    
    # Copy package definition and lock file from the builder stage
    COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
    
    # Install ONLY production dependencies
    RUN pnpm install --prod
    
    # Copy the built application code from the builder stage
    COPY --from=builder /app/dist ./dist
    

    ARG MCP_SSE_PORT=3200
    ARG MCP_TIMEOUT=60000
    # Expose the port the app runs on
    EXPOSE ${MCP_SSE_PORT}
    
    # Define the command to run your app using Node.js
    CMD ["node", "dist/main.js"]
    