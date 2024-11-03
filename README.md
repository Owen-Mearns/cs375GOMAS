# cs375GOMAS
This is the github repo for the cs375 project

To get the project up and running
go into the route directroy and run 
npm install

To create your database and table, run the command psql --username USERNAME -f setup.sql, replacing your use name with your postgres user.

ALSO create an env.json file in the root directory that has

	"user": "postgres",
	"host": "localhost",
	"password": "Luxray924!",
	"API_KEY": "STOCK API KEY",
	"API_NEWSKEY": "NEWS API KEY",
	"port": 5432

you should than be able to go the the /app directory
and run node.js
OR 
in the root directory run npm start