<script lang="ts">
    import Sun from "~icons/fluent/weather-sunny-16-filled?raw";
    import Moon from "~icons/fluent/weather-moon-16-filled?raw";
    import { toggleMode } from "mode-watcher";
    import { Button } from "@/components/ui/button";
</script>

<Button on:click={toggleMode} variant="outline" size="icon">
    <span
        class=" rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
    >
        {@html Sun}
    </span>
    <span
        class="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
    >
        {@html Moon}
    </span>
    <span class="sr-only">Toggle theme</span>
</Button>
