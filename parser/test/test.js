var parseNessusResult = require("../src/parser").parseNessusResult
var parseNessusTimeStamp = require("../src/parser").parseNessusTimeStamp
var assert = require("assert")
var sys = require("util")

suite('Nessus Parse', function(){

    test("Nessus1", function(){
        var n1 = "results|127.0.0|127.0.0.1|general/tcp|19506|Security Note|Synopsis :\n\nInformation about the Nessus scan.\n\nDescription :\n\nThis script displays, for each tested host, information about the scan itself :\n\n - The version of the plugin set\n - The type of plugin feed (HomeFeed or ProfessionalFeed)\n - The version of the Nessus Engine\n - The port scanner(s) used\n - The port range scanned\n - Whether credentialed or third-party patch management    checks are possible\n - The date of the scan\n - The duration of the scan\n - The number of hosts scanned in parallel\n - The number of checks done in parallel\n\nSolution :\n\nn/a\n\nRisk factor :\n\nNone\n\nPlugin output :\nInformation about this scan : \n\nNessus version : 5.0.1\nPlugin feed version : 201206261238\nType of plugin feed : HomeFeed (Non-commercial use only)\nScanner IP : 127.0.0.1\nPort scanner(s) : netstat \nPort range : default\nThorough tests : no\nExperimental tests : no\nParanoia level : 1\nReport Verbosity : 1\nSafe checks : yes\nOptimize the test : yes\nCredentialed checks : yes\nPatch management checks : None\nCGI scanning : disabled\nWeb application tests : disabled\nMax hosts : 80\nMax checks : 5\nRecv timeout : 5\nBackports : Detected\nAllow post-scan editing: Yes\nScan Start Date : 2012/6/26 15:01\nScan duration : 244 sec\n\n\n";
        
        var obj = parseNessusResult(n1);

        assert(obj["port"] === -1)
        assert(obj["ip"] === "127.0.0.1")
        assert(obj["holeNote"] === "Security Note")
        assert(obj["code"] === 19506)
        assert(obj["cvssScore"] === 0)
    });

    test("Nessus2", function(){
        var n2 = "results|192.168.2|192.168.2.99|general/tcp|10180|Security Note|Synopsis :\n\nIt was possible to identify the status of the remote host (alive or dead)\n\nDescription :\n\nThis plugin attempts to determine if the remote host is alive using one or more\nping types :\n\n  - An ARP ping, provided the host is on the local subnet\n    and Nessus is running over ethernet.\n\n  - An ICMP ping.\n\n  - A TCP ping, in which the plugin sends to the remote host \n    a packet with the flag SYN, and the host will reply with\n    a RST or a SYN/ACK. \n\n  - A UDP ping (DNS, RPC, NTP, etc).\n\nSolution :\n\nn/a\n\nRisk factor :\n\nNone\n\nPlugin output :\nThe remote host is considered as dead - not scanning\nThe remote host did not respond to the following ping methods :\n- TCP ping\n- ICMP ping\n\n\n"

        var obj = parseNessusResult(n2);

        assert(obj["port"] === -1)
        assert(obj["ip"] === "192.168.2.99")
        assert(obj["holeNote"] === "Security Note")
        assert(obj["code"] === 10180)
        assert(obj["cvssScore"] === 0)
    });

    test("Nessus3", function(){

        var n3 = "results|192.168.2|192.168.2.175|cifs (445/tcp)|49958|Security Hole|Synopsis :\n\nA library on the remote Windows host has a buffer overflow\nvulnerability.\n\nDescription :\n\nThe remote host has a heap buffer overflow vulnerability in the\nWindows common control library.  This vulnerability can be exploited\nwhen a user visits a specially crafted web page while using a third-\nparty scalable vector graphics (SVG) viewer. \n\nA remote attacker could exploit this by tricking a user into visiting\na maliciously crafted web page.\n\nSolution :\n\nMicrosoft has released a set of patches for Windows 2003, XP, Vista,\n2008, 7, and 2008 R2 :\n\nhttp://www.microsoft.com/technet/security/bulletin/MS10-081.mspx\n\nRisk factor :\n\nHigh / CVSS Base Score : 9.3\n(CVSS2#AV:N/AC:M/Au:N/C:C/I:C/A:C)\n\n\nPlugin output :\n- C:\\WINDOWS\\system32\\Comctl32.dll has not been patched\n    Remote version : 5.82.2900.5512\n    Should be : 5.82.2900.6028\n\n\n\nCVE : CVE-2010-2746\nBID : 43717\nOther references : OSVDB:68549,EDB-ID:15963,MSFT:MS10-081\n"
        var obj = parseNessusResult(n3);

        assert(obj["port"] === 445)
        assert(obj["ip"] === "192.168.2.175")
        assert(obj["holeNote"] === "Security Hole")
        assert(obj["code"] === 49958)
        assert(obj["cvssScore"] === 9.3)
    });

});


suite('TimeStamp Parse', function(){
    test("TimeStamp Test 1", function(){
        var n1 = "timestamps|||scan_start|Mon Apr 11 10:16:19 2011|"
                  parseNessusTimeStamp
        sys.print(parseNessusTimeStamp(n1))
    });
});
