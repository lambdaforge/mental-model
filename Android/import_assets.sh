#!/bin/bash

assetdir="MMEAndroid/app/src/main/assets"

rm -r "$assetdir"/www
cp -r ../www "$assetdir"
cp ../resources/manual.pdf "$assetdir"/manual.pdf
