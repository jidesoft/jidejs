fs = require 'fs'
path = require 'path'
nunjucks = require 'nunjucks'

module.exports = (env, callback) ->

  class NunjucksPlugin extends env.ContentPlugin
    constructor: (@_filepath, @_template) ->

    getFilename: ->
      @_filepath.relative

    getView: ->
      (env, locals, contents, templates, callback) ->
        data = Object.create(locals);
        locals.env = env
        locals.contents = contents
        locals.page = this
        callback null, new Buffer @_template.render(data)

  NunjucksPlugin.fromFile = (filepath, callback) ->
    nenv = new nunjucks.Environment([
      new nunjucks.FileSystemLoader(env.contentsPath),
      new nunjucks.FileSystemLoader(env.templatesPath)])
    callback null, new NunjucksPlugin(filepath, nenv.getTemplate(filepath.full))

  env.registerContentPlugin 'html', '**/*.html', NunjucksPlugin
  callback()