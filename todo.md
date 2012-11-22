NV Issues
==============

### externalizing hierarchy
- If the user does not define groups, do not add groups to the hierarchy 
- Fix the root ("nv") node in the breadcrumbs, make clicking on it redraw the treemap from the root (basically showing the next level in the hierarchy).

### legend
- Add a color legend that changes based on if we're looking single or comparing nbe files

### deployment
- Create a github page for nv 

### aesthetics
- On mouseover, use fill instead of stroke 
- Trigger text-fix on any redraw (for some reason only is applied during transitions now).

### interaction
- on treemap mouseover, emit the id/port/ip label; this means removing the 'at the bottom' function in the treemap view 

### bugs
- if you're low in the hierarchy (e.g. IP level) and you click the treemap resize, artifacts (looks like an extra div?) appear to the right of the treemap. 
- assigning a criticality/weight to individual machines has no effect.
- IPs should be in order on 'groups' tab
- some way to remove groups
- checking that groups don't overlap, how to handle if they do
- set weight to 0/'ignore' to remove machines from results?
