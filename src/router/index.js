import { createRouter, createWebHashHistory } from 'vue-router'
import Character from '../views/Character.vue'
import Query from '../views/Query.vue'
import Quiz from '../views/Quiz.vue'
import Book from '../views/Book.vue'
import RenjiaoBooks from '../views/RenjiaoBooks.vue'
import JiujiuBooks from '../views/JiujiuBooks.vue'
import RenjiaoDetail from '../views/RenjiaoDetail.vue'
import JiujiuDetail from '../views/JiujiuDetail.vue'
import JiujiuPost from '../views/JiujiuPost.vue'
import Settings from '../views/Settings.vue'
import Apps from '../views/Apps.vue'
import UI from '../views/UI.vue'
import Wordbook from '../views/Wordbook.vue'
import StrokeGame from '../views/StrokeGame.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/quiz'
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
      path: '/book/jiujiu',
      name: 'jiujiuBooks',
      component: JiujiuBooks
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
      path: '/book/jiujiu/:id',
      name: 'jiujiuDetail',
      component: JiujiuDetail
    },
    {
      path: '/book/jiujiu/:id/:type/:cid',
      name: 'jiujiuPost',
      component: JiujiuPost
    },
    {
      path: '/ui',
      name: 'ui',
      component: UI
    },
    {
      path: '/play/stroke',
      name: 'strokeGame',
      component: StrokeGame
    }
  ]
})

export default router
