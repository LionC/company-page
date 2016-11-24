FROM gliderlabs/herokuish

ENV PORT 8080

WORKDIR /app

ADD . /app

RUN herokuish buildpack build

EXPOSE ${PORT}

CMD herokuish procfile start web
