# Nigeria-map-density-visualizer
This is a JavaScript plugin that can be used to visualize data on the map of Nigeria. 
The color distribution is based on the density of entity for each state. It uses raphaeljs to manipulate the svg entities applying different color gradient for each state

```


var el = document.querySelector('#map_obj');
var ngHitMap = new NigeriaHitMap(
    {
        element: el, 
        width:600,
        height:600,
        color:'red',
        backgroundColor:'#ffffff',
        hoverColor:'pink',
        selectOnClick:false,
        events:{
            mouseHover:function(e){
                e.pallet.showInfoWindow(e, `<div style="width: 500px;height: 500px;"><h2>State Info</h2><p>${e.pallet.getDataPointValue()}</p></div>`);
            },
            mouseLeave:function(e){  },
            onclick:function(e){ console.log(e);}
        }
    });


ngHitMap.init().then((map) => {
    var psKeys = map.getPalletsKeys();
    var psKeyLen = psKeys.length;
    psKeys.forEach(function (v) {
        let data_point = parseFloat(Math.random() * 10 * psKeyLen);
        map.DataLayer.addDataPoint(new map.DataLayer.DataPoint(v, data_point.toFixed(2)));
    });

    map.DataLayer.renderHitMap();

});

```
