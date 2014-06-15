'use strict';

/**
 * @ngdoc overview
 * @name webrtcApp
 * @description
 * # webrtcApp
 *
 * Main module of the application.
 */
angular
  .module('webrtcApp', []);


angular.module('webrtcApp', [])
    .directive('onFinishRender', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, element, attr) {
            if (scope.$last === true) {
                $timeout(function () {
                    scope.$emit('ngRepeatFinished');
                });
            }
        }
    }
});