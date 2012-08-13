/*
Class: DiagramElement, diagram, element and connector. dm.base.diagram implements inheritanse of methods.

Author:
  Evgeny Alexeyev (evgeny.alexeyev@googlemail.com)

Copyright:
  Copyright (c) 2012 Evgeny Alexeyev (evgeny.alexeyev@googlemail.com). All rights reserved.

URL:
  umlsync.org/about

Version:
  2.0.0 (2012-07-12)
*/


var dm = (function( window, undefined ) {

    var dm = {};
    dm.base = {};
    dm.menu = {};
    dm.ds = {};
    dm.cs = {};

    return dm;
})(window);

window['dm'] = dm;

// export namespaces for minifier
dm['base'] = dm.base;
dm['menu'] = dm.menu;
dm['ds'] = dm.ds;
dm['cs'] = dm.cs;
dm['es'] = dm.es;

//@aspect
(function( $, dm, undefined ) {

    //@export:dm.base.diagram:plain
    dm.base.diagram = function( name, base, prototype ) {
        var ns = name.split( "." ),
        fullName = ns[0] + "-" + ns[1],
        namespace = ns[ 0 ],
        name = ns[ 1 ];

        if ( !prototype ) {
            prototype = base;
            base = dm.base.DiagramElement;
        }

        dm = dm || {};
        dm [ namespace ] = dm [ namespace ] || {};
        dm [ namespace ][ name ] = function( options, parrent ) {
            // allow instantiation without initializing for simple inheritance
            if ( arguments.length ) {
                options = options || {};
                if (options['type'] == undefined)
                    options['type'] = name;
                this._createDiagram( options, parrent);
            }
        };

        var basePrototype = new base();

        // TODO: the same options cloning happen in _CreateDiagram method
        basePrototype.options = $.extend( true, {}, basePrototype.options );
        dm [ namespace ][ name ].prototype = $.extend( true, basePrototype, {
            'namespace': namespace,
            diagramName: name,
            diagramEventPrefix: dm[ namespace ][ name ].prototype.diagramEventPrefix || name,
            'diagramBaseClass': fullName
        }, prototype );
    };
    //@print
    
    dm.base.DiagramElement = function( options, parent) {
        // allow instantiation without initializing for simple inheritance
        if ( arguments.length ) {
            this._createDiagram( options, parent);
        }
    } ;

    //@export:dm.base.DiagramElement:plain
    dm.base.DiagramElement.prototype = {
    'options': {
        'editable': true,
        'nameTemplate': 'base'
    },
    _createDiagram: function( options, parent) {
        // extend the basic options
        this.options = $.extend(true, {}, this.options, options);
        //this._setOptions(options); // Extended class could re-define some options setup

        //@proexp
        this.parrent = parent;
        //@proexp
        this.euid = this.options['type'] + dm.ds.diagram.ec;

        if (this.options['name'] == undefined) {
            this.options['name'] = this.options['nameTemplate'] + dm.ds.diagram.ec;
        }
        dm.ds.diagram.ec++;

        // it is responsible for this.element instance creation 
        this._create();
        
        //@overwrite
        this.element = $(this.element);

        if (this.element) {
            // element unique id
            $(this.element).data(this.euid, this );
            this._baseinit();

            var self = this;
            $(this.element).bind("remove." + this.euid, function() {
                self.destroy();
            });

            this._trigger( "create" );

            this._init();
        } else {
            // TODO: change on even to dialog manager !!!
            alert("Please, declare method _create() for diagram element " + this.euid);
        }
    },
    //@proexp
    getDescription: function(key, value) {
        var kv = !(key || value || false);
        var proto = Object.getPrototypeOf(this);
        var item = '{',
        comma = '';
        this._update();
        for (i in this.options) {
            if (this.options[i] != undefined) {
                if (proto.options[i] != undefined) {
                    if ((proto.options[i] != this.options[i]) || (i == 'type')) {
    item += comma + '"' + i + '":"' + this.options[i] + '"';
    comma = ',';
                    }
                } else {
                    var obj = this.options[i];
                    if (obj instanceof Array) {
    var c = '';
    item += comma + '"' + i + '":[';
    comma = ',';
    for (j in obj) {
        // Do not add element if it is not selected
        if (kv || (obj[j].option(key) == value)) {
            if (obj[j] && obj[j].getDescription) {
                item += c + obj[j].getDescription();
            } else {
                //item += c + '{"' + j + '":"' + obj[j] + '"}';
                item += c + '"' +obj[j] + '"';
            }
            c = ',';
        }
    }
    item += ']';
                    } else {
    if (typeof(obj) != 'object') {
        item += comma + '"' + i + '":"' + obj + '"';
        comma = ',';
    }
                    }
                }
            } // this.options[i] != undefined
        }
        item += '}';
        return item;
    },
    //@overwrite
    _update: function() {
    },
    //@proexp
    _getCreateOptions: function() {
        return $.metadata && $.metadata.get( this.element[0] )[ this.euid ];
    },
    //@overwrite
    _create: function(){},
    //@overwrite
    _init: function(){},
    //@overwrite
    _baseinit: function(){},
    //@overwrite
    _destroy: function(){},
    destroy: function() {
        this._destroy();
        // TODO: handle diagram close
        // This is hack to save diagram on destroy
        if ((this.options['type2'] == 'diagram')
                && (this.options['viewid'])) {
            var data = this.getDescription();
            //alert("destroy " + this.options.fullname);
            var self = this;
            $.ajax({
                type: 'GET',
                url: 'http://localhost:8000/vm/'+ self.options['viewid'] +'/save',
                dataType: 'jsonp',
                data: {'diagram':data, 'path': self.options['fullname'] + ".umlsync", 'description':'Test diagram'},
                success: function(ddd) {alert("DONE COOL !!!!" + ddd);}
            });
        }
        this.element
        .unbind( "." + this.euid )
        .removeData( this.euid );
    },
    //@proexp
    option: function( key, value ) {
        var options = key;

        if ( arguments.length === 0 ) {
            // don't return a reference to the internal hash
            return $.extend( {}, this.options );
        }

        if  (typeof key === "string" ) {
            if ( value === undefined ) {
                return this.options[ key ];
            }
            options = {};
            options[ key ] = value;
        }

        this._setOptions( options );

        return this;
    },
    //@proexp
    _setOptions: function( options ) {
        var self = this;
        $.each( options, function( key, value ) {
            self._setOption( key, value );
        });

        return this;
    },
    //@proexp
    _setOption: function( key, value ) {
        this.options[ key ] = value;
        // TODO: REDIRECT ON inherited function !!!
        return this;
    },
    //@proexp
    _trigger: function( type, event, data ) {
        var callback = this.options[type];

        event = $.Event( event );
        event.type = ( type === this.diagramEventPrefix ?
                type :
                    this.diagramEventPrefix + type ).toLowerCase();
        data = data || {};

        // copy original event properties over to the new event
        // this would happen if we could call $.event.fix instead of $.Event
        // but we don't have a way to force an event to be fixed multiple times
        if ( event.originalEvent ) {
            for ( var i = $.event.props.length, prop; i; ) {
                prop = $.event.props[ --i ];
                event[ prop ] = event.originalEvent[ prop ];
            }
        }

        this.element.trigger( event, data );

        return !( $.isFunction(callback) &&
                callback.call( this.element[0], event, data ) === false ||
                event.isDefaultPrevented() );
    }
    };

    //@print

//@aspect
})(jQuery, dm);

