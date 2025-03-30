<template>
  <div class="container mx-auto px-4 py-8 relative">
    <div class="prose lg:prose-xl prose-neutral dark:prose-invert prose-code:text-gray-800 dark:prose-code:text-gray-200" v-html="renderedContent"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import MarkdownIt from 'markdown-it';
import MarkdownItSub from 'markdown-it-sub';
import MarkdownItSup from 'markdown-it-sup';
import MarkdownItIns from 'markdown-it-ins';
import MarkdownItMark from 'markdown-it-mark';
import MarkdownItTocDoneRight from 'markdown-it-toc-done-right';
import MarkdownItAnchor from 'markdown-it-anchor';
import{ useRoute } from 'vue-router'
import slugify from 'slugify'
import tinyPinyin from 'tiny-pinyin'
const renderedContent = ref('');
const markdown = ref('');
const route = useRoute();

onMounted(async () => {
  try {
    const response = await fetch('/README.md');
    markdown.value = await response.text();

    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      slugify: (s) => {
        const pinyin = tinyPinyin.convertToPinyin(s, '', true);
        const slug = slugify(pinyin);
        return `${route.path.slice(1)}#${slug}`;
      }
    })
    .use(MarkdownItSub)
    .use(MarkdownItSup)
    .use(MarkdownItIns)
    .use(MarkdownItMark)
    .use(MarkdownItAnchor, {
      permalink: true,
      permalinkBefore: true,
      permalinkSymbol: '#',
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

    renderedContent.value = md.render(markdown.value);
  } catch (error) {
    console.error('Error loading README.md:', error);
  }
});
</script>

<style>
.prose {
  @apply text-gray-900 dark:text-gray-100;
}

.prose h1 {
  @apply text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100;
}

.prose h2 {
  @apply text-3xl font-semibold mt-8 mb-4 text-gray-800 dark:text-gray-200;
}

.prose h3 {
  @apply text-2xl font-medium mt-6 mb-3 text-gray-800 dark:text-gray-200;
}

.prose p {
  @apply my-4 leading-relaxed;
}

.prose ul {
  @apply list-disc list-inside my-4;
}

.prose code {
  @apply px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded;
}

.prose pre {
  @apply p-4 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-x-auto my-4;
}

.prose a {
  @apply text-blue-600 dark:text-blue-400 hover:underline;
}

.toc-container {
  @apply hidden lg:block;
}

.toc {
  @apply text-sm p-4 bg-gray-50 dark:bg-gray-800 rounded-lg shadow;
}

.toc ul {
  @apply list-none pl-4 space-y-2;
}

.toc a {
  @apply text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400;
}
</style>