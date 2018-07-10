var NigeriaHitMap = function(options) {
    
    var __default_options = {
        width:600,
        height:600,
        element:null,
        color:'#7c7c7c',
        hoverColor:'#ff0000',
        selectedColor:'#74e827',
        backgroundColor:'#ffffff',
        events:{},
        showHover:true,
        selectOnClick:true,
        colorRange: {
            lowerBoundary:'red',
            upperBoundary:'blue'
        }
    };

    var __dataset_options = {
      click_enabled:true
    };

    var _map_svg_handles = {};

    
    if(options) {
        for(var option in options) {
            if(__default_options.hasOwnProperty(option)) {
                __default_options[option] = options[option];
            }
        }
    }
    
    this.init = init;
    
    
    var internalInterface = {
        _map_svg: null,
        palletCollection:{},
        infoWinHandle: null,
        dataLayer: {
            totalSum:0.00,
            maxValue:0.00,
            dataPointValues : {}
        }
        
    };
    
    var returnedInterface = {
        loadDataSet:null,
        getPallets: getPallets,
        getPalletsKeys: getPalletsKeys,
        getPalletByCode: getPalletByCode,
        setCustomColors:null,
        setColorRange:{lowerBoundary:null, upperBoundary:null},
        DataLayer: {
            DataPoint: DataPoint,
            addDataPoint: addDataPoint,
            renderHitMap: renderHitMap
        }
    };

    function infoWindow() {
        if(__default_options.element == null) {
            return;
        }
        internalInterface.infoWinHandle = document.createElement('div');
        internalInterface.infoWinHandle.style.position = 'absolute';
        internalInterface.infoWinHandle.style.minWidth = '200px';
        internalInterface.infoWinHandle.style.top = '0px';
        internalInterface.infoWinHandle.style.left = '0px';
        internalInterface.infoWinHandle.style.minHeight = '200px';
        internalInterface.infoWinHandle.style.border = 'solid 1px #e9e9e9';
        internalInterface.infoWinHandle.style.backgroundColor = '#e1e1e1';
        internalInterface.infoWinHandle.style.display = 'none';

        __default_options.element.appendChild(internalInterface.infoWinHandle);
    }

    
    function indexPaths() {
        internalInterface._map_svg = document.querySelectorAll('path');
        for(var path in internalInterface._map_svg) {
            if(typeof internalInterface._map_svg[path] == 'object') {
                internalInterface._map_svg[path].onmouseover = __events.mouseHover;
                internalInterface._map_svg[path].onmouseout = __events.mouseLeave;
                internalInterface._map_svg[path].onclick = __events.onclick;
                internalInterface._map_svg[path].setAttribute('fill', __default_options.color);
                internalInterface._map_svg[path].setAttribute('stateCode', genKey(internalInterface._map_svg[path].getAttribute('name')));
                internalInterface._map_svg[path].style.opacity = 0.7;
                //console.log(internalInterface._map_svg[path].name);
                internalInterface.palletCollection[internalInterface._map_svg[path].getAttribute('stateCode')] = (new Pallet(internalInterface._map_svg[path]));
            }
        }
    }
    
    function getPallets() {
        return Object.values(internalInterface.palletCollection);
    }

    function getPalletByCode(code) {
        if(!(code in internalInterface.palletCollection)) {
            return false;
        }
        return internalInterface.palletCollection[code];
    }

    function getPalletsKeys() {
        return Object.keys(internalInterface.palletCollection);
    }

    function genKey(name) {
        return name.toLowerCase().split(' ').join('-');
    }
    
    function getSVGHandle() {
        _map_svg_handles = document.querySelectorAll('.__nig_map');
        let counter = 0;
        for(var handle in _map_svg_handles) {
            if(typeof _map_svg_handles[handle] == 'object') {
                _map_svg_handles[handle].id = '__ng_map' + counter;
                _map_svg_handles[handle].style.width = __default_options.width + 'px';
                _map_svg_handles[handle].style.height = __default_options.height + 'px';
                counter++;
            }   
        }
    }
    
    function injectSVG() {
        var d = document.createElement('div');
        d.classList.add('wrapper');
        d.style.backgroundColor = __default_options.backgroundColor;
        d.innerHTML = __NG_SVG;
        __default_options.element.appendChild(d);
    }
    
    function init () {
        return new Promise((resolve, reject) => {
            try{
                getMapHolder();
                injectSVG();
                getSVGHandle();
                indexPaths();
                infoWindow();
                resolve(returnedInterface);
            }catch(e) {
                reject(e);
            } 
        });
    }
    
    function getMapHolder() {
        if(__default_options.element == null) { 
            __default_options.element = document.createElement('div');
            document.body.appendChild(__default_options.element);
        }
        __default_options.element.classList.add('__map');
        
        return __default_options.element;
    }
    
    function fireEvent(event_name, args) {
        if(event_name in __default_options.events && typeof __default_options.events[event_name] == 'function') {
                __default_options.events[event_name].call(returnedInterface, args);
            }
    }

    
    var __events = {
        mouseHover: function($e) {
            if(__default_options.showHover) {
                this.setAttribute('fill', __default_options.hoverColor);
            }

            fireEvent('mouseHover', {pallet: internalInterface.palletCollection[this.getAttribute('stateCode')], event: $e});
        },
        mouseLeave: function($e) {
            if(__default_options.showHover) {
                let is_clicked = this.getAttribute('selected') == '1';
                if(!is_clicked) {
                    this.setAttribute('fill', __default_options.color);
                }else {
                    this.setAttribute('fill', __default_options.selectedColor);
                }
            }

            if(internalInterface.infoWinHandle) {
                internalInterface.infoWinHandle.style.display = 'none';
            }

            fireEvent('mouseLeave', {pallet: internalInterface.palletCollection[this.getAttribute('stateCode')], event: $e});
        },
        onclick: function($e) {
            let is_clicked = this.getAttribute('selected') == '1';
            if(__default_options.selectOnClick) {
                if(!is_clicked) {
                    this.setAttribute('fill', __default_options.selectedColor);
                    this.setAttribute('selected', '1');
                }else {
                    this.setAttribute('fill', __default_options.color);
                    this.removeAttribute('selected');
                }

            }
            fireEvent('onclick',  {pallet: internalInterface.palletCollection[this.getAttribute('stateCode')], event: $e, is_selected:!is_clicked});
        }
    };
    
    
    
    function Pallet(pallet_data) {
        var $pallet_obj = pallet_data;
        var data_point = null;
        this.stateCode = pallet_data.getAttribute('stateCode');
        this.name = pallet_data.getAttribute('name');
        this.id = pallet_data.getAttribute('data-id');
        this.showInfoWindow = function (e, template) {
            internalInterface.infoWinHandle.style.top = e.event.offsetY + 10;
            internalInterface.infoWinHandle.style.left = e.event.offsetX + 10;
            internalInterface.infoWinHandle.style.padding = '10px';
            internalInterface.infoWinHandle.innerHTML = template;
            internalInterface.infoWinHandle.style.display = 'block';
            //console.log($pallet_obj);
        };

        this.test = pallet_data;

        this.setColor = function (color) {
            $pallet_obj.setAttribute('fill', color);
        };

        this.setDataPointValue = function (value) {
            data_point = value;
        };

        this.setHitValue = function (hit_value) {
            var parsed_hit_value = parseFloat(hit_value);
            if(isNaN(parsed_hit_value)) {return;}
            if(parsed_hit_value < 0.00 || parsed_hit_value > 1.00) { throw "Hit value out of range. Value must be between 0.00 and 1.00"}
            $pallet_obj.style.opacity = parsed_hit_value;
        };

        this.getDataPointValue = function () {
            return data_point;
        };
    }

    function DataPoint(stateCode, value) {
        if(!getPalletByCode(stateCode)) { throw "Invalid stateCode provided for DataPoint;. '" + stateCode + "' is not a valid stateCode"}
        if(isNaN(value)) { throw "Invalid value provided for DataPoint;. '" + value + "' must be of a Type Number"}
        this.stateCode = stateCode;
        this.value = parseFloat(value);
    }

    function addDataPoint(dataPoint) {
        if(!(dataPoint instanceof DataPoint)) { throw "DataLayer.addDataPoint Error : Instance of a DataLayer.DataPoint is required as argument.";}
        internalInterface.palletCollection[dataPoint.stateCode].setDataPointValue(dataPoint.value);
        internalInterface.dataLayer.totalSum += dataPoint.value;
        if(dataPoint.value > internalInterface.dataLayer.maxValue) {
            internalInterface.dataLayer.maxValue = dataPoint.value;
        }
        internalInterface.dataLayer.dataPointValues[dataPoint.stateCode] = dataPoint.value;
    }

    function renderHitMap() {
        var hash_map = {};
        for(var d in internalInterface.palletCollection) {
            if(!(d in internalInterface.dataLayer.dataPointValues)) {
                hash_map[d] = 0.01;
            }else {
                hash_map[d] = (parseFloat((internalInterface.dataLayer.dataPointValues[d] / internalInterface.dataLayer.maxValue)  )).toFixed(2);
            }
            internalInterface.palletCollection[d].setHitValue(hash_map[d]);
        }
    }
};








