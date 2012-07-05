var sys = require("util")

var parseNessusResult = function(nessStr){
    var scoreReg = /CVSS Base Score : (\d\.\d)/;

    var portReg = /\D+ \((\d{1,7})\D+\)/;
    var splitNess = nessStr.split("|");
    var ip = splitNess[2];
    var code = parseFloat(splitNess[4]);
    var holeNote = splitNess[5];
    if(scoreReg.test(nessStr)){
        var score = parseFloat(scoreReg.exec(nessStr)[1]);
    }
    else{
        var score = 0.0;
    }
    if(portReg.test(nessStr)){
        var port = parseFloat(portReg.exec(nessStr)[1]);
    }
    else{
        var port = -1;
    }
    
    return {"ip":ip,
        "vulnid":code,
        "vulntype":holeNote,
        "cvss":score,
        "port":port};
}

var parseNessusTimeStamp = function(stampString){
    var moment = require("moment")
    var timeFormat = "ddd MMM DD HH:mm:ss YYYY"
    var splitInput = stampString.split("|")
    
    var time = moment(splitInput[splitInput.length - 2], timeFormat)
    //var time = splitInput[splitInput.length - 2]
    return time.valueOf()
}

var hasTime = function(line){
    var splits = line.split("|")
    return (splits[splits.length - 2].length > 0 && splits[0] == "timestamps")
}

var isResult = function(line){
    return(line.split("|")[0] === "results")
}

var parseNBEFile = function(nbe){
    var lines = nbe.split("\n")
    var currentTime = 0
    var returnArray = new Array(2)

    for(var i = 0; i < lines.length; i++){
        if(isResult(lines[i])){
            returnArray.push(parseNessusResult(lines[i]))
        }
    }
    return returnArray
}

module.exports.parseNessusResult = parseNessusResult;
module.exports.parseNessusTimeStamp = parseNessusTimeStamp;
module.exports.parseNBEFile = parseNBEFile;
