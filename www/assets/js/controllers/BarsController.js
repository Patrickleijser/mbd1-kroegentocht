(function(){
    'use strict';

    angular.module('app').controller('BarsController', function($scope, DataService) {
        var page = $scope.navi.getCurrentPage();
        $scope.items = page.options.items;

        angular.forEach($scope.items, function(value, key) {
            DataService.getBar(value.bar[0].google_id).then(function(data) {
                $scope.items[key].bar[0].details = data;
                console.log($scope.items[key]);
            });
        });
    });

})();