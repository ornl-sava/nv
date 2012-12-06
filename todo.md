nv issues
==============
### bugs
- treemap will not transition in firefox
  - this may be because the text bounding box check does not work in firefox
  - (this also leads to the longer labels not getting changed to "...")

### deployment
- identify the best way to update gh-pages on new versions of master
- make script and instructions to install this beside Nessus
- consider a post on using grep with nv

### aesthetics
- guide user in finding sample files from the start page 
- add cvss score to nessus info

### feedback
- set up a feedback mechanism for users (maybe a short survey with comments?)

nv 1.0 list
--------------
- on mouseover, show both parent and child:
  - this does not currently work since .parent is above all the .child nodes and takes the mouseover hit
- add tipsy (fork john sent)
- add an indicator of where you are on color legend based on mouseover
- rewrite groups page using backbone
- rewrite all the buttons using backbone
- run-nv does not work on ubuntu
- on color scale click, cycle a different scale


