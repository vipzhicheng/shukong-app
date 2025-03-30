<template>
  <RightNav>
    <div class="nav-content">
      <div class="nav-menu">
        <a style="font-size: 1.5rem; font-weight: bold">帮助文档</a>
      </div>
    </div>
  </RightNav>
  <div class="container mx-auto px-4 py-8 relative">
    <div class="prose lg:prose-xl prose-zinc dark:prose-invert" v-html="renderedContent"></div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import{ useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it';
import MarkdownItSub from 'markdown-it-sub';
import MarkdownItSup from 'markdown-it-sup';
import MarkdownItIns from 'markdown-it-ins';
import MarkdownItMark from 'markdown-it-mark';
import MarkdownItAnchor from 'markdown-it-anchor';
import MarkdownItTocDoneRight from 'markdown-it-toc-done-right';
import slugify from 'slugify'
import tinyPinyin from 'tiny-pinyin'
import RightNav from '../components/RightNav.vue'

const route = useRoute();
const renderedContent = ref('');
const markdown = ref('');


onMounted(async () => {
  try {
    const baseUrl = import.meta.env.VITE_BASE_URL || '/';
    const response = await fetch(`${baseUrl}HELP.md`);
    markdown.value = await response.text();

    const md = new MarkdownIt({
      html: true,
      linkify: true,
      // typographer: true,

    })
    .use(MarkdownItSub)
    .use(MarkdownItSup)
    .use(MarkdownItIns)
    .use(MarkdownItMark)
    .use(MarkdownItAnchor, {
      permalink: true,
      permalinkBefore: true,
      permalinkSymbol: '#',
      permalinkClass: 'header-anchor',
      slugify: s => {
        const pinyin = tinyPinyin.convertToPinyin(s, '', true);
        const slug = slugify(pinyin);
        return `${route.path.slice(1)}#${slug}`;
      }
    })
    .use(MarkdownItTocDoneRight, {
      containerClass: 'toc',
      listType: 'ul',
      listClass: 'toc-list',
      itemClass: 'toc-item',
      linkClass: 'toc-link',
      level: [2, 3], // 只包含 h2 和 h3
      slugify: s => {
        const pinyin = tinyPinyin.convertToPinyin(s, '', true);
        const slug = slugify(pinyin);
        return `${route.path.slice(1)}#${slug}`;
      }
    });

    const env = {};
    renderedContent.value = md.render(markdown.value, env);

  } catch (error) {
    console.error('Error loading HELP.md:', error);
  }
});
</script>

<style>

</style>