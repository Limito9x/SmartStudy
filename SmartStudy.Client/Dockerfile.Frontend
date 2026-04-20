FROM node:22-alpine AS build-stage

WORKDIR /app

# Cài dependencies trước
COPY package*.json ./

RUN npm install

# Mount code từ host vào container
COPY . .

EXPOSE 5173

CMD [ "npm", "run" ,"dev" ,"--" , "--host"]