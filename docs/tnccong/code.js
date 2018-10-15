'use strict';

/*
SFCTA PROSPECTOR: Data visualization platform.

Copyright (C) 2018 San Francisco County Transportation Authority
and respective authors. See Git history for individual contributions.

This program is free software: you can redistribute it and/or modify
it under the terms of the Apache License version 2.0, as published
by the Apache Foundation, or any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the Apache License for more details.

You should have received a copy of the Apache License along with
this program. If not, see <https://www.apache.org/licenses/LICENSE-2.0>.
*/

// Must use npm and babel to support IE11/Safari
import 'isomorphic-fetch';
import Cookies from 'js-cookie';

var maplib = require('../jslib/maplib');
let styles = maplib.styles;
let getLegHTML = maplib.getLegHTML2;
let getColorFromVal = maplib.getColorFromVal2;
let mymap = maplib.sfmap;
mymap.setView([37.76889, -122.440997], 13);

// some important global variables.
const API_SERVER = 'https://api.sfcta.org/api/';
const GEO_VIEW = 'tmc_trueshp';
const DATA_VIEW = 'tmcmod';

const FRAC_COLS = ['speed','pti80'];
const INT_COLS = [];
const SCNTXT_MAP = {'2010':'2010',
                    '2016 Network':'netchg',
                    '2016 Population + Network':'popchg',
                    '2016 Jobs + Population + Network':'empchg',
                    '2016 TNCs + Jobs + Population + Network':'pudochg'};
const SCN_LIST = Object.keys(SCNTXT_MAP);
const SCN_LIST_SHORT = Object.values(SCNTXT_MAP);
const FACTXT_MAP = {'netchg': 'Network',
                    'popchg': 'Population',
                    'empchg': 'Employment',
                    'pudochg': 'TNC'};
const FACTXT_MAP_CHK = {'net': ['2010','netchg'],
                        'pop': ['netchg','popchg'],
                        'emp': ['popchg','empchg'],
                        'tnc': ['empchg','pudochg'],};

const VIZ_LIST = ['vhd', 'vmt', 'speed'];
const VIZ_INFO = {
  vhd: {
    TXT: 'Vehicle Hours of Delay (VHD)',
  },
  vmt: {
    TXT: 'Vehicle Miles Traveled (VMT)',
  },
  speed: {
    TXT: 'Speed',
  },
  pti80: {
    TXT: 'Reliability (PTI80)',
  },
};

