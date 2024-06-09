FROM node:14-alpine AS builder

# Set metadata labels
LABEL version="1.0" \
      description="Frontend service for CareerTracker application"

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm set progress=true

RUN sh -c 'npm ci'

COPY . .

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
