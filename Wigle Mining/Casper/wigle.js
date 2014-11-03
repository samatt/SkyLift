
'use strict';

var casper = require('casper').create({pageSettings: {
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/37.0.2062.124 Safari/537.36'
}
});
//================================================================================
//================================================================================
// Extending Casper functions for realizing label() and goto()
// 
// Functions:
//   checkStep()   Revised original checkStep()
//   then()        Revised original then()
//   label()       New function for making empty new navigation step and affixing the new label on it.
//   goto()        New function for jumping to the labeled navigation step that is affixed by label()
//   dumpSteps()   New function for Dump Navigation Steps. This is very helpful as a flow control debugging tool.
// 

var utils = require('utils');
var f = utils.format;
var fs = require('fs');
/**
 * Revised checkStep() function for realizing label() and goto()
 * Every revised points are commented.
 *
 * @param  Casper    self        A self reference
 * @param  function  onComplete  An options callback to apply on completion
 */
 casper.checkStep = function checkStep(self, onComplete) {
    if (self.pendingWait || self.loadInProgress) {
        return;
    }
    self.current = self.step;                 // Added:  New Property.  self.current is current execution step pointer
    var step = self.steps[self.step++];
    if (utils.isFunction(step)) {
        self.runStep(step);
        step.executed = true;                 // Added:  This navigation step is executed already or not.
    } else {
        self.result.time = new Date().getTime() - self.startTime;
        self.log(f('Done %s steps in %dms', self.steps.length, self.result.time), 'info');
        clearInterval(self.checker);
        self.emit('run.complete');
        if (utils.isFunction(onComplete)) {
            try {
                onComplete.call(self, self);
            } catch (err) {
                self.log('Could not complete final step: ' + err, 'error');
            }
        } else {
            // default behavior is to exit
            self.exit();
        }
    }
};


/**
 * Revised then() function for realizing label() and goto()
 * Every revised points are commented.
 *
 * @param  function  step  A function to be called as a step
 * @return Casper
 */
 casper.then = function then(step) {
    if (!this.started) {
        throw new CasperError('Casper not started; please use Casper#start');
    }
    if (!utils.isFunction(step)) {
        throw new CasperError('You can only define a step as a function');
    }
    // check if casper is running
    if (this.checker === null) {
        // append step to the end of the queue
        step.level = 0;
        this.steps.push(step);
        step.executed = false;                 // Added:  New Property. This navigation step is executed already or not.
        this.emit('step.added', step);         // Moved:  from bottom
    } else {

      if( !this.steps[this.current].executed ) {  // Added:  Add step to this.steps only in the case of not being executed yet.
        // insert substep a level deeper
        try {
//          step.level = this.steps[this.step - 1].level + 1;   <=== Original
            step.level = this.steps[this.current].level + 1;   // Changed:  (this.step-1) is not always current navigation step
        } catch (e) {
            step.level = 0;
        }
        var insertIndex = this.step;
        while (this.steps[insertIndex] && step.level === this.steps[insertIndex].level) {
            insertIndex++;
        }
        this.steps.splice(insertIndex, 0, step);
        step.executed = false;                    // Added:  New Property. This navigation step is executed already or not.
        this.emit('step.added', step);            // Moved:  from bottom
      }                                           // Added:  End of if() that is added.

  }
//    this.emit('step.added', step);   // Move above. Because then() is not always adding step. only first execution time.
return this;
};


/**
 * Adds a new navigation step by 'then()'  with naming label
 *
 * @param    String    labelname    Label name for naming execution step
 */
 casper.label = function label( labelname ) {
  var step = new Function('"empty function for label: ' + labelname + ' "');   // make empty step
  step.label = labelname;                                 // Adds new property 'label' to the step for label naming
  this.then(step);                                        // Adds new step by then()
};

/**
 * Goto labeled navigation step
 *
 * @param    String    labelname    Label name for jumping navigation step
 */
 casper.goto = function goto( labelname ) {
  for( var i=0; i<this.steps.length; i++ ){         // Search for label in steps array
      if( this.steps[i].label == labelname ) {      // found?
        this.step = i;                              // new step pointer is set
    }
}
};
// End of Extending Casper functions for realizing label() and goto()
//================================================================================
//================================================================================



//================================================================================
//================================================================================
// Extending Casper functions for dumpSteps()

