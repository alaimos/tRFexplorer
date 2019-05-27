#!/usr/bin/env bash

CURR_DIR=$(pwd)

if [[ ! -d src/ ]]; then
    echo >&2 "Source directory not found. Aborting!";
    exit 1;
fi

command -v php >/dev/null 2>&1 || { echo >&2 "PHP environment not found. Aborting!"; exit 1; }
command -v composer >/dev/null 2>&1 || { echo >&2 "PHP Composer not found. Aborting!"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo >&2 "NodeJS environment not found. Aborting!"; exit 1; }
command -v samtools >/dev/null 2>&1 || { echo >&2 "SamTools not found. Aborting!"; exit 1; }

cd src/

if [[ ! -f .env ]]; then
    echo "Installing PHP dependencies"
    cp .env.prod .env
    composer install
    php artisan key:generate
    composer update
    php artisan storage:link
fi

if [[ ! -d node_modules ]]; then
    echo "Installing NodeJS dependencies"
    npm install
    npm run production
fi;

echo "Downloading tRF resources"
curl -o data.tar.bz2 https://alpha.dmi.unict.it/~alaimos/trf.data.tar.bz2
mkdir -p resources/data/
echo "Extracting data directory"
tar -jxf data.tar.bz2 -C resources/data/
rm data.tar.bz2
echo "Parsing data"
php artisan data:parse

read -p "Do you wish to setup the genomic browser? (y/N) " -n 1 -r
echo    #
if [[ $REPLY =~ ^[Yy]$ ]]; then
    cd public/ext/jbrowse/
    if [[ -d data ]]; then
        rm -r data
    fi
    . setup.sh
fi

cd ${CURR_DIR}
