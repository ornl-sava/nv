
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
        "code":code,
        "holeNote":holeNote,
        "cvssScore":score,
        "port":port};
}

module.exports.parseNessusResult = parseNessusResult;
