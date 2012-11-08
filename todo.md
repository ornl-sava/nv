NV Issues
==============

- Hide text in Treemap nodes when they are too small for the full IP
- Put the dynamic info area in a scroll box
- Clicking an active filter removes it (set no filter)
- On mouseover, use fill instead of stroke 
- Add a color legend that changes based on if we're looking single or comparing nbe files
- If a user switches from the group go vis view multiple times, the histograms can end up overlapping. 
- If the user does not define groups, do not add groups to the hierarchy 
- Create breadcrumbs view for the hierarchy-levels in the treemap
- Allow users to drag and drop the hierarchy
- Create a github page for nv 

- if you're low in the hierarchy (e.g. IP level) and you click the treemap resize, artifacts (looks like an extra div?) appear to the right of the histogram. 

1. Sometimes the label for the largest square will not render.
    * This bug is difficult to reproduce.
    * It seems to pop up when One square dominates the tree map such as when one
    group has a far higher criticality score than the others.
2.  Tree map disappears if you switch from the vis tab to the groups tab and
    back again.

- When a treemap node is small, the title (usually IP), can overlap with other nodes. The label should change based on node size (smaller, less text such as nixing 192.168, etcetera).
- When running comparisons, a key showing what the colors mean needs to appear.
- Any mouseover should change some information in some part of the page (useful for scanning).

### neighbor network
With a large number of machines, a node link diagram is a terrible idea.
However, node link diagrams could show useful information about a machine's neighbors, provided this information is available.
With this in mind, we can consider adding a node-link diagram to the right of the treemap display.
This node link diagram would show a focus machine in the center, with all of its neighbors surrounding it, and their relative vulnerabilities.
Interaction in the node-link view supports the use case of focusing on a node, and examining the vulnerabilities in its immediate neighbors.
Switching focus to a neighbor will change the treemap (focusing on a different node), as well as the node link diagram.

### hierarchy changes via gui
Different hierarchy arrangements support different use cases.
To support this further, we could have a simple drag and drop hierarchy arrangement area in the gui, which changes how the treemap aggregates are computed.

### Non-critical bugs:

- assigning a criticality/weight to individual machines has no effect.
- IPs should be in order on 'groups' tab
- some way to remove groups
- checking that groups don't overlap, how to handle if they do
- set weight to 0/'ignore' to remove machines from results?
- some way to hide the second data tab, and go back to only one nbe file
