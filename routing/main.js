//
// Routing Demo
//


Home = {
  template: `
<article class="home">
  <h2>Demo-1 home page</h2>
</article>`
}

Foo = {
  template: `
<article class="foo">
  <h2>Foo</h2>
  <p>This is page foo.</p>
</article>`
}

Bar = {
  data: function(){
    return {
      entries: {'a': 1, 'b': 2, 'c': 3}
    }
  },
  template: `
<article class="bar">
  <h2>Bar</h2>
  <ul><li v-for="(value, name) in entries">{{ name }}: {{ value }}</li></ul>
</article>`
}

Error404 = {
    data: function(){
        return {
        }
    },
    computed: {
        'pathMatch': function() {
            return this.$route.params[0];
        }
    },
    template: `
<article class="error">
    <h2>Error: page not found</h2>
    <p><span class="code">{{ pathMatch }}</span> does not exist</p>
</article>`
}

Vue.component('navpage', {
    data: function(){
        return {
            path: '',
            name: '',
            current: ''
        }
    },
    props: ['path', 'name', 'current'],
    computed: {
        classObj: function() {
            console.log('name:'+this.name+'   current:'+this.current)
            return {
                active: this.name == this.current
            }
        },
    },
    beforeRouteEnter(to, from, next) {
        this.current = to.params.route
        next()
    },
    template: '<li :class="classObj"><router-link :to="path">{{ name }}</router-link></li>'
});

var routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/foo', name: 'foo', component: Foo },
  { path: '/bar', name: 'bar', component: Bar },
  { path: '*', name: '404', component: Error404, props: true }
];

(async function(){
    var router = new VueRouter({
        mode: 'history',
        routes: routes
    })

    var app = new Vue({
        el: '#page-container',
        data: {
            routes: routes,
            current: 'home'
        },
        computed: {
            visibleRoutes: function() {
                var ret = []
                for(let i=0;i<routes.length;i++){
                    if (routes[i].name != '404')
                        ret.push(routes[i])
                }
                return ret
            }
        },
        router: router
    })
})()
