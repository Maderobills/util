<script setup>
const props = defineProps({
    buttons: {
        type: Array,
        required: true
    }
});
</script>

<template>
    <div class="flex flex-wrap space-x-2">
        <button
            v-for="(button, index) in buttons"
            :key="index"
            :class="[
                'px-4 py-2 font-semibold rounded',
                button.type === 'primary' ? 'bg-primary dark:bg-dark-primary text-white' :
                button.type === 'secondary' ? 'bg-secondary dark:bg-dark-secondary text-white' :
                button.type === 'success' ? 'bg-success dark:bg-dark-success text-white' :
                button.type === 'error' ? 'bg-error dark:bg-dark-error text-white' :
                'bg-white text-black'
            ]"
            @click="button.onClick"
        >
            {{ button.text }}
        </button>
    </div>
</template>

<style scoped>
/* Add any additional styles here */
</style>