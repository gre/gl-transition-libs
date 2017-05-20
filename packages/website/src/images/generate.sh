#!/bin/bash
cd `dirname $0`

formats="512x400 600x400 1024x768"

in="./raw";
dist="."

for format in $formats; do
  mkdir -p $dist/$format;
  for name in `ls $in`; do
    if [ ! -f $dist/$format/$name ] ; then
      echo "Generating $format/$name";
      convert $in/$name -resize "$format^" -gravity center -crop "$format+0+0" +repage $dist/$format/$name;
    fi;
  done;
done;
