FROM node:22-alpine

WORKDIR /home/node/app

RUN apk add ffmpeg

# Run as current user so file permissions work
USER 1000:1000

CMD npm run kids