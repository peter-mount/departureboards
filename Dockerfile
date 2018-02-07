# ======================================================================
# Build departureboards.mobi
#
# The order of things within the build is important.
#
# Items that don't change much should be first so that we make use of
# the docker build cache.
#
# e.g. We run npm install early on so that we don't update every time
# a build runs, especially as this can be over 50Mb of downloads each time.
#
# The build is also broken down into three images:
# 1 builder based on the babel image contains the build tools and the dependencies
# 2 compiler handles the compilation of the application
# 3 the final image, contains httpd and the built application.
# ======================================================================

# The build architecture
ARG arch=amd64

# ======================================================================
# The base builder image comprising babel, webpack and all required
# dependencies from npm
FROM area51/${arch}-babel:latest as builder

# Add the missing react plugins to babel & eslint & install webpack
RUN cd /usr/local/babel/ &&\
    npm install \
      babel-preset-react \
      babel-preset-stage-0 \
      eslint-plugin-jsx-a11y \
      eslint-plugin-react &&\
    npm install -g webpack

# Now install our dependencies
WORKDIR /opt/build
ADD package.json package.json
RUN usenpmrepository https://npm.area51.onl/
RUN npm install

# Override babel & eslint with our react based config
ADD .babelrc /usr/local/babel/.babelrc
ADD .eslintrc /usr/local/babel/.eslintrc

# ======================================================================
FROM builder as compiler

WORKDIR /opt/build

# Copy static content into the final distribution
ADD public dist

# Now the sources then run eslint and babel against them
ADD src src
RUN eslint $(pwd)/src
RUN babel $(pwd)/src $(pwd)/build

# Finally run webpack
ADD webpack.config.js webpack.config.js
RUN webpack --config webpack.config.js

# Now caching, rename main.js to main-{hash}.js
RUN MAIN="main-$(sha256sum dist/main.js | cut -c-16).js" &&\
    CSS="main-$(sha256sum dist/mobile.css | cut -c-16).css" &&\
    mv dist/main.js dist/$MAIN &&\
    mv dist/main.css dist/$CSS &&\
    sed \
      -e "s/main.js/$MAIN/g" \
      -e "s/main.css/$CSS/g" \
      -i dist/index.html

# ======================================================================
# Apache HTTPD based image to run the app locally
FROM httpd

# Send all 404's to the index document.
# This is required so we can use URL based routing within the app.
RUN echo "ErrorDocument 404 /index.html" >>/usr/local/apache2/conf/httpd.conf

# Copy the distribution unto htdocs
COPY --from=compiler /opt/build/dist /usr/local/apache2/htdocs/
