FROM node:18.10 AS builder
RUN echo "----------------- Node building -----------------"

WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build
RUN chmod +x version.sh && ./version.sh


FROM nginx:1.23-alpine
RUN echo "----------------- Nginx building -----------------"

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/dist .
COPY --from=builder /app/gitversion .

#RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories
RUN apk update \
  && apk add bash \
  && apk add tzdata \
  && apk add curl

CMD ["nginx", "-g", "daemon off;"]
