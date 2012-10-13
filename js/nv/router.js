// The router is our entire app
var NV = new (Backbone.Router.extend({
  routes: {
    "": "index"
  },

  // instantiate/link views and models
  initialize: function(){
    // the crossfilter holder
    this.nessus           =  new Nessus({
                             dimensions: [ 'ip', 
                                           'port',
                                           'cvss',
                                           'vulnid',
                                           'vulntype']
                           });

  // models and views

    // cvss (severity) histogram
    
    this.cvssHistogram        =   new Histogram({  
                                  app: this,
                                  datasource: this.nessus, 
                                  bins: 10, 
                                  filterOptions: { attribute:'cvss' }
                               });

   this.cvssHistogramView    =   new HistogramView({
                                 app: this,
                                 model: this.cvssHistogram,
                                 target:'#cvssHistogram',
                                 barwidth: 15,
                                 w: 180,
                                 h: 165,
                                 title: ['cvss']
                              });

    // vulnerability type histogram

      // NOTE: This is a hack to make categorical histograms.
      // If d3 somehow supports non-numerical histograms, we can remove this
      // and lighten the histogram model considerably.
      var vulnTypeMap = d3.scale.ordinal()
          .domain(['hole', 'port', 'note'])
          .range([1,2,3]);

      this.vulnTypeHistogram  =   new Histogram({  
                                  app: this,
                                  datasource: this.nessus, 
                                  bins: 3, 
                                  datamap: vulnTypeMap,
                                  filterOptions: {
                                    attribute: 'vulntype'
                                  }
                              });

      this.vulnTypeHistogramView    =   new HistogramView({
                                 app: this,
                                 model: this.vulnTypeHistogram,
                                 target:'#vulnTypeHistogram',
                                 barwidth: 15,
                                 w: 100,
                                 h: 165,
                                 title: ['vuln type']
                              });

    // top notes histogram

    this.topNoteHistogram    =   new Histogram({  
                                  app: this,
                                  datasource: this.nessus, 
                                  limit: 5,
                                  filterOptions: {
                                    attribute: 'vulnid',
                                    filters: [
                                      { attribute:'vulntype', exact:'note' }
                                    ]
                                  }
                               });

    this.topNoteHistogramView    =   new HistogramView({
                                  app: this,
                                  model: this.topNoteHistogram,
                                  target:'#topNoteHistogram',
                                  barwidth: 25,
                                  w: 180,
                                  h: 165,
                                  title: ['top notes']
                               });
 
    // top holes histogram

    this.topHoleHistogram    =   new Histogram({  
                                  app: this,
                                  datasource: this.nessus, 
                                  limit: 5,
                                  filterOptions: {
                                    attribute: 'vulnid',
                                    filters: [
                                      { attribute:'vulntype', exact:'hole' }
                                    ]
                                  }
                              });

    this.topHoleHistogramView    =   new HistogramView({
                                     app: this,
                                     barwidth: 25,
                                     model: this.topHoleHistogram,
                                     target:'#topHoleHistogram',
                                     w: 180,
                                     h: 165,
                                     title: ['top notes']
                                });


    // treemap

    // info view

  },

  // called from outside the app
  start: function(){
    Backbone.history.start();
  }

}))();
