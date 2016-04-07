var cordovaGeolocationModule = angular.module('cordovaGeolocationModule', []);

// Constants
cordovaGeolocationModule.constant('cordovaGeolocationConstants', {
    apiVersion: '1.0.0',
    cordovaVersion: '>=3.4.0'
});

// Services
cordovaGeolocationModule.factory('cordovaGeolocationService', ['$rootScope', '$log', 'cordovaGeolocationConstants', function ($rootScope, $log, cordovaGeolocationConstants) {
    return {

        apiVersion: function () {
            $log.debug('cordovaGeolocationService.apiVersion.');
            return cordovaGeolocationConstants.apiVersion;
        },

        cordovaVersion: function () {
            $log.debug('cordovaGeolocationService.cordovaVersion.');
            return cordovaGeolocationConstants.cordovaVersion;
        },

        checkGeolocationAvailability: function () {
            $log.debug('cordovaGeolocationService.checkGeolocationAvailability.');
            if (!navigator.geolocation) {
                $log.warn('Geolocation API is not available.');
                return false;
            }
            return true;
        },

        getCurrentPosition: function (successCallback, errorCallback, options) {
            $log.debug('cordovaGeolocationService.getCurrentPosition.');

            // Checking API availability
            if (!this.checkGeolocationAvailability()) {
                return;
            }
            // API call
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    $rootScope.$apply(successCallback(position));
                },
                function (error) {
                    $rootScope.$apply(errorCallback(error));
                },
                options
            );
        },

        watchPosition: function (successCallback, errorCallback, options) {
            $log.debug('cordovaGeolocationService.watchPosition.');

            // Checking API availability
            if (!this.checkGeolocationAvailability()) {
                return;
            }

            // API call
            return navigator.geolocation.watchPosition(
                function (position) {
                    $rootScope.$apply(successCallback(position));
                },
                function (error) {
                    $rootScope.$apply(errorCallback(error));
                },
                options
            );
        },

        clearWatch: function (watchID) {
            $log.debug('cordovaGeolocationService.clearWatch.');

            // Checking API availability
            if (!this.checkGeolocationAvailability()) {
                return;
            }

            // API call
            navigator.geolocation.clearWatch(watchID);
        }
    };
}]);

