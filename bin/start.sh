#~/bin/bash

ctrlc_count=0

function no_ctrlc()
{
    let ctrlc_count++
    echo
    if [[ $ctrlc_count == 1 ]]; then
        echo "Stopping..."
        ./bin/stop.sh
        exit
    else
        echo "Force quitting..."
        exit
    fi
}

trap no_ctrlc SIGINT

LOG_FILE=/tmp/adrizer-out.log
API_PID_FILE=/tmp/adrizer-api.pid
FRONTEND_PID_FILE=/tmp/adrizer-frontend.pid

touch "$LOG_FILE"



npm --prefix ./api start > "$LOG_FILE" 2>&1 &
API_PID=$!
echo "$API_PID" > "$API_PID_FILE"
npm --prefix ./frontend start > "$LOG_FILE" 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" > "$FRONTEND_PID_FILE"
tail -f "$LOG_FILE"
