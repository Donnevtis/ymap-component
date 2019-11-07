import vue from 'rollup-plugin-vue'

export default {
    input: 'src/App.vue',
    output: {
        format: 'esm',
        file: 'dist/MyComponent.js'
    },
    plugins: [
        // ...
        vue( /* options */ )
    ]
}