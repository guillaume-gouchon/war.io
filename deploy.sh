#!/bin/bash
cd ~/warnode;
git checkout . prod;
git pull;
cd ~;

# # Minify, compress, build sprites
cd ~/warnode/public;
bash build.sh;

# Update prod version
cd ~/warnode/public;
# update CSS
sed -i -e "/<link href=\"css\\/bootstrap.min.css\" rel=\"stylesheet\" media=\"screen\">/d" index.html;
sed -i -e "/<link href=\"css\\/gui.css\" rel=\"stylesheet\">/d" index.html;
sed -i "s/style.css/style.min.css/g" index.html;
# update JS
sed -i "/js\\/game\\/engine\\//d" index.html;
sed -i "/js\\/game\\/data\\//d" index.html;
sed -i "/js\\/game\\/client\\//d" index.html;
sed -i "s/<!-- GAME//g" index.html;
sed -i "s/<\\/script>-->/<\\/script>/g" index.html;

# Restart server
cd ~/warnode;
forever stop app.js;
forever -a -l node.log -o node.log -e node.log start app.js;
