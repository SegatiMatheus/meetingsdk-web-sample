# Use an image with Node.js version 20.12.1
FROM node:20.12.1

# Set the initial working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Change the working directory to the 'CDN' folder inside the current working directory
WORKDIR /usr/src/app/CDN

# Install dependencies in the 'CDN' directory, force to resolve potential conflicts
RUN npm install --force

# Copy the rest of your app's source code from your host to your image filesystem
# Make sure to adjust the paths if your source structure requires it
COPY . .

# If you need to run the build command inside the CDN directory
RUN npm run build

# Inform Docker that the container is listening on port 9998
EXPOSE 9998

# Command to run your app using npm, still within the CDN directory
CMD ["npm", "start"]