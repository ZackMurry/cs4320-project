# CS 4320 Group 14 Project 2: iFINANCE

Spring 2025 Software Engineering with Dr. Ouda

Group 14 members: Zack Murry, Mike Huber, Jacob York, and Jagger Schmitz

## Requirements

This software setup is required for running the web server. Versions do not have to be exact.

- NGINX version 1.26.3
- Node.js version 22.11.0
  - NPM version 10.9.0
- PostgreSQL version 17.2
- Linux (may work on other operating systems)

For ease of use, we have deployed the website on the cloud for testing at this IP: TODO

- Please don't change the default admin username or password on our hosted instance

## Setup

Copy `backend/.env.example` to `backend/.env` and change the values to match your PostgreSQL credentials.

## Execution

The `start.sh` Bash script will install all dependencies (besides the software listed in the Requirements section), configure the database, and start the web server.
The processes started by this script include:

- Frontend Next.js server on port 3000
- Backend Node.js server on port 8080
- NGINX reverse proxy on port 80
  - This directs HTTP requests as follows:
    - Requests to /api/\*\* are sent to port 8080 (backend)
    - All other requests are sent to port 3000 (frontend)

The script can be run using `bash start.sh`.
The server can be terminated by exiting from the `start.sh` script.
