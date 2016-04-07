(function(){
    'use strict';
    var module = angular.module('app', ['onsen', 'cordovaGeolocationModule', 'ImgCache']);

    /**
     *
     * Shared Properties Service
     *
     */
    module.service('sharedProperties', function() {
        var listLoaded = false;
        var cacheData = localStorage.cacheData ? localStorage.cacheData : null;

        return {
            getListLoaded: function() {
                return listLoaded;
            },
            setListLoaded: function(value) {
                listLoaded = value;
            },
            getCacheData: function() {
                return JSON.parse(cacheData);
            },
            setCacheData: function(value) {
                value = JSON.stringify(value);
                cacheData = value;
                localStorage.cacheData = value;
            },
            setCacheDataItem: function(index, value) {
                var newCacheData = JSON.parse(cacheData);
                newCacheData.items[index] = value;
                cacheData = JSON.stringify(newCacheData);
                localStorage.cacheData = cacheData;
            }
        }
    });

    /**
     *
     * App Controller
     *
     */
    module.controller('AppController', function($scope, $data, ImgCache, sharedProperties) {

        // Button functions
        $scope.buttonPress = function(action, value) {
            switch(action) {
                case 'call':
                    window.open("tel:" + value, "_system");
                    break;
                case 'email':
                    window.open("mailto:" + value, "_system");
                    break;
                case 'geo':
                    window.open("geo://?q=" + value, "_system");
                    break;
                case 'web':
                    window.open(value, "_system");
                    break;
                default:
                    window.open(value, "_system");
                    break;
            }
        };

        // Create contact function
        $scope.createContact = function(name, number) {
            var contact = navigator.contacts.create({"displayName": name});

            var phoneNumbers = [];
            phoneNumbers[0] = new ContactField('mobile', number, true);
            contact.phoneNumbers = phoneNumbers;

            contact.save();
        };

        // Init image cache library
        ons.ready(function() {
            ImgCache.$init();

        });

    });

    /**
     *
     * Options Controller
     *
     */
    module.controller('OptionsController', function($scope, sharedProperties) {

        $scope.cacheEnabled = localStorage.cacheEnabled ? (localStorage.cacheEnabled == 'true') : false;

        // Save settings function
        $scope.saveSettings = function() {
            localStorage.cacheEnabled = $scope.cacheEnabled;
        };

        // Delete cache function
        $scope.deleteCache = function() {

            ons.notification.confirm({
                message: 'Weet je zeker dat je het cache geheugen wilt legen?',
                title: 'Let op',
                buttonLabels: ['Ja', 'Nee'],
                animation: 'default', // or 'none'
                primaryButtonIndex: 1,
                cancelable: true,
                callback: function(index) {
                    if(index === 0) {
                        sharedProperties.setCacheData(null);
                        ImgCache.clearCache();
                        ons.notification.alert({
                            message: 'Cache verwijderd!'
                        });
                    }
                }
            });

        };

    });

    /**
     *
     * Detail Controller
     *
     */
    module.controller('DetailController', function($scope, $data) {
        $scope.items = $data.items;
        $scope.index = $data.selectedItemIndex;

        // Set carousel index
        ons.ready(function() {
            setImmediate(function(){
                carousel.setActiveCarouselItemIndex($scope.index, {
                    animation : 'none'
                });
            });
        });
    });

    /**
     *
     * Master Controller
     *
     */
    module.controller('MasterController', function($scope, $data, $q, $http, sharedProperties) {
        $scope.listLoaded = sharedProperties.getListLoaded();
        $scope.error = $data.error;
        $scope.items = $data.items;

        $scope.sharedProperties = sharedProperties;
        $scope.$watch('sharedProperties.getListLoaded()', function(newValue) {
            $scope.listLoaded = newValue;
            $scope.items = $data.items;
        });

        // Show details on phone (push page)
        $scope.showDetail = function(index) {
            $data.selectedItem = $data.items[index];
            $data.selectedItemIndex = index;
            $scope.navi.pushPage('detail.html', {title : $data.selectedItem.title});
        };

        // Show details on tablet (split screen)
        $scope.showDetailTablet = function(index) {
            $data.selectedItem = $data.items[index];
            $data.selectedItemIndex = index;
            splitView.setMainPage('detail.html');
        };

        // Show options
        $scope.showOptions = function() {
            $scope.navi.pushPage('options.html', {title : 'Instellingen'});
        };

    });

    /**
     *
     * Data method
     *
     */
    module.factory('$data', function($q, $http, cordovaGeolocationService, sharedProperties, ImgCache) {
        var data = {};
        data.canceler = $q.defer();
        data.items = [];

        if(sharedProperties.getCacheData() != null) {
            data.items = sharedProperties.getCacheData().items;
            sharedProperties.setListLoaded(true);
        } else {
            if(cordovaGeolocationService.checkGeolocationAvailability()) {
                cordovaGeolocationService.getCurrentPosition(function(position) {

                    $http.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyCa7_xDOrAkBwMIgCYe3zet8dNZYjLbgII&location=' + position.coords.latitude + ',' + position.coords.longitude + '&radius=5000&type=bar|cafe', {timeout: data.canceler.promise})
                        .success(function(apiData) {
                            sharedProperties.setListLoaded(true);
                            data.items = apiData.results;

                            var cacheData = {
                                date: Date.now,
                                items: data.items
                            }
                            sharedProperties.setCacheData(cacheData);

                            angular.forEach(data.items, function(value, key) {
                                $http.get('https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyCa7_xDOrAkBwMIgCYe3zet8dNZYjLbgII&placeid=' + value.place_id, {
                                    timeout: data.canceler.promise
                                }).success(function(apiData) {
                                    data.items[key].details = apiData.result;
                                    data.items[key].details.geometry.location.coords = data.items[key].details.geometry.location.lat + "," + data.items[key].details.geometry.location.lng;

                                    if(data.items[key].details.hasOwnProperty('photos')) {
                                        data.items[key].details.photoUrl =  'https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyAX3l5GFtC7mvb6WvMv13Puxk_OsaEVQ3U&maxwidth=640&photoreference=' + data.items[key].details.photos[0].photo_reference;
                                    } else {
                                        data.items[key].details.photoUrl = 'images/default.jpg';
                                    }

                                    sharedProperties.setCacheDataItem(key, data.items[key]);
                                }).error(function() {
                                    data.items[key].details = {};
                                    data.items[key].details.photoUrl = 'images/default.jpg';

                                    sharedProperties.setCacheDataItem(key, data.items[key]);
                                });
                            });


                        })
                        .error(function() {
                            data.error = 'Er zijn geen kroegen gevonden.';
                        });

                }, function(error) {
                    data.error = 'Uw locatie kan niet worden gevonden.';
                }, { enableHighAccuracy: true });
            } else {
                data.error = "Uw locatie kan niet worden gevonden.";
            }
        }
        return data;
    });

})();

