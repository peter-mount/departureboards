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

# The type of build, default is development which is faster & has all
# warnings generated by react.
#
# To build a production ready application use --build-arg environment=production
ARG environment=development

# ======================================================================
# The base builder image comprising babel, webpack and all required
# dependencies from npm
FROM area51/babel:react-latest as dependencies

WORKDIR /opt/build
ADD package.json package.json
RUN usenpmrepository https://nexus.area51.onl/repository/npm/
RUN npm install

# Link to webpack
RUN npm link webpack

# Override babel & eslint with our react based config
ADD .babelrc /usr/local/babel/.babelrc
ADD .eslintrc /usr/local/babel/.eslintrc

# ======================================================================
# Import sources
FROM dependencies as sources
WORKDIR /opt/build
ADD src src

# ======================================================================
# Run eslint over sources
FROM sources as eslint
WORKDIR /opt/build
RUN eslint $(pwd)/src

# ======================================================================
# Run babel on sources
FROM sources as babel
WORKDIR /opt/build
RUN babel $(pwd)/src $(pwd)/build

# ======================================================================
# Run webpack on output
FROM babel as webpack
ARG environment

WORKDIR /opt/build

# Copy static content into the final distribution
ADD public dist

# The CSS
ADD css css
RUN cat css/*.css >>dist/main.css

# Finally run webpack
ADD webpack.config.js webpack.config.js
RUN environment=${environment} webpack --config webpack.config.js

# Now caching, rename main.js to main-{hash}.js
RUN MAIN="main-$(sha256sum dist/main.js | cut -c-16).js" &&\
    CSS="main-$(sha256sum dist/main.css | cut -c-16).css" &&\
    mv dist/main.js dist/$MAIN &&\
    mv dist/main.css dist/$CSS &&\
    sed \
      -e "s/main.js/$MAIN/g" \
      -e "s/main.css/$CSS/g" \
      -i dist/index.html

# ======================================================================
# Apache HTTPD based image to run the app locally
FROM httpd:2.4.29-alpine as httpd

# Send all 404's to the index document.
# This is required so we can use URL based routing within the app.
RUN echo "ErrorDocument 404 /index.html" >>/usr/local/apache2/conf/httpd.conf

# Copy the distribution unto htdocs
COPY --from=webpack /opt/build/dist /usr/local/apache2/htdocs/