let metric_sum_map = {Daily: {'2010': {vmt:8105225.64, vht:371147.07, speed:21.84, vhd:154991.55, pti80:2.24},
                              'netchg': {vmt:8111757.25, vht:372387.94, speed:21.78, vhd:155964.61, pti80:2.25},
                              'popchg': {vmt:8468383.54, vht:393354.37, speed:21.53, vhd:166906.82, pti80:2.29},
                              'empchg': {vmt:8734444.93, vht:411398.25, speed:21.23, vhd:177484.93, pti80:2.34},
                              'pudochg': {vmt:9292046.60, vht:453359.28, speed:20.49, vhd:201343.44, pti80:2.42}},
                      AM: {'2010': {vmt:1303003, vht:59040, speed:22.07, vhd:24666, pti80:2.25},
                            'netchg': {vmt:1303234, vht:59080, speed:22.06, vhd:24697, pti80:2.26},
                            'popchg': {vmt:1349048, vht:61691, speed:21.87, vhd:26020, pti80:2.28},
                            'empchg': {vmt:1398656, vht:65482, speed:21.36, vhd:28414, pti80:2.39},
                            'pudochg': {vmt:1465437, vht:70425, speed:20.81, vhd:31186, pti80:2.44}},
                      EA: {'2010': {vmt:224535, vht:8637, speed:26.00, vhd:2842, pti80:1.75},
                            'netchg': {vmt:222810, vht:8597, speed:25.92, vhd:2839, pti80:1.75},
                            'popchg': {vmt:231976, vht:8953, speed:25.91, vhd:2958, pti80:1.75},
                            'empchg': {vmt:250078, vht:9738, speed:25.68, vhd:3245, pti80:1.76},
                            'pudochg': {vmt:270952, vht:10726, speed:25.26, vhd:3630, pti80:1.78}},
                      MD: {'2010': {vmt:3037295, vht:141528, speed:21.46, vhd:59837, pti80:2.26},
                            'netchg': {vmt:3044231, vht:142175, speed:21.41, vhd:60252, pti80:2.27},
                            'popchg': {vmt:3191566, vht:151078, speed:21.13, vhd:64983, pti80:2.31},
                            'empchg': {vmt:3283567, vht:157438, speed:20.86, vhd:68746, pti80:2.36},
                            'pudochg': {vmt:3439869, vht:170813, speed:20.14, vhd:76955, pti80:2.44}},
                      PM: {'2010': {vmt:1700639, vht:82962, speed:20.50, vhd:37227, pti80:2.47},
                            'netchg': {vmt:1701833, vht:83300, speed:20.43, vhd:37522, pti80:2.49},
                            'popchg': {vmt:1775638, vht:88245, speed:20.12, vhd:40335, pti80:2.54},
                            'empchg': {vmt:1812366, vht:91620, speed:19.78, vhd:42678, pti80:2.63},
                            'pudochg': {vmt:1893284, vht:98599, speed:19.20, vhd:46927, pti80:2.70}},
                      EV: {'2010': {vmt:1841933, vht:79247, speed:23.24, vhd:30641, pti80:2.04},
                            'netchg': {vmt:1839648, vht:79236, speed:23.22, vhd:30655, pti80:2.05},
                            'popchg': {vmt:1920155, vht:83388, speed:23.03, vhd:32610, pti80:2.07},
                            'empchg': {vmt:1989778, vht:87119, speed:22.84, vhd:34402, pti80:2.10},
                            'pudochg': {vmt:2222506, vht:102796, speed:21.62, vhd:42645, pti80:2.20}},
};

const CUSTOM_BP_DICT = {
  'speed': {'pctdiff':{'Daily':[-20, -15, -10, -5],
                        'AM':[-20, -15, -10, -5],
                        'PM':[-20, -15, -10, -5],
                        'MD':[-20, -15, -10, -5],
                        'EV':[-20, -15, -10, -5],
                        'EA':[-20, -15, -10, -5]}},
  'vhd': {'pctdiff':{'Daily':[30, 60, 90, 120],
                        'AM':[30, 60, 90, 120],
                        'PM':[30, 60, 90, 120],
                        'MD':[30, 60, 90, 120],
                        'EV':[30, 60, 90, 120],
                        'EA':[30, 60, 90, 120]}},
  'vmt': {'pctdiff':{'Daily':[20, 40, 60, 80],
                        'AM':[20, 40, 60, 80],
                        'PM':[20, 40, 60, 80],
                        'MD':[20, 40, 60, 80],
                        'EV':[20, 40, 60, 80],
                        'EA':[20, 40, 60, 80]}},
  'pti80': {'pctdiff':{'Daily':[1, 2, 4, 6],
                        'AM':[1, 2, 3, 4],
                        'PM':[1, 2, 3, 4],
                        'MD':[1, 2, 3, 4],
                        'EV':[1, 2, 3, 4],
                        'EA':[1, 2, 3, 4]}}
}
const METRIC_UNITS = {'speed':'mph'};

const DISCRETE_VAR_LIMIT = 0;
const MISSING_COLOR = '#ccd';
const ZERO_COLOR = '#666';
const DEF_BWIDTH = 4;
const chart_deftitle = 'All Segments Combined';

let sel_colorvals, sel_colors, sel_binsflag;
let geoLayer, mapLegend;
let _featJson;
let prec;

