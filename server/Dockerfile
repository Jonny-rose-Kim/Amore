FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY *.js ./
COPY data.json ./
COPY routes/ ./routes/
COPY services/*.js ./services/
ENV PORT=8080 NODE_ENV=production \
    LLM_SERVER_GPU0=http://161.122.23.23:5001 \
    LLM_SERVER_GPU1=http://161.122.23.23:5002 \
    LLM_SERVER_GPU2=http://161.122.23.23:5003 \
    LLM_SERVER_GPU3=http://161.122.23.23:5004
EXPOSE 8080
CMD ["node", "index.js"]
