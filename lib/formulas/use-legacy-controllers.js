var parseAst    = require('../helpers/parse-ast');
var recast      = require('recast');
var b    = recast.types.builders;
var addDefaultImport = require('./helpers/add-default-import');
var isImportFor = require('./helpers/is-import-for');

module.exports = function transform(source) {
  var ast = parseAst(source);
  var arrayControllerPath, objectControllerPath, emberImport;
  var emberUses = 0;
  recast.visit(ast, {
    visitMemberExpression: function(path) {
      if (isObjectController(path)) {
        objectControllerPath = path;
      }
      if (isArrayController(path)) {
        arrayControllerPath = path;
      }
      if (isEmberUse(path)) {
        emberUses++;
      }
      this.traverse(path);
    },
    visitImportDeclaration: function(path) {
      if (isImportFor('ember', path.node)) {
        emberImport = path;
      }
      this.traverse(path);
    },
  });
  if (objectControllerPath) {
    replaceObjectController(ast, objectControllerPath);
  }
  if (arrayControllerPath) {
    replaceArrayController(ast, arrayControllerPath);
  }
  if (emberImport && emberUses < 1) {
    emberImport.replace();
  }
  return recast.print(ast, { tabWidth: 2, quote: 'single' }).code;
};

function isArrayController(path) {
  return path.value.object.type === 'MemberExpression' &&
    (path.value.object.object.name === 'Em' || path.value.object.object.name === 'Ember') &&
    path.value.object.property.name === 'ArrayController';
}

function isObjectController(path) {
  return path.value.object.type === 'MemberExpression' &&
    (path.value.object.object.name === 'Em' || path.value.object.object.name === 'Ember') &&
    path.value.object.property.name === 'ObjectController';
}

function isEmberUse(path) {
  return path.value.type === 'MemberExpression' &&
    (path.value.object.name === 'Em' || path.value.object.name === 'Ember');
}

function replaceArrayController(ast, path) {
  addDefaultImport(ast, 'ember-legacy-controllers/array', 'ArrayController');
  path.replace(b.memberExpression(
      b.identifier('ArrayController'),
      b.identifier('extend'),
      false
    )
  );
}

function replaceObjectController(ast, path) {
  addDefaultImport(ast, 'ember-legacy-controllers/object', 'ObjectController');
  path.replace(b.memberExpression(
      b.identifier('ObjectController'),
      b.identifier('extend'),
      false
    )
  );
}