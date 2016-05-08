(function(){
    'use strict';

    angular.module('app').controller('OptionsController', function($scope, SharedPropertiesService) {

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
                        SharedPropertiesService.setCacheData(null);
                        ImgCache.clearCache();
                        ons.notification.alert({
                            message: 'Cache verwijderd!'
                        });
                    }
                }
            });

        };

    });
    
})();