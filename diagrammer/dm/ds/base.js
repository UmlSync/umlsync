/*
 Class: base
        Base diagram type, most diagram doesn't requered any specific changes in the base structures
        that's why there is no needs to duplicate code
 Author:
   Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

 Copyright:
  Copyright (c) 2011 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

 URL:
  umlsync.org/about

 Version:
  2.0.0 (2012-07-12)
*/
(function( $, dm, undefined ) {
    dm.base.diagram("ds.base", dm.ds.diagram, {
        diagramName: "BaseDiagram",
        diagramEventPrefix: "CD",
        'options': {
            'width': 800,
            'height': 500,
            'type': 'base'
        },
        _init: function() {
        }
    });
})(jQuery, window.dm);