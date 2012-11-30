NV Issues
==============

### externalizing hierarchy
- If the user does not define groups, do not add groups to the hierarchy 
- Fix the root ("nv") node in the breadcrumbs, make clicking on it redraw the treemap from the root (basically showing the next level in the hierarchy).
- Hierarchy list elements need some kind of visual indication that they can be dragged

### legend
- Add a color legend that changes based on if we're looking single or comparing nbe files

### deployment
- Create a github page for nv 

### aesthetics
- On mouseover, use fill instead of stroke 

### interaction
- the reset button on the data page should reload the page (until groups is ported to backbone)

### bugs
- assigning a criticality/weight to individual machines has no effect.
- IPs should be in order on 'groups' tab
- some way to remove groups
- checking that groups don't overlap, how to handle if they do
- set weight to 0/'ignore' to remove machines from results?
