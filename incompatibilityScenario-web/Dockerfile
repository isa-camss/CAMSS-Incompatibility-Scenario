# Use a NodeJS base image
FROM node:20.11.1-alpine
# Install Angular and eUI
RUN npm install -g @eui/cli@17.1.1
# Set working directory
WORKDIR /incompatibilityscenario
# Copy package and npmrc files
COPY package*.json /incompatibilityscenario
COPY yarn.lock /incompatibilityscenario
# Install and update packages
RUN yarn install
# After installing packages, copy all app files
COPY . /incompatibilityscenario
# It can be modified in Angular.json
EXPOSE 4300
# Execute command
CMD ["npm", "run", "server"]