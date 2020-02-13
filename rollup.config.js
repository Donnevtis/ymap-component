import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import { terser } from 'rollup-plugin-terser'
import json from '@rollup/plugin-json'
import vue from 'rollup-plugin-vue'
import replace from '@rollup/plugin-replace'
import html from 'rollup-plugin-bundle-html';

const sourcemap = process.env.NODE_ENV === 'development' ? true : false;

const options = (target, legacy) => ({
    input: 'src/main.js',
    output: {
        format: 'iife',
        dir: `dist/`,
        sourcemap,
        entryFileNames: `ymap${legacy ? '.legacy' : ''}.[hash].js`
    },
    plugins: [
        commonjs(),
        resolve({ browser: true }),
        json({ compact: true }),
        replace({
            'process.env.NODE_ENV': JSON.stringify('development')
        }),
        html({
            template: 'public/index.html',
            dest: "dist/",
            filename: 'index.html',
            ignore: /.legacy./
        }),
        vue(),
        babel({
            babelrc: false,
            exclude: /\bcore-js\b/,
            presets: [['@babel/preset-env', {
                corejs: 3,
                modules: false,
                useBuiltIns: 'usage',
                targets: target,
            }]]
        }),
        terser({
            compress: {
                passes: 5
            }
        })
    ]
})

export default [
    options('> 0.5%', true),
    options('> 5%'),
]