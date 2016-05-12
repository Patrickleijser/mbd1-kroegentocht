(function(){
    'use strict';

    angular.module('app').controller('MasterController', function($scope, DataService, cordovaGeolocationService, SharedPropertiesService) {
        //$scope.error = $data.error;

        // Get races
        $scope.refreshRaces = function(resetCache) {
            if(resetCache) {
                SharedPropertiesService.setCacheData(null);
            }

            DataService.getRaces().then(function(data) {
                $scope.items = data;
            });
        };

        // Show details on phone (push page)
        $scope.showDetail = function(index) {
            $scope.navi.pushPage('detail.html', { title : $scope.items[index].name, item : $scope.items[index] });
        };

        // Show details on tablet (split screen)
        /*$scope.showDetailTablet = function(index) {
            $data.selectedItem = $data.items[index];
            $data.selectedItemIndex = index;
            splitView.setMainPage('detail.html');
        };*/

        // Show options
        $scope.showOptions = function() {
            $scope.navi.pushPage('options.html', {title : 'Instellingen'});
        };

        $scope.addRace = function() {
            // Ask geolocation
            if(cordovaGeolocationService.checkGeolocationAvailability()) {
                cordovaGeolocationService.getCurrentPosition(function(position) {
                    ons.notification.prompt({
                        message: "Vul een naam in.",
                        callback: function(value) {

                            if(value != '') {
                                DataService.addRace(value, position.coords.latitude, position.coords.longitude).then(function(data) {
                                    $scope.refreshRaces(true);
                                });

                                ons.notification.alert({
                                    message: 'Kroegenrace ' + value + ' is aangemaakt.'
                                });
                            } else {
                                ons.notification.alert({
                                    message: 'Gelieve een naam in te vullen.'
                                });
                            }
                        }
                    });
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

        $scope.refreshItems = function($done) {
            $scope.items = null;
            SharedPropertiesService.setCacheData(null);
            DataService.getRaces().then(function(data) {
                $scope.items = data;
                $done();
            });
        };

        $scope.refreshRaces(false);

    });

})();