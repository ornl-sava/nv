### System Design

The goal of nv is to support the sysadmin's understanding of vulnerabilities in their network by combining the results of a Nessus scan in raw format and (optionally) a list of critial machines in their network into an interactive visualization. This visualization is designed to support common workflows in vulnerability discovery, analysis, and mitigation. Some of these are described in the Case Studies sections. This section covers the visualization and interaction design.

#### Data
Nessus data in detail


#### Use Case
The primary goal of the system

The main questions sysadmins are able to answer with nv are as follows:
-
-
-

#### Visualization and Interaction
Nv consists of multiple coordinated views including a treemap, several histograms, and a detail-information area showing information on the selected Nessus id. Each of these are designed to support a specific aspect of the vulnerability analysis workflow

Our primary visualization is a zoomable treemap (TODO cite). We chose to use a treemap over other hierarchical visualization methods such as network/tree-layouts for several reasons. First, our goal with nv is to support the analysis of Nessus scans on large networks. While information on the network topology is useful for vulnerability analysis, it is important to note that in large dynamic networks, a complete network topology is often either unavailable or too large to be visualized directly. The space-filling aspects of treemaps make them more scalable in this regard. Another reason we used treemaps was for their ability to effectively make use of both size and color for encoding data attributes.

Since Nessus data is not stored in a hierarchical form by default, it could be visualized using many multi-dimensional visualization techniques, such as parallel coordinates or scatterplot matrices. However, because the scalability of the visualization was a primary concern, we opted to nest the data from individual vulnerabilities and ports up to IPs and groups of IPs. 

We also use data-accumulation and coloring methods to ensure that data is not obscured by the hierarchy. For instance, when comparing two Nessus scans, nodes are colored by the maximum count of issue states (fixed, open, or new issues) in their child nodes. A potential disadvantage of this approach is that a node could contain sligthly more fixed issues than open issues, and yet will still be colored green. To alleviate this problem, we add the option to split the nodes by issue-state higher in the hierarchy. Both options are shown in figure (TODO make figure). 

The advantage to separating issue-states higher is that the analyst can explore only the fixed issues or only the open issues. However, the disadvantage of this approach is that the IPs are then separated since they can appear in any branch of the hierarchy (fixed, open, and new). To our knowledge, there exists no widely accepted visual technique that can effectively represent multiple attributes at every level in a treemap. However, we plan to explore other common approaches such as glyphs and combined color scales in future versions of nv. 

Since analysts can specify the criticality of both individual machines and groups of machines in nv, the treemap includes sizing by criticality as an option. The most critical machines therefore appear as larger nodes, while still being colored by severity. Other sizing options include severity (the default) and by issue counts. Dual encoding severity with both color and size can be useful, as the darkest colored and largest nodes appear at the top left in each level of the histogram.

The color scales in the treemap were created using ColorBrewer2 (TODO cite). While the primary color scales shown in the paper are designed to have semantic meanings (green for fixed, red for new, orange for open), we also include a colorblind-safe version, which is shown in figure (TODO figure). 

Nv includes several histograms, including issue-type (note, hole, or open port), severity (CVSS score), top Nessus note ids, and top Nessus hole ids. These histograms serve dual purposes, as both overviews of the data and as filters by which sysadmins may guide their analysis. For instance, by brushing over the highest values in the severity histogram, the appropriate nodes in the treemap are highlighted. This works by examining each child of each element in the current level of the hierarchy. Another use of the histograms is to easily highlight the most commonly occuring issues in the network. A possible drawback of this approach is that sometimes the least common issues can be the most damaging. However, this issue is mitigated by the fact that the treemap can be be sized and colored by severity, which makes the most damaging issues easy to find. 

NessusInfo

Data input (grouping)

Modification


#### Implementation

no server-side, d3, jquery, crossfilter

One significant requirement for this project was to not unnecessarily disclose the Nessus scan results to any third parties; because this information would be very valuable to any attacker, the users of this tool would have an obvious concern to prevent its disclosure. To address this concern, the NV tool runs entirely in the browser client, without relying on any server-side functionality, and without loading any non-local resources. We were able to achieve this in a highly scalable implementation by combining several existing components, including the crossfilter data model library and the d3 library for data-driven DOM manipulation. We also developed a custom parser for the .nbe files, which also handles this task in the browser. For additional peace-of-mind to any users, the entire technology stack is open source, and the NV tool itself will also soon be open sourced.(TODO make less 'meh')

One difficulty caused by the requirement of not leaking scan results was how to look up additional details about the results. Nessus provides an interface to access significant additional information about any specific vulnerability ID, including useful details such as related CVE and Bugrtaq IDs, and information about how to patch or otherwise address each issue. However, using this directly could still give an adversary significant information; if they could observe any of this traffic, then they could still learn which vulnerabilities are present. To address this, we build a local cache of this information, which the client can access offline. (TODO presumably we won't be open-sourcing this part, heh. I guess that's obvious enough that we don't need to say it...)

The main treemap and the histograms were created using the d3 library (TODO cite), for "apply[ing] data-driven transformations" to the Document Object Model (DOM).  D3 is fast, flexible, and supports large datasets, which were our main requirements. (TODO elaborate?  Should we maybe say that it's awesome but also a pain?  Not sure where to go with this ...)

The crossfilter library (TODO cite), designed for accessing "large multivariate datasets in the browser", was used to store and access our Nessus scan results and all related information about the machines and subnets on the network.  (TODO same issue as above.)

As with everything, jquery was used for massive convenience when manipulating elements and such. (TODO what else can we actually say about it?)