/**
 * Dump Navigation Steps for debugging
 * When you call this function, you cat get current all information about CasperJS Navigation Steps
 * This is compatible with label() and goto() functions already.
 *
 * @param   Boolen   showSource    showing the source code in the navigation step?
 *
 * All step No. display is (steps array index + 1),  in order to accord with logging [info] messages.
 *
 */
 casper.dumpSteps = function dumpSteps( showSource ) {
  this.echo( "=========================== Dump Navigation Steps ==============================", "RED_BAR");
  if( this.current ){ this.echo( "Current step No. = " + (this.current+1) , "INFO"); }
  this.echo( "Next    step No. = " + (this.step+1) , "INFO");
  this.echo( "steps.length = " + this.steps.length , "INFO");
  this.echo( "================================================================================", "WARNING" );

  for( var i=0; i<this.steps.length; i++){
    var step  = this.steps[i];
    var msg   = "Step: " + (i+1) + "/" + this.steps.length + "     level: " + step.level
    if( step.executed ){ msg = msg + "     executed: " + step.executed }
        var color = "PARAMETER";
    if( step.label    ){ color="INFO"; msg = msg + "     label: " + step.label }

    if( i == this.current ) {
      this.echo( msg + "     <====== Current Navigation Step.", "COMMENT");
  } else {
      this.echo( msg, color );
  }
  if( showSource ) {
      this.echo( "--------------------------------------------------------------------------------" );
      this.echo( this.steps[i] );
      this.echo( "================================================================================", "WARNING" );
  }
}
};

// End of Extending Casper functions for dumpSteps()
//================================================================================
//================================================================================

var args = {};
args.username = 'samatt';
args.password = 'password';
args.ssids = [];
args.currentSSID = '';
var currentIndex = 0;

var linkData = [];
var currentPage= 1 ;
var x = require('casper').selectXPath;
var maxCount;

// utils.dump(casper.cli.options);

if(casper.cli.options.filename){
    var fileName = casper.cli.options.filename ;
    console.log(casper.cli.options.filename);
    var data = fs.read(casper.cli.options.filename);
    
    args.ssids = data.split(/[\r\n]/);
    for (var i = 0; i < args.ssids.length; i++) {
        args.ssids[i];

        args.ssids[i] = args.ssids[i].substr(1, args.ssids[i].length -2) ;
    };
    args.currentSSID = args.ssids[0];
    console.log('SSID LIST: ');
    console.log(data);

    if(args.ssids.length > 15){
        maxCount = 10;    
    }
    else{
        maxCount = args.ssids.length ;
    }
    
    
}
else if(casper.cli.options.ssid){
    
    // var data = fs.read(casper.cli.options.ssid);
    // args.ssids = data.split(/[\r\n]/);
    args.currentSSID = casper.cli.options.ssid;
    console.log('Searching for SSID: '+ args.currentSSID);
    maxCount = 1;
    args.ssids = ['args.currentSSID']

}
// var maxCount = args.ssids.length -1 || 2;


casper.start('http://wigle.net/', function() {
    console.log("here");
    casper.click('input[name="noexpire"]');
});

//STEP: Sign in
casper.then(function signIn() {
    

    casper.fill('form[method="POST"]', {
        'credential_0': args.username,
        'credential_1': args.password,
    },true);
    casper.capture('../Debug/test.png');
    this.echo('Signed in..');
});

casper.label( 'QUERY_PAGE' );

//STEP: Query page
casper.thenOpen('https://wigle.net/gps/gps/main/query/',function fillForm(){

    casper.capture('../Debug/test1.png');
    //UGLY HACK: Don't know why but wigles form format is weird only way i
    // can get it to query is by using the xpath i find and tabbing 9 times
    this.sendKeys(x('/html/body/center[2]/table/tbody/tr/td/table[2]/tbody/tr/td[1]/table[2]/tbody/tr[2]/td[2]/input'),'\t\t\t\t\t\t\t\t\t\t'+args.currentSSID);
    
});

//STEP: Process page
casper.thenClick(x('/html/body/center[2]/table/tbody/tr/td/table[2]/tbody/tr/td[1]/p/table/tbody/tr[8]/td/input[1]'),function(){

    casper.capture('../Debug/'+args.currentSSID +'_' +args.currentIndex + '.png');
    var t = this.evaluate(getData);
    linkData.push.apply(linkData,t);
    processPage();

});

