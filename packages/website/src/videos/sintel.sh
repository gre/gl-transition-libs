#!/bin/bash
cd `dirname $0`

in=Sintel.2010.720p.mkv
out=./sintel

opts="-b:v 3000k -an"
webmopts="-vcodec libvpx -quality good"
mpegopts="-vcodec libx264"

test -f $in || wget http://ftp.nluug.nl/pub/graphics/blender/demo/movies/$in
ffmpeg -i $in -ss 00:06:09.0 -t 00:00:05.0 $webmopts $opts $out/cut1.webm
ffmpeg -i $in -ss 00:06:20.0 -t 00:00:05.0 $webmopts $opts $out/cut2.webm
ffmpeg -i $in -ss 00:06:26.0 -t 00:00:05.0 $webmopts $opts $out/cut3.webm

ffmpeg -i $in -ss 00:06:09.0 -t 00:00:05.0 $mpegopts $opts $out/cut1.mp4
ffmpeg -i $in -ss 00:06:20.0 -t 00:00:05.0 $mpegopts $opts $out/cut2.mp4
ffmpeg -i $in -ss 00:06:26.0 -t 00:00:05.0 $mpegopts $opts $out/cut3.mp4
