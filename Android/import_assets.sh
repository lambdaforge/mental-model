#!/bin/bash

files="index.html tool.js tool.css settings.js fabric-2.2.3.min.js jquery-1.9.1.js audio buttons images video"
assetdir="MMEAndroid/app/src/main/assets"

for f in $files;
do
    echo "Copying $f"
    cp -r ../"$f" "$assetdir"
done
