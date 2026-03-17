FROM node:20-alpine

WORKDIR /app

# Force à ne pas utiliser le cache
RUN npm cache clean --force

COPY package.json package-lock.json* ./

# Force npm install même s'il y a du cache
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]