//
// Advanced Demo
//


var isAuthenticated = false;


var list_to_obj = function(inputlist){
  var ret = {}
  for(let i=0;i<inputlist.length;i++){
    ret[inputlist[i]] = inputlist[i]
  }
  return ret
};

Home = {
  template: `
<article class="home">
  <h4>Advanced routing demo</p>
</article>`
}

Login = {
  data: function(){
    return {
      prev: '',
      username: '',
      error: ''
    }
  },
  props: ['prev'],
  methods: {
    submit: function() {
        if (this.username == 'icecube') {
            isAuthenticated = true;
            if (this.prev !== undefined && this.prev != '') {
                console.log('login - redirect to '+this.prev);
                this.$router.push({'name': this.prev});
            } else {
                this.$router.push({'name': 'home'});
            }
        } else {
            this.error = 'bad username'
        }
    }
  },
  template: `
<article class="login">
  <h2>Login:</h2>
  <div>
    <div v-if="error" style="margin: .3em;color:red">{{ error }}</div>
    <input v-model="username" placeholder="enter name" v-on:keyup.enter="submit">
    <button v-on:click="submit">Submit</button>
  </div>
</article>`
}

Fruits = {
  data: function(){
    return {
      fruit: '',
      description: '',
      valid: true,
      errMessage: '',
      submitted: false
    }
  },
  props: ['experiment', 'institution'],
  computed: {
    fruitOptions: function() {
      // could do ajax call here, but we'll do a list for simplicity
      return ["apple","banana","grape","pear"];
    },
    validFruit: function() {
      return this.fruit in list_to_obj(this.fruitOptions)
    },
    validDescription: function() {
      return this.description != ''
    }
  },
  methods: {
      submit: async function(e) {
          // validate
          this.valid = (this.validFruit)

          // now submit
          if (this.valid) {
              this.errMessage = 'Submission success';
          } else {
              this.errMessage = '<span class="red">Please fix invalid entries</span>'
          }
      }
  },
  template: `
<article class="fruits">
    <h2>Select a fruit</h2>
    <form class="newuser" @submit.prevent="submit">
      <div class="entry">
        <span class="red">* entry is requred</span>
      </div>
      <div class="entry">
        <p>Select a fruit: <span class="red">*</span></p>
        <select v-model="fruit">
          <option disabled value="">Please select one</option>
          <option v-for="f in fruitOptions">{{ f }}</option>
          <option>tomato</option>
        </select>
        <span class="red" v-if="!valid && !validFruit">invalid entry</span>
      </div>
      <textinput name="Fruit description" inputName="description" v-model.trim="description"
       :valid="validDescription" :allValid="valid"></textinput>
      <div v-if="errMessage" class="error_box" v-html="errMessage"></div>
      <div class="entry" v-if="!submitted">
        <input type="submit" value="Submit Fruit">
      </div>
    </form>
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

Vue.component('textinput', {
    data: function(){
        return {
            required: false,
            valid: true,
            allValid: true
        }
    },
    props: ['name', 'inputName', 'value', 'required', 'valid', 'allValid'],
    template: `
<div class="entry">
  <p>{{ name }}: <span v-if="required" class="red">*</span></p>
  <input :name="inputName" :value="value" @input="$emit('input', $event.target.value)">
  <span class="red" v-if="!allValid && !valid && (required || value)">invalid entry</span>
</div>`
})

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

// scrollBehavior:
// - only available in html5 history mode
// - defaults to no scroll behavior
// - return false to prevent scroll
const scrollBehavior = function (to, from, savedPosition) {
  if (savedPosition) {
    // savedPosition is only available for popstate navigations.
    return savedPosition
  } else {
    const position = {}

    // scroll to anchor by returning the selector
    if (to.hash) {
      position.selector = to.hash

      // specify offset of the element
      if (to.hash === '#anchor2') {
        position.offset = { y: 100 }
      }

      // bypass #1number check
      if (/^#\d/.test(to.hash) || document.querySelector(to.hash)) {
        return position
      }

      // if the returned position is falsy or an empty object,
      // will retain current scroll position.
      return false
    }

    return new Promise(resolve => {
      // check if any matched route config has meta that requires scrolling to top
      if (to.matched.some(m => m.meta.scrollToTop)) {
        // coords will be used if no selector is provided,
        // or if the selector didn't match any element.
        position.x = 0
        position.y = 0
      }

      // wait for the out transition to complete (if necessary)
      this.app.$root.$once('triggerScroll', () => {
        // if the resolved position is falsy or an empty object,
        // will retain current scroll position.
        resolve(position)
      })
    })
  }
}


var routes = [
  { path: '/', name: 'home', component: Home },
  { path: '/login', name: 'login', component: Login,
    props: (route) => ({
      prev: route.query.prev,
    }),
  },
  { path: '/fruits', name: 'fruits', component: Fruits,
    props: (route) => ({
      fruit: route.query.fruit,
    }),
    meta: { requiresAuth: true }
  },
  { path: '*', name: '404', component: Error404, props: true }
];

(async function(){
    var router = new VueRouter({
        mode: 'history',
        routes: routes,
        scrollBehavior: scrollBehavior
    })
    router.beforeEach(async function(to, from, next){
      if (to.meta.requiresAuth && !isAuthenticated) {
        // do login process
        console.log("needs login: "+to.name)
        next({ name: 'login', query: { prev: to.name } })
      }
      else next()
    })

    var app = new Vue({
        el: '#page-container',
        data: {
            routes: routes,
            current: 'home'
        },
        router: router,
        computed: {
            visibleRoutes: function() {
                var ret = []
                for (let i=0;i<routes.length;i++){
                    if (routes[i].name != '404')
                        ret.push(routes[i]);
                }
                return ret
            }
        },
        watch: {
            '$route.currentRoute.path': {
                handler: function() {
                    console.log('currentPath update:'+router.currentRoute.path)
                    this.current = router.currentRoute.name
                },
                deep: true,
                immediate: true,
            }
        }
    })
})()
