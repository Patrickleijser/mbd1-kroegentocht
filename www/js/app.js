(function(){
    'use strict';
    var module = angular.module('app', ['onsen', 'cordovaGeolocationModule', 'ImgCache']);

    /**
     *
     * Shared Properties Service
     *
     */
    app.service('sharedProperties', function() {
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
            },
            getCacheDataAge: function() {

                // TODO: Fix this function
                if(cacheData == null)
                    return 0;

                var difference = parseInt(this.getCacheData().date) - Date.now;

                var daysDifference = Math.floor(difference/1000/60/60/24);
                difference -= daysDifference*1000*60*60*24

                var hoursDifference = Math.floor(difference/1000/60/60);
                difference -= hoursDifference*1000*60*60

                return difference;
            }
        }
    });

    /**
     *
     * App Controller
     *
     */
    module.controller('AppController', function($scope, $data, ImgCache, sharedProperties) {
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

        $scope.createContact = function(name, number) {
            var contact = navigator.contacts.create({"displayName": name});

            var phoneNumbers = [];
            phoneNumbers[0] = new ContactField('mobile', number, true);
            contact.phoneNumbers = phoneNumbers;

            contact.save();
        };

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

        $scope.showOptions = function() {
            $scope.navi.pushPage('options.html', {title : 'Instellingen'});
        };

        ons.ready(function() {
            ImgCache.$init();

        });

    });

    /**
     *
     * Options Controller
     *
     */
    module.controller('OptionsController', function($scope, $data) {

    });

    /**
     *
     * List Controller
     *
     */
    module.controller('ListController', function($scope, $data) {

    });

    /**
     *
     * Detail Controller
     *
     */
    module.controller('DetailController', function($scope, $data) {
        $scope.items = $data.items;
        $scope.index = $data.selectedItemIndex;


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

        $scope.sharedProperties = sharedProperties;
        $scope.$watch('sharedProperties.getListLoaded()', function(newValue) {
            $scope.listLoaded = newValue;
        });

        $scope.showDetail = function(index) {
            $data.selectedItem = $data.items[index];
            $data.selectedItemIndex = index;
            $scope.navi.pushPage('detail.html', {title : $data.selectedItem.title});
        };

        $scope.infiniteScroll = {
            configureItemScope: function(index, itemScope) {
                itemScope.canceler = $q.defer();
                itemScope.item = $data.items[index];

                /*$http.get('https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyAX3l5GFtC7mvb6WvMv13Puxk_OsaEVQ3U&placeid=' + itemScope.item.place_id, {
                    timeout: itemScope.canceler.promise
                }).success(function(data) {
                    console.log(data);
                    $data.items[index].details = data.result;
                    $data.items[index].details.photoUrl = 'images/default-header.jpg';
                    if($data.items[index].details.hasOwnProperty('photos')) {
                        $data.items[index].details.photoUrl = 'https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyAX3l5GFtC7mvb6WvMv13Puxk_OsaEVQ3U&maxwidth=640&photoreference=' + $data.items[index].details.photos[0].photo_reference;
                    } else {
                        $data.items[index].details.photoUrl = '';
                    }
                }).error(function() {
                    $data.items[index].details.photoUrl = 'images/default-header.jpg';
                });*/
            },
            calculateItemHeight: function(index) {
                return 74;
            },
            countItems: function() {
                return $data.items.length;
            },
            destroyItemScope: function(index, scope) {
                console.log("Destroyed item #" + index);
            }
        };

        $scope.refreshItems = function($done) {
            setTimeout(function() {
                $data.items = $data.items;
                $done();
            }, 2000);
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
                                    data.items[key].details.photoUrl = 'http://lorempixel.com/600/400/nightlife/';


                                    sharedProperties.setCacheDataItem(key, data.items[key]);
                                    /*if($data.items[index].details.hasOwnProperty('photos')) {
                                        $data.items[index].details.photoUrl = 'https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyAX3l5GFtC7mvb6WvMv13Puxk_OsaEVQ3U&maxwidth=640&photoreference=' + $data.items[index].details.photos[0].photo_reference;
                                    } else {
                                        $data.items[index].details.photoUrl = '';
                                    }*/
                                }).error(function() {
                                    data.items[key].details = {};
                                    data.items[key].details.photoUrl = 'http://lorempixel.com/600/400/nightlife/';

                                    sharedProperties.setCacheDataItem(key, data.items[key]);
                                });
                            });


                        })
                        .error(function() {
                            data.error = 'Foutcode 1';
                        });

                }, function(error) {
                    data.error = error;
                });
            } else {
                data.error = 'Foutcode 2';
            }
        }

        return data;
    });

})();

