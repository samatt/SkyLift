'use strict';
// Ref http://getbootstrap.com/javascript/

// TODO

/*
1: Add K-Mmeans clustering for top lat/long centroids
2: Add coordinates to statistics
		curl "http://www.datasciencetoolkit.org/coordinates2statistics/37.769456%2c-122.429128"
3: Add coordinates to politics
		curl "http://www.datasciencetoolkit.org/coordinates2politics/37.769456%2c-122.429128"
4: 
curl "http://www.datasciencetoolkit.org/coordinates2politics/39.27048874%2c-76.61150360"
*/

$(document).ready(function() {
	var viewer, scene, primitives, handler, boards;
	$('#form-select-file-nw').hide();
	$('#openFile').hide();
	$('#form-select-file-w').hide();

	var isNodeWebkit = (typeof process == "object");
	if (isNodeWebkit)
	{
		$('#form-select-file-w').hide();
		$('#form-select-file-nw').show();
		$('#openFile').show();
		var chooser = document.querySelector('#openFile');
		var saveFilenameEl = document.querySelector('#saveFilename');
		chooser.addEventListener('change', function(evt) {
			$('li.network-name').remove();
			$('#network-list-title').html('Loading...');
			skylift.loadSSIDList(this.value);
		}, false);
	}
	else{
		console.log("Not webkit");
		$('#form-select-file-w').show();
		$('#form-select-file-nw').hide();
		$('#openFile').hide();
		
	}
	
	var skylift = {
		
		entries: [],
		nodeSsidMap:{},
		loadID: 0,

		// --------------------------------------------------------------------------------
		
		loadFileList: function( ){
			$.getJSON( '_private/data/_file_list.json', function( data ) {
				var nodes = '';
				nodes += '<option value="0"> Select File </option>';
				$.each( data.files, function( key, val ) {
					nodes += '<option value="' + val.file + '">' + val.name + '</option>';
				});	

				$('select#file-list').append(nodes)
				.change(function () {
					$('li.network-name').remove();
					$('#network-list-title').html('Loading...');
					skylift.loadSSIDList($(this).find( 'option:selected' ).eq(0).val());
				});
			});
		},


		// --------------------------------------------------------------------------------
		
		loadSSIDList: function( file ){

			if(isNodeWebkit){
				$.getJSON( file, function( data ) {
					skylift.entries =[];
					$.each(data, function(key,entry){
						skylift.entries.push( entry );
					});
					skylift.onLoadSSIDList();
				});	
			}
			else{
				$.getJSON( '_private/data/logs/' + file, function( data ) {
					skylift.entries =[];
					$.each(data, function(key,entry){
						if(entry.ids.length <= 0){
							console.log("No ids found for: " +entry.name);
						}

						skylift.entries.push( entry );	
					});
					skylift.onLoadSSIDList();
				});
			}
			
		},
		
		/*
		{
        "geo": {
            "bssid": "3A:0F:4A:AC:36:85", 
            "essid": "Justin's iPad", 
            "lat": "47.44257355", 
            "lon": "-122.30046844", 
            "tString": "2014-09-09 07:34:14", 
            "timestamp": "20140909073503"
        }, 
        "ids": [
                "08:70:45:52:76:cc", 
                "d8:9e:3f:7c:bf:f4"
               ]
        "name": "Justin's iPad"
    }, 
    */
    /*
	nodeSSIDMap 
	{
		"3A:0F:4A:AC:36:85" : []
	
	}

    */

    onLoadSSIDList: function(){
    	$('#network-list-title').html('Networks');

    	var ssidEL = $('ul.networks');
    	var node = '';
    	var uid = 1;

			// Give everything a unique ID (uid)
			$.each( skylift.entries, function(k1,entry){
				entry.uid = uid++;
			});
			
			$.each( skylift.entries, function(k1,entry){
				entry.name = entry.name.trim();
				// filter out
				if( entry.name === null || entry.name === "") return;
				
				if( !(
					entry.geo === null || entry.geo === undefined
					|| entry.geo.lat === undefined
					|| entry.geo.lon === undefined
					|| entry.geo.lat === null
					|| entry.geo.lon === null
					|| entry.geo.lon === ''
					|| entry.geo.lat === ''
					) ){
					node =  '<li class="network-name" data-net-uid="' + entry.uid + '" data-full-name="' + entry.name + '">';
				// node += '<span style="display:block"><a class="network-name-geo" href="#" >' + entry.name + '</a> (' + entry.ids.length + ')</span>';
				node += '<span style="display:block"><a class="network-name-geo" href="#" >' + entry.name +'</a></span>	';
				node += '	<span class="l2">'; // hide elements until clicked
				node += '		<ul class="network-info">';
				node += '			<li>Network Info</li>';
				node += '		</ul>';
				
				node += '		<ul class="geo">';
				node += '			<li class="latlong" data-net-uid="' + entry.uid +'"><a href="#">' + entry.geo.lat + ', ' + entry.geo.lon + '</a></li>';
				node += '		</ul>';

				node += '		<ul class="network-info">';
				node += '			<li>Last Time Seen</li>';
				node += '		</ul>';
				node += '		<ul class="tstamp">';
				node += '			<li >'+ entry.geo.tString+'</li>';
				node += '		</ul>';
			}
			else{
				node =  '<li class="network-name" data-net-uid="' + entry.uid + '" data-full-name="' + entry.name + '">';
				node += '<span style="display:block"><a href="#" >' + entry.name + '</a> </span>';
				
				node += '	<span class="l2">'; // hide elements until clicked
			}

			if( entry.ids !== null && entry.ids.length > 0 ){
				node += '<ul class="network-info">';
				node += '	<li>Associated MACs</li>';
				node += '</ul>';
				
				node += '	<ul class="mac">';
					// for each network mac id
					$.each( entry.ids, function(k2,id){
						node += '		<li><a href="#">' + id + '</a>';
						// for each network name associated with this mac address
						skylift.nodeSsidMap[id] = [];
						node += '		<ul class="ssid-mac">';
						$.each( skylift.entries, function(k3, entryRef){
							$.each( entryRef.ids, function(k4,idRef){
								if( idRef === id ){
									node += '			<li data-net-uid="' + entryRef.uid + '" data-parent-uid="' + entry.uid + '">../<a href="#">' + entryRef.name + '</a></li>';	
									// console.log(id + " " + entryRef.name);
									if( !(
									entryRef.geo === null || entryRef.geo === undefined 
									|| entryRef.geo.lat === undefined
									|| entryRef.geo.lon === undefined
									|| entryRef.geo.lat === null
									|| entryRef.geo.lon === null
									|| entryRef.geo.lon === ''
									|| entryRef.geo.lat === ''
									) ){
										skylift.nodeSsidMap[id].push([entryRef.geo.lat,entryRef.geo.lon,entryRef.name]);
									}
									
								}
							});
						});
						node += '		</ul>';
						node += '	</li>';
					});	
					node += '	</ul>';	
				}

				node += '	</span>';
				node += '</li>';
				ssidEL.append(node);
				node = null;
			});

console.log('set mouse events');
this.attachSSIDMouseEvents();
this.sortMeu("alphabetically");
console.log('set network markers');

			setGeoMarkers(	); // function hanging outside scope, fix later
		},

		sortMeu: function(order){
			// return;
			if(order == "alphabetically"){
				// rearrange the network elements alphabetically
				$("ul.networks > li").sort(skylift.sort_li).appendTo('ul.networks');
			}
		},

		sort_li: function(a, b){

		    //return ($(b).data('position')) < ($(a).data('position')) ? 1 : -1;
		    var d1 = $(b).attr('data-full-name');
		    
		    if( !(typeof(d1) === undefined)){
		    	d1 = $(b).attr('data-full-name').substring(0,1);
		    } else {
		    	d1 = "";
		    }

		    var d2 = $(a).attr('data-full-name');
		    if( !(typeof(d2) === undefined) ){
		    	d2 = $(a).attr('data-full-name').substring(0,1);
		    } else {
		    	d2 = "";
		    }
		    return ($(b).attr('data-full-name').substring(0,1).toLowerCase()) < ($(a).attr('data-full-name').substring(0,1).toLowerCase()) ? 1 : -1;
		},

		// --------------------------------------------------------------------------------
		attachSSIDMouseEvents: function(){
			// mouse events
			//var count = 0;
			$('ul.networks > li.network-name > span > a').each( function(){
				//console.log('appending mouse: ' + count++);
				$(this).click(function() {					
					$(this).toggleClass('active').parent().parent().find('.l2').slideToggle( 'fast', function() {
					});
				});
			});

			$('ul.networks > li.network-name-geo > span > a').each( function(){
				//console.log('appending mouse: ' + count++);
				$(this).click(function() {					
					$(this).toggleClass('active').parent().parent().find('.l2').slideToggle( 'fast', function() {
					});
				});
			});
			
			$('ul.mac > li a').each( function(){
				$(this).click(function() {
					// toggle css class
					$(this).parent().find('ul.ssid-mac').slideToggle( 'fast', function() {
						var key = $(this).parent().find('a').html();
				  	console.log(key); // outputs MAC addr
				  	setGeoMarkers(key)
				  }).parent().find('a').eq(0).toggleClass('active');
					;
				});
			});
			
			// Level 3 network names, click to reset
			$('ul.ssid-mac > li a').each( function(){
				$(this).click(function() {
					// toggle css class
					var netUID = $(this).parent().attr('data-net-uid');
					var parentUID = $(this).parent().attr('data-parent-uid');
					var pn = $('li.network-name[data-net-uid="' + parentUID + '"] .l2');
					var nn = $('li.network-name[data-net-uid="' + netUID + '"] .l2');
					pn.find('.mac a').removeClass('active');
					pn.find('.ssid-mac').hide();
				  //console.log('click: ' + $(this).html() + ', netUID: ' + netUID + ', parentUID: ' + parentUID);
				  $('li.network-name[data-net-uid="' + parentUID + '"] > a').toggleClass('active');

				  pn.slideToggle( 'fast', function() {
				  	$(this).find('li.latlong a').removeClass('active');

				  	nn.slideToggle( 'fast', function() {
				  		$('#sidebar').scrollTo( $('li.network-name[data-net-uid="' + netUID + '"]'), 1000, {
				  			offset:-50,
				  			easing:'easeOutCubic',
				  			onAfter:function(){ 
							  		// console.log('done');		
							  	}
							  });
				  		$(this).parent().find('a').eq(0).addClass('active');
				  	});
				  	$(this).parent().find('a').eq(0).removeClass('active');
				  });
				  setGeoMarkers()
				});
			});

			// Lat/Long clickable
			$('li.latlong a').each( function(){
				$(this).click( function(){
					// not cpu ideal, clean up alter
					$(this).parent().parent().find('a').removeClass('active');
					$(this).addClass('active');
					
					var uid = parseInt($(this).parent().attr('data-net-uid'));
					// find linked network
					console.log('clicked on latlong: ' + uid);
					$.each( skylift.entries, function(k,entry){
						if( entry.uid === uid ){
							// pass this network object on to function
							flyToRectangle( entry );
							return;
						}
					});
				});
			});

		},
	  // --------------------------------------------------------------------------------
	  start: function(){
	  	console.log('SKYLIFT');
	  	this.loadFileList();
	  },
	  
	  getEntryBySSID: function(ssid){
	  	$.each(skylift.entries, function(key,val){
		  		//console.log('does it match? ' + ssid + ' ? ' + val.geo.bssid);
		  		if( val.geo.bssid === ssid ){
		  			console.log('match!');
		  			return val;
		  		}
		  	});
	  	return null;
	  }

	};
	
	
	
	// --------------------------------------------------------------------------------
	// Point of Entry
	// --------------------------------------------------------------------------------
	window.skylift = skylift;
	
	window.viewer = viewer;
	
	$( window ).resize(function() {
		$( '#cesium-parent-container' ).css('height',$(window).height() );
	});
	$( window ).resize();
	// Begin
	skylift.start();		
	
	
	
	// --------------------------------------------------------------------------------
	// Cesium 
	// --------------------------------------------------------------------------------
	
	// Bug here, Cesium is not immediately avaialble. Check on interval for existence of Cesium var, then init
	var cesiumLoadedIntervalID;
	var cesiumInited = false;
	
	// Cesium loaded utils
	function isCesiumReady(){
		if( Cesium !== null ){
			clearInterval(cesiumLoadedIntervalID);
			onCesiumReady();
		} else {
		}
	}
	
	function onCesiumReady(){
		try{
			viewer = new Cesium.Viewer('cesiumContainer');
			scene = viewer.scene;
			console.log
			primitives = scene.primitives;
			cesiumInited = true;
			console.log('ok, init');
		} catch(e){
		}
	}
	
	try {
		if( Cesium === null){
			// cesium threw error, start interval here
			cesiumLoadedIntervalID = setInterval( isCesiumReady, 100);
		}
	} catch(e){
		// cesium was null, start interval here
		cesiumLoadedIntervalID = setInterval( isCesiumReady, 100);
	}
	
	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}
	// Getting messy
	function setGeoMarkers(nodeID){

		if( cesiumInited !== true ){
			isCesiumReady();
		}


		var canvas = document.createElement('canvas');
		canvas.width = 10;
		canvas.height = 10;
		var context2D = canvas.getContext('2d');
		context2D.beginPath();
	    context2D.arc(4, 4, 4, 0, Cesium.Math.TWO_PI, true); // ?
	    context2D.closePath();
	    context2D.fillStyle = 'rgb(255, 255, 255)';
	    context2D.fill();

		//remove old primitives		
		boards = {};
		if(primitives){
			primitives.removeAll();
		}

		if(nodeID){
			
			var nodeData = skylift.nodeSsidMap[nodeID];
			
			//Formatting for list for WebGL Globe JSON. Just so it fits the standard. Not essential
			//[["series1",[latitude, longitude, height, ... ]
    		// ["series2",[latitude, longitude, height, ... ]]
			
			// Only doing one series for now
			var merged = [];
			merged = merged.concat.apply(merged, nodeData);

        	var count = 0;
        	var coordinates = merged;
        	var billboards = primitives.add(new Cesium.BillboardCollection());
			for (var i = 0; i < coordinates.length; i += 3) {
            	var latitude = coordinates[i];
            	var longitude = coordinates[i + 1];
            	var name = coordinates[i + 2];
           		var height = i/coordinates.length;
            	var color = Cesium.Color.fromHsl((0.6 - (height * 0.5)), 1.0, 0.5,0.5);        	
				var b  = billboards.add({
					imageId : 'Point ' + count + ', uid: ' + name,
					id :name,
					image : canvas,
		        	position : Cesium.Cartesian3.fromDegrees(longitude, latitude), // long, lat
		        	color : color
		    	});
				count++;
				boards[name.toString()] = b;	
        	}

			handler = handler && handler.destroy();
	    	handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
	    	handler.setInputAction(
	    	function (movement) {
	    		var pickedObject = scene.pick(movement.endPosition);
	    		if(Cesium.defined(pickedObject)){
	    			if (Cesium.defined(pickedObject) && (pickedObject.primitive === boards[pickedObject.id.toString()])) {
	    				$.each( skylift.entries, function(key,entry){
	    					if(entry.name == pickedObject.id ){
								$('#network-list-title').html("Current : "+ entry.name);
							}
						});
	    			} 
	    		}
	    		else{
	    			$('#network-list-title').html('Networks');
	    		}
    		},Cesium.ScreenSpaceEventType.MOUSE_MOVE);        	
		}
		else{
			
			var billboards = primitives.add(new Cesium.BillboardCollection());
			var count = 0;
			$.each( skylift.entries, function(key,entry){

				if( Math.abs(entry.geo.lat) > 0 && Math.abs(entry.geo.lon) > 0 ){
					var b  = billboards.add({
						imageId : 'Point ' + count + ', uid: ' + entry.uid,
						id :entry.uid,
						image : canvas,
				        position : Cesium.Cartesian3.fromDegrees(entry.geo.lon, entry.geo.lat), // long, lat
				        color : Cesium.Color.RED
				    });
					count++;
					boards[entry.uid.toString()] = b;
				}

			handler = handler && handler.destroy();
	    	handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);
	    	handler.setInputAction(
	    	function (movement) {

	    		$.each(boards, function(key, value) {
	    			value.color = Cesium.Color.RED;		 	
	    		});

	    		var pickedObject = scene.pick(movement.endPosition);
	    		if(Cesium.defined(pickedObject)){

	    			if (Cesium.defined(pickedObject) && (pickedObject.primitive === boards[pickedObject.id.toString()])) {

	    				boards[pickedObject.id.toString()].color =Cesium.Color.WHITE;
	    				$.each( skylift.entries, function(key,entry){
	    					if(entry.uid == pickedObject.id ){
								$('#network-list-title').html("Current : "+ entry.name);

							}
						});
	    			} 
	    		}
	    		else{
	    			$('#network-list-title').html('Networks');
	    		}
    		},Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			});
		}
	    // drawAllLines();
	}

	 // Fly to location
	 function flyToRectangle( entry ) {

	 	if( cesiumInited !== true ){
	 		isCesiumReady();
	 	}
	 		// paramter is network object form JSON
	 		console.log('flyToRectangle: ' + entry.uid + ' , lat: ' + entry.geo.lat + ', lon: ' + entry.geo.lon + ', name: ' + entry.name);
	 		
		 	// zoom level
		 	var fuzzShape = 0.015; // degrees 
		 	var fuzzZoom = fuzzShape + 0.0015 // degrees
		 	
		 	var lon = parseFloat(entry.geo.lon);
		 	var lat = parseFloat(entry.geo.lat);

		 	var rectZoom = {
		 		west: lon - fuzzZoom,
		 		south: lat - fuzzZoom,
		 		east: lon + fuzzZoom,
		 		north: lat + fuzzZoom
		 	};

		 	var rectShape = {
		 		west: lon - fuzzShape,
		 		south: lat - fuzzShape,
		 		east: lon + fuzzShape,
		 		north: lat + fuzzShape
		 	};

		 	console.dir(rectZoom);

		 	scene.camera.flyToRectangle({
		 		destination : Cesium.Rectangle.fromDegrees(rectZoom.west, rectZoom.south, rectZoom.east, rectZoom.north)
		 	});

		  // Show the rectangle.  Not required; just for show.
		  var polylines = scene.primitives.add(new Cesium.PolylineCollection());
		  polylines.add({
		  	positions : Cesium.Cartesian3.fromDegreesArray([
		  		rectShape.west, rectShape.south,
		  		rectShape.west, rectShape.north,
		  		rectShape.east, rectShape.north,
		  		rectShape.east, rectShape.south,
		  		rectShape.west, rectShape.south
		  		])
		  });
		  
		}
		
		
	// Example 1: Draw a red polyline on the globe surface
	function drawAllLines(){
		$.each( skylift.entries, function(key,entry){

			$.each( entry.ids, function(idKey, id){
				var dest = skylift.getEntryBySSID(id);
				
				if( dest !== null && dest.lat !== undefined && dest.lon !== undefined ){
					// filter out non located points
					
					// add a line connecting every point
					scene.primitives.add(new Cesium.Primitive({
						geometryInstances : new Cesium.GeometryInstance({
							geometry : new Cesium.PolylineGeometry({
								positions : Cesium.Cartesian3.fromDegreesArray([
									entry.geo.lon, entry.geo.lat,
									dest.geo.lon, dest.geo.lat
									]),
								width : 2.0,
								vertexFormat : Cesium.PolylineColorAppearance.VERTEX_FORMAT
							}),
							attributes: {
								color: Cesium.ColorGeometryInstanceAttribute.fromColor(new Cesium.Color(1.0, 0.0, 0.0, 1.0))
							}
						}),
						appearance : new Cesium.PolylineColorAppearance()
					}));
				}
			});
		});

	}



});


// Dev Reference
/*
		networks":[ 
        {
            "lat": 27.565883349203435, 
            "name": "BlueFigGuest", 
            "long": -29.621221341814202, 
            "ids": [
                "08:70:45:52:76:cc", 
                "d8:9e:3f:7c:bf:f4"
            ]
        }, 
*/