// This script licensed under the MIT.
// http://orgachem.mit-license.org


var path = require('path');
var fs = require('fs');


/**
 * JSON publisher.
 * @constructor
 */
var JsonPublisher = function() {};


/**
 * Builds an object that is able to be stringified.
 * @param {jsdoc.Doclet} symbol Doclet.
 * @return {Object} Plain object was built.
 */
JsonPublisher.prototype.buildObject = function(symbol) {
    if (!symbol) {
        console.log('WARNING: Empty symbol was found.');
        return {};
    }

    var obj = {
        comment: symbol.comment || null,
        name: symbol.name || null,
        longname: symbol.longname || null,
        kind: symbol.kind || null,
        description: symbol.description || null,
    };

    var meta;
    if (meta = symbol.meta) {
        obj.meta = {
            filename: meta.filename || null,
            lineno: typeof meta.lineno === 'number' ? meta.lineno : null,
            path: meta.path || null
        };
    }
    else {
        obj.meta = {};
    }

    var tags
    if (tags = symbol.tags) {
        obj.tags = tags.map(function(tag) {
            return {
                originalTitle: tag.originalTitle || null,
                title: tag.title || null,
                text: tag.text || null
            };
        }, this);
    }

    var borrowed;
    if (borrowed = symbol.borrowed) {
        obj.borrowed = symbol.borrowed.map(function(b) {
            var bObj = {
                from: b.from
            };

            var as;
            if (as = b.as) {
                bObj.as = as;
            }

            return bObj;
        });
    }

    var mixes;
    if (mixes = symbol.mixes) {
        obj.mixes = symbol.mixes;
    }

    var augments;
    if (augments = symbol.augments) {
        obj.augments = augments;
    }

    var examples;
    if (examples = symbol.examples) {
        obj.examples = examples;
    }

    var exceptions;
    if (exceptions = symbol.exceptions) {
        obj.exceptions = exceptions;
    }

    var properties;
    if (properties = symbol.properties) {
        obj.properties = properties.map(function(prop) {
            return this.buildObject(prop);
        }, this);
    }

    var requires;
    if (requires = symbol.requires) {
        obj.requires = requires;
    }

    var see;
    if (see = symbol.see) {
        obj.see = see;
    }

    var tutorials;
    if (tutorials = symbol.tutorials) {
        obj.tutorials = tutorials;
    }

    var author;
    if (author = symbol.author) {
        obj.author = author;
    }

    var access;
    if (access = symbol.access) {
        obj.access = access;
    }

    var cr;
    if (cr = symbol.copyright) {
        obj.copyright = cr;
    }

    var deprecated;
    if (deprecated = symbol.deprecated) {
        obj.deprecated = deprecated;
    }

    var license;
    if (license = symbol.license) {
        obj.license = license;
    }

    var memberof;
    if (memberof = symbol.memberof) {
        obj.memberof = memberof;
    }

    var scope;
    if (scope = symbol.scope) {
        obj.scope = scope;
    }

    var since;
    if (since = symbol.since) {
        obj.since = since;
    }

    var summary;
    if (summary = symbol.summary) {
        obj.summary = summary;
    }

    var that;
    if (that = symbol['this']) {
        obj['this'] = that;
    }

    var def;
    if (def = symbol.defaultValue) {
        obj.defaultValue = def;
    }

    var version;
    if (version = symbol.version) {
        obj.version = version;
    }

    var variation;
    if (variation = symbol.variation) {
        obj.variation = variation;
    }

    if (symbol.isEnum) {
        obj.isEnum = true;
    }

    if (symbol.preserveName) {
        obj.preserveName = true;
    }

    if (symbol.ignore) {
        obj.ignore = true;
    }

    if (symbol.virtual) {
        obj.virtual = true;
    }

    if (symbol.alias) {
        obj.alias = true;
    }

    if (symbol.readOnly) {
        obj.readOnly = true;
    }

    return obj;
};


/**
 * Builds an object will be stringified by function symbol.
 * @param {jsdoc.Doclet} symbol Function symbol doclet.
 * @return {Object} Plain object was built.
 */
JsonPublisher.prototype.buildFunctionObject = function(symbol) {
    var obj = this.buildObject(symbol);

    if (symbol.params) {
        obj.params = symbol.params.map(function(param) {
            var paramObj = {
                optional: param.optional || null,
                nullable: param.nullable || null,
                variable: param.variable || null,
                defaultValue: param.defaultValue || null,
                description: param.description || null,
                name: param.name || null
            };

            var type;
            if (type = param.type) {
                paramObj.type = {};

                var names;
                if (names = type.names) {
                    paramObj.type.names = names.map(function(name) {
                        return name;
                    });
                }
            }

            return paramObj;
        }, this);
    }

    var returns;
    if (returns = symbol.returns) {
        obj.returns = symbol.returns.map(function(ret) {
            var retObj = {
                optional: ret.optional || null,
                nullable: ret.nullable || null,
                variable: ret.variable || null,
                defaultValue: ret.defaultValue || null,
                description: ret.description || null
            };

            var type;
            if (type = ret.type) {
                retObj.type = {};

                var names;
                if (names = type.names) {
                    retObj.type.names = names.map(function(name) {
                        return name;
                    });
                }
            }

            return retObj;
        }, this);
    }

    return obj;
};


/**
 * Publishes documents by the template.
 *  @param {TAFFY} taffyData See <http://taffydb.com/>.
 *  @param {object} opts Options.
 *  @param {Tutorial} tutorials Tutorials.
 */
JsonPublisher.prototype.publish = function(taffyData, opts, tutorials) {
    var startTime = new Date().getTime();
    console.log('start output');

    /**
     * Map has pairs that longnames and each members.
     * @type {Object.<Array.<tsumekusaJsdoc.dom.DocletWrapper>>}
     */
    var memberMap = {};

    var symbols = taffyData().get();

    var files = {};

    symbols.forEach(function(symbol) {
        console.log('Processing: ' + symbol.longname);
        if (symbol && symbol.meta && symbol.meta.filename) {
            var doclets;
            var filepath = path.join(symbol.meta.filename);
            if (!(doclets = files[filepath])) {
                doclets = files[filepath] = [];
            }

            if (symbol.kind === 'function') {
                doclets.push(this.buildFunctionObject(symbol));
            }
            else {
                doclets.push(this.buildObject(symbol));
            }
        }
        else {
            console.log('WARNING: Unknown file name doclet found.', symbol);
        }
    }, this);

    symbols = null;

    for (var filepath in files) {
        var json;
        if (opts.destination === 'console') {
            json = JSON.stringify(files[filepath], null, '  ');
            console.log(json);
        }
        else {
            json = JSON.stringify(files[filepath]);
            var outpath = path.join(opts.destination, filepath + 'on');
            console.log('Publishing: ' + outpath);

            try {
                fs.mkPath(path.dirname(outpath));
                fs.writeFileSync(outpath, json, 'utf8');
            }
            catch (e) {
                console.log(outpath);
                throw e;
            }
        }
        delete files[filepath];
    }

    var elapse = parseInt((new Date().getTime() - startTime) / 1000);
    console.log('jsonjsdoc complete the publishing (' + elapse + ' sec).');
};


// Exports the publisher.
module.exports = new JsonPublisher();