#!/bin/bash

# Assuming Linux with postgres, nginx, and node installed

# Define database name
DB_NAME="group14_ifinancedb"

# Create the database using psql
sudo -u postgres createdb "$DB_NAME"

# Check if the database was created successfully
if [ $? -eq 0 ]; then
  echo "Database '$DB_NAME' created successfully."
else
  echo "Failed to create database '$DB_NAME'. Continuing, as it may already exist..."
fi

# Start frontend
cd frontend
npm install
npm run build
npm run start &
FRONTEND_PID=$!

# Start backend
cd ../backend
npm install
npm run start &
BACKEND_PID=$!

# Start nginx
if ! pgrep -x "nginx" > /dev/null; then
  echo "Nginx is not running. Starting nginx..."
  sudo nginx -p nginx -c conf/nginx.conf
else
  echo "Nginx is already running."
fi

# kill all processes when user kills the bash script
cleanup() {
  echo "Killing processes..."
  kill $FRONTEND_PID $BACKEND_PID
  wait $FRONTEND_PID $BACKEND_PID
}

# Use cleanup as trap
trap cleanup EXIT

# Don't exit until frontend and backend have exited
wait $FRONTEND_PID $BACKEND_PID
