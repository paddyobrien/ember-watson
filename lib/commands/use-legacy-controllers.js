'use strict';

var Watson = require('../../index');
var watson = new Watson();

module.exports = {
  name: 'watson:use-legacy-controllers',
  description: 'Replace array and object controllers with their legacy equivalents.',
  works: 'insideProject',
  anonymousOptions: [
    '<path>'
  ],
  run: function(commandOptions, rawArgs) {
    var path = rawArgs[0] || 'app/controllers';
    watson.useLegacyControllers(path);
  }
};