async function initialPrep() {

  console.log('1...');
  _featJson = await fetchMapFeatures();

  console.log('2... ');
  await drawMapFeatures();

  console.log('3 !!!');
  mapdata_cache = await fetch(API_SERVER + DATA_VIEW).then((resp) => resp.json());
}

async function fetchMapFeatures() {
  const geo_url = API_SERVER + GEO_VIEW + '?select=tmc,geometry,street,direction,intersec';

  try {
    let resp = await fetch(geo_url);
    let features = await resp.json();

    // do some parsing and stuff
    for (let feat of features) {
      feat['type'] = 'Feature';
      feat['geometry'] = JSON.parse(feat.geometry);
    }
    return features;

  } catch (error) {
    console.log('map feature error: ' + error);
  }
}

// hover panel -------------------
let infoPanel = L.control();

infoPanel.onAdd = function(map) {
  // create a div with a class "info"
  this._div = L.DomUtil.create('div', 'info-panel-hide');
  return this._div;
};

function getInfoHtml(geo) {
  let metric_val = null;
  if (geo.metric !== null) metric_val = (Math.round(geo.metric*100)/100).toLocaleString();
  let base_val = null;
  if (geo.base !== null) base_val = (Math.round(geo.base*100)/100).toLocaleString();
  let comp_val = null;
  if (geo.comp !== null) comp_val = (Math.round(geo.comp*100)/100).toLocaleString();
  let bwmetric_val = null;
  if (geo.bwmetric !== null) bwmetric_val = (Math.round(geo.bwmetric*100)/100).toLocaleString();
  return  '<b>TMC ID: </b>' + `${geo.tmc}<br/>` +
          '<b>STREET: </b>' + `${geo.street}<br/>` +
          '<b>DIRECTION: </b>' + `${geo.direction}<br/>` +
          '<b>INTERSECTION: </b>' + `${geo.intersec}<br/><hr>` +

          `<b>${app.sliderValue[0]}</b> `+`<b>${app.selected_metric.toUpperCase()}: </b>` + `${base_val}<br/>` +
          `<b>${app.sliderValue[1]}</b> `+`<b>${app.selected_metric.toUpperCase()}: </b>` + `${comp_val}<br/>` +
          `<b>${app.selected_metric.toUpperCase()}</b>` + 
          (app.pct_check? '<b> % Diff: </b>':'<b>: </b>') + 
          `${metric_val}` + 
          ((app.pct_check && app.comp_check && metric_val !== null)? '%':''); 
}

infoPanel.update = function(geo) {
  infoPanel._div.innerHTML = '';
  infoPanel._div.className = 'info-panel';
  if (geo) this._div.innerHTML = getInfoHtml(geo);

  infoPanelTimeout = setTimeout(function() {
    // use CSS to hide the info-panel
    infoPanel._div.className = 'info-panel-hide';
    // and clear the hover too
    if (oldHoverTarget.feature.tmc != selGeoId) geoLayer.resetStyle(oldHoverTarget);
  }, 2000);
};
infoPanel.addTo(mymap);

function getDiffArray(entry, metric) {
  let tmp_list = [];
  let tot = 0;
  for (var i = 1; i < SCN_LIST_SHORT.length; i++) {
    let val = Math.round(entry['mod_'+metric+'_'+SCN_LIST_SHORT[i]]*100)/100;
    let preval = Math.round(entry['mod_'+metric+'_'+SCN_LIST_SHORT[i-1]]*100)/100;
    let x = (metric=='speed'? (preval-val):(val-preval));
    if (x < 0) x = -1.0*x;
    tmp_list.push(x);
    tot += x;
  }
  return [tmp_list, tot];
}

