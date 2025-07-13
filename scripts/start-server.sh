#!/bin/bash

LOGFILE=server.log

# Start the jar in the background
cd quarkus-app # change the directory, so the config file is found
java -jar quarkus-run.jar >"$LOGFILE" 2>&1 &
cd ..

# Get the PID of the last background process
echo $! > process_id

echo "Server started with PID $(cat process_id)"