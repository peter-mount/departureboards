# Build departureboards.mobi

# The build architecture
ARG ARCHITECTURE=amd64

# The script to run
ARG SCRIPT=build

FROM area51/${ARCHITECTURE}-node:latest
ARG SCRIPT

WORKDIR /opt/build

# Copy package.json first so we run npm install from cache
# as much as possible
ADD package.json .
RUN npm install

ADD public/ public/
ADD src/ src/

RUN npm run ${SCRIPT}
