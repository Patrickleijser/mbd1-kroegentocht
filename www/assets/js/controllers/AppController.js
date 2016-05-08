(function(){
    'use strict';

    angular.module('app').controller('AppController', function($scope, DataService, ImgCache, SharedPropertiesService) {

        //DataService.addRace('Test', 51.27474506286809, 5.57499242565794);

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

            contact.save(function() {
                ons.notification.alert({
                    message: 'Contactpersoon succesvol opgeslagen!'
                });
            }, function() {
                ons.notification.alert({
                    message: 'Contactpersoon niet opgeslagen!'
                });
            });
        };

        // Init image cache library
        ons.ready(function() {
            ImgCache.$init();

        });

    });

})();