//@aspect
(function( $, dm, undefined ) {

    /**
     * jQuery.dm.base.diagram class.
     * The base class for all diagrams types. It is consist of base div which has
     * canvas, element and connector childs.
     * Options could be overwritten via heritage mehanizm - dm.base.diagram or
     * on diagram creation or via JSON description which provided as argument of
     * constructor
     * \jsonDesc - JSON description of diagram. It could consist of diagram
     *             specific desciption and elements and connectors JSON
     * \parrent  - The parrent element reference, which diagram should be
     *             attached
     */
    //@export:dm.ds.diagram
    dm.base.diagram("ds.diagram", {
        'options': {
        'width': 800,
        'height': 500,
        'nameTemplate': 'diagram',
        'type2': 'diagram' // hack while we do not have project manager
    },
    //@proexp
    _create: function () {
        this.element = $(this.parrent).append('<div id="' + this.euid + '" class="UMLSyncClassDiagram" width="100%" height="100%">\
                <canvas id="' + this.euid +'_Canvas" class="UMLSyncCanvas" width=1300px height=700px>\
                <p> Your browser doesn\'t support canvas</p>\
                </canvas>\
                </div>\
                ');
                this.max_zindex = 100;
                this.canvas = window.document.getElementById(this.euid +'_Canvas');

                // Diagram canvas drop element
                // It is not necessary for regular usage
                // TODO: make it as a separate functionality which glue 
                //       file tree and diagram engine
                var iDiagram = this;
                $("#" + this.euid + "_Canvas").droppable({
                    drop: function( event, ui ) {
                    var source = ui.helper.data("dtSourceNode") || ui.draggable;
                    $.log("source: " + source.data.addClass);
                    if (source.data.addClass == "iconclass" || source.data.addClass == "iconinterface") {
    var key = "",
    separator = "",
    filenode = source,
    isInterface = source.data.addClass == "iconinterface";
    // TODO: Change on isFs (is filesystem resource)
    while ((filenode.data.addClass == 'iconinterface')
            || (filenode.data.addClass == 'iconclass')
            || (filenode.data.addClass == 'namespace')) {
        key = filenode.data.title + separator + key;
        separator = "::";
        filenode = filenode.parent;
    }

    if (iDiagram.options['type'] == "component") {
        var element = $.extend({}, iDiagram.menuIcon.dmb.getElementById((isInterface) ? "Interface":"Component"), {'viewid':source.data.viewid});

        element.pageX = 200;
        element.pageY = 200;
        element.name = key;
        element.filepath = filenode.getAbsolutePath() + "/" + key;
        var ename = iDiagram.Element(element.type, element);
        return;
    }
    if (iDiagram.menuIcon != undefined) {
        var element = $.extend({}, iDiagram.menuIcon.dmb.getElementById("Class"), {'viewid':source.data.viewid});
        if (element != undefined) {
            element.pageX = 200;
            element.pageY = 200;
            element.name = key;
            if (isInterface) element.aux = "interface";
            element.filepath = filenode.getAbsolutePath() + "/" + key;
            var ename = iDiagram.Element(element.type, element);
        }
    } else {
        iDiagram.Element("class", {name:source.data.title, filepath:source.getAbsolutePath(),editable:true,'viewid':source.data.viewid});
    }
                    } else if (source.data.addClass == "diagramclass") {
    // Add sub-diagram to element
    $.eee = ui;
    $.uuu = event;
    iDiagram._dropSubDiagram(source.getAbsolutePath(), event, ui);
                    } else if (source.data.isFs) {
    if (iDiagram.options['type'] == "component") {
        var element = $.extend({}, iDiagram.menuIcon.dmb.getElementById("Component"), {'viewid':source.data.viewid});
        if (element != undefined) {
            var x = element.pageX,
            y = element.pageY;
            element.pageX = 200;
            element.pageY = 200;
            element.name = source.data.title;
            element.filepath = source.getAbsolutePath();
            var ename = iDiagram.Element(element.type, element);   
            return;
        }
    }
    var element = $.extend({}, iDiagram.menuIcon.dmb.getElementById("Package"), {'viewid':source.data.viewid});
    if (element != undefined) {
        var x = element.pageX,
        y = element.pageY;
        element.pageX = 200;
        element.pageY = 200;
        element.name = source.data.title;
        element.filepath = source.getAbsolutePath();
        var ename = iDiagram.Element(element.type, element);   
    }

                    }
                }
                });

                /** Canvas extra functionality handling:
                 *   1. Hide resize GUI helpers on canvas click
                 *   2. Position locator is debug functionality
                 *   3. Mouse Up/Down for connector stransforms perform
                 */
                var diag = this;
                $("#" + this.euid)
                .dblclick(function(e) {
                    e.preventDefault();
                    $.log("DBL CLICK");         
                    e.stopPropagation();

                })
                .click(function(evt) {
                    $.log("clicked");
                    // it could be undefined !!!
                    diag._mouseClick(diag.selectedconntector);
                    /*            
           // Hide elements selectors on click
           //$(".ui-resizable-handle").css({'visibility':'hidden'});

           // Hack to notify about click
           //if (diag.clickedconntector) {
             diag.clickedconntector.selected = false;
           }

           if (diag.selectedconntector) {
             if (diag.clickedconntector != diag.selectedconntector) {
               diag.clickedconntector = diag.selectedconntector;
             }

             diag.selectedconntector.selected = true;

             if (diag.selectedconntector._showMenu)
               diag.selectedconntector._showMenu(x, y, true, diag.selectedconntector);
           } else {
             diag.clickedconntector = undefined;
           }
           this.selectedElement = undefined;
                     */
                    diag.draw();
                    evt.stopPropagation();
                })
                .mousemove(function(e) {  // DEBUG FUNCTIONALITY.
                    var p = $(this).offset(),
                    x = e.pageX - p.left,
                    y = e.pageY - p.top;
                    
                    var status = diag.isPointOnLine(x,y);
                    if (status) {
    //$("#possition_locator").val("X:" + x + "  y:" + y + " on");
    e.stopPropagation();
                    }
                })
                .mouseup(function(e) {
                    var p = $(this).offset(),
                    x = e.pageX - p.left,
                    y = e.pageY - p.top;
                    diag.stopConnectorTransform(x,y);
                })
                .mousedown(function(e) { 
                    var p = $(this).offset(),
                    x = e.pageX - p.left,
                    y = e.pageY - p.top;
                    diag.startConnectorTransform(x,y);
                    if ((diag.selectedconntector)
        && (!dm.dm.fw['CtrlDown'])) {
    diag.selectedconntector._setOption("selected", true);
    e.stopPropagation();
                    }
                })
                .bind('contextmenu', function(e) {
                    if (diag.selectedconntector) {
    diag.menuCtx['HideAll']();
    diag.menuCtx['visit'](diag.selectedconntector, e.pageX , e.pageY);
    $.log("context menu ");
    e.preventDefault();
    diag.multipleSelection = true; // work around to hide connector selection on click
                    }
                });

                // create an empty lists for connectors and elements
                this.connectors = [];
                this.elements = [];

                // For all elements in JSON description try to create an element
                for (i in this.options['elements']) {
                    // How to get options which described in menu JSON ? 
                    this.Element(this.options['elements'][i].type, this.options['elements'][i]);
                }

                // For all connectors in JSON description try to create a connector 
                for (i in this.options['connectors']) {
                    this.options['connectors'][i]['stored'] = true;
                    this.Connector(this.options['connectors'][i]['type'], this.options['connectors'][i]);
                    // TODO: find elements IDs and add connectors between elements
                    //       How to handle use-case when connector created,
                    //                               but element was not creat yet?
                    // TODO: think about queued operations which could be loaded
                    //       sequentially even if one should be loaded but another
                    //       one already exists
                }

                // Perform function on diagram load completion
                dm.base.loader.OnLoadComplete(function() {
                    for (i in diag.elements) {
    var d = diag.elements[i].options['dropped'];
    if (d) {
        diag.elements[i]._dropped = new Array();
        for (ii in d) {
            for (iii in diag.elements) {
                if (diag.elements[iii].options['id'] == d[ii]) {
                    diag.elements[i]._dropped.push(diag.elements[iii].euid);
                    break; // from the neares for
                }
            } // iii
        } // ii
    }
                    } // i
                });

                this.operations = new Array(); // Array of pushed operations to diagram
                this.reverted_operations = new Array(); // Array of reverted operations of diagram

    },
    //@proexp
    _update: function() {
        this.options['connectors'] = this.connectors;
        var i = 0;
        for (r in this.elements) {
            this.elements[r].options['id'] = i;
            i++;
        }
        this.options['elements'] = this.elements;

    },
    //@proexp
    _init: function () {
        // It is necessary to init mouse over listener
        // to detect connections types
    },

    /**
     * \class Function.
     * Create an element with \eid and unique name.
     * Call element load if was not create.
     * \uid Unique element type ID which corresponding to JS class
     * \options Extra options which overwrite base class options 
     * \jsonDesc - JSON which could understand loaded element JS class
     *
     * Note: for now we use ElementLoaded callback method which doesn't
     *       required at all.
     *       TODO: provide ElementLoaded functionality as
     *             argument-function of loader.Element
     */
    //@proexp
     Element: function (type, options, callback) {
        dm.ds.diagram.ec++;
        options = options || {};

        var self = this;
        self.max_zindex++;
        options["z-index"] = self.max_zindex; //options["z-index"] || ();
        $.log("this.options.loader.Element !!!");
        dm.base.loader.Element(type, options, this, function(obj) {
            if (obj != undefined)
                self.elements[obj.euid] = obj;

            if (callback)
                callback(obj);
        });

        // If it is editable diagram
        if (this.options['editable']) {
            // Load the context menu for element
            if ((this.menuCtx != undefined) && (options['ctx_menu'] != undefined))
                // mini
                this.menuCtx['load'](options['ctx_menu']);
            // Load the icons menu for element
            if ((this.menuIcon != undefined) && (options['menu'] != undefined))
                this.menuIcon['load'](options['menu']);
        }

        return options.euid;
    },
    //@proexp
    _setWidgetsOption: function( key, value ) {
        if (key == "selected") {
            this.multipleSelection = value;
            for (i in this.elements)
                this.elements[i]._setOption( key, value );
            for (i in this.connectors)
                this.connectors[i]._setOption( key, value );
        } if (key == "z-index") { // Z-index supported by elements only (not applicable for connectors)
            var newmax = this.max_zindex,
            min_z = undefined,
            max_z = undefined,
            min_not_selected_z = undefined;
            // Identify the minimal z-index in selection
            for (i in this.elements) {
                var r = this.elements[i].option(key);
                if (this.elements[i].option("selected")) {
                    min_z = ((min_z == undefined) || r<min_z) ? r : min_z;
                    max_z = ((max_z == undefined) || r>max_z) ? r : max_z;
                } else
                    min_not_selected_z = ((min_not_selected_z == undefined) || r<min_not_selected_z) ? r : min_not_selected_z;
            }

            if ((min_not_selected_z == undefined) || (min_z == undefined))
                return; // all or nothing selected; nothing to relocate;

            $.log("Min Z-INDEX: " + min_z);
            var flag = (value == "front") ? true : false;
            for (i in this.elements)
                if (this.elements[i].option("selected")) {
                    if (flag) {
    var zi = this.elements[i].option(key) + this.max_zindex - min_z + 1;
    $.log("new Z-INDEX: " + zi + " D: " + this.elements[i].option(key));
    this.elements[i]._setOption( key, zi);
    if (zi >  newmax)
        newmax= zi;
                    }
                } else {
                    if (!flag) {
    var zi = this.elements[i].option(key) - min_not_selected_z + max_z + 1;
    $.log("new2 Z-INDEX: " + zi + " D: " + this.elements[i].option(key));
    this.elements[i]._setOption( key, zi);
    if (zi >  newmax)
        newmax= zi;
                    }
                }
            this.max_zindex = newmax + 1;
        } else {
            for (i in this.elements)
                if (this.elements[i].option("selected"))
                    this.elements[i]._setOption( key, value );
            for (i in this.connectors)
                if (this.connectors[i].option("selected"))
                    this.connectors[i]._setOption( key, value );
        }

        this.draw(); // work-around to re-draw connectors after options update
    },
    /**
     * \class Function.
     * TODO: think about lifeline diagram
     */
    //@proexp
    checkdrop: function(x,y) {
        for (d in this.elements) {
            var p = $("#" + this.elements[d].id + "_Border").position();

            if ((x > p.left) && (x < p.left + 140) && (y > p.top) && (y < p.top + 140))  {
                return this.elements[d].id;
            }
        }
        return undefined;
    },
    /**
     * \class Function.
     */
    //@proexp
     setMenuBuilder: function(type, menu) {
        if (type == "main") {
            //@proexp
            this.menuMain = menu;
        }
        if (type == "context") {
            //@proexp
            this.menuCtx = menu;
        }
        if (type == "icon") {
            //@proexp
            this.menuIcon = menu;
        }

    },
    //@proexp
    removeElement: function(euid) {
        var el = this.elements;
        for (k in el) {
            if (el[k].euid == euid) {
                delete el[k];
                el.splice(k, 1);
                $('#' +  euid + '_Border').remove(); // Think about removal !!!!
                break;
            }
        }

    },
    /**
     * \class Function.
     * remove connector from the list of updatable connectors
     * if fromId or toId is undefined than remove
     * all elements to or from element
     * if both Ids are undefined than remove all connectors
     */
    //@proexp
     removeConnector: function (fromId, toId, type) {
        if (this.connectors.length > 0) {
            for (c in this.connectors) {        
                if (((this.connectors[c].from  == fromId) || (fromId == undefined))
    && ((this.connectors[c].toId == toId) || (toId == undefined))) {
                    for (i in this.connectors[c].lables) {
    this.connectors[c].lables[i].remove();
                    }
                    delete this.connectors[c];
                    this.connectors.slice(c,1);
                }
            }
            this.draw();
        }

    },


    /**
     * \class Function.
     * Load and create a connector instance.
     * TODO: Why we do not use clallback method in that case ?
     *       How to load connector correctly ? 
     *       
     */
    //@proexp
     Connector: function (type, options, callback) {
        // Loader is responsible for connector creation
        var self = this;

        dm.base.loader.Connector(type, options, this, function(connector) {
            if (connector != undefined) {
                self.connectors.push(connector);
                self.draw();
                if (callback)
                    callback(connector);
            }
        });
    },
    //@proexp
    _dropConnector: function(ui) {
        var result = undefined;
        for (i in this.elements) {
            var e = $("#" + this.elements[i].euid + "_Border");
            var p = e.position(),
            w = e.width(),
            h = e.height();

            if ((ui.position.left > p.left)
                    && (ui.position.left < p.left + w)
                    && (ui.position.top > p.top)
                    && (ui.position.top < p.top + h)) {
                result = this.elements[i];
            }
        }
        return result;
    },
    //@proexp
    _dropSubDiagram: function(path, event, ui) {
        var d, z = 0;
        for (i in this.elements) {
            var e = $("#" + this.elements[i].euid + "_Border");
            var p = e.offset(),
            w = e.width(),
            h = e.height();
            $.log("UI: " + ui.position.left + "  " + ui.position.top + "  P:" + p.left + "  " + p.top);
            if ((ui.position.left > p.left)
                    && (ui.position.left < p.left + w)
                    && (ui.position.top > p.top)
                    && (ui.position.top < p.top + h)) {
                if (this.elements[i].option("z-index") > z) {
                    z = this.elements[i].option("z-index");
                    d = this.elements[i];
                }
            }
        }

        if (d != undefined) {
            if (d.options['subdiagram'] != undefined) {
                d.options['subdiagram'] = path;
                $("img#" + d.euid + "_REF").attr('title', path);
                return;
            }
            d.options['subdiagram'] = path;

            var self = this;
            $("img#" + d.euid + "_REF").attr('title', path).click(function() {
                if (path != "")
                    path = '&path=' + path;
                dm.dm.fw['loadDiagram']('http://localhost:8000/vm/cp/getdiagram?' + path +'&project=storageman');
            });
        }
    },
    //@proexp
    _dropElement: function(element, ui) {
        for (i in this.elements) {
            if (this.elements[i].options['acceptdrop']
                    && (this.elements[i].euid != element.euid)) {
                var e = $("#" + this.elements[i].euid + "_Border");
                var p = e.position(),
                w = e.width(),
                h = e.height();

                if ((ui.position.left > p.left)
    && (ui.position.left < p.left + w)
    && (ui.position.top > p.top)
    && (ui.position.top < p.top + h)) {
                    this.elements[i]._dropped = this.elements[i]._dropped || new Array();
                    var notfound = true;
                    for (j in this.elements[i]._dropped) {
    if (this.elements[i]._dropped[j] == element.euid) {
        notfound = false;
        break;
    }
                    }
                    if (notfound)
    this.elements[i]._dropped.push(element.euid);
                } else {
                    for (j in this.elements[i]._dropped) {
    if (this.elements[i]._dropped[j] == element.euid) {
        this.elements[i]._dropped.splice(j,1);
        break;
    }
                    }
                }
            }
        }
    },
    //@proexp    
    onDragStart: function(el, ui) {
        el.onDragStart(ui, true);

        if (this.multipleSelection)
            for (i in this.elements) {
                if (this.elements[i] != el
    && this.elements[i].option("selected")
    && this.elements[i].option("dragStart") == undefined) {
                    this.elements[i].onDragStart(ui);
                }
            }

        for (i in this.connectors)
            if (this.elements[this.connectors[i].from].option("dragStart")
                    && this.elements[this.connectors[i].toId].option("dragStart"))
                this.connectors[i].onDragStart(ui);

    },

    //@proexp
    onDragMove: function(el, ui) {
        for (i in this.elements)
            if (this.elements[i].option("dragStart") != undefined
                    && this.elements[i] != el)
                this.elements[i].onDragMove(ui);
        for (i in this.connectors)
            if (this.connectors[i].option("dragStart"))
                this.connectors[i].onDragMove(ui);
    },
    //@proexp
    onDragStop: function(el, ui) {
        el.onDragStop();
        for (i in this.elements)
            if (this.elements[i].option("dragStart") != undefined
                    && this.elements[i] != el)
                this.elements[i].onDragStop(ui);

        for (i in this.connectors)
            if (this.connectors[i].option("dragStart"))
                this.connectors[i].onDragStop(ui);
    },
    /**
     * \class Function.
     * Clear the canvas rectongle and re-draw
     * all connectors on the Canvas.
     */
    //@proexp
     draw: function() {
        if (this.connectors.length > 0) {
            var ctx = this.canvas.getContext("2d");

            ctx.fillStyle = "#EEEEEE";//"rgba(140,140,140,1)";
            ctx.clearRect(0, 0, 1300, 700);
//            ctx.strokeRect(0, 0, 1000, 500);


            for (c in this.connectors) {
                ctx.lineWidth = 1;

                if (this.connectors[c].options['linewidth'] != undefined) {
                    ctx.lineWidth = this.connectors[c].options['linewidth'];          
                }

                if (this.connectors[c].options['selected']) {
                    ctx.lineWidth += 2;
                    this.connectors[c].redraw(ctx, "blue");
                    ctx.lineWidth -= 2;
                }
                else if (this.selectedconntector == this.connectors[c]) {
                    this.connectors[c].redraw(ctx, "blue");

                }
                else {
                    if (this.connectors[c].options['color'])
    this.connectors[c].redraw(ctx, this.connectors[c].options['color']);
                    else 
    this.connectors[c].redraw(ctx);
                }
            }
            ctx.lineWidth = 1;
        }
    },
    /**
     * \class Function.
     * Check that point is on the line.
     * It is necessary to hightlight connectors on mouseover
     * and it seems that capability of browser is good enought
     * to support such actions
     */
    //@proexp
     isPointOnLine: function(x,y) {
        if (this.connectors.length > 0) {
            if (this.transformStarted == true) {
                this.selectedconntector.TransformTo(x,y);
                this.draw();
                return true;
            }

            for (c in this.connectors) {        
                if (this.connectors[c].isPointOnLine(x,y)) {
                    if (this.connectors[c] != this.selectedconntector) {
    this.selectedconntector = this.connectors[c];
    this.draw();
    if (this.selectedconntector._showMenu != undefined) {
        this.selectedconntector._showMenu(x,y, true);
    }
                    }
                    return true;             
                }
            }
        }

        // Hide selected connector
        // because it is no longer highlited
        if (this.selectedconntector != undefined) {
            if (this.selectedconntector._showMenu != undefined) {
                this.selectedconntector._showMenu(x,y, false);
            }
            this.selectedconntector = undefined;
            this.draw();
        }
        return false;
    },
    /**
     * \class Function.
     * The connector transfomation function.
     */
    //@proexp
     startConnectorTransform: function(x,y) {
        if (this.selectedconntector != undefined) {
            this.transformStarted = true;
            this.selectedconntector.startTransform(x,y);
        }      
    },
    /**
     * \class Function.
     * The connector transfomation function.
     */
    //@proexp
     stopConnectorTransform: function(x,y) {
        if ((this.transformStarted == true)
                && (this.selectedconntector != undefined))
            this.selectedconntector.stopTransform(x,y);
        this.transformStarted = false;
    },
    /**
     * \class Function.
     */
    //@proexp
     _mouseClick: function(refElement) {
        var mtype = (refElement == undefined) ? undefined : refElement.options['menu'];
        var ctrlDown = dm.dm.fw['CtrlDown'];
        this.clickedElement = refElement;

        // Hide all context menus
        if (this.menuCtx)
            this.menuCtx['HideAll']();

        // Nothing to add for multiple selection
        if (ctrlDown) {
            $.log("Ctl Down");
            if (refElement == undefined) {
                $.log("ref element undefined");
                return;
            }

            if ((this.selectedElement != undefined)
                    && (this.selectedElement != refElement)) {
                if (this.menuIcon != undefined)
                    this.menuIcon['Disable'](this.selectedElement);
            }

            if (refElement != undefined) {
                $.log("ref element is: " + refElement.euid + " OPT: " + refElement.option("selected"));
                refElement._setOption("selected", (refElement.option("selected") ? false:true));
            }
            this.multipleSelection = true;
            this.selectedElement = undefined;
            return;
        }

        if (this.multipleSelection) {
            $.log("SET WG OPTIONS");
            this._setWidgetsOption("selected", false);
            this.multipleSelection = false;
        }

        // Do not hide menu if it is the same element
        if ((refElement == undefined) || (this.selectedElement != refElement)) {
            if (this.selectedElement != undefined) {
                this.selectedElement._setOption("selected", false);
            }

            // If element icon menu exists
            if (this.menuIcon != undefined) { 
                // Disable icon menu for the current element
                if (this.selectedElement != undefined)
                    this.menuIcon['Disable'](this.selectedElement);

                if (refElement != undefined) {
                    // Enable menu for the newely selected element
                    if (mtype != undefined) {
    this.menuIcon['Enable'](refElement.euid, mtype, refElement);
                    }
                    this.menuIcon['Show'](refElement.euid, refElement);
                }
            }

            this.selectedElement = refElement;
            if (refElement == undefined)
                return;

            // Hide selected elements and hightlight selected only
            this.selectedElement._setOption("selected", true);
            this.draw();
        }

    },
    //@proexp
    reportOperation: function(operation, euid, before, after) {
        this.operations.push([operation, euid, before, after]);
        this.reverted_operations.splice(0, this.reverted_operations.length);
    },
    //@proexp
    revertOperation: function() {
        var op = this.operations.pop();
        if (op) {
            this.reverted_operations.push(op);
            if (op[0] == "move") {
                $("#" + op[1] + "_Border").css("left", op[2].left).css("top", op[2].top);
            }
        }
    },
    //@proexp
    repeatOperation: function() {
        var op = this.reverted_operations.pop();
        if (op) {
            this.operations.push(op);
            if (op[0] == "move") {
                $("#" + op[1] + "_Border").css("left", op[3].left).css("top", op[3].top);
            }
        }
    }
    });
    
    //@print

//        Global elements counter
//        Entroduced to avoid side-effecst because of
//        incorrectly implemented jquery requests
//@export:dm.es.element
        dm.base.diagram("es.element", {
            'options': {
            'drop': false,
            'nameTemplate': 'Element',
            'width': 140,
            'height': 200,
            'pageY': 140,
            'pageX': 200,
            'selected': false,
            'area': "none"
        },
        /*
    destroy: function() {
      var el = this.parrent.elements;
      for (k in el) {
        if (el[k] == this) {
          delete el[k];
          el.splice(k, 1);
          break;
        }
      }
    },*/
        //@proexp
        _create: function () {
            // if parent element is undefined, do nothing
            // create element at possition which described in jsonDesc
            alert("Could not create virtual element !!!");
        },
        //@proexp
        _update: function() {
            var p = $("#" + this.euid + "_Border").position();
            this.options['pageX'] = p.left;
            this.options['pageY'] = p.top;
            this.options['width'] = $("#" + this.euid + "_Border").width();
            this.options['height'] = $("#" + this.euid + "_Border").height();
            this.options['name'] = $("#" + this.euid + " .Name").html();

            if (this._dropped) {
                this.options['dropped'] = new Array();
                for (i in this._dropped) {
                    this.options['dropped'].push(this.parrent.elements[this._dropped[i]].options['id']);
                }
            }
        },
        //@proexp
        _init: function () {
            if (this.options['height']) {
                $('#' + this.euid)
                .css('width', this.options['width']).css('height', this.options['height']);
                $('#' + this.euid + "_Border").css("width", this.options['width']);
            }

            if (this.options['top'])
                $('#' + this.euid)
                .css('top', this.options['top']);
        },

        /**
         * \class Function.
         *  Initialization of base operations of element:
         *  Wrap with boarder-div, add resizable handlers, css etc
         *  Add the behaviour: editable, draggale, menu hide/show
         *  TODO: refactoring is comming 
         */
         //@proexp
        _baseinit: function() {
            //wrap with border
            var poz = "";
            if ((this.options['pageX'] != undefined)
                    && (this.options['pageY'] != undefined)) {
                poz = " style='top:" +this.options['pageY'] + "px;left:" + this.options['pageX'] + "px;' ";
            }

            $(this.element).wrap('<div id="' + this.euid + '_Border"' + poz + ' class="UMLSyncClassBorder"></div>');

            var parrentClass = this.parrent;
            var self = this;

            var axis111 = this.options['axis'] || false;
            var elmt = $('#' + this.euid  + '_Border').draggable({
                'start': function(event, ui) {
                $.log ("SSSSSSSSSSSSSSTART");
                self.operation_start = {left: ui.position.left, top: ui.position.top};
                parrentClass.onDragStart(self, ui);
            },
            'drag': function(event, ui) {
                parrentClass.onDragMove(self, {left:ui.position.left - self.operation_start.left, top:ui.position.top - self.operation_start.top});
                if (parrentClass != undefined) {
                    parrentClass.draw();
                }
                if (self.$moveit != undefined) {
                    $("#" + self.$moveit).css("left", 200);
                }
            },
            'stop': function(event, ui) {
                if (ui.position.top < 0) {
                    $(this).css("top", 3);
                    ui.position.top = 3;
                }

                if (ui.position.left < 140) {
                    $(this).css("left", 140);
                    ui.position.left = 140;
                }
                $.log("D STOP:" + self.euid);
                parrentClass.onDragStop(self, {left:ui.position.left - self.operation_start.left, top:ui.position.top - self.operation_start.top});

                if (self.options['droppable']) {
                    if (self.parrent != undefined) {
    self.parrent._dropElement(self, ui); 
                    }
                }
                if (self.onDropComplete) {
                    self.onDropComplete();
                }
                self.parrent.reportOperation("move", self.euid, self.operation_start, {left: ui.position.left, top: ui.position.top});
            },
            'scope': self.options['droppable'],
            'axis': axis111
            }) 
            /*{
        start: function(event, ui) {
                 // if this is a connection helper
                 // => add connector to for redrawing 
                 if (self.parrentClass != undefined) {
                     self.parrentClass.startConnection(self.id);
                 }
               },
        drag: function(event, ui) {
            if (parrentClass != undefined) {
               parrentClass.draw();
            }
              },
        stop: function(event, ui) {
                // remove connection helper 
                // create connection it is possible because element should be available yet 
                // TODO: check that connection supported (menu which describe connections should contain such connection declaration !!!!)
                if (self.parrentClass != undefined) {
                     self.parrentClass.stopConnection(self.id);
                }
              }
      }) // draggable completed*/
            // CSS  hack for chnaging view of resizable element "ui-resizable-*-u"
            .resizable({ handles: this.options['resizable_h'] || 'n-u,e-u,s-u,w-u,nw-u,sw-u,ne-u,se-u', alsoResize: '#' + this.euid + '_Border .ElementResizeArea', 
                stop: function() {
                if (self.onResizeComplete) {
                    self.onResizeComplete();
                }
                self.parrent.draw();
            },
            resize: function() {
                if (self.onResizeComplete) {
                    self.onResizeComplete();
                }
                self.parrent.draw();
            }      
            })
            .bind('contextmenu', function(e) {
                e.preventDefault();
                // Check that context menu manager already loaded
                if (self.parrent.menuCtx) {
                    self.parrent.menuCtx['HideAll']();
                    self.parrent.menuCtx['visit'](self, e.pageX , e.pageY);
                }
            })
            .css({'position':'absolute'})
            .css('top', this.options['pageY'])
            .css('left', this.options['pageX']);

            // Hide element resize points which was
            // added on the previous step
            $('#' + this.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'hidden'});

            // enable editable fields
            // if this diagram is editable
            if (this.parrent.options['editable']) {
                $("#" + this.euid + " .editablefield").editable();
            }

            // You need to select element to start DND
            $('#'+this.euid)
            .click(function(e) {
                $.log("clicked element");
                self.parrent._mouseClick(self, self.options['menu']);
                e.stopPropagation();
            })       
            .mouseenter(function (){
                $('#' + this.id +'_Border').css({'border':'3px solid #678E8B'}).animate({left:'-=3px', top:'-=3px'},0);
                $('#' + this.id +'_FS').css({'visibility':'visible'});
                $('#' + this.id +'_REF').css({'visibility':'visible'});
                // Show the  menu if element was selected
                if (self.parrent.menuIcon)
                    self.parrent.menuIcon['Show'](this.id, self);
                //$(".elmenu-" + self.menutype).stop().animate({opacity:"1"});;
            })
            .mouseleave(function (){
                $('#' + this.id +'_Border').css({'border':'0px solid #87CEEF'}).animate({left:'+=3px', top:'+=3px'},0);

                //Check if this.euid is the same as selected
                if (self.parrent.menuIcon)
                    self.parrent.menuIcon['Hide'](this.id);
                //$(".elmenu-" + self.menutype).animate({opacity:"0"});;
//                if (!self.options.selected) {
                $('#' + this.id +'_FS').css({'visibility':'hidden'});
                $('#' + this.id +'_REF').css({'visibility':'hidden'});
//                }
            })
            .append("<img id='" + this.euid + "_REF' title='REFERENCE' src='static/diagrams/images/reference.jpg' class='extreference' style='z-index:99999;visibility:hidden;'></img>")
            .append("<img id='" + this.euid + "_FS' src='static/diagrams/images/fitsize.jpg' class='fitsize' style='z-index:99999;visibility:hidden;'></img>");

            if (this.options['subdiagram']) {
                $("img#" + this.euid + "_REF").attr('title', this.options['subdiagram']).click(function() {
                    var path = self.options['subdiagram'];
                    if (path != "")
    path = '&path=' + path;
                    dm.dm.fw['loadDiagram']('http://localhost:8000/vm/cp/getdiagram?' + path +'&project=storageman');
                });
            }


            if (this.options['color']) 
                this._setOption("color", this.options['color']);

            if (this.options['borderwidth'])
                this._setOption("borderwidth", this.options['borderwidth']);

            if (this.options["font-family"])
                this._setOption("font-family", this.options["font-family"]);

            if (this.options["z-index"])
                $('#'+this.euid + "_Border").css("z-index", this.options["z-index"]);
        },
        //@proexp
        _setOption: function( key, value ) {
            this.options[ key ] = value;
            if (key == "color") {
                $("#" + this.euid).css("background-color", value);
            } else if (key == "borderwidth") {
                $("#" + this.euid).css("border-width", value);
            } else if (key == "font-family") {
                $.log("ff: " + value);
                $("#" + this.euid).css(key, value);
            } else if (key == "selected") {
                if (value)
                    $('#' + this.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'visible'});
                else
                    $('#' + this.euid +'_Border ' + ".ui-resizable-handle").css({'visibility':'hidden'});
            } else if (key == "z-index") {
                $("#" + this.euid + '_Border ').css(key, value);
            }

            return this;
        },
        //@proexp
        onDragStart: function(ui, isbase) {
            if (this.options.dragStart != undefined)
                return;

            for (i in this._dropped)
                this.parrent.elements[this._dropped[i]].onDragStart(ui);

            this.options.dragStart = true;
            if (isbase == undefined) {
                var p = $("#" + this.euid + "_Border").position();
                this.start_operation = {left:p.left, top:p.top};
            }
        },
        //@proexp
        onDragMove: function(ui) {
            if (this.options.dragStart == undefined)
                return;
            if (!this.start_operation)
                alert("THERE IS NO this.start_operation for: " + this.euid + this.options.dragStart);
            $("#" + this.euid + "_Border").css({'left':this.start_operation.left + ui.left, 'top':this.start_operation.top + ui.top});

        },
        //@proexp
        onDragStop: function(ui) {
            if (ui) {
                this.onDragMove(ui);
                if (this.options['droppable']) {
                    if (this.parrent != undefined) {
    this.parrent._dropElement(this, {position: {'left':this.start_operation.left + ui.left, 'top':this.start_operation.top + ui.top}}); 
                    }
                }

            }

            $.log("DSTOP: " + this.euid);
            this.options.dragStart = undefined;
            this.start_operation = undefined;
        }    
        });

        //@print

        dm.ds.diagram = dm.ds.diagram || {}; 
        dm.ds.diagram.ec = 0; 

        //@export:dm.cs.connector
        dm.base.diagram("cs.connector", {
            'options': {
            'selected': false,
            'nameTemplate': 'Connector',
            'ctx_menu': 'connector'
        },
        //@proexp
        addLable: function(text, x, y) {
            this.lables.push($("<div style=\"position:absolute;z-index:99999;\">" + text + "</div>").appendTo("#" + this.parrent.euid).css("left", x).css("top", y).draggable().editable());
        },
        //@proexp
        getDescription: function() {
            var item = '{',
            fromId = this.parrent.elements[this.options['fromId']].options['id'],
            toId = this.parrent.elements[this.options['toId']].options['id'];

            item += '"type":"' + this.options['type'] + '",';
            item += '"fromId":"' + fromId + '",';
            item += '"toId":"' + toId + '",';
            item += '"epoints":[';
            var comma = "",
            c;
            for (i in this.epoints) {
                item +=  comma + '{';
                comma = ',';
                c='';
                for (j in this.epoints[i]) {
                    item +=  c + '"' + j + '":"' + this.epoints[i][j] + '"';
                    c=',';
                }
                item +=  '}';
            }
            item +=  ']';

            if (this.lables) {
                item += ',"lables":[';
                comma = "";
                c = "";
                for (i in this.lables) {
                    var p = this.lables[i].position();
                    item +=  comma + '{"name":"' + this.lables[i].html() + '","x":"' + p.left + '","y":"' + p.top + '"}';
                    comma = ',';
                }
                item +=  ']';
            }
            item +=  '}';
            return item; 
        },
        //@proexp
        _create: function () {
            this.epoints = [];
            this.cleanOnNextTransform = false;
            if (this.options['stored']) {
                for (i in this.parrent.elements) {
//                    alert("ELEMENT: " + this.parrent.elements[i].euid);
                    if (this.parrent.elements[i].options['id'] == this.options['fromId']) {
    this.from = this.parrent.elements[i].euid;
                    }
                    if (this.parrent.elements[i].options['id'] == this.options['toId']) {
    this.toId = this.parrent.elements[i].euid;
                    }
                }
                if (this.options['epoints']) {
                    dm.debug = dm.debug || {};
                    dm.debug[this.euid] = this.options['epoints'];
                    this.epoints = new Array();
                    for (i in this.options['epoints']) {
    this.epoints[i] = {};
    this.epoints[i][0] = parseInt(this.options['epoints'][i][0], 10);
    this.epoints[i][1] = parseInt(this.options['epoints'][i][1], 10);
                    }
                }
                this.options['fromId'] = this.from;
                this.options['toId'] = this.toId;
            }
            else {
                this.from = this.options['fromId'];
                this.toId = this.options['toId'];
            }
            this.lables = new Array();
            for (i in this.options['lables']) {
                var l = this.options['lables'][i];
                this.addLable(l.name, parseInt(l.x), parseInt(l.y));
            }
        },
        //@proexp
        _init: function () {
            // this.element.draggable().resizable().selectable().border()
        },
        //@proexp
        _baseinit: function() {
            // TODO: add on mouse drag&drop
        },
        //@proexp
        drawSelected: function(c, points, color) {
            c.beginPath();
            c.fillStyle = color;
            c.strokeStyle = color;

            c.moveTo(points[0][0], points[0][1]);
            for (i=1; i<points.length; ++i) {
                c.lineTo(points[i][0], points[i][1]);
            }
            c.stroke();
            c.closePath();
        },
        //@proexp
        draw: function(ctx, points, color) {},

        //@proexp
        redraw: function(ctx, color) {
            var context = ctx;
            var col = color || "rgba(0,0,0,1)";
            if (ctx == undefined) {
                // TODO: identify context by this,parent
                return;
            }

            this.points = this._getConnectionPoints(this.from, this.toId, this.epoints);
            this.gip = [];
            for (i=0;i<this.points.length-1;++i) {
                var dy = this.points[i][1] - this.points[i+1][1],
                dx = this.points[i][0] - this.points[i+1][0];
                this.gip[i] = Math.sqrt(dx*dx + dy*dy);
            }


      // !!! It looks like conflict of naming. Diagram has draw method too,
      //     But with different signature
      // !!!
      // ???
      // Is is problem
      // Why it is possible to re-define methods for elements
      // but not possible for connector
      // ???
            this['draw'](context, this.points, col);
        },

        //@proexp
        _getRValue: function(x1, x2, w) {
            var diffx = x2-x1;
            if (diffx>0) {
                if (diffx > w)
                    return x1 + w;
                return x2;
            }
            return x1;
        },
        //@proexp
        isPointOnLine: function(x,y) {
            if (this.points == undefined)
                return false;

            for (i=0;i<this.points.length-1;++i) {
                var dx1 = x - this.points[i][0],
                dy1 = y - this.points[i][1],
                dx = this.points[i+1][0] - x,
                dy = this.points[i+1][1] - y,
                gip1 = Math.sqrt(dx1*dx1 + dy1*dy1),
                gip = Math.sqrt(dx*dx + dy*dy);

                if (((gip1 + gip) - this.gip[i]) < 0.2 ) {
                    return true;
                }
            }
            return false;          
        },
        //@proexp
        canRemovePoint: function(p1,p2,rp) {
            if ((p1 == undefined)
                    || (p2 == undefined)) {
                return false;
            }
            var dx = p1[0] - p2[0],
            dy = p1[1] - p2[1],
            dx1 = p1[0] - rp[0],
            dy1 = p1[1] - rp[1],
            dx2 = p2[0] - rp[0],
            dy2 = p2[1] - rp[1],
            gip1 = Math.sqrt(dx1*dx1 + dy1*dy1),
            gip2 = Math.sqrt(dx2*dx2 + dy2*dy2),
            gip = Math.sqrt(dx*dx + dy*dy);
            if (((gip1 + gip2) - gip) < 0.2)
                return true;
            return false;
        },
        //@proexp        
        startTransform: function(x,y) {
            this.eppos = undefined;

            if ((this.cleanOnNextTransform) && (this.epoints.length == 1)) {
                this.cleanOnNextTransform = false;
                this.epoints.splice(0, 1);
            }

            for (c=0; c<this.epoints.length; ++c) {
                if ((this.epoints[c][0] - 12 < x) && (this.epoints[c][0] + 12 > x)
    && (this.epoints[c][1] - 12 < y) && (this.epoints[c][1] + 12> y)) {
                    this.eppos = c;
                    break;
                }
            }

            // Don't need to identify position
            // in array for the first element
            if (this.epoints.length == 0) {
                this.eppos = 0;
            }

            if (this.eppos == undefined) {
                this.points = this._getConnectionPoints(this.from, this.toId, this.epoints);
                newPoint = [];
                newPoint[0] = x; newPoint[1] = y;
                for (i=0;i<this.points.length-1;++i) {
                    if (this.canRemovePoint(this.points[i], this.points[i+1], newPoint)) {
    this.eppos = i;
    this.epoints.splice(i, 0, newPoint);
                    }
                }
            } else {
                this.epoints[this.eppos] = [];
                this.epoints[this.eppos][0] = x;
                this.epoints[this.eppos][1] = y;
            }

            if (this.onStartTransform != undefined)
                this.onStartTransform(x,y);
        },
        //@proexp
        stopTransform: function(x,y) {
            this.epoints[this.eppos][0] = x;
            this.epoints[this.eppos][1] = y;

            var isEqualPoint = function(p1, p2) {
                if ((p1[0] - 12 < p2[0]) && (p1[0] + 12 > p2[0])
    && (p1[1] - 12 < p2[1]) && (p1[1] + 12 > p2[1])) {
                    return true;
                }
                return false;
            };

            if (this.eppos < this.epoints.length - 1) {
                if (isEqualPoint(this.epoints[this.eppos], this.epoints[this.eppos + 1])) {
                    this.epoints.splice(this.eppos +1, 1);
                }
            }

            if (this.eppos > 0) {
                if (isEqualPoint(this.epoints[this.eppos], this.epoints[this.eppos -1])) {
                    this.eppos--;
                    this.epoints.splice(this.eppos, 1);
                }
            }

            if (this.canRemovePoint(this.points[this.eppos], this.points[this.eppos+2], this.points[this.eppos+1])){
                if (this.epoints.length > 1) {
                    this.epoints.splice(this.eppos, 1);
                } else { this.cleanOnNextTransform = true; }
            }

            this.eppos = undefined;

            if ($.isFunction(this.onStopTransform))
                this.onStopTransform(x,y);
        },
        //@proexp
        TransformTo: function(x,y) {
            if (this.eppos != undefined) {
                this.epoints[this.eppos][0] = x;
                this.epoints[this.eppos][1] = y;
                if ($.isFunction(this.onTransform))
                    this.onTransform(x,y);
            }
        },    
        //@proexp
        _getConnectionPoints: function(fromId, toId, epoints) {

            //alert(" Get connection points: " + fromId + "  " + toId);
            var p1 = $('#'+ fromId).position();

            var p2 = $('#' + toId).position();
            if (p2 == null) {
                alert(" TOID" + toId);
                return;
            }


            var p11 = $('#'+ fromId + "_Border").position();
            var p21 = $('#' + toId + "_Border").position();
            var scrollTop = 0,//$("#" + this.parrent.euid).scrollTop(),
            scrollLeft = 0;//$("#" + this.parrent.euid).scrollLeft();

            if ((epoints == undefined) || (epoints.length ==0)) {
                var x1 = this._getRValue(p1.left + p11.left, p2.left + p21.left, $('#'+ fromId).width()) ;
                var y1 = this._getRValue(p1.top + p11.top, p2.top + p21.top, $('#'+ fromId).height()) ;
                var x2 = this._getRValue(p2.left + p21.left, p1.left + p11.left, $('#' + toId).width());
                var y2 = this._getRValue(p2.top + p21.top, p1.top + p11.top,  $('#' + toId).height());
                var newpoints = [[x1 + scrollLeft,y1 + scrollTop], [x2 + scrollLeft,y2 + scrollTop]];
                return newpoints;
            }
            else {
                var lln = epoints.length -1;
                var x1 = this._getRValue(p1.left + p11.left, epoints[0][0], $('#'+ fromId).width()) ;
                var y1 = this._getRValue(p1.top + p11.top, epoints[0][1], $('#'+ fromId).height()) ;

                var x2 = this._getRValue(p2.left + p21.left, epoints[lln][0], $('#' + toId).width());
                var y2 = this._getRValue(p2.top + p21.top, epoints[lln][1], $('#' + toId).height());

                /*         var x1 = p1.left + p11.left;
         var y1 = p1.top + p11.top;

         var x2 = p2.left + p21.left;
         var y2 = p2.top + p21.top;
                 */      
                var newpoints = [];
                newpoints[0] = [x1 + scrollLeft,y1 + scrollTop];
                for (i=1;i<=epoints.length;++i) {
                    newpoints[i] = epoints[i-1];          
                }
                newpoints[epoints.length + 1] = [x2 + scrollLeft,y2 + scrollTop];
                return newpoints;
            }
        },
        //@proexp
        onDragStart: function(ui) {
            if (this.epoints.length > 0) {
                this.epoints_drag = [];
                // clone this.epoints
                for (i in this.epoints) {
                    this.epoints_drag[i] = {};
                    this.epoints_drag[i][0] = this.epoints[i][0];
                    this.epoints_drag[i][1] = this.epoints[i][1];
                }
                this.options.dragStart = true;
            }
            if (this.lables && this.lables.length > 0) {
                this.lables_drag = [];
                // clone this.epoints
                for (i in this.lables) {
                    var p = this.lables[i].position();
                    this.lables_drag[i] = {};
                    this.lables_drag[i][0] = p.left;
                    this.lables_drag[i][1] = p.top;
                }
            }
        },
        //@proexp
        onDragMove: function(ui) {
            if (this.options.dragStart == undefined)
                return;
            for (i in this.epoints_drag) {
                this.epoints[i][0] = this.epoints_drag[i][0] + ui.left;
                this.epoints[i][1] = this.epoints_drag[i][1] + ui.top;
            }

            for (i in this.lables_drag) {
                this.lables[i].css({left:this.lables_drag[i][0] + ui.left,
                    top: this.lables_drag[i][1] + ui.top});
            }
        },
        //@proexp
        onDragStop: function(ui) {
            this.onDragMove(ui);
            this.options['dragStart'] = undefined;
            this.epoints_drag = undefined;
            this.lables_drag = undefined;
        }
        });
        //@print
//@aspect
})(jQuery, dm);