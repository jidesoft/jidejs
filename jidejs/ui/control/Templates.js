define('jidejs/ui/control/Templates', [
    'jidejs/ui/Template', 'text!./templates.html'
], function(Template, templates) {
    var div = document.createElement('div');
    div.innerHTML = templates;

    var templateSet = div.querySelectorAll('template[id]');
    var map = {};

    for(var i = 0, len = templateSet.length; i < len; i++) {
        var template = templateSet[i],
            id = template.getAttribute('id');
        template.removeAttribute('id');
        map[id] = Template(template);
    }

    return map;
});