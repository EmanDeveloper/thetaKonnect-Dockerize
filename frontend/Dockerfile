From node:18.9.1

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

# copy all the files from the current directory to the working directory in the container
COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]

