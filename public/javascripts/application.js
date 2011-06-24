$(function(){
    

    
    
    
  var h1_interval;
  var next_z_index = 0;
  var days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
  var marker_icon = 'images/icon_truck_arrow.png';
  var marker_icon_hover = 'images/icon_truck_hover.png';
  var bounds = new google.maps.LatLngBounds();

  var visible_markers = [];

  var zoom_min = 11;
  var zoom_max = 17;
  
  var markers_by_id = {};
  var neighborhood_markers = {};
  var active_neighborhoods = {};
  // var seattle = new google.maps.LatLng(47.61680985980715, -122.34203338623047);
  //   var options = {
  //     zoom: 12,
  //     center: Seattle,
  //     scrollwheel: false,
  //     disableDefaultUI: true,
  //     navigationControl: false,
  //     navigationControlOptions: {
  //         position: google.maps.ControlPosition.BOTTOM_LEFT
  //     },
      mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_box"), options);
  
  
  
  // Jack adding geolocation

  function success(position) {
    var s = document.querySelector('#status');

    if (s.className == 'success') {
      // not sure why we're hitting this twice in FF, I think it's to do with a cached result coming back    
      return;
    }

    s.innerHTML = "found you!";
    s.className = 'success';

    var mapcanvas = document.createElement('div');
    mapcanvas.id = 'mapcanvas';
    mapcanvas.style.height = '75%';
    mapcanvas.style.width = '75%';

    document.querySelector('article').appendChild(mapcanvas);

    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var myOptions = {
      zoom: 15,
      center: latlng,
      mapTypeControl: false,
      navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);

    var marker = new google.maps.Marker({
        position: latlng, 
        map: map, 
        title:"You are here!"
    });
  }

  function error(msg) {
    var s = document.querySelector('#status');
    s.innerHTML = typeof msg == 'string' ? msg : "failed";
    s.className = 'fail';

    // console.log(arguments);
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    error('not supported');
  }
  
  
  
  // end
  
  
  
  // EVENT HANDLERS
  $(window).scroll(function(e){
    console.log(new Date());
    if ($('body').height() > $(window).height())
      $("#map_box").css('top', $(window).scrollTop());
    else
      $("#map_box").css('top', 0);
  });
  google.maps.event.addListener(map, 'zoom_changed', function() {
    check_zoom_disabled();
  });
  $("#zoom_in").click(function(){
    map.setZoom(Math.min(zoom_max, map.getZoom() + 1));
  });
  $("#zoom_out").click(function(){
    map.setZoom(Math.max(zoom_min, map.getZoom() - 1));
  });
  $("#magic_zoom").click(function(){
    update_bounds();
  });
  function check_zoom_disabled(){
    if (map.getZoom() < zoom_min) map.setZoom(zoom_min);
    if (map.getZoom() > zoom_max) map.setZoom(zoom_max);

    if (map.getZoom() == zoom_min) $("#zoom_out").addClass("disabled");
    else $("#zoom_out").removeClass("disabled");

    if (map.getZoom() == zoom_max) $("#zoom_in").addClass("disabled");
    else $("#zoom_in").removeClass("disabled");
  }
  $("h1").hover(function(){
    $this = $(this);
    $this.css('background-color', '#333');
    // h1_interval = setInterval(function(){
    //   $this.css('background-color', get_random_color);
    // }, 10);
  }, function(){
    // clearInterval(h1_interval);
    $this.css('background-color', 'white');
  });
  $("#top_nav a").toggle(function(e){
    return false;
  }, function(e){
    return false;
  });
  $("#info_panel a.name").live('mouseover mouseout', function(event) {
    if (event.type == 'mouseover') {
      // MOUSEOVER
      $(this).addClass('active');
      var id = ($(this).data('address-id'));
      var m = markers_by_id[id];
      m.setIcon(marker_icon_hover);
      m.setZIndex(next_z_index);
      next_z_index++;
    } else {
      // MOUSEOUT
      $(this).removeClass('active');
      var id = ($(this).data('address-id'));
      var m = markers_by_id[id];
      m.setIcon(marker_icon);
    }
  });
  $("#info_panel a.name").live('click', function(){
    show_address_info($(this).data("address-id"));
    return false;
  });
  $("#left_nav a").toggle(function(e){
    var a = $(this);
    a.addClass('active');
    var id = a.data('id');
    active_neighborhoods[id] = true;

    update_filtering();
    return false;
  }, function(e){
    var a = $(this);
    a.removeClass('active');
    var id = a.data('id');
    active_neighborhoods[id] = false;

    update_filtering();
    return false;
  });

  function update_filtering(){
    $.each(active_neighborhoods, function(id, is_active){
      if (is_active){
        // SHOW ACTIVE
        if (neighborhood_markers[id] == null){
          neighborhood_markers[id] = [];
          var neighborhood_data = neighborhoods_by_id[id];
          // CREATE NEW MARKERS (happens first time only)
          $.each(neighborhood_data.addresses, function(index, address){
            var spot = address.spot;
            
            var marker = new google.maps.Marker({
              position: new google.maps.LatLng(address.latitude, address.longitude),
              map: map,
              title: spot.name,
              id: spot.id,
              icon: new google.maps.MarkerImage(marker_icon),
              zIndex: next_z_index
            });
            google.maps.event.addListener(marker, 'mouseover', function() {
              $("#address_" + this.address.id + " .name").mouseover();
            });
            google.maps.event.addListener(marker, 'mouseout', function() {
              $("#address_" + this.address.id + " .name").mouseout();
            });
            google.maps.event.addListener(marker, 'click', function() {
              show_address_info(this.address.id);
            });
            
            next_z_index++;
            markers_by_id[address.id] = marker;
            marker.address = address;
            show_marker(marker);
            neighborhood_markers[id].push(marker);
          });
        } else {
          // SHOW EXISTING MARKERS (happens second time on)
          $.each(neighborhood_markers[id], function(index,marker){
            show_marker(marker);
          });
        }
      } else {
        // HIDE INACTIVE
        $.each(neighborhood_markers[id], function(index,marker){
          hide_marker(marker);
        });
      }
      // console.log(id, is_active);
    });

    return;
  }
  function show_address_info(address_id){
    var spot_info = $("#address_" + address_id + " .spot_info");
    // if (spot_info.css('display') == 'none'){
      spot_info.fadeIn();
      var marker = markers_by_id[address_id];
      map.setCenter(marker.getPosition());
      map.setZoom(zoom_max - 2);
    // } else {
    //   spot_info.hide();
    // }
  }
  function update_info_panel(){
    var active_count = 0;

    var info_panel = $("#info_panel");
    info_panel.html(""); // clear
    info_panel.show();
    $.each(active_neighborhoods, function(id, is_active){
      if (is_active){
        active_count++;
        var neighborhood_data = neighborhoods_by_id[id];

        var info_div = "" +
        "   <div class='neighborhood'>" + 
        "     <h3>{{name}}</h3>" + 
        "     <ul>" +
        "       {{#addresses}}" +
        "         <li class='spot' id='address_{{id}}'>" +
        "           <a href='#' class='name' data-address-id='{{id}}'>{{spot/name}}</a>" +
        "           <ul class='days_available'>{{#days_available}}{{/days_available}}</ul>" +
        "           <div class='spot_info'>" +
        "             {{address}}<br>" +
        "             {{city}}, {{state}} {{zip}}<br>" +
        "             {{spot/phone}}<br>" +
        "             <a href='{{spot/url}}' target='_blank'>website</a><br>" +
        "           </div>" +
        "         </li>" +
        "       {{/addresses}}" +
        "     </ul>" +
        "   </div>" +
        "";
        Handlebars.registerHelper('days_available', function(context, fn) {
          var self = this;
          return $.map(days, function(value){
            var class_name = self.__get__(value) ? "available" : "";
            return "<li class='" + class_name + "'>" + value[0] + "</li>";
          }).join("");
        });

        var info_div_template = Handlebars.compile(info_div);
        info_panel.append(info_div_template(neighborhood_data));
      }
    });
    if (active_count == 0) info_panel.hide();
  }
  function show_marker(marker){
    if (!marker.is_shown){
      marker.is_shown = true;
      marker.setMap(map);
      visible_markers.push(marker);
      update_info_panel();
    }
  }
  function hide_marker(marker){
    marker.is_shown = false;
    marker.setMap(null);
    visible_markers.remove(marker);
    update_info_panel();
  }


  // MAGIC ZOOM
  function update_bounds(){
    bounds = new google.maps.LatLngBounds();
    $.each(visible_markers, function(index,marker){
      bounds.extend(marker.getPosition());
    });
    if (visible_markers.length > 0){
      // map.fitBounds(bounds);
      setTimeout( function() {
        map.fitBounds(bounds); 
        check_zoom_disabled();
      }, 1);
    }else {
      map.setCenter(options.center);
      map.setZoom(options.zoom);
      check_zoom_disabled();
    }
  }

  Array.prototype.remove = function (o) {
    if ($.inArray(o,this) >= 0) this.splice($.inArray(o, this), 1);
    return this;
  }
  
  // helpers
  function get_random_color() {
    function c() {
      return (10 + (Math.floor(Math.random()*156))).toString(16)
    }
    return "#"+c()+c()+c();
  }
});
