#!/bin/bash

assetdir="MMEAndroid/app/src/main/assets"

rm -r "$assetdir"/www
cp -r ../www "$assetdir"
