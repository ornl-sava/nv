### System Design

The goal of nv is to support the sysadmin's understanding of vulnerabilities in their network by combining the results of a Nessus scan in raw format and (optionally) a list of critial machines in their network into an interactive visualization. This visualization is designed to support common workflows in vulnerability discovery, analysis, and mitigation. Some of these are described in the Case Studies sections. This section covers the visualization and interaction design.

#### Data
Nessus data in detail


#### Use Case
The primary goal of nv is to support sysadmins in identifying and analyzing vulnerabilities in their network, information which they may then use to better prioritize their (often) limited resources.
Specifically, the main questions nv seeks to answer are as follows:

- What vulnerabilities are most common across the network?
- What machines or groups of machines have the most severe vulnerabilities?
- Which critical machines (to the network) are vulnerable?

#### Visualization and Interaction
Nv consists of multiple coordinated views including a treemap, several histograms, and a detail-information area showing information on the selected Nessus item (id). Each of these views are designed to support a specific aspect of the vulnerability analysis workflow.

Our primary visualization is a zoomable treemap (TODO cite). We chose to use a treemap over other hierarchical visualization methods such as network/tree-layouts for several reasons. First, our goal with nv is to support the analysis of Nessus scans on large networks. While information on the network topology is useful for vulnerability analysis, it is important to note that in large dynamic networks, a complete network topology is often either unavailable or too large to be visualized directly. The space-filling aspects of treemaps make them more scalable in this regard. Another reason we used treemaps was for their ability to effectively make use of both size and color for encoding data attributes.

Since Nessus data is not stored in a hierarchical form by default, it can be visualized using many multi-dimensional visualization techniques, such as parallel coordinates or scatterplot matrices. However, because the scalability of the visualization was a primary concern, we opted to nest the data from individual vulnerabilities and ports up to IPs and groups of IPs. 

We also use data-accumulation and coloring methods to ensure that data is not obscured by the hierarchy. For instance, when comparing two Nessus scans, nodes are colored by the maximum count of issue states (fixed, open, or new issues) in their child nodes. A potential disadvantage of this approach is that a node could contain slightly more fixed issues (colored in green) than open issues (colored in orange), and yet will still be colored green to mislead the user to thinking that a node has mostly fixed issues. To alleviate this problem, we add the option to split the nodes by issue-state higher in the hierarchy. Both options are shown in figure (TODO make figure). 

The advantage to separating issue-states higher is that the analyst can explore only the fixed issues or only the open issues. However, the disadvantage of this approach is that the IPs are then separated since they can appear in any branch of the hierarchy (fixed, open, and new). To our knowledge, there exists no widely accepted visual technique that can effectively represent multiple attributes at every level in a treemap. However, we plan to explore other common approaches such as glyphs and combined color scales in future versions of nv. 

Since analysts can specify the criticality of both individual machines and groups of machines in nv, the treemap includes sizing by criticality as an option. The most critical machines therefore appear as larger nodes, while still being colored differently by severity. Other sizing options include sizing by severity (the default) and by issue counts. Having the node sizes and colors based off of severity can be useful, as the darkest colored and largest nodes appear at the top left in each level of the histogram.

The color scales in the treemap were created using ColorBrewer2 (TODO cite). While the primary color scales shown in the paper are designed to have semantic meanings (green for fixed, orange for open, and purple for new), we also include a colorblind-safe version shown in figure (TODO figure). 

Nv includes several histograms, including issue-type (note, hole, or open port), severity (CVSS score), top Nessus note ids, and top Nessus hole ids. These histograms serve dual purposes, as both overviews of the data and as filters by which sysadmins may guide their analysis. For instance, by brushing over the highest values in the severity histogram, the appropriate nodes in the treemap are highlighted. This works by examining each child of each element in the current level of the hierarchy in the treemap. Another use of the histograms is to easily highlight the most commonly occuring issues in the network. A possible drawback of this approach is that sometimes the least common issues can be the most damaging. However, this issue is mitigated by the fact that the treemap can be be sized and colored by severity, which makes the most damaging issues easy to find. The histograms also operate in conjunction (such as the boolean AND does), meaning that the sysadmin can specify to see only specific issues such as all issues containing type hole with severity of 5 of greater.

The Nessus information area is updated when the sysadmin arrives at the level at which Nessus issue-identification numbers are displayed. The area then updates with detailed information about the currently selected Nessus id, including a synopsis, detailed description, vulnerability family, and solution (when available). Based on this information, the sysadmin has the option to mark the vulnerability as either a fixed issue or as a non-issue, re-coloring the node in the treemap. This functionality is intended to serve as a way for analysts to avoid revisiting issues that have been addressed in the past. 

#### Implementation
Nv is implemented in Javascript. The d3.js toolkit is used as the basis for the visualizations and interaction. Crossfilter.js, an in-memory data structure for Javascript, is used to manage dataset filtering in an efficient manner. Finally, the Nessus-to-JSON parsing and change-detection was developed for nv. (TODO citations for these libs).

One crucial feature of nv is that everything is designed to avoid sending sensitive Nessus scans to servers. Our implementation runs completely in the browser.