let mapdata_cache = null
async function getMapData() {
  let jsonData;
  if (mapdata_cache == null)
  {
    let data_url = API_SERVER + DATA_VIEW + '?select=*&tod=eq.' + app.selected_timep;
    let resp = await fetch(data_url);
    mapdata_cache = await resp.json();
    jsonData = mapdata_cache;
  } else {
    jsonData = mapdata_cache.filter((row) => row.tod==app.selected_timep);
  }
  let lookup = {};
  let fac_lookup = {};
  for (let entry of jsonData) {
    let key = entry.tmc;
    fac_lookup[key] = {};
    let voldiff_list, voldiff_tot;
    [voldiff_list, voldiff_tot] = getDiffArray(entry, 'vol');
    for (let v of VIZ_LIST) {
      let tmp_list, tot;
      [tmp_list, tot] = getDiffArray(entry, v);
      entry['mod_'+v+'_2010'] = entry['emp_'+v+'_2010'];
      entry['mod_'+v+'_'+SCN_LIST_SHORT[SCN_LIST_SHORT.length-1]] = entry['emp_'+v+'_2016'];
      let diff = entry['emp_'+v+'_2016'] - entry['emp_'+v+'_2010'];
      for (var i = 1; i < SCN_LIST_SHORT.length-1; i++) {
        if (tot<0.01) {
          entry['mod_'+v+'_'+SCN_LIST_SHORT[i]] = entry['mod_'+v+'_'+SCN_LIST_SHORT[i-1]] + diff*voldiff_list[i-1]/voldiff_tot;
        } else {
          entry['mod_'+v+'_'+SCN_LIST_SHORT[i]] = entry['mod_'+v+'_'+SCN_LIST_SHORT[i-1]] + diff*tmp_list[i-1]/tot;
        }
      }
    }
    lookup[key] = entry;
    for (let c of SCN_LIST_SHORT) {
      fac_lookup[key][c] = {};
      for (let v of VIZ_LIST) {
        fac_lookup[key][c][v] = Math.round(entry['mod_'+v+'_'+c]*100)/100;
      }
    }
  }
  return [lookup,fac_lookup];
}