casper.run();

var terminate = function() {
    exportJSON(linkData);
    this.echo('thats all, folks.').exit();
};

var processPage = function() {
    var url;
    
    casper.capture('../Debug/'+args.currentSSID +'_' +currentPage + '.png');
    if (casper.exists('input[value="Next100 >>"]')) {


        var t = casper.evaluate(getData);
        linkData.push.apply(linkData,t);

        // don't go too far down the rabbit hole
        if (currentPage >= 3) {
            exportJSON(linkData);
            if(args.ssids.length > 0 && currentIndex <= maxCount){
                currentPage = 1;
                excuteNewQuery();
            }
            else{
                return terminate.call(casper);    
            }
        }

        currentPage++;
        casper.echo('requesting next page: ' + currentPage);
        url = casper.getCurrentUrl();
        casper.thenClick('input[value="Next100 >>"]').then(function() {
            casper.waitFor(function() {
                casper.echo(url == casper.getCurrentUrl());
                return url == casper.getCurrentUrl();
            }, processPage, terminate,function timeout(){casper.echo('TIMED OUT');}
            );
        });
    }
    else{
        casper.echo('No more results for : ' + args.currentSSID);        
        var s = casper.evaluate(checkForBlock);
        if(s !== null && s['0'] ==='An Error has occurred:') {
            casper.echo(" ");
            casper.echo("******************************");
            casper.echo("Wigle has blocked this account.")
            casper.echo("******************************");
            casper.echo(" ")
            return terminate.call(casper);    
        }
        
        
        
        if(args.ssids.length > 0 && currentIndex <= maxCount){
            currentPage = 1;
            excuteNewQuery();
        }
        else{
            return terminate.call(casper);    
        }
    }
    
};

var excuteNewQuery = function(){
    args.currentSSID  = args.ssids[currentIndex];
    
    casper.echo('NEW QUERY : ' + args.currentSSID);
    currentIndex++;
    casper.then(function noMoreResults(){
        linkData = [];
        casper.goto('QUERY_PAGE');
    });
};

var exportJSON = function(data){
    casper.echo('Exporting JSON '+args.currentSSID+'.json with '+ data.length + ' locations');

    var d = filterData(data);

    
    fs.write('../Outputs/Wigle/'+args.currentSSID+'.json', d, 'w');
    // fs.write(args.currentSSID+'.json', d, 'w');
};

function compare(a,b) {
  if (a.timestamp < b.timestamp)
     return 1;
  if (a.timestamp > b.timestamp)
    return -1;
  return 0;
}

function filterData (data){
    var count = 0;
    data.sort(compare);

    var finalJson = ' { \"results\" :  [ ' ;   
    // casper.echo('FILTER DATA');
    // var filterDate = Date.parse('2008-01-01 00:00:00');
    for (var i in data) {
        // casper.echo(data[i].essid + ' : ' +data[i].tString);
        if(data[i].essid.trim() === args.currentSSID.trim()
            && i === data.length -1){
                finalJson += JSON.stringify(data[i]);    

        }
        else if(data[i].essid.trim() === args.currentSSID.trim()
            && i !== data.length -1){
                count++;
                finalJson += JSON.stringify(data[i]) + ',';
        }    
        else{
            casper.echo( args.currentSSID +  ' !== ' + data[i].essid);
        }
        
    }
    finalJson +=  '{}';
    finalJson += ' ] }';

    return finalJson;
}

var getData = function () {
    var searchRows = document.querySelectorAll('.search');

    return Array.prototype.map.call(searchRows, function(e) {

    //2 : BSSID , 3: essid , 10: last updated, 13: lat, 14: long , 15: timestamp
    // if(e.childNodes[3].innerHTML === args.currentSSID){
        
        var myObj = {
            'bssid' : e.childNodes[2].innerHTML,
            'essid' : e.childNodes[3].innerHTML,
            'tString' : e.childNodes[10].innerHTML,
            'timestamp' : e.childNodes[15].innerHTML,
            'lat' : e.childNodes[13].innerHTML,
            'lon' : e.childNodes[14].innerHTML
        };
        return myObj;
    // }
    });
};

var checkForBlock = function(){
    
    var searchRows = document.querySelectorAll('.launchinner');
    return Array.prototype.map.call(searchRows, function(e) {
        return e.childNodes[0].innerHTML;
    });    
}   




