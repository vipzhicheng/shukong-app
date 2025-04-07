import { createRouter, createWebHashHistory } from 'vue-router'
import About from '../views/About.vue'
import Apps from '../views/Apps.vue'
import Book from '../views/Book.vue'
import Character from '../views/Character.vue'
import DictMap from '../views/DictMap.vue'
import Help from '../views/Help.vue'
import Query from '../views/Query.vue'
import Quiz from '../views/Quiz.vue'
import RenjiaoBooks from '../views/RenjiaoBooks.vue'
import RenjiaoDetail from '../views/RenjiaoDetail.vue'
import Settings from '../views/Settings.vue'
import StrokeGame from '../views/StrokeGame.vue'
import Wordbook from '../views/Wordbook.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/quiz'
    },
    {
      path: '/dictmap',
      name: 'dictmap',
      component: DictMap
    },
    {
      path: '/dictmap/:chars',
      name: 'dictmapChars',
      component: DictMap
    },
    {
      path: '/zi/:char',
      name: 'character',
      component: Character
    },
    {
      path: '/query',
      name: 'queryInput',
      component: Query
    },
    {
      path: '/query/:chars',
      name: 'query',
      component: Query
    },
    {
      path: '/quiz/:content?',
      name: 'quiz',
      component: Quiz
    },
    {
      path: '/book',
      name: 'book',
      component: Book
    },
    {
      path: '/apps',
      name: 'apps',
      component: Apps
    },
    {
      path: '/wordbook',
      name: 'wordbook',
      component: Wordbook
    },
    {
      path: '/book/renjiao',
      name: 'renjiaoBooks',
      component: RenjiaoBooks
    },
    {
      path: '/book/renjiao/:id',
      name: 'renjiaoDetail',
      component: RenjiaoDetail
    },
    {
      path: '/settings',
      name: 'settings',
      component: Settings
    },
    {
      path: '/play/stroke',
      name: 'strokeGame',
      component: StrokeGame
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/help',
      name: 'help',
      component: Help
    }
  ]
})

export default router
