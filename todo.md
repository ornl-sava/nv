nv issues
==============
### bugs
- on testNetworkOpen.nbe, in Top holes there is a bin that gets no data. There should be a temporary workaround in the histogram model.

### deployment

### aesthetics
- add mouseover help as in jgoodall.github.com/cinevis
  - for legacy.js: https://github.com/jgoodall/cinevis/blob/master/web/js/script.js#L456
  - for index.html: https://github.com/jgoodall/cinevis/blob/master/web/index.html#L51 

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
- rewrite width like this: http://groups.google.com/forum/?fromgroups=#!topic/d3-js/n-UDJQfuHlI 
- make script and instructions to install this beside Nessus
- consider a post on using grep with nv
