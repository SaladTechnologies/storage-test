FROM docker.io/pytorch/pytorch:2.7.0-cuda12.6-cudnn9-devel

# Install essential utilities
RUN apt-get update && apt-get install -y curl net-tools iputils-ping 

# Optional: Install VS Code Server
RUN curl -Lk 'https://code.visualstudio.com/sha/download?build=stable&os=cli-alpine-x64' -o vscode_cli.tar.gz && \
    tar -xf vscode_cli.tar.gz && \
    mv code /usr/local/bin/code && \
    rm vscode_cli.tar.gz

# Install rclone and prepare config directory
# https://rclone.org/downloads/
RUN curl -Lk 'https://downloads.rclone.org/v1.69.2/rclone-v1.69.2-linux-amd64.deb' -o rclone-v1.69.2-linux-amd64.deb && \
    dpkg -i rclone-v1.69.2-linux-amd64.deb && \
    rm rclone-v1.69.2-linux-amd64.deb && \
    mkdir -p /root/.config/rclone

# Upgrade pip 
RUN pip install --upgrade pip

# Install nvm and Node.js v22.16.0
ENV NVM_DIR=/root/.nvm
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash && \
    . "$NVM_DIR/nvm.sh" && \
    nvm install v22.16.0 && \
    nvm use v22.16.0 && \
    nvm alias default v22.16.0 && \
    ln -s $NVM_DIR/versions/node/v22.16.0/bin/node /usr/local/bin/node && \
    ln -s $NVM_DIR/versions/node/v22.16.0/bin/npm /usr/local/bin/npm && \
    ln -s $NVM_DIR/versions/node/v22.16.0/bin/npx /usr/local/bin/npx

# Install additional Python packages
WORKDIR /app
COPY requirements.txt ./

RUN pip install -r requirements.txt

# Use VS Code on SaladCloud
RUN mkdir -p /app/.vscode/
COPY .vscode/launch.json ./.vscode/launch.json

COPY package*.json tsconfig.json testCases.txt testCaseSummary.txt ./
RUN npm install

COPY src ./src
RUN npx tsc

# Set the default command to run your built app
CMD ["node", "dist/main.js"]

# The pre-built image: docker.io/saladtechnologies/storage-test:0.0.1