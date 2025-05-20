FROM node:18

WORKDIR /my-project

COPY package*.json ./
RUN npm config set registry https://registry.npmjs.org/
RUN npm install
RUN npm install mysql

COPY . .

EXPOSE 3000

CMD ["node", "main.js"]