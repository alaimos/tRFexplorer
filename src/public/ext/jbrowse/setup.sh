#!/bin/bash

JBROWSE_BUILD_MIN=${JBROWSE_BUILD_MIN:=1}
# check the exit status of the command, and print the last bit of the log if it fails
done_message () {
    if [ $? == 0 ]; then
        log_echo " done."
        if [ "x$1" != "x" ]; then
            echo $1;
        fi
    else
        echo " failed.  See setup.log file for error messages." $2;
        if [[ "x$3" != "x" ]]; then
            echo "setup cannot continue, aborting.";
            tail -200 setup.log;
            exit 1;
        fi
    fi
}

# echoes both to the console, and to setup.log
# adds extra carriage returns in setup.log for readability.
log_echo () {
    echo $@
    echo >> setup.log
    echo $@ >> setup.log
    echo >> setup.log
}

check_node () {
    set +e
    node_executable=$(which node)
    npm_executable=$(which npm)
    if ! [ -x "$node_executable" ] ; then
        nodejs_executable=$(which nodejs)
        if ! [ -x "$nodejs_executable" ] ; then
            echo "No 'node' executable found. JBrowse expects node version 6 or later. Please install an updated version of node.js by following the instructions appropriate for your system https://nodejs.org/en/download/package-manager/";
            exit 1
        else
            echo "Creating an alias 'node' for 'nodejs'"
            node_executable="$nodejs_executable"
        fi
    fi
    set -e
    if ! [ -x "$npm_executable" ] ; then
        echo "No 'npm' executable found. JBrowse expects npm version 3 or later. Please install an updated version of node.js by following the instructions appropriate for your system https://nodejs.org/en/download/package-manager/";
        exit 1
    fi
    NODE_VERSION=`$node_executable -v`
    NODE_MAJOR_VERSION=`$node_executable -v | cut -dv -f2 | cut -d. -f1`
    NODE_MINOR_VERSION=`$node_executable -v | cut -d. -f1`
    NPM_VERSION=`$npm_executable -v`
    NPM_MAJOR_VERSION=`$npm_executable -v | cut -d. -f1`
    if [[ $NODE_MAJOR_VERSION -lt 6 ]]; then
        echo "node $NODE_VERSION found, but node version 6 or later must be installed.  Please install an updated version of node.js by following the instructions appropriate for your system https://nodejs.org/en/download/package-manager/";
        exit 1
    fi
    if [[ $NPM_MAJOR_VERSION -lt 3 ]]; then
        echo "npm $NPM_VERSION found, but npm version 3 or later must be installed.  Please install an updated version of node.js by following the instructions appropriate for your system https://nodejs.org/en/download/package-manager/";
        exit 1
    fi
    echo "Node $NODE_VERSION installed at $node_executable with npm $NPM_VERSION";
}

# we are starting a new setup. clear the log file
rm -f setup.log

# log information about this system
log_echo -n "Gathering system information ..."
(
    echo '============== System information ====';
    set -x;
    lsb_release -a;
    uname -a;
    sw_vers;
    grep MemTotal /proc/meminfo;
    echo; echo;
) >>setup.log 2>&1;
done_message "" ""

# check Mac OS version
SUPPRESS_BIODB_TO_JSON=0

sw_vers >& /dev/null;
if [ $? -eq 0 ]; then
    product_version=`sw_vers -productVersion`;
    have_db=`perl -MConfig=myconfig -e 'print myconfig' | grep -- -ldb`
    if [[ $product_version =~ ^10.13 && x$have_db = 'x' ]]; then
        SUPPRESS_BIODB_TO_JSON=1;
        log_echo;
        log_echo ===============================================================
        log_echo "** MacOS High Sierra with broken system Perl detected. **";
        log_echo "biodb-to-json.pl does not work on MacOS High Sierra with the stock system Perl.";
        log_echo "The setup will not run biodb-to-json.pl for its sample data: Volvox and Yeast.";
        log_echo "To re-enable formatting on your High Sierra machine, install a Perl with a working BerkeleyDB."
        log_echo;
        log_echo "If you use Homebrew, an easy way to install a working Perl would be:"
        log_echo;
        log_echo "    brew install berkeley-db; brew install --build-from-source perl"
        log_echo;
        log_echo "Then delete the external perl libraries and run setup.sh again:"
        log_echo;
        log_echo "    rm -rf extlibs/; ./setup.sh"
        log_echo;
        log_echo ===============================================================
        log_echo;
    fi
fi

# if we are running in a development build, then run npm install and run the webpack build.
if [ -f "src/JBrowse/Browser.js" ]; then
    log_echo -n "Installing node.js dependencies and building with webpack ..."
    (
        set -e
        check_node
        [[ -f node_modules/.bin/yarn ]] || npm install yarn
        node_modules/.bin/yarn install
        JBROWSE_BUILD_MIN=$JBROWSE_BUILD_MIN node_modules/.bin/yarn build
    ) >>setup.log 2>&1;
    done_message "" "" "FAILURE NOT ALLOWED"
