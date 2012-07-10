# Vulnerability Visualization

Nessus data - VAST 2011

## Use Case 1: State of vulnerabilities network
Visualization of state of a network in terms of vulnerabilities.
Zoomable treemap
* Hierarchy - network, groupings, IPs, port, vulnerability
* Size - leaf nodes number of vulnerabilities, optionally weighted by user-defined machine criticality or CVSS severity score
* Color - open port, security note (no score), vulnerable port (scale for max cvss score)

User defined groupings: label, nodes, importance/criticality score. If a machine is not in a group, put it in the default 'other' group. Ideally, should be able to drag/drop a node onto another node or group to put into that group. For now, ok to just have a text box like: group - subnet

### Interaction:
* Zoom - click on interior node to zoom to next level
* Details - click on leaf node to get details [using nessus API](http://www.nessus.org/plugins/index.php?view=single&id=42118/)

### UI Widgets: Size 
* Weight by Severity (cvss scores)
* Weight by Criticality
* Weight by number of notes/holes per port

### Filters:
* Security Hole Vulnerability Type
* Security Note Vulnerability Type
* Severity

Filters will remove nodes that do not match the current filter. When removing nodes, try animate transitions.


### Design decisions

* use count/severity for size/color - why? 
* how to color groupings???

### CVSS
[CVSS](https://nvd.nist.gov/cvss.cfm)

NVD provides severity rankings of "Low," "Medium," and "High" in addition to the numeric CVSS scores
but these qualitative rankings are simply mapped from the numeric CVSS scores:
1. Vulnerabilities are labeled "Low" severity if they have a CVSS base score of 0.0-3.9.
2. Vulnerabilities will be labeled "Medium" severity if they have a base CVSS score of 4.0-6.9.
3. Vulnerabilities will be labeled "High" severity if they have a CVSS base score of 7.0-10.0. 


## Use Case 2: Change between scans
Visualization of changes between two scans.

### Changes
From: http://seccubus.com/seccubus/about-seccubus

* New - Finding was detected for the first time
* Open - Finding was previously detected and has not been altered by the user
* Changed - Flinging has changed since it was last detected. This status remains until it is changed by the user
* No Issue - The finding does not pose any security risk and will remain this status until it changes. If the finding changes it will be marked as changed.
* Gone - The finding had been found in a previous run, but has done been fixed in this run.
* Fixed - The finding has been fixed and should not reappear. If this finding reappears it will be marked as changed.
* Hard Masked - The finding is bogus and will not leave this status unless the user changes it.


# TODO:
* John - ask IT if they have nessus data we can use
* Mike - find data with more than one scan of the same network
* Riley - develop a parser from .nbe -> JSON (in js on client)
* John - set up scaffolding for web server
* Mike/John - develop web server as necessary
* Lane - develop state vis zoomable treemap
* Lane - develop change vis treemap - use colors
* All - write the damn paper

## TODO Paper
* Lane - Intro/Motivation
* Lane - Related work in vulnerability visualization
* Mike/Riley - Related work in security vulnerability analysis
* System design
* Use cases
* Conclusion
