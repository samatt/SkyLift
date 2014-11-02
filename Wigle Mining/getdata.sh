#/bin/bash	

if [ -z "$1" ] 
  then
    echo "Two arguments required"
    echo "Usage: ./getdata.sh <input filename> <output filename>"
elif [ -z "$2" ]
then
    echo "Two arguments required"
    echo "Usage: ./getdata.sh <input filename> <output filename>"
else
	echo "Deleting old temp files"
	rm -r Outputs
	mkdir Outputs
	cd Outputs
	mkdir Wigle
	cd ..

	rm -r Debug
	mkdir Debug

	#making stand alone folder
	echo "parse NSHeyyy data"
	cd Parsers

	python queries.py probes ../$1 > ../Outputs/probes.txt


	echo "get wigle data"

	cd ../Casper
	casperjs --ssl-protocol=tlsv1 wigle.js --filename=../Outputs/probes.txt


	echo "accumulate wigle and nshey data"
	cd ../Parsers
	python queries.py networks ../Outputs/Wigle/ > ../$2

fi

