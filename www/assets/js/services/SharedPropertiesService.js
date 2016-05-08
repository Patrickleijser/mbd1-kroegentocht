(function(){
    'use strict';

    angular.module('app').service('SharedPropertiesService', function() {
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

})();