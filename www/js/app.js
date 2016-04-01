(function(){
  'use strict';
  var module = angular.module('app', ['onsen', 'cordovaGeolocationModule']);

  module.controller('AppController', function($scope, $data) {
    $scope.doSomething = function() {
      setTimeout(function() {
        ons.notification.alert({ message: 'tapped' });
      }, 100);
    };
  });

  module.controller('DetailController', function($scope, $data) {
    $scope.item = $data.selectedItem;

      $scope.buttonCall = function() {
          window.open("tel:" + $scope.item.details.formatted_phone_number, "_system");
      };

      $scope.buttonMail = function() {
          ons.notification.alert({ message: 'mailfddfen' });
      };

      $scope.buttonMap = function() {
          window.open("geo://?q=" + $scope.item.details.geometry.location.lat + "," + $scope.item.details.geometry.location.lng, "_system");
      };

      $scope.buttonWeb = function() {
          window.open($scope.item.details.website, "_system");
      };
  });

module.controller('MasterController', function($scope, $data, $q, $http) {

    $scope.showDetail = function(index) {
        console.log($data.items[index]);
      $data.selectedItem = $data.items[index];
      $scope.navi.pushPage('detail.html', {title : $data.selectedItem.title});
    };

      $scope.infiniteScroll = {
          configureItemScope: function(index, itemScope) {
              itemScope.canceler = $q.defer();
              itemScope.item = $data.items[index];

              $http.get('https://maps.googleapis.com/maps/api/place/details/json?key=AIzaSyAX3l5GFtC7mvb6WvMv13Puxk_OsaEVQ3U&placeid=' + itemScope.item.place_id, {
                  timeout: itemScope.canceler.promise
              }).success(function(data) {
                  $data.items[index].details = data.result;
                  if($data.items[index].details.photos != null) {
                      $data.items[index].details.photoUrl = 'https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyAX3l5GFtC7mvb6WvMv13Puxk_OsaEVQ3U&maxwidth=640&photoreference=' + $data.items[index].details.photos[0].photo_reference;
                  } else {
                      $data.items[index].details.photoUrl = '';
                  }
              }).error(function() {
                  $data.items[index].details = 'images/default-header.jpg';
              });
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
  });



  module.factory('$data', function($q, $http, cordovaGeolocationService) {
      var data = {};
      data.canceler = $q.defer();
      data.items = [];

      if(cordovaGeolocationService.checkGeolocationAvailability()) {
          cordovaGeolocationService.getCurrentPosition(function(position) {

              $http.get('https://maps.googleapis.com/maps/api/place/nearbysearch/json?key=AIzaSyAX3l5GFtC7mvb6WvMv13Puxk_OsaEVQ3U&location=' + position.coords.latitude + ',' + position.coords.longitude + '&radius=5000&type=bar|cafe', {timeout: data.canceler.promise})
                  .success(function(apiData) {
                      data.items = apiData.results;
                      console.log('collection success');
                  })
                  .error(function() {
                      data.items = [
                          {
                              error: 'HTTP erno No data'
                          }
                      ];
                  });

          }, function(error) {
              data.items = [
                  {
                      error: ' geo erno No data'
                  }
              ];
          });
      } else {
          data.items = [
              {
                  error: 'no geo loxartion No data'
              }
          ];
      }

      return data;
  });

})();

