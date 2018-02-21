FROM node:8
LABEL maintainer "gre"

RUN sed -i "s/jessie main/jessie main contrib non-free/" /etc/apt/sources.list
RUN echo "deb http://http.debian.net/debian jessie-backports main contrib non-free" >> /etc/apt/sources.list

RUN apt-get update -y \
  && apt-get -y install xvfb mesa-utils libgl1-mesa-dri libglapi-mesa libosmesa6 ffmpeg \
  && rm -rf /var/lib/apt/lists/* /var/cache/apt/*

ADD . /opt/bot/
WORKDIR /opt/bot/
RUN npm install
CMD ["npm", "start"]
