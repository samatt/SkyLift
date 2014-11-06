# Build the web app, clear the old node-app, build the new node-app, open the node-app
echo "1/3 Build web-app distribution"
cd web-app
grunt build
echo "2/3 Clear build cache"
cd ../node-app
rm -rf build
echo "3/3 Build node-app distribution"
grunt nodewebkit
echo "Done. Opening nodewebkit app."
open build/skylift/osx/skylift.app

