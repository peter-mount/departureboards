FROM area51/node:latest
MAINTAINER Peter Mount <peter@retep.org>

ADD package.json /tmp/package.json
RUN cd /tmp &&\
    npm install
RUN mkdir -p /opt/app &&\
    cp -a /tmp/node_modules /opt/app/ &&\
    rm -rvf /tmp/*

WORKDIR /opt/app
ADD site /opt/app

EXPOSE 80

CMD ["node", "server.js"]
