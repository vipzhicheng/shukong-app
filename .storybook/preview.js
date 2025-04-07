import '../src/style.css'
import { createPinia } from 'pinia'
import { setup } from '@storybook/vue3'
const pinia = createPinia()

setup(app => {
  app.use(pinia)
})

/** @type { import('@storybook/vue3').Preview } */
const preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i
      }
    }
  }
}

export default preview
