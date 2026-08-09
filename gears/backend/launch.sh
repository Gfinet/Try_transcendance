#!/bin/sh

rm -f package-lock.json
###DELETE

npm i 
# npm update

sleep 5
npx prisma generate
npx prisma db push --accept-data-loss
sleep 5

sed -i 's/_COMMON_ARGUMENTS = \[/_COMMON_ARGUMENTS = [\n    "deviceid",\n    "pushtoken",/' /root/.local/pipx/venvs/midea-beautiful-air/lib/python3.11/site-packages/midea_beautiful/cli.py

# echo "URL:" $URL

if [ "$APP_MODE" = "dev" ]; then
	echo "DEV";
	exec npm run dev;
elif [ "$APP_MODE" = "prod" ]; then
	echo "START";
	# if [ -d "app/frontend/dist" ]; then
	# 	rm -rf "app/frontend/dist";
	# fi
	exec npm start;
fi

