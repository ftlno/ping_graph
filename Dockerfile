FROM node:4.1.2
COPY . /app
WORKDIR /app
RUN \
	rm -rf node_modules; \
	npm install; \
	rm pings.db
EXPOSE 5000
CMD npm start