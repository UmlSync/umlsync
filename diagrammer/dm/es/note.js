/**
  *  
  */
//@aspect
(function( $, dm, undefined ) {

dm.base.diagram("es.note", dm.es.element, {
    'options': {
        'width': 200,
        'height': 76,
        'nameTemplate': "Note"
    },
    '_create': function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="us-note us-element-resizable-area grElement">\
                        <a class="editablefield Name">' + this.options['name'] + '</a>\
                        <img src="./images/corner.png" class="us-note-corner">\
    </div>';
      $("#" + this['parrent'].euid).append(this.innerHtml);
      this.element = $("#"  + this.euid);
    }
});
//@aspect
})(jQuery, dm);