let base_lookup, fac_lookup;
let map_vals;
async function drawMapFeatures(queryMapData=true) {

  // create a clean copy of the feature Json
  if (!_featJson) return;
  let cleanFeatures = _featJson.slice();
  let sel_metric = app.selected_metric;
  let base_metric = 'mod_' + sel_metric + '_' + SCNTXT_MAP[app.sliderValue[0]];
  prec = (FRAC_COLS.includes(sel_metric) ? 100 : 1);  
  
  try {
    if (queryMapData) {
      [base_lookup, fac_lookup] = await getMapData();
      let map_metric;
      map_vals = [];
      for (let feat of cleanFeatures) {
        map_metric = null;
        if (base_lookup.hasOwnProperty(feat.tmc)) {
          let feat_entry = base_lookup[feat.tmc];
          feat['base'] = Math.round(feat_entry[base_metric]*100)/100;
          let tmp = feat['base'];
          for (let s of app.checkedScn) {
            let d = FACTXT_MAP_CHK[s];
            tmp += fac_lookup[feat.tmc][d[1]][sel_metric] - fac_lookup[feat.tmc][d[0]][sel_metric];
          }
          feat['comp'] = Math.round(tmp*100)/100;
          map_metric = feat['comp'] - feat['base'];
          if (app.pct_check && app.comp_check) {
            if (feat_entry[base_metric]>0) {
              map_metric = map_metric*100/feat_entry[base_metric];
            }
          }
        }
        if (map_metric !== null) {
          map_metric = Math.round(map_metric*prec)/prec;
          map_vals.push(map_metric);
        }
        feat['metric'] = map_metric;
      }
      map_vals = map_vals.sort((a, b) => a - b);      
    }
    
    if (map_vals.length > 0) {
      let color_func;
      let sel_colorvals2;
      let bp;
      
      if (queryMapData) {
        sel_colorvals = Array.from(new Set(map_vals)).sort((a, b) => a - b);
        
        if (sel_colorvals.length <= DISCRETE_VAR_LIMIT || INT_COLS.includes(sel_metric)) {
          sel_binsflag = false;
          color_func = chroma.scale(app.selected_colorscheme).mode(getColorMode(app.selected_colorscheme)).classes(sel_colorvals.concat([sel_colorvals[sel_colorvals.length-1]+1]));
          sel_colorvals2 = sel_colorvals.slice(0);
          app.bp0 = 0;
          app.bp1 = 0;
          app.bp2 = 0;
          app.bp3 = 0;
          app.bp4 = 0;
          app.bp5 = 1;
          
        } else {
          let mode = 'base';
          if (app.comp_check){
            if(app.pct_check){
              mode = 'pctdiff';
            } else {
              mode = 'diff';
            }
          }
          let custom_bps = CUSTOM_BP_DICT[sel_metric][mode][app.selected_timep];
          sel_colorvals = [map_vals[0]];
          for (var i = 0; i < custom_bps.length; i++) {
            if (custom_bps[i]>map_vals[0] && custom_bps[i]<map_vals[map_vals.length-1]) sel_colorvals.push(custom_bps[i]);
          }
          sel_colorvals.push(map_vals[map_vals.length-1]);
          bp = Array.from(sel_colorvals).sort((a, b) => a - b);
          app.bp0 = bp[0];
          app.bp5 = bp[bp.length-1];
          app.bp1 = custom_bps[0];
          app.bp2 = custom_bps[1];
          app.bp3 = custom_bps[2];
          app.bp4 = custom_bps[3];
          
          sel_colorvals = Array.from(new Set(sel_colorvals)).sort((a, b) => a - b);
          sel_binsflag = true; 
          if (app.sliderValue[0]==app.sliderValue[1]) {
            sel_colorvals = [0,0];
            color_func = chroma.scale([ZERO_COLOR,ZERO_COLOR]).classes(sel_colorvals);
          } else {
            color_func = chroma.scale(app.selected_colorscheme).mode(getColorMode(app.selected_colorscheme)).classes(sel_colorvals);
          }
          sel_colorvals.length>1? sel_colorvals2 = sel_colorvals.slice(0,sel_colorvals.length-1):sel_colorvals2 = sel_colorvals.slice();
        }
      }
      
      sel_colors = [];
      for(let i of sel_colorvals2) {
        sel_colors.push(color_func(i).hex());
      }
 
      if (geoLayer) mymap.removeLayer(geoLayer);
      if (mapLegend) mymap.removeControl(mapLegend);
      geoLayer = L.geoJSON(cleanFeatures, {
        style: styleByMetricColor,
        onEachFeature: function(feature, layer) {
          layer.on({
            mouseover: hoverFeature,
            click: clickedOnFeature,
            });
        },
      });
      geoLayer.addTo(mymap);

      mapLegend = L.control({ position: 'bottomright' });
      mapLegend.onAdd = function(map) {
        let div = L.DomUtil.create('div', 'info legend');
        let legHTML = getLegHTML(
          sel_colorvals,
          sel_colors,
          sel_binsflag,
          (app.pct_check && app.comp_check)? '%': '',
          app.selected_metric=='speed'? false: true
        );
        legHTML = '<h4>' + sel_metric.toUpperCase() + (app.pct_check? ' % Diff': (METRIC_UNITS.hasOwnProperty(sel_metric)? (' (' + METRIC_UNITS[sel_metric] + ')') : '')) +
                  '</h4>' + legHTML;
        div.innerHTML = legHTML;
        return div;
      };
      mapLegend.addTo(mymap);
      
      if (selectedGeo) {
        fac_lookup.hasOwnProperty(selectedGeo.feature.tmc)? updateFACChart(fac_lookup[selectedGeo.feature.tmc]) : updateFACChart();
        return cleanFeatures.filter(entry => entry.tmc == selectedGeo.feature.tmc)[0];
      } else {
        updateFACChart(metric_sum_map[app.selected_timep]);
        return null;
      }
    }
    
  } catch(error) {
    console.log(error);
  }
}

