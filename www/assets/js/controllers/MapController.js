(function(){
    'use strict';

    angular.module('app').controller('MapController', function($scope, $timeout) {
        var page = $scope.navi.getCurrentPage();
        $scope.item = page.options.item;

        $scope.map;
        $scope.markers = [];
        $scope.bounds = new google.maps.LatLngBounds();

        // Init Google Maps
        $timeout(function(){

            var latlng = new google.maps.LatLng(51.27474506286809, 5.57499242565794);
            var myOptions = {
                zoom: 14,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            $scope.map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
            $scope.overlay = new google.maps.OverlayView();
            $scope.overlay.draw = function() {}; // empty function required
            $scope.overlay.setMap($scope.map);
            $scope.element = document.getElementById('map_canvas');

            // Add all markers
            angular.forEach($scope.item.bars, function(value, key) {
                $scope.addMarker(value.bar[0].location.lat, value.bar[0].location.long);
            });

            $scope.map.fitBounds($scope.bounds);

        },100);

        // Add markers
        $scope.addMarker = function(lat, lng) {
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(lat, lng),
                map: $scope.map
            });

            $scope.markers.push(marker);
            $scope.bounds.extend(marker.position);
        };

    });

})();