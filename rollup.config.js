import vue from 'rollup-plugin-vue'; // Обработка однофайловых компонентов .vue

export default {
    input: 'src/App.vue', // Путь до относительного package.json
    output: {
        name: 'MyComponent',
        exports: 'named'
    },
    plugins: [

        vue({
            css: true, // Динамически внедряем CSS в тег <style>
            compileTemplate: true, // Явное преобразование шаблона в рендер-функцию
        }),

    ],
};