function styleByMetricColor(feat) {
  let color = getColorFromVal(
              feat['metric'],
              sel_colorvals,
              sel_colors,
              sel_binsflag
              );
  if (!color) color = MISSING_COLOR;
  return { color: color, weight: DEF_BWIDTH, opacity: 1.0 };
}

let infoPanelTimeout;
let oldHoverTarget;

function hoverFeature(e) {
  clearTimeout(infoPanelTimeout);
  infoPanel.update(e.target.feature);
  
  // don't do anything else if the feature is already clicked
  if (selGeoId === e.target.feature.tmc) return;

  // return previously-hovered segment to its original color
  if (oldHoverTarget && e.target.feature.tmc != selGeoId) {
    if (oldHoverTarget.feature.tmc != selGeoId)
      geoLayer.resetStyle(oldHoverTarget);
  }

  let highlightedGeo = e.target;
  highlightedGeo.bringToFront();
  highlightedGeo.setStyle(styles.selected);
  oldHoverTarget = e.target; 
}

let selGeoId;
let selectedGeo, prevSelectedGeo;
let selectedLatLng;

function highlightSelectedSegment() {
  if (!selGeoId) return;

  mymap.eachLayer(function (e) {
    try {
      if (e.feature.tmc === selGeoId) {
        e.bringToFront();
        e.setStyle(styles.popup);
        selectedGeo = e;
        return;
      }
    } catch(error) {}
  });
}

function clickedOnFeature(e) {
  e.target.setStyle(styles.popup);
  let geo = e.target.feature;
  selGeoId = geo.tmc;

  // unselect the previously-selected selection, if there is one
  if (selectedGeo && selectedGeo.feature.tmc != geo.tmc) {
    prevSelectedGeo = selectedGeo;
    geoLayer.resetStyle(prevSelectedGeo);
  }
  selectedGeo = e.target;
  let selfeat = selectedGeo.feature;
  app.chartSubtitle = selfeat.street + ' ' + selfeat.direction + ' at ' + selfeat.intersec;
  selectedLatLng = e.latlng;
  showSegmentDetails(selectedLatLng);
  fac_lookup.hasOwnProperty(selGeoId)? updateFACChart(fac_lookup[selGeoId]) : updateFACChart();
}

let popSelGeo;
function showSegmentDetails(latlng) {
  // show popup
  popSelGeo = L.popup()
    .setLatLng(latlng)
    .setContent(infoPanel._div.innerHTML)
    .addTo(mymap);

  // Revert to overall chart when no segment selected
  popSelGeo.on('remove', function(e) {
    geoLayer.resetStyle(selectedGeo);
    prevSelectedGeo = selectedGeo = selGeoId = null;
    app.chartSubtitle = chart_deftitle;
    updateFACChart(metric_sum_map[app.selected_timep]);
  });
}

