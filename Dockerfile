FROM node:4.1.2
COPY . /app
WORKDIR /app
RUN \
	rm -rf node_modules; \
	npm install
EXPOSE 3000
CMD npm start