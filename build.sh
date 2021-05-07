#!/bin/sh

set -e

cd alias
git pull
cd ..

yarn add qqwry.raw.ipdb

rm -r data/

yarn build