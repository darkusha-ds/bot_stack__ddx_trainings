# Базовый образ Node.js на основе Debian
FROM node:20-slim

# Устанавливаем рабочую директорию
WORKDIR /usr/src/app

# Копируем package.json и устанавливаем зависимости
COPY bot/package*.json ./
RUN npm install

# Копируем приложение
COPY bot/ .

# Копируем .env внутрь контейнера
# COPY node_app/.env /usr/src/app/utils/.env
# RUN rm /usr/src/app/server.log

# Запуск
CMD ["npm", "run", "start"]
