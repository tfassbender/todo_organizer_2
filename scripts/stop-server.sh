#!/bin/bash

if [ -f process_id ]; then
  PID=$(cat process_id)
  if kill -0 "$PID" 2>/dev/null; then
    kill "$PID"
    echo "Server with PID $PID stopped."
    rm process_id
  else
    echo "No running process found with PID $PID."
  fi
else
  echo "No process_id file found. Is the server running?"
fi