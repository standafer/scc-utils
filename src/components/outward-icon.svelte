<script lang="ts">
    // this is a messsyyyyyyyy workaround. i don't really feel like implementing a proper solution
    // for a one off problem
    // TODO: make not messy

    // a more elegant solution would be having a single source of truth for all icons

    // basically: i think the issue is that when an icon imported through the unicon library
    // is used more than once (like the arrowoutward icon is), astro tries to optimize it but instead
    // optimizes it as a javascript file instead of as the raw svg text file that it should be

    // basically: not (exactly) my fault :P

    // so by doing this, we consolidate the import to one file THEN export the svelte file and allow
    // other files to reference

    // rant over
    // - ethan 1/13/25

    import ArrowOutward from "~icons/material-symbols/arrow-outward?raw&width=100%25&height=100%25";
</script>

{@html ArrowOutward}
