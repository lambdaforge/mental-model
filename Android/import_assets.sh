#!/bin/bash

files="index.html tool.js tool.css settings.js mediaSources.js canvasStyle.js settingsScreen.js mappingScreen.js fabric-3.2.0.min.js jquery-1.12.4.min.js audio buttons images video"
assetdir="MMEAndroid/app/src/main/assets/www"

rm -r "$assetdir"
mkdir "$assetdir"


for f in $files;
do
    echo "Copying $f"
    cp -r ../"$f" "$assetdir"
done
