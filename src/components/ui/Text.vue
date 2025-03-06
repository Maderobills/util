<script setup>
const props = defineProps(['msg']);
</script>

<template>
    <div v-if="msg.banner" class="text-foreground dark:text-dark-foreground font-extrabold">
        <h1 class="2xl:text-9xl xl:text-8xl md:text-4xl text-2xl">{{ msg.banner }}</h1>
    </div>
    <div v-if="msg.heading" class="text-primary dark:text-dark-primary font-medium">
        <h2 class="xl:text-4xl md:text-2xl text-xl">{{ msg.heading }}</h2>
    </div>
    <div v-if="msg.subheading" class="text-foreground dark:text-dark-foreground font-normal">
        <h3 class="xl:text-3xl md:text-xl text-lg">{{ msg.subheading }}</h3>
    </div>
    <div v-if="msg.body" class="text-foreground dark:text-dark-foreground font-normal">
        <h4 class="2xl:text-2xl lg:text-lg md:text-base text-xs">{{ msg.body }}</h4>
    </div>
    <div v-if="msg.success || msg.error || msg.warning || msg.info || msg.mute" class="font-normal 2xl:text-2xl lg:text-lg md:text-base text-xs">
        <h4 v-if="msg.success" class="text-success dark:text-dark-success">Success: {{ msg.success }}</h4>
        <h4 v-if="msg.error" class="text-error dark:text-dark-error">Error: {{ msg.error }}</h4>
        <h4 v-if="msg.warning" class="text-warning dark:text-dark-warning">Warning: {{ msg.warning }}</h4>
        <h4 v-if="msg.info" class="text-info dark:text-dark-info">{{ msg.info }}</h4>
        <h4 v-if="msg.mute" class="text-muted dark:text-dark-muted">{{ msg.mute }}</h4>
    </div>
</template>