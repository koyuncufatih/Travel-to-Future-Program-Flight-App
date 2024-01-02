import { createApp } from 'vue'
import App from './App.vue'
import 'vuetify/dist/vuetify.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/lib/components'
import * as directives from 'vuetify/lib/directives'
import '@mdi/font/css/materialdesignicons.css'

const vuetify = createVuetify({
    components,
    directives,
    icons: {
        iconfont: 'mdi', // Bu satýr materyal ikonlarý kullanacaðýný belirtir
    },
})

createApp(App).use(vuetify).mount('#app')
