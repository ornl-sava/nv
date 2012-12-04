var NessusInfoView = Backbone.View.extend({

  initialize: function() {
    // render on model update
    this.model.on('change:data', this.render, this);
  },

  render: function(){
    var data = this.model.get('data');

    var div = $(this.options.target);

    div.html('<hr><p>');

    div.append("ID: " + data.vulnid + '<br>');

    div.append("Title: " + data.title + '<br>');

    if(data.family && data.family !== "")
      div.append("Family: " + data.family + '<br>');
      
    div.append('<br>');

    if(data.synopsis && data.synopsis !== "")
      div.append("Synopsis: " + data.synopsis + '<br><br>');

    if(data.description && data.description !== "")
      div.append("Description: " + data.description + '<br><br>');

    if(data.updateInfo && data.updateInfo !== "")
      div.append("UpdateInfo: " + data.updateInfo + '<br><br>');

    if(data.solution && data.solution !== "")
      div.append("Solution: " + data.solution);

   //TODO deal with these later.
   //div.append("bugtraqList: "   + data.bugtraqList);
   //div.append("cveList: "       + data.cveList);
   //div.append("otherInfoList: " + data.otherInfoList);

    div.append('</p>');
  }
});
