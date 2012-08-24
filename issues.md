NV Issues
==============

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
One of the VizSec paper reviewers suggested that a node link diagram could be appropriate for this data. 
With a large number of machines, a node link diagram is a terrible idea.
However, node link diagrams could show useful information about a machine's neighbors, provided this information is available.
With this in mind, we should consider adding a node-link diagram to the right of the treemap display.
This node link diagram would show a focus machine in the center, with all of its neighbors surrounding it, and their relative vulnerabilities.
Interaction in the node-link view supports the use case of focusing on a node, and examining the vulnerabilities in its immediate neighbors.
Switching focus to a neighbor will change the treemap (focusing on a different node), as well as the node link diagram.
