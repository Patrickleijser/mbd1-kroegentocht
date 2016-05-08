(function(){
    'use strict';

    angular.module('app').controller('DetailController', function($scope, DataService, cordovaGeolocationService) {
        var page = $scope.navi.getCurrentPage();
        $scope.item = page.options.item;

        /*$scope.index = $data.selectedItemIndex;

        // Set carousel index
        ons.ready(function() {
            setImmediate(function(){
                carousel.setActiveCarouselItemIndex($scope.index, {
                    animation : 'none'
                });
            });
        });*/

        $scope._coordsToMeters = function(lat1, lon1, lat2, lon2){  // generally used geo measurement function
            var R = 6378.137; // Radius of earth in KM
            var dLat = (lat2 - lat1) * Math.PI / 180;
            var dLon = (lon2 - lon1) * Math.PI / 180;
            var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            var d = R * c;
            return d * 1000; // meters
        };

        $scope.openMap = function() {
            $scope.navi.pushPage('map.html', { title : $scope.item.name, item : $scope.item });
        };

        $scope.openBars = function() {
            $scope.navi.pushPage('bars.html', { title : $scope.item.name, items : $scope.item.bars });
        };

        $scope.changeVisited = function(bar) {
            if(cordovaGeolocationService.checkGeolocationAvailability()) {
                cordovaGeolocationService.getCurrentPosition(function(position) {
                    var meters = $scope._coordsToMeters(position.coords.latitude, position.coords.longitude, bar.bar[0].location.lat, bar.bar[0].location.long);
                    if(meters > 20) {
                        ons.notification.alert({
                            message: 'U bent niet aanwezig in de geselecteerde kroeg. (' + Math.round(meters) + '/20 meter)'
                        });
                        bar.visited = false;
                    } else {
                        DataService.editBarInRace($scope.item._id, bar.bar[0]._id, bar.visited).then(function(data) {
                            ons.notification.alert({
                                message: data
                            });
                        });
                    }
                }, function(error) {
                    ons.notification.alert({
                        message: 'Uw locatie kan niet worden gevonden. (#1)'
                    });
                }, { enableHighAccuracy: true });
            } else {
                ons.notification.alert({
                    message: 'Uw locatie kan niet worden gevonden. (#2)'
                });
            }
        };
    });

})();