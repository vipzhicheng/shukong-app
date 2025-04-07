/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
  stories: [
    // '../src/components/*.vue',
    '../src/components/*.stories.@(js|jsx|mjs|ts|tsx)'
    // '../src/**/*.mdx',
    // '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@chromatic-com/storybook',
    '@storybook/experimental-addon-test'
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  }
}
export default config
