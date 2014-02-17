require([
    'jidejs/base/Class',
    'jidejs/base/ObservableList',
    'jidejs/ui/Control',
    'jidejs/ui/Skin'
], function(Class, ObservableList, Control, Skin) {
    var data = new ObservableList();
    window.callbackToFetchPosts = function(res) {
        if(!res || !res.posts) return;
        data.addAll(res.posts);
    };

    // import posts through jsonp call
    function makeJSONPImport(url) {
        var script = document.createElement('script');
        script.src = url;
        document.head.appendChild(script);
    }

    // define our Blog control
    function Blog(config) {
        Control.call(this, config || {});
    }
    Class(Blog).extends(Control);
    Blog.Skin = Skin.create(Skin, {});

    // and initialize it
    new Blog({
        element: document.getElementById('recent_blog_posts'),
        posts: data
    });

    makeJSONPImport('http://jidesoft.com/blog/?json=get_category_posts&category_id=36&callback=callbackToFetchPosts&count=3');
});