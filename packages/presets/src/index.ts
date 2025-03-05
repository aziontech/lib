import angular from './presets/angular';
import astro from './presets/astro';
import docusaurus from './presets/docusaurus';
import eleventy from './presets/eleventy';
import emscripten from './presets/emscripten';
import gatsby from './presets/gatsby';
import hexo from './presets/hexo';
import html from './presets/html';
import hugo from './presets/hugo';
import javascript from './presets/javascript';
import jekyll from './presets/jekyll';
import next from './presets/next';
import nuxt from './presets/nuxt';
import preact from './presets/preact';
import qwik from './presets/qwik';
import react from './presets/react';
import rustwasm from './presets/rustwasm';
import svelte from './presets/svelte';
import typescript from './presets/typescript';
import vitepress from './presets/vitepress';
import vue from './presets/vue';

const presets = {
  angular,
  astro,
  docusaurus,
  eleventy,
  emscripten,
  gatsby,
  hexo,
  html,
  hugo,
  javascript,
  jekyll,
  next,
  nuxt,
  preact,
  qwik,
  react,
  rustwasm,
  svelte,
  typescript,
  vitepress,
  vue,
} as const;

export {
  angular,
  astro,
  docusaurus,
  eleventy,
  emscripten,
  gatsby,
  hexo,
  html,
  hugo,
  javascript,
  jekyll,
  next,
  nuxt,
  preact,
  qwik,
  react,
  rustwasm,
  svelte,
  typescript,
  vitepress,
  vue,
};

export default presets;
