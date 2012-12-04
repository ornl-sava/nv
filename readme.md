# nv: nessus vulnerability visualization

nv is a tool for visualizing vulnerabilities reported in [Nessus](http://www.tenable.com/products/nessus) scans. 

<img src="/ornl-situ/nv/support/nv.png" width="960" height="500" alt="nessus vulnerability visualization">

nv consists of four main views:

- Zoomable treemap with nodes sized and colored according to their attributes (max CVSS severity, max machine criticality, or accumulated vulnerability count)
- Histograms that summarize scan statistics and act as clickable filters to modify the data shown in the treemap
- Hierarchy view (above the treemap) where items can be dragged and dropped to re-arrange the treemap hierarchy
- Nessus info that shows vulnerability info and possible solutions (updates when a Nessus id is moused over in the treemap or histograms)

## Running

To run nv, you can use the built in script or use your own web server.

To run using the built in script, have [node.js](http://nodejs.org) installed and simply run `run_nv`. If a browser is not launched automatically, go to http://localhost:8000/ in a browser.

To run using your own web server, just start in the current directory. For example, to use [Python's http server](http://docs.python.org/2/library/simplehttpserver.html), run `python -m SimpleHTTPServer 8000` and go to http://localhost:8000/ in a browser.


## License 

nv is freely distributable under the terms of the MIT License.

Copyright (c) UT-Battelle, LLC (the "Original Author")

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS, THE U.S. GOVERNMENT, OR UT-BATTELLE BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
