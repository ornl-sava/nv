// The router is our entire app
var NV = new (Backbone.Router.extend({
  routes: {
    "": "index",
    "test": "testRoute"
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

//  // the models + views
//    // cvss (severity) histogram
    this.cvssHistogram        =   new Histogram({  
                                  app: this,
                                  datasource: this.nessus, 
                                  attribute: 'cvss'
                               });

    this.cvssHistogramView    =   new HistogramView({
                                  app: this,
                                  model: this.cvssHistogram,
                                  target:'#cvssHistogram',
                                  range: [0.0, 10.0],
                                  numBins: 10,
                                  barWidth: 15,
                                  w: 180,
                                  h: 165,
                                  title: ['cvss distribution'],
                                  labels: ['0', '1', '2', '3', '4'
                                          ,'5', '6', '7', '8', '9']
                               });
    
    // top notes
    // top holes
    // type
    // treemap
    // info
  },

  // routing functions
//  testRoute: function(){
//    console.log('route successful');
//  },

  // called from outside the app
  start: function(){
    Backbone.history.start();
  }

}))();