Chart.defaults.global.defaultFontColor = 'white';
var facChart = null;
let fac_colors = {Network:'rgb(0, 0, 0)',Population:'rgb(245, 97, 0)',Employment:'rgb(234, 174, 0)',TNC:'rgb(212, 21, 21)'};
//let fac_colors = {Network:'rgb(0, 0, 0)',Population:'rgb(252, 181, 28)',Employment:'rgb(245, 235, 145)',TNC:'rgb(191, 51, 56)'};
function updateFACChart(fdata={}) {
  let pdata = [];
  let plabels = [];
  let pcolors = [];

  if ((Object.keys(fdata).length>0)) {
    for (let entry of getFACData(fdata)) {
      pdata.push(entry.value);
      plabels.push(entry.label);
      pcolors.push(fac_colors[entry.label]);
    }
  }

  if (facChart) {
    facChart.data.datasets[0].data = pdata;
    facChart.data.datasets[0].backgroundColor = pcolors;
    facChart.data.labels = plabels;
    facChart.options.title.text = app.chartSubtitle;
    facChart.update();
  } else {
    var ctx = document.getElementById("facchart");
    facChart  = new Chart(ctx, {
      type: 'pie',
      data: {
        datasets: [{
                    data: pdata,
                    backgroundColor: pcolors,
                    borderWidth: 0}],
        labels: plabels
      },
      options: {
        //events: [],
        title: {
          display: true,
          text: app.chartSubtitle,
        },
        legend: {
          position: 'bottom',
          labels: {boxWidth: 20}
        },
        tooltips: {
          callbacks: {
            label: function(tooltipItem, data) {
              let value = data.datasets[tooltipItem.datasetIndex]['data'][tooltipItem.index];
              let label = data.labels[tooltipItem.index];
              return label + ': ' + value + '%';
            }
          }
        },
        plugins: {
          datalabels: {
            formatter: function(value, context) {
              return value + '%';
            },
            align: 'end',
            //anchor: 'end'
          }
        }
      }
    });    
  }
}

function getFACData(data){
  let fac_data = [];
  let scn_keys = Object.keys(data);
  let tot = 0;
  if (data[scn_keys[0]][app.selected_metric]==data[scn_keys[scn_keys.length-1]][app.selected_metric]) return fac_data;
  for (let entry of app.checkedScn) {
    let scnkey = FACTXT_MAP_CHK[entry][1];
    let val = data[scnkey][app.selected_metric];
    let preval = data[FACTXT_MAP_CHK[entry][0]][app.selected_metric];
    let x = val-preval;
    if (app.selected_metric=='speed') x = -1.0*x;
    if (x < 0) x = -1.0*x;
    fac_data.push({label:FACTXT_MAP[scnkey], value:x});
    tot += x;
  }
  if (fac_data.length==1) {
    fac_data[0].value = 100;
    return fac_data;
  }
  for (let entry of fac_data) {
    entry.value = Math.round((entry.value/tot)*100);
  }
  return fac_data;
}

async function selectionChanged(thing) {
  if (app.checkedScn.length==0) {
    app.sliderValue[1] = SCN_LIST[0];
  } else if (app.checkedScn.length==4) {
    app.sliderValue[1] = SCN_LIST[4];
  } else {
    let tmp = '2016 ';
    for (let k of app.checkedScn) {
      tmp += FACTXT_MAP[FACTXT_MAP_CHK[k][1]] + ' +';
    }
    app.sliderValue[1] = tmp.substr(0, tmp.length-2);
  }
  
  app.selected_metric=='speed'? app.selected_colorscheme = ['#3f324f','#963d8e','#d55175','#f2ad86','#ffffcc']: app.selected_colorscheme = ['#ffffcc','#f2ad86','#d55175','#963d8e','#3f324f'];
  let selfeat = await drawMapFeatures();
  if (selfeat) {
    highlightSelectedSegment();
    popSelGeo.setContent(getInfoHtml(selfeat));
  }
}

function getColorMode(cscheme) {
  if (app.modeMap.hasOwnProperty(cscheme.toString())) {
    return app.modeMap[cscheme];
  } else {
    return 'lrgb';
  }
}

function clickViz(chosenviz) {
  app.selected_metric = chosenviz;
  selectionChanged(null);
}

function clickTP(chosentp) {
  app.selected_timep = chosentp;
  selectionChanged(null);
}

function clickScn(scn) {
  app.checkedScnFlag[scn] = !app.checkedScnFlag[scn];
  app.checkedScn = [];
  for(let s of Object.keys(app.checkedScnFlag)) {
    if (app.checkedScnFlag[s]) app.checkedScn.push(s);
  }
  selectionChanged(null);
}


