var NessusInfoView = Backbone.View.extend({

  initialize: function() {
    // render on model update
    this.model.on('change:data', this.render, this);
  },

  render: function(){
    var data = this.model.get('data');

    var div = $(this.options.target)
      , nodeInfo = data.nodeInfo
      , idData = data.vulnInfo;

    // TODO do this with d3 instead
    div.html('<hr><p>');
    if(nodeInfo){
      if(nodeInfo.type == 'hole')
        div.append("Security Hole"+ '<br><br>');
      else
        div.append("Security Note"+ '<br><br>');
      div.append("Group: " + nodeInfo.group + '<br>');
      div.append("Address: " + nodeInfo.ip + '<br>');
      div.append("Port: " + nodeInfo.group + '<br><br>');
      div.append("Nessus ID: " + nodeInfo.id + '<br>');
    }
    div.append("Title: " + idData.title + '<br>');
    if(idData.family && idData.family !== "")
      div.append("Family: " + idData.family + '<br>');
    div.append('<br>');
    if(idData.synopsis && idData.synopsis !== "")
      div.append("Synopsis: " + idData.synopsis + '<br><br>');
    if(idData.description && idData.description !== "")
      div.append("Description: " + idData.description + '<br><br>');
    if(idData.updateInfo && idData.updateInfo !== "")
      div.append("UpdateInfo: " + idData.updateInfo + '<br><br>');
    if(idData.solution && idData.solution !== "")
      div.append("Solution: " + idData.solution);
    /* //TODO deal with these later.
    div.append("bugtraqList: "   + idData.bugtraqList);
    div.append("cveList: "       + idData.cveList);
    div.append("otherInfoList: " + idData.otherInfoList);
    */
    div.append('</p>');

  }
});
