#~/bin/bash

LOG_FILE=/tmp/adrizer-out.log
API_PID_FILE=/tmp/adrizer-api.pid
FRONTEND_PID_FILE=/tmp/adrizer-frontend.pid

API_PID="$(cat "$API_PID_FILE")"
kill $API_PID
rm "$API_PID_FILE"
FRONTEND_PID="$(cat "$FRONTEND_PID_FILE")"
kill $FRONTEND_PID
rm "$FRONTEND_PID_FILE"

echo "Stopped!"
