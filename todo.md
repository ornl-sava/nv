NV Issues
==============

### externalizing hierarchy
- Create breadcrumbs view for the hierarchy-levels in the treemap
- If the user does not define groups, do not add groups to the hierarchy 
- Allow users to drag and drop the hierarchy

### legend
- Add a color legend that changes based on if we're looking single or comparing nbe files

### deployment
- Create a github page for nv 

### aesthetics
- On mouseover, use fill instead of stroke 

### bugs
- if you're low in the hierarchy (e.g. IP level) and you click the treemap resize, artifacts (looks like an extra div?) appear to the right of the treemap. 
- assigning a criticality/weight to individual machines has no effect.
- IPs should be in order on 'groups' tab
- some way to remove groups
- checking that groups don't overlap, how to handle if they do
- set weight to 0/'ignore' to remove machines from results?
- some way to hide the second data tab, and go back to only one nbe file
