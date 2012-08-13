/*
* 
*/
(function( $, dm, undefined ) {
dm.base.diagram("es.venn", dm.es.element, {
    options: {
        nameTemplate: "Venn",
        opacity: 0.6,
        color: 'purel'
    },
    _create: function() {
      // HTML for class structure creation
      this.innerHtml = '<div id="' + this.euid + '" class="UMLSyncVenn ElementResizeArea">\
       <a class="editablefield" style="text-align:left;position:relative;top:30%">' + this.options.name + '</a></div>';
      $("#" + this.parrent.euid).append(this.innerHtml);
      this.element = $("#" + this.euid);
    }
});
})
( jQuery, dm);