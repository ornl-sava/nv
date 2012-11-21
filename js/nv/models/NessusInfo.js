var NessusInfo = Backbone.Model.extend({
    
  initialize: function() {
    this.get('app').on('nessusIDSelected', function(msg){
      this.updateData(msg);
    }, this);

    // respond to a mouseover on histogram
    this.get('app').on('histogramMouseover', function(msg){

      // if note, say so, same for hole; ignore otherwise
      if( msg.chart.indexOf('note') != -1){
        this.updateData({vulntype: 'note', vulnid: msg.label});
      } else if( msg.chart.indexOf('hole') != -1){
        this.updateData({vulntype: 'hole', vulnid: msg.label});
      }

    }, this);
    
    var model = this;
    // load vulnerability ids
    $.get("data/vulnIDs.json", function(data) {
      model.set('vulnIdInfo', data);
    });
    
  },

  updateData: function(info){
    var nodeInfo = {
      id:     info.vulnid, 
      type:   info.vulntype, 
      port:   info.port, 
      ip:     info.ip, 
      group:  info.group
    };

    var vulnInfo = this.get('vulnIdInfo')[info.vulnid];
    this.set('data', {nodeInfo: nodeInfo, vulnInfo: vulnInfo});
  }
});
