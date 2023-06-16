#!/bin/bash

#getting apache flag -a
while [[ $# -gt 0 ]]; do
	case "$1" in
		-a)
			shift
			flag_a="$1"
			;;
		-s)
			shift
			flag_s="$1"
			;;
		-d)	
			shift
			flag_d="$1"
	esac
	shift
done

cd ..
#getting project dir
root_dir=$(pwd)
echo "Project Root Dir ${root_dir}"

if [ -n "${flag_d}" ]; then
	echo "Running in detached mode"
fi


if [ -n "${flag_a}" ]; then
	echo "Starting apache Server"
	sudo $flag_a/xampp start

	#copying front-end folder into htdocs
	echo "Copying front-end folder over"

	if [ ! -d "$flag_a/htdocs/code-racer" ]; then
		#Creating the folder
		echo "Creating folder code-racer"
		mkdir -p "$flag_a/htdocs/code-racer"
	fi

	cp -r "${root_dir}/front-end/" "${flag_a}/htdocs/code-racer/"
fi


pid_array=()
if [ -n "${flag_s}" ]; then
	echo "Starting Services"

	cd "${root_dir}/back-end/Microservices/"

	for folder in */; do
		if [ -d "$folder" ]; then
			echo "Starting service : $folder"
			cd $folder

			if [ ! -n "${flag_d}" ]; then
				gnome-terminal -- bash -c "node index.js"
			else 
				nohup node index.js /dev/null 2>1 & 
				pid=$!
				pid_array+=("${pid}")
			fi
			cd ..
		fi
	done
fi

while true; do
	sleep 1;
done

#used for killing pids in array
kill_pids() {
	for pid in "${pid_array[@]}"; do
		kill "$pid"
	done
}


trap '{
	echo "Closing all node js servers"
	kill_pids
}' EXIT

trap '{
	echo "Closing all node js servers"
	kill_pids
}' SIGINT








