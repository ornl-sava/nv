### System Design

The goal of nv is to support the sysadmin's understanding of vulnerabilities in their network by combining the results of a Nessus scan in raw format and (optionally) a list of critial machines in their network into an interactive visualization. This visualization is designed to support common workflows in vulnerability discovery, analysis, and mitigation. Some of these are described in the Case Studies sections. This section covers the visualization and interaction design.

#### Data
Nessus data in detail


#### Use Case
The primary goal of nv is to support sysadmins in identifying and analyzing vulnerabilities in their network, information which they may then use to better prioritize their (often) limited resources.
Specifically, the main questions nv seeks to answer are as follows:

- What vulnerabilities are most common across the network?
- What machines or groups have the most severe vulnerabilities?
- Are critical machines are vulnerable?

#### Visualization and Interaction
Nv consists of multiple coordinated views including a treemap, several histograms, and a detail-information area showing information on the selected Nessus id. Each of these are designed to support a specific aspect of the vulnerability analysis workflow

Our primary visualization is a zoomable treemap (TODO cite). We chose to use a treemap over other hierarchical visualization methods such as network/tree-layouts for several reasons. First, our goal with nv is to support the analysis of Nessus scans on large networks. While information on the network topology is useful for vulnerability analysis, it is important to note that in large dynamic networks, a complete network topology is often either unavailable or too large to be visualized directly. The space-filling aspects of treemaps make them more scalable in this regard. Another reason we used treemaps was for their ability to effectively make use of both size and color for encoding data attributes.

Since Nessus data is not stored in a hierarchical form by default, it could be visualized using many multi-dimensional visualization techniques, such as parallel coordinates or scatterplot matrices. However, because the scalability of the visualization was a primary concern, we opted to nest the data from individual vulnerabilities and ports up to IPs and groups of IPs. 

We also use data-accumulation and coloring methods to ensure that data is not obscured by the hierarchy. For instance, when comparing two Nessus scans, nodes are colored by the maximum count of issue states (fixed, open, or new issues) in their child nodes. A potential disadvantage of this approach is that a node could contain sligthly more fixed issues than open issues, and yet will still be colored green. To alleviate this problem, we add the option to split the nodes by issue-state higher in the hierarchy. Both options are shown in figure (TODO make figure). 


**Screen shot of state_issue here**
![Alt Text](screenshots/state_issue.png)

The advantage to separating issue-states higher is that the analyst can explore only the fixed issues or only the open issues. However, the disadvantage of this approach is that the IPs are then separated since they can appear in any branch of the hierarchy (fixed, open, and new). To our knowledge, there exists no widely accepted visual technique that can effectively represent multiple attributes at every level in a treemap. However, we plan to explore other common approaches such as glyphs and combined color scales in future versions of nv. 

Since analysts can specify the criticality of both individual machines and groups of machines in nv, the treemap includes sizing by criticality as an option. The most critical machines therefore appear as larger nodes, while still being colored by severity. Other sizing options include severity (the default) and by issue counts. Dual encoding severity with both color and size can be useful, as the darkest colored and largest nodes appear at the top left in each level of the histogram.

The color scales in the treemap were created using ColorBrewer2 (TODO cite). While the primary color scales shown in the paper are designed to have semantic meanings (green for fixed, red for new, orange for open), we also include a colorblind-safe version, which is shown in figure (TODO figure). 

**Screen shot of cb here**
![Alt Text](screenshots/cb_version_both.png)

Nv includes several histograms, including issue-type (note, hole, or open port), severity (CVSS score), top Nessus note ids, and top Nessus hole ids. These histograms serve dual purposes, as both overviews of the data and as filters by which sysadmins may guide their analysis. For instance, by brushing over the highest values in the severity histogram, the appropriate nodes in the treemap are highlighted. This works by examining each child of each element in the current level of the hierarchy. Another use of the histograms is to easily highlight the most commonly occuring issues in the network. A possible drawback of this approach is that sometimes the least common issues can be the most damaging. However, this issue is mitigated by the fact that the treemap can be be sized and colored by severity, which makes the most damaging issues easy to find. The histograms also operate in as conjunction (AND), meaning that the sysadmin can specify queries such as all issues of type hole with severity of 5 or greater.

The Nessus information area is updated when the sysadmin drills down to the level at which Nessus issue-identification numbers are shown. The area then updates with detailed information about the currently selected Nessus id, including a synopsis, detailed description, vulnerability family, and solution (when available). Based on this information, the sysadmin has the option to mark the vulnerability as either fixed or as a non-issue, which re-colors the node in the treemap. This functionality is intended to serve as a way for analysts to avoid revisiting issues that have been addressed. 

#### Implementation
Nv is implemented in Javascript. The d3.js toolkit is used as the basis for the visualizations and interaction. Crossfilter.js, an in-memory data structure for Javascript, is used to manage datasets in an efficient manner. Finally, the Nessus to JSON parsing and change-detection was developed for nv. (TODO citations for these libs).

One crucial feature of nv is that everything was designed to avoid sending sensitive Nessus scans to servers. Our implementation therefore runs completely in the browser.