let app = new Vue({
  el: '#panel',
  delimiters: ['${', '}'],
  data: {
    vizlist: VIZ_LIST,
    vizinfo: VIZ_INFO,
    chartSubtitle: chart_deftitle,
    isPanelHidden: false,
    comp_check: true,
    pct_check: true,
    bp0: 0.0,
    bp1: 0.0,
    bp2: 0.0,
    bp3: 0.0,
    bp4: 0.0,
    bp5: 0.0,
    
    selected_timep: 'Daily',
    tplist: ['Daily','AM','MD','PM','EV','EA'],
    tpmap: {'Daily':['Daily',''],
            'EA':['3:00a-','6:00a'],
            'AM':['6:00a-','9:00a'],
            'MD':['9:00a-','3:30p'],
            'PM':['3:30p-','6:30p'],
            'EV':['6:30p-','3:00a']},
    selected_metric: 'vhd',
    sliderValue: [SCN_LIST[0],SCN_LIST[4]],
    scnlist: ['net','pop','emp','tnc'],
    scninfo: {
      'net': 'Network Effect',
      'pop': 'Population Effect',
      'emp': 'Employment Effect',
      'tnc': 'TNC Effect'
    },
    checkedScn: ['net','pop','emp','tnc'],
    checkedScnFlag: {
      'net': true,
      'pop': true,
      'emp': true,
      'tnc': true,
    },
    
    selected_colorscheme: ['#ffffcc','#f2ad86','#d55175','#963d8e','#3f324f'],
    color_options: [
    {text: 'Cream-Purple', value: ['#ffffcc','#3f324f']},
    {text: 'Purple-Cream', value: ['#3f324f','#ffffcc']},
    {text: 'GnYlRd', value: ['Green','Yellow','Red']},
    {text: 'RdYlGn', value: ['Red','Yellow','Green']},
    {text: 'YlOrRd', value: 'YlOrRd'},
    {text: 'Yellow-Blue', value: ['#fafa6e','#2A4858']},
    {text: 'YlRdBl', value: ['Yellow','Red','Black']},
    {text: 'Spectral', value: 'Spectral'},
    {text: 'YlGn', value: 'YlGn'},
    ],
    modeMap: {
      '#ffffcc,#663399': 'lch',
      '#ebbe5e,#3f324f': 'hsl',
      '#ffffcc,#3f324f': 'hsl',
      '#3f324f,#ffffcc': 'hsl',
      '#fafa6e,#2A4858': 'lch',
    },     
  },
  methods: {
    clickViz: clickViz,
    clickTP: clickTP,
    clickScn: clickScn,
    clickToggleHelp: clickToggleHelp,
    clickedShowHide: clickedShowHide,
  },
});

let slideapp = new Vue({
  el: '#slide-panel',
  delimiters: ['${', '}'],
  data: {
    isPanelHidden: false,
  },
  methods: {
    clickedShowHide: clickedShowHide,
  },
});

function clickedShowHide(e) {
  slideapp.isPanelHidden = !slideapp.isPanelHidden;
  app.isPanelHidden = slideapp.isPanelHidden;
  // leaflet map needs to be force-recentered, and it is slow.
  for (let delay of [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]) {
    setTimeout(function() {
      mymap.invalidateSize()
    }, delay)
  }
}

// eat some cookies -- so we can hide the help permanently
let cookieShowHelp = Cookies.get('showHelp');
function clickToggleHelp() {
  helpPanel.showHelp = !helpPanel.showHelp;

  // and save it for next time
  if (helpPanel.showHelp) {
    Cookies.remove('showHelp');
  } else {
    Cookies.set('showHelp', 'false', { expires: 365 });
  }
}

let helpPanel = new Vue({
  el: '#helpbox',
  data: {
    showHelp: cookieShowHelp == undefined,
  },
  methods: {
    clickToggleHelp: clickToggleHelp,
  },
  mounted: function() {
    document.addEventListener('keydown', e => {
      if (this.showHelp && e.keyCode == 27) {
        clickToggleHelp();
      }
    });
  },
});

initialPrep();

