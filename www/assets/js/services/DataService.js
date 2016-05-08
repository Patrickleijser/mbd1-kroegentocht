angular.module('app').factory('DataService', function($q, $http) {

    // Vars
    var _googleApiKey = 'AIzaSyCa7_xDOrAkBwMIgCYe3zet8dNZYjLbgII';

    // Functions
    var getRaces = function() {
        var deferred = $q.defer();

        var req = {
            method: 'GET',
            url: 'https://vast-journey-84913.herokuapp.com/races',
            headers: {
                'Content-Type': 'application/json'
            },
            data: ''
        }

        $http(req).then(function(res){
            console.log(res.data);
            deferred.resolve(res.data);
        }, function(){
            deferred.resolve('Er zijn geen races gevonden.');
        });

        return deferred.promise;
    };

    var getBar = function(place_id) {
        var deferred = $q.defer();

        var req = {
            method: 'GET',
            url: 'https://maps.googleapis.com/maps/api/place/details/json?placeid=' + place_id + '&key=' + _googleApiKey,
            headers: {
                'Content-Type': 'application/json'
            },
            data: ''
        }

        $http(req).then(function(res){

            if(res.data.result.hasOwnProperty('photos')) {
                res.data.result.photoUrl =  'https://maps.googleapis.com/maps/api/place/photo?key=AIzaSyAX3l5GFtC7mvb6WvMv13Puxk_OsaEVQ3U&maxwidth=640&photoreference=' + res.data.result.photos[0].photo_reference;
            } else {
                res.data.result.photoUrl = 'assets/images/default.jpg';
            }

            deferred.resolve(res.data.result);
        }, function(){
            deferred.resolve('Kroeg niet gevonden.');
        });

        return deferred.promise;
    }

    var editBarInRace = function(raceid, barid, visited) {
        var deferred = $q.defer();

        var req = {
            method: 'PUT',
            url: 'https://vast-journey-84913.herokuapp.com/races/' + raceid + '/bars/' + barid,
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                'visited' : visited
            }
        }

        $http(req).then(function(res){
            deferred.resolve('Bar is gemarkeerd als bezocht.');
        }, function(){
            deferred.resolve('Bar is niet gemarkeerd als bezocht.');
        });

        return deferred.promise;
    };

    var addRace = function(name, lat, lng) {
        var deferred = $q.defer();

        var req = {
            method: 'POST',
            url: 'https://vast-journey-84913.herokuapp.com/races',
            headers: {
                'Content-Type': 'application/json'
            },
            data: {
                'name': name,
                'lat': lat,
                'lng': lng,
                'raceLeader': '5702c4981adb13154894face'
            }
        }

        $http(req).then(function(res){
            deferred.resolve(res);
            console.log(res);
        }, function(){
            deferred.resolve('Kroegenrace is niet aangemaakt.');
        });

        return deferred.promise;
    };

    // Return
    return {
        getRaces: getRaces,
        getBar: getBar,
        addRace: addRace,
        editBarInRace: editBarInRace
    };

});