else
    log_echo "Minimal release, skipping node and Webpack build"
fi

log_echo  -n "Installing Perl prerequisites ..."
if ! ( perl -MExtUtils::MakeMaker -e 1 >/dev/null 2>&1); then
    log_echo;
    log_echo "WARNING: Your Perl installation does not seem to include a complete set of core modules.  Attempting to cope with this, but if installation fails please make sure that at least ExtUtils::MakeMaker is installed.  For most users, the best way to do this is to use your system's package manager: apt, yum, fink, homebrew, or similar.";
fi;
( set -x;
  bin/cpanm -v --notest -l extlib/ Bio::Perl@1.7.2 < /dev/null;
  bin/cpanm -v --notest -l extlib/ Bio::Perl@1.7.2 < /dev/null;
  set -e
  bin/cpanm -v --notest -l extlib/ Bio::Perl@1.7.2 < /dev/null;
  set -x;
  bin/cpanm -v --notest -l extlib/ --installdeps . < /dev/null;
  bin/cpanm -v --notest -l extlib/ --installdeps . < /dev/null;
  set -e;
  bin/cpanm -v --notest -l extlib/ --installdeps . < /dev/null;
) >>setup.log 2>&1;
done_message "" "As a first troubleshooting step, make sure development libraries and header files for GD, Zlib, and libpng are installed and try again.";

download_and_extract () {
  local OLDP=$(pwd)
  mkdir hg19
  cd hg19
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr1.fa.gz > chr1.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr2.fa.gz > chr2.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr3.fa.gz > chr3.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr4.fa.gz > chr4.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr5.fa.gz > chr5.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr6.fa.gz > chr6.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr7.fa.gz > chr7.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr8.fa.gz > chr8.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr9.fa.gz > chr9.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr10.fa.gz > chr10.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr11.fa.gz > chr11.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr12.fa.gz > chr12.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr13.fa.gz > chr13.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr14.fa.gz > chr14.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr15.fa.gz > chr15.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr16.fa.gz > chr16.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr17.fa.gz > chr17.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr18.fa.gz > chr18.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr19.fa.gz > chr19.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr20.fa.gz > chr20.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr21.fa.gz > chr21.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chr22.fa.gz > chr22.fa.gz
  curl -L http://hgdownload.soe.ucsc.edu/goldenPath/hg19/chromosomes/chrX.fa.gz > chrX.fa.gz
  gunzip *.gz
  cat chr1.fa chr2.fa chr3.fa chr4.fa chr5.fa chr6.fa chr7.fa chr8.fa chr9.fa chr10.fa chr11.fa chr12.fa chr13.fa  \
      chr14.fa chr15.fa chr16.fa chr17.fa chr18.fa chr19.fa chr20.fa chr21.fa chr22.fa chrX.fa > $OLDP/hg19.fa
  cd $OLDP
  rm -r hg19
}

echo "Installing HG19 genome ..."
(
  OLD_PATH=$(pwd)
  mkdir tmp
  cd tmp
  download_and_extract
  samtools faidx hg19.fa
  ../bin/prepare-refseqs.pl --indexed_fasta hg19.fa --key "Reference sequence" --compress --seqType dna
  CNF="{
  \"menuTemplate\" : [
    {
      \"label\" : \"Search in GtRNAdb\",
      \"title\" : \"Search in GtRNAdb\",
      \"iconClass\" : \"dijitIconDatabase\",
      \"action\": \"iframeDialog\",
      \"url\" : \"http://gtrnadb.ucsc.edu/Hsapi19/genes/{id}.html\"
    },
    {
      \"label\" : \"Search in Genome Browser\",
      \"title\" : \"Search in Genome Browser\",
      \"iconClass\" : \"dijitIconDatabase\",
      \"action\": \"iframeDialog\",
      \"url\" : \"http://genome.ucsc.edu/cgi-bin/hgc?g=tRNAs&i={id}\"
    },
    {
      \"label\" : \"Search in GeneCards\",
      \"title\" : \"Search in GeneCards\",
      \"iconClass\" : \"dijitIconDatabase\",
      \"action\": \"iframeDialog\",
      \"url\" : \"https://www.genecards.org/Search/Keyword?queryString={id}\"
    }
  ]
}";
  ../bin/flatfile-to-json.pl --gff ../conf.template/tRNAs.gff --key "tRNA Genes" --trackLabel tRNAGenes --compress --config "$CNF"
  ../bin/flatfile-to-json.pl --gff ../conf.template/tRNA.fragments.hg19.short.gff --key "tRNA Fragments" --trackLabel tRNAFragments --compress --urltemplate "/fragments/{geneID}"
  mv data/ ../
  cd $OLD_PATH
  rm -r tmp
  bin/generate-names.pl --compress
);
done_message "" "";
#>>setup.log 2>&1;
