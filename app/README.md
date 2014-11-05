#SKYLIFT Build Processes

***
##Web App
From /web-app dir
`grunt serve`
Starts site at http://localhost:9000

`grunt build`
Generates distribution files

##Node-Webkit App
From /node-app dir
`grunt nodewebkit`

###ToDo UI
* Fold-up top-level menus when opening other top-level menus
* Remove plotted map points when selecting new log file
* Add polylines to connect shared locations

###ToDo Data
* add demographic data
* add political data
* add device make/model data
* For now, keeping logic simple w/only one data file at a time
* ...Loading new data file clears data loaded from previous file

###ToDo Node App
* remove .app before building (current build process errors if it exists prior to build)


###ToDo Web App
