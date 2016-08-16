/**
 * Created by jmartinez on 8/11/16.
 */
import {getDataFields} from '../components/Global_helpers.js';
if(Meteor.isClient){
    
    export function loadCesiumMap() {
        Session.set('spinning', true);
        var west = -105.5347;
        var south = 39.2663;
        var east = -104.4301;
        var north = 40.246;
        var rectangle = Cesium.Rectangle.fromDegrees(west, south, east, north);

        Cesium.Camera.DEFAULT_VIEW_FACTOR = 0;
        Cesium.Camera.DEFAULT_VIEW_RECTANGLE = rectangle;


        var imageryViewModels = [];
        imageryViewModels.push(new Cesium.ProviderViewModel({
            name: "Mapbox Streets",
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/mapboxStreets.png'),
            tooltip: 'Imagery from <a href="http://mapbox.com/about/maps/">Mapbox</a> &mdash; Map data &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            creationFunction: function(){
                return new Cesium.MapboxImageryProvider({
                    mapId: 'mapbox.outdoors',
                    accessToken: 'pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg'
                })
            }
        }));

        imageryViewModels.push(new Cesium.ProviderViewModel({
            name: "Mapbox Satellite",
            iconUrl: Cesium.buildModuleUrl('Widgets/Images/ImageryProviders/mapboxSatellite.png'),
            tooltip: 'Imagery from <a href="http://mapbox.com/about/maps/">Mapbox</a> &mdash; Map data &copy <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            creationFunction: function(){
                return new Cesium.MapboxImageryProvider({
                    mapId: 'mapbox.streets-satellite',
                    accessToken: 'pk.eyJ1IjoiZHJjMGciLCJhIjoiY2lvbG44bXR6MDFxbHY0amJ1bTB3bGNqdiJ9.yVn2tfcPeU-adm015g_8xg'
                })
            }
        }));


        viewer = new Cesium.Viewer('cesiumContainer', {
            infoBox: false,
            selectionIndicator: false,
            fullscreenButton: false,
            geocoder: false,
            homeButton: true,
            sceneModePicker: false,
            timeline: false,
            navigationHelpButton: true,
            navigationInstructionsInitiallyVisibile: false,
            animation: false,
            baseLayerPicker: true,
            selectedImageryProviderViewModel: imageryViewModels[0]

        });


        viewer.baseLayerPicker.viewModel.imageryProviderViewModels = imageryViewModels;
        viewer.baseLayerPicker.viewModel.terrainProviderViewModels = [];
        viewer.selectedImageryProviderViewModel = imageryViewModels[0];



        viewer.scene.screenSpaceCameraController.inertiaSpin = 0;
        viewer.scene.screenSpaceCameraController.inertiaTranslate = 0;
        viewer.scene.screenSpaceCameraController.inertiaZoom = 0;


        viewer.dataSources.removeAll(true);
        var promise = Cesium.GeoJsonDataSource.load('/data/zonesGeo.json', {
            stroke: Cesium.Color.BLACK,
            fill: new Cesium.Color(0.01,0.01,0.01,0.01)
        });
        promise.then(function(dataSource){
            viewer.dataSources.add(dataSource);
            Session.set('spinning', false);
        }).otherwise(function(error){
            //Display any errrors encountered while loading.
            window.alert(error);
        });


        setZoneClickEvents();
        
    }

    export function setZoneClickEvents() {
        var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        handler.setInputAction(function(click){
            var pickedObject = viewer.scene.pick(click.position);
            var entity = pickedObject.id;
            var zoneId = entity.properties.ZONE_ID;

            var ds = viewer.dataSources.get(0);
            var selectedZones = Session.get('selectedZone');

            //this block of code deals with setting the color of the clicked zone and the color of the unclicked zone
            //it accounts for if the chloropleth is active
            if(Session.equals('allowMultipleGeo', false)){
                if(selectedZones.length > 0){
                    var colorData = Session.get('colorData');
                    var oldColor;
                    entity.polygon.material = new Cesium.Color(1,1,0,0.5);
                    var prior = _.find(ds.entities.values, function(entity){return entity.properties.ZONE_ID == selectedZones[0]});
                    if(colorData){
                        oldColor = _.find(colorData, function(x){return x.zone_id == selectedZones[0]}).color;
                        prior.polygon.material = Cesium.Color.fromCssColorString(oldColor).withAlpha(0.5);
                    }else{
                        oldColor = new Cesium.Color(0.01,0.01,0.01,0.01);
                        prior.polygon.material = oldColor;
                    }



                }else{
                    entity.polygon.material = new Cesium.Color(1,1,0,0.5);
                }

            }else{
                if(_.contains(selectedZones, zoneId)){
                    entity.polygon.material = new Cesium.Color(0.01,0.01,0.01,0.01);
                }else{
                    entity.polygon.material = new Cesium.Color(1,1,0,0.5);
                }

            }

            var year = Session.get('selectedYear');
            findZoneData(zoneId, year);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    export function findZoneData(zoneId, year){
        var selectedZoneArray = Session.get('selectedZone');
        if($.inArray(parseInt(zoneId), selectedZoneArray) !== -1){
            selectedZoneArray = _.without(selectedZoneArray, _.find(selectedZoneArray, function(x){return x == zoneId;}));
        }else{
            if(Session.get('allowMultipleGeo') == false){
                selectedZoneArray = [parseInt(zoneId)];
            }else{
                selectedZoneArray.push(parseInt(zoneId));
            }

        }
        console.log(year);
        
        Session.set('selectedZone', selectedZoneArray);
        var zoneSubscription = subscribeToZone(year, selectedZoneArray);
    }

    export function subscribeToZone(year, selectedZoneArray){
        return Meteor.subscribe('grouped_zones', year, selectedZoneArray, {
            onReady: function(){
                var fieldObj = getDataFields(Roles.userIsInRole(Meteor.userId(), ['admin']));
                var data = zoneData.find({sim_year: year, zone_id:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
                var baseData = zoneData.find({sim_year: 2010, zone_id:{$in:selectedZoneArray}}, {fields:fieldObj}).fetch();
                this.stop();
                var dataArr =[];

                //functional programming way of creating the right data object
                if(data.length > 0){
                    dataArr = _.keys(data[0]).map(function(key){
                        var value = data.reduce(function(a, b){
                            var obj = {};
                            obj[key] = a[key] + b[key];
                            return obj
                        });

                        var baseValue = baseData.reduce(function(a, b){
                            var obj = {};
                            obj[key] = a[key] + b[key];
                            return obj
                        });

                        return {measure: key, value:parseInt(value[key]), diff: parseInt(value[key]) - parseInt(baseValue[key])};
                    });
                }


                var dataDict = {};
                var chartData;



                dataDict["oneYear"] = _.sortBy(dataArr, 'measure').reverse();
                var allYears = _.groupBy(zoneData.find().fetch(), 'sim_year');
                var counties = _.groupBy(countyData.find({}).fetch(), 'sim_year');


                //this if statement determines if the chart draws the generic all region series
                //or the series for that particular zone. selectedZone will be length 0 when nothing is selected
                if(Session.get('selectedZone').length > 0){
                    chartData = _.keys(allYears).map(function(key){
                        var simData = allYears[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });
                        return simData;
                    });
                }else{
                    chartData = _.keys(counties).map(function(key){
                        var simData = counties[key].reduce(function(a,b){
                            return {
                                pop_sim: parseInt(a.pop_sim) + parseInt(b.pop_sim),
                                emp_sim: parseInt(a.emp_sim) + parseInt(b.emp_sim),
                                sim_year: a.sim_year
                            };
                        });
                        return simData;
                    });
                }



                dataDict["allYears"] = chartData;
                Session.set("selectedData", dataDict);
                
                
                drawChart(dataDict.allYears);

            }
        });
    }

    export function drawChart(data){
        d3.selectAll(".svgChart").remove();
        var margin = {top: 10, right:25, bottom:25, left:90},
            width = 350 - margin.left - margin.right,
            height = 220 - margin.top - margin.bottom;

        var x = d3.scale.linear().range([0, width]);
        var y_pop = d3.scale.linear().range([height, 0]);
        var y_emp = d3.scale.linear().range([height, 0]);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(d3.format('d'));

        var yAxis = d3.svg.axis()
            .scale(y_pop)
            .orient("left");

        var yAxis_emp = d3.svg.axis()
            .scale(y_emp)
            .orient("left");

        var line_pop = d3.svg.line()
            .x(function(d){return x(d.sim_year)})
            .y(function(d){return y_pop(d.pop_sim)});

        var line_emp = d3.svg.line()
            .x(function(d){return x(d.sim_year)})
            .y(function(d){return y_emp(d.emp_sim)});


        var svg = d3.select("#popChartContainer").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
            .attr("class", "svgChart")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var svg_emp = d3.select("#hhChartContainer").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.bottom + margin.top)
            .attr("class", "svgChart")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


        x.domain([2010, 2040]);
        y_pop.domain(d3.extent(data, function(d){return d.pop_sim}));
        y_emp.domain(d3.extent(data, function(d){return d.emp_sim}));

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Population");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line_pop);

        svg_emp.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg_emp.append("g")
            .attr("class", "y axis")
            .call(yAxis_emp)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Employment");

        svg_emp.append("path")
            .datum(data)
            .attr("class", "lineEmp")
            .attr("d", line_emp)


    }

    export function colorCesiumMap(data, measure){

        var max = _.max(data, function (x) {
            return x[measure]
        })[measure];


        var quantize = d3.scale.quantize()
            .domain([0, max])
            .range(d3.range(7).map(function (i) {
                return i;
            }));

        var colorMap = {
            0: "#eff3ff",
            1: "#85B3D4",
            2: "#6C9DC7",
            3: "#5387BA",
            4: "#3A71AD",
            5: "#215BA0",
            6: "#084594"
        };

        var ds = viewer.dataSources.get(0);
        data.forEach(function(cv, idx, arr){
            var entity = _.find(ds.entities.values, function(x){return x.properties.ZONE_ID == cv.zone_id});
            var quantized = quantize(cv[measure]);
            var color = colorMap[quantized];
            cv['color'] = color;
            entity.polygon.material = Cesium.Color.fromCssColorString(color).withAlpha(0.5);


        });

        Session.set('colorData', data.map(function(x){return {zone_id: x.zone_id, color: x.color}}));






    }

}