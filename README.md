To build the final css, js files you need grunt installed:

Install nodejs & grunt:

curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install -g grunt

In this directory run:

npm install grunt-contrib-cssmin --save-dev
npm install grunt-contrib-uglify --save-dev
npm install grunt-contrib-htmlmin --save-dev
npm install grunt-contrib-concat --save-dev
npm install grunt-processhtml --save-dev
